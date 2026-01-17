from datetime import datetime, timezone
from typing import List, Optional
import logging
import re

logger = logging.getLogger(__name__)


def build_keyword_pattern(keyword: str) -> str:
    """
    Constrói um padrão regex para buscar uma palavra-chave, lidando corretamente
    com caracteres especiais como ponto (.), hash (#), plus (+), barra (/), hífen (-), etc.
    
    Esta função é usada por todos os campos de filtragem de palavras-chave:
    - Palavras-chave na Descrição (description_required_keywords)
    - Termos de Exclusão (exclude_keywords)
    - E pode ser usada para outros campos se necessário
    
    Para palavras com apenas caracteres alfanuméricos, usa word boundaries (\b).
    Para palavras com caracteres especiais (como .NET, C++, C#, PL/SQL, etc.),
    usa lookbehind e lookahead negativos para evitar substrings incorretas.
    
    Args:
        keyword: Palavra-chave a ser buscada (será convertida para lowercase)
    
    Returns:
        Padrão regex pronto para uso em re.search() ou re.match()
    
    Examples:
        >>> build_keyword_pattern('React')
        '\\\\breact\\\\b'
        >>> build_keyword_pattern('.NET')
        '(?<![a-zA-Z0-9_])\\\\.net(?![a-zA-Z0-9_])'
        >>> build_keyword_pattern('C#')
        '(?<![a-zA-Z0-9_])c#(?![a-zA-Z0-9_])'
    """
    keyword_escaped = re.escape(keyword.lower())
    
    # Verifica se a palavra contém apenas caracteres de palavra (letras, dígitos, underscore)
    if re.match(r'^[\w]+$', keyword):
        # Usa word boundaries para palavras normais
        return r'\b' + keyword_escaped + r'\b'
    else:
        # Para palavras com caracteres especiais (como .NET, C++, C#, PL/SQL, T-SQL, etc.),
        # usa uma busca que verifica se não está dentro de outra palavra
        # mas permite caracteres especiais
        # Usa lookbehind e lookahead negativos para evitar substrings
        return r'(?<![a-zA-Z0-9_])' + keyword_escaped + r'(?![a-zA-Z0-9_])'


# Mantém compatibilidade com código existente (função privada)
_build_keyword_pattern = build_keyword_pattern


def contains_exclude_keywords(text: str, exclude_keywords: List[str]) -> bool:
    """
    Verifica se o texto contém algum dos termos de exclusão.
    
    Usa a mesma lógica de busca de palavras-chave que suporta caracteres especiais.
    Esta função é usada para filtrar vagas que contêm termos indesejados.
    
    Args:
        text: Texto a ser verificado (geralmente a descrição da vaga)
        exclude_keywords: Lista de palavras-chave que excluem a vaga se encontradas
    
    Returns:
        True se algum termo de exclusão for encontrado, False caso contrário
    
    Examples:
        >>> contains_exclude_keywords("Vaga requer inglês avançado", ["inglês avançado"])
        True
        >>> contains_exclude_keywords("Vaga para desenvolvedor .NET", [".NET"])
        True
        >>> contains_exclude_keywords("Vaga para desenvolvedor NET", [".NET"])
        False
    """
    if not exclude_keywords or not text:
        return False
    
    text_lower = text.lower()
    for keyword in exclude_keywords:
        keyword_lower = keyword.lower().strip()
        if not keyword_lower:
            continue
        # Usa padrão adaptativo que funciona com caracteres especiais
        pattern = build_keyword_pattern(keyword_lower)
        if re.search(pattern, text_lower):
            return True
    return False


def find_word_keys(required_keywords: List[str], target_text: str) -> bool:
    """
    Verifica se o texto contém TODAS as palavras-chave obrigatórias.
    
    Usa a mesma lógica de busca de palavras-chave que suporta caracteres especiais.
    Esta função é usada para filtrar vagas que devem conter palavras-chave específicas
    na descrição (description_required_keywords).
    
    Args:
        required_keywords: Lista de palavras-chave que DEVEM estar presentes no texto
        target_text: Texto a ser verificado (geralmente a descrição da vaga)
    
    Returns:
        True se TODAS as palavras-chave forem encontradas, False caso contrário
    
    Examples:
        >>> find_word_keys(["React", ".NET"], "Vaga para desenvolvedor React e .NET")
        True
        >>> find_word_keys(["React", ".NET"], "Vaga para desenvolvedor React")
        False
        >>> find_word_keys(["C#"], "Vaga para desenvolvedor C#")
        True
        >>> find_word_keys(["C#"], "Vaga para desenvolvedor C")
        False
    """
    if not required_keywords or not target_text:
        return False
    
    target_lower = target_text.lower()
    for keyword in required_keywords:
        keyword_lower = keyword.lower().strip()
        if not keyword_lower:
            continue
        # Usa padrão adaptativo que funciona com caracteres especiais
        pattern = build_keyword_pattern(keyword_lower)
        if not re.search(pattern, target_lower):
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
