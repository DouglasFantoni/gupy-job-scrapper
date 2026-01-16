"""
Constantes reutilizáveis para o app jobs
"""

WORKPLACE_TYPE_LABELS = {
    'remote': 'Remoto',
    'hybrid': 'Híbrido',
    'on-site': 'Presencial'
}

# Tipos de local de trabalho válidos
VALID_WORKPLACE_TYPES = ['remote', 'hybrid', 'on-site']

# Tipos de vaga válidos
VALID_JOB_TYPES = [
    'vacancy_type_effective',
    'vacancy_type_internship',
    'vacancy_type_temporary',
    'vacancy_type_talent_pool',
    'vacancy_legal_entity'
]

JOB_TYPE_LABELS = {
    'vacancy_type_effective': 'CLT/Efetiva',
    'vacancy_type_internship': 'Estágio',
    'vacancy_type_temporary': 'Temporária',
    'vacancy_type_talent_pool': 'Banco de Talentos',
    'vacancy_legal_entity': 'Pessoa Jurídica'
}


def format_workplace_types(workplace_types, default='N/A'):
    """
    Formata tipos de local de trabalho para exibição
    
    Args:
        workplace_types: Lista de tipos de local de trabalho
        default: Valor padrão se a lista estiver vazia
    
    Returns:
        String formatada com os tipos ou valor padrão
    """
    if not workplace_types:
        return default
    
    return ', '.join([WORKPLACE_TYPE_LABELS.get(wt, wt) for wt in workplace_types])

