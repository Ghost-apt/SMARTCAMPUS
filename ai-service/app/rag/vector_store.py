"""
SmartCampus AI — Persistent Vector Store & Embedding Engine
===========================================================
Local persistent vector store using scikit-learn TF-IDF / Cosine Vector Space
with metadata persistence, document-level access filtering, and idempotent re-indexing.
"""

import os
import json
from typing import List, Dict, Any, Optional
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import joblib

DEFAULT_STORE_DIR = os.path.join(os.path.dirname(__file__), "store")


class PersistentVectorStore:
    def __init__(self, store_dir: Optional[str] = None):
        self.store_dir = store_dir or DEFAULT_STORE_DIR
        os.makedirs(self.store_dir, exist_ok=True)

        self.meta_file = os.path.join(self.store_dir, "metadata.json")
        self.model_file = os.path.join(self.store_dir, "vector_model.joblib")

        self.documents: Dict[str, Any] = {}
        self.chunks: List[Dict[str, Any]] = []
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.chunk_matrix = None

        self._load()

    def _load(self):
        """Loads persistent document metadata and vector matrix from disk."""
        if os.path.exists(self.meta_file):
            try:
                with open(self.meta_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.documents = data.get("documents", {})
                    self.chunks = data.get("chunks", [])
            except Exception as e:
                print(f"[RAG Store] Warning loading metadata: {e}")

        if os.path.exists(self.model_file):
            try:
                saved = joblib.load(self.model_file)
                self.vectorizer = saved.get("vectorizer")
                self.chunk_matrix = saved.get("matrix")
            except Exception as e:
                print(f"[RAG Store] Warning loading vector model: {e}")

        # If chunks exist but vector model is missing, rebuild
        if self.chunks and (self.vectorizer is None or self.chunk_matrix is None):
            self._rebuild_vector_space()

    def _save(self):
        """Persists metadata and vector matrix to disk."""
        try:
            with open(self.meta_file, "w", encoding="utf-8") as f:
                json.dump({
                    "documents": self.documents,
                    "chunks": self.chunks
                }, f, indent=2, ensure_ascii=False)

            if self.vectorizer is not None and self.chunk_matrix is not None:
                joblib.dump({
                    "vectorizer": self.vectorizer,
                    "matrix": self.chunk_matrix
                }, self.model_file)
        except Exception as e:
            print(f"[RAG Store] Error persisting vector store: {e}")

    def _rebuild_vector_space(self):
        """Re-fits vectorizer over all indexed chunks."""
        if not self.chunks:
            self.vectorizer = None
            self.chunk_matrix = None
            return

        corpus = [c["text"] for c in self.chunks]
        self.vectorizer = TfidfVectorizer(
            sublinear_tf=True,
            min_df=1,
            ngram_range=(1, 2),
            token_pattern=r'(?u)\b\w+\b'
        )
        self.chunk_matrix = self.vectorizer.fit_transform(corpus)

    def add_document(self, document_id: str, doc_meta: Dict[str, Any], new_chunks: List[Dict[str, Any]]) -> int:
        """
        Idempotently adds or updates an academic document and its chunks in the vector store.
        Existing chunks for this document_id are replaced to prevent duplicate vectors.
        """
        # Remove old chunks for this document
        self.chunks = [c for c in self.chunks if c.get("document_id") != document_id]

        # Add new chunks
        self.chunks.extend(new_chunks)
        self.documents[document_id] = {
            **doc_meta,
            "document_id": document_id,
            "chunk_count": len(new_chunks)
        }

        self._rebuild_vector_space()
        self._save()
        return len(new_chunks)

    def delete_document(self, document_id: str) -> bool:
        """
        Removes all vectors and metadata associated with a document.
        """
        initial_count = len(self.chunks)
        self.chunks = [c for c in self.chunks if c.get("document_id") != document_id]
        existed = document_id in self.documents or len(self.chunks) < initial_count

        if document_id in self.documents:
            del self.documents[document_id]

        self._rebuild_vector_space()
        self._save()
        return existed

    def search(
        self,
        query: str,
        top_k: int = 4,
        min_similarity: float = 0.08,
        filter_doc_ids: Optional[List[str]] = None,
        filter_subjects: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """
        Performs cosine similarity retrieval over authorized candidate chunks.
        Strictly applies document-level and subject-level RBAC filters before scoring.
        """
        if not query or not query.strip() or not self.chunks or self.vectorizer is None or self.chunk_matrix is None:
            return []

        # 1. Server-side authorization filter: Identify candidate chunk indices
        candidate_indices = []
        for idx, chunk in enumerate(self.chunks):
            # Check document ID filter (if specified by RBAC)
            if filter_doc_ids is not None and chunk.get("document_id") not in filter_doc_ids:
                continue

            # Check subject code filter (if specified by RBAC)
            if filter_subjects is not None:
                sub_code = chunk.get("subject_code", "").upper().strip()
                normalized_subjects = [s.upper().strip() for s in filter_subjects]
                if sub_code not in normalized_subjects:
                    continue

            candidate_indices.append(idx)

        # Fail closed: No authorized documents available for this student/query
        if not candidate_indices:
            return []

        # 2. Transform query vector
        query_clean = query.strip()
        try:
            query_vec = self.vectorizer.transform([query_clean])
        except Exception:
            return []

        # 3. Compute cosine similarities only against authorized candidate chunk vectors
        sub_matrix = self.chunk_matrix[candidate_indices]
        sims = cosine_similarity(query_vec, sub_matrix).flatten()

        # 4. Filter by minimum similarity threshold and rank
        scored_candidates = []
        for i, score in enumerate(sims):
            if score >= min_similarity:
                chunk_idx = candidate_indices[i]
                chunk_data = self.chunks[chunk_idx]
                scored_candidates.append({
                    "chunk_id": chunk_data["chunk_id"],
                    "document_id": chunk_data["document_id"],
                    "document_title": chunk_data["document_title"],
                    "page_number": chunk_data["page_number"],
                    "course_code": chunk_data["course_code"],
                    "subject_code": chunk_data["subject_code"],
                    "text": chunk_data["text"],
                    "score": round(float(score), 4)
                })

        # Sort descending by similarity score
        scored_candidates.sort(key=lambda x: x["score"], reverse=True)
        return scored_candidates[:top_k]

    def get_status(self) -> Dict[str, Any]:
        """Returns health and inventory of the vector store."""
        return {
            "is_ready": self.vectorizer is not None and len(self.chunks) > 0,
            "total_documents": len(self.documents),
            "total_chunks": len(self.chunks),
            "store_directory": self.store_dir,
            "document_catalog": list(self.documents.values())
        }


# Singleton instance for the service lifecycle
_global_vector_store: Optional[PersistentVectorStore] = None


def get_vector_store() -> PersistentVectorStore:
    global _global_vector_store
    if _global_vector_store is None:
        _global_vector_store = PersistentVectorStore()
    return _global_vector_store
