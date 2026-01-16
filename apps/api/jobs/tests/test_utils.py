"""
Testes para jobs.utils
"""
from django.test import TestCase
from datetime import datetime, date
from jobs.utils import parse_keywords, parse_date_from_snapshot


class UtilsTestCase(TestCase):
    """Testes para funções utilitárias"""
    
    def test_parse_keywords_empty_string(self):
        """Testa parsing de string vazia"""
        result = parse_keywords('')
        self.assertEqual(result, [])
    
    def test_parse_keywords_single_keyword(self):
        """Testa parsing de uma única keyword"""
        result = parse_keywords('python')
        self.assertEqual(result, ['python'])
    
    def test_parse_keywords_multiple_keywords(self):
        """Testa parsing de múltiplas keywords"""
        result = parse_keywords('python, django, react')
        self.assertEqual(set(result), {'django', 'python', 'react'})
        self.assertEqual(len(result), 3)
    
    def test_parse_keywords_with_spaces(self):
        """Testa parsing com espaços"""
        result = parse_keywords(' python , django , react ')
        self.assertEqual(result, ['django', 'python', 'react'])
    
    def test_parse_keywords_empty_items(self):
        """Testa parsing com itens vazios"""
        result = parse_keywords('python,,django,')
        self.assertEqual(result, ['django', 'python'])
    
    def test_parse_date_from_snapshot_none(self):
        """Testa parsing de data None"""
        result = parse_date_from_snapshot(None)
        self.assertIsNone(result)
    
    def test_parse_date_from_snapshot_datetime(self):
        """Testa parsing de datetime"""
        dt = datetime(2024, 1, 15, 10, 30)
        result = parse_date_from_snapshot(dt)
        self.assertEqual(result, datetime(2024, 1, 15, 0, 0))
    
    def test_parse_date_from_snapshot_iso_string(self):
        """Testa parsing de string ISO"""
        result = parse_date_from_snapshot('2024-01-15')
        self.assertEqual(result, datetime(2024, 1, 15, 0, 0))
    
    def test_parse_date_from_snapshot_invalid_string(self):
        """Testa parsing de string inválida"""
        result = parse_date_from_snapshot('invalid-date')
        self.assertIsNone(result)

