"""
SmartCampus AI — Academic Document Text Extractor
================================================
Extracts text page-by-page from academic PDF and text documents, preserves
source-location metadata (page numbers), and detects scanned/empty documents.
"""

import io
import re
from typing import List, Dict, Any, Union
import pypdf

MINIMUM_TEXT_THRESHOLD = 30  # Minimum characters to consider document extractable


def normalize_whitespace(text: str) -> str:
    """Collapses duplicate spaces and excessive newlines while preserving paragraph breaks."""
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n\s*\n+', '\n\n', text)
    return text.strip()


def extract_text_from_pdf(source: Union[bytes, str]) -> List[Dict[str, Any]]:
    """
    Extracts text page-by-page from PDF bytes or a local file path.
    Preserves exact page numbering (1-indexed).
    Raises ValueError if the PDF is scanned, empty, or unreadable.
    """
    try:
        if isinstance(source, bytes):
            reader = pypdf.PdfReader(io.BytesIO(source))
        elif isinstance(source, str):
            reader = pypdf.PdfReader(source)
        else:
            raise ValueError("Unsupported source format: expected bytes or file path string.")
    except Exception as e:
        raise ValueError(f"Failed to parse PDF document structure: {str(e)}")

    if len(reader.pages) == 0:
        raise ValueError("The provided PDF contains 0 pages.")

    pages_data: List[Dict[str, Any]] = []
    total_characters = 0

    for idx, page in enumerate(reader.pages):
        page_num = idx + 1
        try:
            page_text = page.extract_text() or ""
        except Exception:
            page_text = ""

        cleaned_text = normalize_whitespace(page_text)
        total_characters += len(cleaned_text)

        pages_data.append({
            "page_number": page_num,
            "text": cleaned_text,
            "char_count": len(cleaned_text)
        })

    # Validate extractable text threshold
    if total_characters < MINIMUM_TEXT_THRESHOLD:
        raise ValueError(
            "Scanned PDF or insufficient extractable text detected. "
            "SmartCampus AI does not have OCR enabled for image-only scans. "
            "Please provide a text-based PDF or notes handout."
        )

    return pages_data


def extract_text_from_string(raw_text: str, fallback_title: str = "Document") -> List[Dict[str, Any]]:
    """
    Converts raw text notes into structured pages, recognizing form feeds or page delimiters.
    """
    cleaned = normalize_whitespace(raw_text)
    if len(cleaned) < 20:
        raise ValueError("Insufficient document text provided for indexing (minimum 20 characters required).")

    # If form-feed '\f' is present, treat as page separators
    raw_pages = cleaned.split('\f')
    pages_data: List[Dict[str, Any]] = []

    for idx, p_text in enumerate(raw_pages):
        p_clean = normalize_whitespace(p_text)
        if p_clean:
            pages_data.append({
                "page_number": idx + 1,
                "text": p_clean,
                "char_count": len(p_clean)
            })

    if not pages_data:
        pages_data.append({
            "page_number": 1,
            "text": cleaned,
            "char_count": len(cleaned)
        })

    return pages_data
