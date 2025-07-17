import logging
import os
import re
from typing import Dict, List


def extract_title_from_url_path(url: str) -> str:
    """Extract a title from a URL path."""
    parts = url.rstrip('/').split('/')
    return parts[-1] if parts else 'No title found'

def extract_link_info(markdown_link: str) -> tuple[str, str]:
    """Extract text and URL from a Markdown link [text](URL)."""
    match = re.match(r'\[(.*?)\]\((.*?)\)', markdown_link)
    if match:
        return match.group(1), match.group(2)
    return ("", "")

logger = logging.getLogger(__name__)

def clean_text(text: str) -> str:
    """Clean up text by replacing escaped quotes and other special characters."""
    text = re.sub(r'",?\s*"pdf_url":.+$', '', text)
    text = text.replace('\\"', '"')
    text = text.replace('\\n', '\n')
    text = text.replace('<para>', '').replace('</para>', '')
    return text.strip()
