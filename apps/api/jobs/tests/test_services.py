"""
Testes para gupy_scraper package
"""
from django.test import TestCase
from unittest.mock import patch, MagicMock
from datetime import datetime
from gupy_scraper import (
    JobScraperService,
    contains_exclude_keywords,
    find_word_keys,
    parse_published_date
)


class ServicesUtilsTestCase(TestCase):
    """Testes para funções utilitárias de services"""
    
    def test_contains_exclude_keywords_found(self):
        """Testa detecção de keywords de exclusão"""
        text = "Vaga requer inglês avançado e experiência"
        exclude_keywords = ['inglês avançado', 'espanhol']
        self.assertTrue(contains_exclude_keywords(text, exclude_keywords))
    
    def test_contains_exclude_keywords_not_found(self):
        """Testa quando não encontra keywords de exclusão"""
        text = "Vaga para desenvolvedor Python"
        exclude_keywords = ['inglês avançado']
        self.assertFalse(contains_exclude_keywords(text, exclude_keywords))
    
    def test_contains_exclude_keywords_empty(self):
        """Testa com lista vazia"""
        text = "Qualquer texto"
        self.assertFalse(contains_exclude_keywords(text, []))
    
    def test_find_word_keys_all_found(self):
        """Testa quando todas as keywords são encontradas"""
        text = "Vaga para desenvolvedor Python com Django e React"
        keywords = ['python', 'django', 'react']
        self.assertTrue(find_word_keys(keywords, text))
    
    def test_find_word_keys_not_all_found(self):
        """Testa quando nem todas as keywords são encontradas"""
        text = "Vaga para desenvolvedor Python"
        keywords = ['python', 'django', 'react']
        self.assertFalse(find_word_keys(keywords, text))
    
    def test_find_word_keys_case_insensitive(self):
        """Testa que busca é case insensitive"""
        text = "Vaga para desenvolvedor PYTHON"
        keywords = ['python']
        self.assertTrue(find_word_keys(keywords, text))
    
    def test_parse_published_date_valid(self):
        """Testa parsing de data válida"""
        date_str = "2024-01-15T10:30:00.000Z"
        result = parse_published_date(date_str)
        self.assertIsNotNone(result)
        self.assertEqual(result.year, 2024)
        self.assertEqual(result.month, 1)
        self.assertEqual(result.day, 15)
    
    def test_parse_published_date_without_milliseconds(self):
        """Testa parsing de data sem milissegundos"""
        date_str = "2024-01-15T10:30:00Z"
        result = parse_published_date(date_str)
        self.assertIsNotNone(result)
    
    def test_parse_published_date_invalid(self):
        """Testa parsing de data inválida"""
        date_str = "invalid-date"
        result = parse_published_date(date_str)
        self.assertIsNone(result)
    
    def test_parse_published_date_empty(self):
        """Testa parsing de string vazia"""
        result = parse_published_date('')
        self.assertIsNone(result)


class JobScraperServiceTestCase(TestCase):
    """Testes para JobScraperService"""
    
    def setUp(self):
        """Setup para testes"""
        self.service = JobScraperService(
            date_start=datetime(2024, 1, 1),
            description_required_keywords=['python', 'django'],
            workplace_types=['remote'],
            exclude_keywords=['inglês avançado'],
            state='São Paulo',
            country='Brasil',
            job_types=['vacancy_type_effective']
        )
    
    def test_process_job_without_id(self):
        """Testa processamento de vaga sem ID"""
        job = {'name': 'Test Job'}
        should_save, reason, data = self.service.process_job(job)
        self.assertFalse(should_save)
        self.assertEqual(reason, 'sem_id')
    
    def test_process_job_old_date(self):
        """Testa filtro por data antiga"""
        job = {
            'id': '123',
            'publishedDate': '2023-12-01T10:00:00.000Z',
            'description': 'Python developer with Django',
            'workplaceTypes': ['remote']
        }
        should_save, reason, data = self.service.process_job(job)
        self.assertFalse(should_save)
        self.assertEqual(reason, 'data_antiga')
    
    def test_process_job_exclude_keywords(self):
        """Testa filtro por keywords de exclusão"""
        job = {
            'id': '123',
            'publishedDate': '2024-02-01T10:00:00.000Z',
            'description': 'Vaga requer inglês avançado',
            'workplaceTypes': ['remote']
        }
        should_save, reason, data = self.service.process_job(job)
        self.assertFalse(should_save)
        self.assertEqual(reason, 'contem_termos_exclusao')
    
    def test_process_job_missing_keywords(self):
        """Testa filtro por keywords obrigatórias"""
        job = {
            'id': '123',
            'publishedDate': '2024-02-01T10:00:00.000Z',
            'description': 'Vaga para desenvolvedor',
            'workplaceTypes': ['remote']
        }
        should_save, reason, data = self.service.process_job(job)
        self.assertFalse(should_save)
        self.assertEqual(reason, 'sem_palavras_chave')
    
    def test_process_job_wrong_workplace_type(self):
        """Testa filtro por tipo de local de trabalho"""
        job = {
            'id': '123',
            'publishedDate': '2024-02-01T10:00:00.000Z',
            'description': 'Python developer with Django',
            'workplaceTypes': ['on-site']
        }
        should_save, reason, data = self.service.process_job(job)
        self.assertFalse(should_save)
        self.assertEqual(reason, 'workplace_type_nao_permitido')
    
    @patch('gupy_scraper.services.fetch_all_jobs_from_api')
    def test_search_jobs_success(self, mock_fetch):
        """Testa busca de vagas com sucesso"""
        from datetime import datetime
        mock_fetch.return_value = ([
            {
                'id': '123',
                'publishedDate': '2024-02-01T10:00:00.000Z',
                'description': 'Python developer with Django',
                'workplaceTypes': ['remote'],
                'name': 'Python Developer',
                'companyId': 'comp1',
                'careerPageName': 'Test Company',
                'type': 'CLT',
                'city': 'São Paulo',
                'state': 'SP',
                'country': 'Brasil',
                'jobUrl': 'https://example.com/job/123'
            }
        ], 1)
        
        vacancies, stats = self.service.search_jobs(['python'])
        
        self.assertGreaterEqual(len(vacancies), 0)
        self.assertIn('salva', stats)
        mock_fetch.assert_called()

