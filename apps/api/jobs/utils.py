"""
Funções utilitárias reutilizáveis para o app jobs
"""
from datetime import datetime
from typing import List, Optional


def parse_keywords(keywords: str) -> List[str]:
    """
    Parseia uma string de keywords separadas por vírgula
    Remove espaços, filtra vazios e ordena alfabeticamente
    
    Args:
        keywords: String de keywords separadas por vírgula
    
    Returns:
        Lista de keywords normalizadas e ordenadas
    """
    if not keywords:
        return []
    parsed = [kw.strip() for kw in keywords.split(',') if kw.strip()]
    return sorted(parsed)


def parse_date_from_snapshot(date_value: Optional[str | datetime | None]) -> Optional[datetime]:
    """
    Parseia uma data do snapshot da configuração
    
    Args:
        date_value: Valor da data (pode ser string, datetime ou None)
    
    Returns:
        Objeto datetime ou None
    """
    if not date_value:
        return None
    
    if isinstance(date_value, datetime):
        # Normaliza para meia-noite (00:00:00)
        return datetime.combine(date_value.date(), datetime.min.time())
    
    if isinstance(date_value, str):
        try:
            date_obj = datetime.fromisoformat(date_value).date()
            return datetime.combine(date_obj, datetime.min.time())
        except (ValueError, AttributeError):
            return None
    
    return None

