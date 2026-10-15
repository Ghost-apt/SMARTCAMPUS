"""
SmartCampus AI — Semantic Overlapping Document Chunker
======================================================
Splits academic document pages into manageable overlapping context chunks
while strictly preserving page numbers, course identifiers, and access scopes.
"""

from typing import List, Dict, Any


def split_text_with_overlap(text: str, chunk_size: int = 450, chunk_overlap: int = 80) -> List[str]:
    """
    Splits text into chunks of approximately `chunk_size` characters with
    `chunk_overlap` character overlap, attempting to break on whitespace or punctuation.
    """
    if not text:
        return []

    if len(text) <= chunk_size:
        return [text]

    chunks: List[str] = []
    start = 0
    text_len = len(text)

    while start < text_len:
        end = min(start + chunk_size, text_len)

        # If not at the end of the text, try to find a natural word boundary
        if end < text_len:
            # Look for sentence boundary or whitespace within the last 40 chars
            last_break = -1
            for punct in ['. ', '.\n', '? ', '! ', '\n\n', '\n', ' ']:
                pos = text.rfind(punct, start + int(chunk_size * 0.6), end)
                if pos != -1:
                    last_break = pos + len(punct)
                    break

            if last_break != -1 and last_break > start:
                end = last_break

        chunk_snippet = text[start:end].strip()
        if chunk_snippet:
            chunks.append(chunk_snippet)

        if end >= text_len:
            break

        # Move forward, stepping back by overlap
        start = max(start + 1, end - chunk_overlap)

    return chunks


def create_chunks(
    document_id: str,
    document_title: str,
    pages: List[Dict[str, Any]],
    course_code: str = "BCA",
    subject_code: str = "BCA-501",
    department: str = "BCA",
    access_scope: str = "enrolled",
    chunk_size: int = 450,
    chunk_overlap: int = 80
) -> List[Dict[str, Any]]:
    """
    Processes extracted pages into discrete, indexable chunks with full source attribution.
    """
    all_chunks: List[Dict[str, Any]] = []

    for page_info in pages:
        page_num = page_info["page_number"]
        page_text = page_info["text"]

        if not page_text or len(page_text.strip()) == 0:
            continue

        raw_chunks = split_text_with_overlap(page_text, chunk_size=chunk_size, chunk_overlap=chunk_overlap)

        for chunk_idx, chunk_text in enumerate(raw_chunks):
            chunk_id = f"{document_id}_p{page_num}_c{chunk_idx + 1}"
            all_chunks.append({
                "chunk_id": chunk_id,
                "document_id": document_id,
                "document_title": document_title,
                "page_number": page_num,
                "chunk_index": chunk_idx + 1,
                "course_code": course_code.upper().strip(),
                "subject_code": subject_code.upper().strip(),
                "department": department.upper().strip(),
                "access_scope": access_scope,
                "text": chunk_text,
                "char_length": len(chunk_text)
            })

    return all_chunks
