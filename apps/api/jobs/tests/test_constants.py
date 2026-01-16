"""
Testes para jobs.constants
"""
from django.test import TestCase
from jobs.constants import (
    VALID_WORKPLACE_TYPES,
    VALID_JOB_TYPES,
    WORKPLACE_TYPE_LABELS,
    JOB_TYPE_LABELS,
    format_workplace_types
)


class ConstantsTestCase(TestCase):
    """Testes para constantes"""
    
    def test_valid_workplace_types(self):
        """Testa tipos válidos de local de trabalho"""
        self.assertIn('remote', VALID_WORKPLACE_TYPES)
        self.assertIn('hybrid', VALID_WORKPLACE_TYPES)
        self.assertIn('on-site', VALID_WORKPLACE_TYPES)
        self.assertEqual(len(VALID_WORKPLACE_TYPES), 3)
    
    def test_valid_job_types(self):
        """Testa tipos válidos de vaga"""
        expected_types = [
            'vacancy_type_effective',
            'vacancy_type_internship',
            'vacancy_type_temporary',
            'vacancy_type_talent_pool',
            'vacancy_legal_entity'
        ]
        for job_type in expected_types:
            self.assertIn(job_type, VALID_JOB_TYPES)
    
    def test_workplace_type_labels(self):
        """Testa labels de tipos de local de trabalho"""
        self.assertEqual(WORKPLACE_TYPE_LABELS['remote'], 'Remoto')
        self.assertEqual(WORKPLACE_TYPE_LABELS['hybrid'], 'Híbrido')
        self.assertEqual(WORKPLACE_TYPE_LABELS['on-site'], 'Presencial')
    
    def test_job_type_labels(self):
        """Testa labels de tipos de vaga"""
        self.assertEqual(JOB_TYPE_LABELS['vacancy_type_effective'], 'CLT/Efetiva')
        self.assertEqual(JOB_TYPE_LABELS['vacancy_type_internship'], 'Estágio')
    
    def test_format_workplace_types_empty(self):
        """Testa formatação de array vazio"""
        result = format_workplace_types([])
        self.assertEqual(result, 'N/A')
    
    def test_format_workplace_types_single(self):
        """Testa formatação de um tipo"""
        result = format_workplace_types(['remote'])
        self.assertEqual(result, 'Remoto')
    
    def test_format_workplace_types_multiple(self):
        """Testa formatação de múltiplos tipos"""
        result = format_workplace_types(['remote', 'hybrid'])
        self.assertEqual(result, 'Remoto, Híbrido')
    
    def test_format_workplace_types_custom_default(self):
        """Testa formatação com default customizado"""
        result = format_workplace_types([], default='Nenhum')
        self.assertEqual(result, 'Nenhum')

