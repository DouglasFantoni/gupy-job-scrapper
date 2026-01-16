from datetime import datetime, timezone
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)


def contains_exclude_keywords(text: str, exclude_keywords: List[str]) -> bool:
    if not exclude_keywords or not text:
        return False
    
    text_lower = text.lower()
    for keyword in exclude_keywords:
        if keyword.lower() in text_lower:
            return True
    return False


def find_word_keys(required_keywords: List[str], target_text: str) -> bool:
    if not required_keywords or not target_text:
        return False
    
    target_lower = target_text.lower()
    for keyword in required_keywords:
        if keyword.lower() not in target_lower:
            return False
    return True


def parse_published_date(date_str: str) -> Optional[datetime]:
    if not date_str:
        return None

    try:
        dt = datetime.strptime(date_str, "%Y-%m-%dT%H:%M:%S.%fZ")
        return dt.replace(tzinfo=timezone.utc)
    except ValueError:
        try:
            dt = datetime.strptime(date_str, "%Y-%m-%dT%H:%M:%SZ")
            return dt.replace(tzinfo=timezone.utc)
        except ValueError:
            logger.warning(f"Erro ao converter data: {date_str}")
            return None
