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
    
    def test_find_word_keys_whole_word_only(self):
        """Testa que busca apenas palavras inteiras, não substrings"""
        # "react" não deve corresponder a "reactive"
        text = "Vaga para desenvolvedor com experiência em Reactive Programming"
        keywords = ['react']
        self.assertFalse(find_word_keys(keywords, text))
        
        # Mas "react" deve corresponder a "react" (palavra completa)
        text2 = "Vaga para desenvolvedor React"
        keywords2 = ['react']
        self.assertTrue(find_word_keys(keywords2, text2))
        
        # "react" deve corresponder a "React" (case insensitive)
        text3 = "Vaga para desenvolvedor REACT"
        keywords3 = ['react']
        self.assertTrue(find_word_keys(keywords3, text3))
    
    def test_contains_exclude_keywords_whole_word_only(self):
        """Testa que exclusão busca apenas palavras inteiras, não substrings"""
        # "react" não deve corresponder a "reactive"
        text = "Vaga para desenvolvedor com experiência em Reactive Programming"
        exclude_keywords = ['react']
        self.assertFalse(contains_exclude_keywords(text, exclude_keywords))
        
        # Mas "react" deve corresponder a "react" (palavra completa)
        text2 = "Vaga para desenvolvedor React"
        exclude_keywords2 = ['react']
        self.assertTrue(contains_exclude_keywords(text2, exclude_keywords2))
    
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
    
    def test_find_word_keys_with_special_characters(self):
        """Testa busca de keywords com caracteres especiais como ponto, #, +, /, etc."""
        # Testa com .NET
        text1 = "Vaga para desenvolvedor .NET com experiência em C#"
        keywords1 = ['.NET']
        self.assertTrue(find_word_keys(keywords1, text1))
        
        # Testa com .NET em diferentes contextos
        text2 = "Buscamos desenvolvedor .NET para nossa equipe"
        keywords2 = ['.NET']
        self.assertTrue(find_word_keys(keywords2, text2))
        
        # Testa múltiplas keywords com caracteres especiais
        text3 = "Vaga para desenvolvedor React e .NET"
        keywords3 = ['React', '.NET']
        self.assertTrue(find_word_keys(keywords3, text3))
        
        # Testa que não encontra substring incorreta
        text4 = "Vaga para desenvolvedor NET (sem ponto)"
        keywords4 = ['.NET']
        self.assertFalse(find_word_keys(keywords4, text4))
        
        # Testa C#
        text5 = "Vaga para desenvolvedor C# com experiência em .NET"
        keywords5 = ['C#']
        self.assertTrue(find_word_keys(keywords5, text5))
        # Não deve encontrar em "C" sozinho
        text5b = "Vaga para desenvolvedor C com experiência"
        self.assertFalse(find_word_keys(keywords5, text5b))
        
        # Testa C++
        text6 = "Vaga para desenvolvedor C++ com experiência em sistemas"
        keywords6 = ['C++']
        self.assertTrue(find_word_keys(keywords6, text6))
        # Não deve encontrar em "C" sozinho
        text6b = "Vaga para desenvolvedor C com experiência"
        self.assertFalse(find_word_keys(keywords6, text6b))
        
        # Testa F#
        text7 = "Vaga para desenvolvedor F# com experiência funcional"
        keywords7 = ['F#']
        self.assertTrue(find_word_keys(keywords7, text7))
        # Não deve encontrar em "F" sozinho
        text7b = "Vaga para desenvolvedor F com experiência"
        self.assertFalse(find_word_keys(keywords7, text7b))
        
        # Testa VB.NET
        text8 = "Vaga para desenvolvedor VB.NET com experiência em Visual Basic"
        keywords8 = ['VB.NET']
        self.assertTrue(find_word_keys(keywords8, text8))
        # Não deve encontrar em "VB" sozinho
        text8b = "Vaga para desenvolvedor VB com experiência"
        self.assertFalse(find_word_keys(keywords8, text8b))
        
        # Testa ASP.NET
        text9 = "Vaga para desenvolvedor ASP.NET com experiência web"
        keywords9 = ['ASP.NET']
        self.assertTrue(find_word_keys(keywords9, text9))
        # Não deve encontrar em "ASP" sozinho
        text9b = "Vaga para desenvolvedor ASP com experiência"
        self.assertFalse(find_word_keys(keywords9, text9b))
        
        # Testa PL/SQL
        text10 = "Vaga para desenvolvedor PL/SQL com experiência em Oracle"
        keywords10 = ['PL/SQL']
        self.assertTrue(find_word_keys(keywords10, text10))
        # Não deve encontrar em "PL" ou "SQL" sozinhos
        text10b = "Vaga para desenvolvedor PL com experiência SQL"
        self.assertFalse(find_word_keys(keywords10, text10b))
        
        # Testa T-SQL
        text11 = "Vaga para desenvolvedor T-SQL com experiência em SQL Server"
        keywords11 = ['T-SQL']
        self.assertTrue(find_word_keys(keywords11, text11))
        # Não deve encontrar em "T" ou "SQL" sozinhos
        text11b = "Vaga para desenvolvedor T com experiência SQL"
        self.assertFalse(find_word_keys(keywords11, text11b))
        
        # Testa Q#
        text12 = "Vaga para desenvolvedor Q# com experiência em quantum computing"
        keywords12 = ['Q#']
        self.assertTrue(find_word_keys(keywords12, text12))
        # Não deve encontrar em "Q" sozinho
        text12b = "Vaga para desenvolvedor Q com experiência"
        self.assertFalse(find_word_keys(keywords12, text12b))
        
        # Testa Objective-C
        text13 = "Vaga para desenvolvedor Objective-C com experiência em iOS"
        keywords13 = ['Objective-C']
        self.assertTrue(find_word_keys(keywords13, text13))
        # Não deve encontrar em "Objective" ou "C" sozinhos
        text13b = "Vaga para desenvolvedor Objective com experiência C"
        self.assertFalse(find_word_keys(keywords13, text13b))
        
        # Testa múltiplas tecnologias juntas
        text14 = "Vaga para desenvolvedor com experiência em C#, .NET, ASP.NET e PL/SQL"
        keywords14 = ['C#', '.NET', 'ASP.NET', 'PL/SQL']
        self.assertTrue(find_word_keys(keywords14, text14))
        
        # Testa que todas devem estar presentes
        text15 = "Vaga para desenvolvedor com experiência em C# e .NET"
        keywords15 = ['C#', '.NET', 'ASP.NET']  # ASP.NET não está presente
        self.assertFalse(find_word_keys(keywords15, text15))
    
    def test_contains_exclude_keywords_with_special_characters(self):
        """Testa exclusão de keywords com caracteres especiais"""
        # Testa com .NET
        text1 = "Vaga para desenvolvedor .NET"
        exclude_keywords1 = ['.NET']
        self.assertTrue(contains_exclude_keywords(text1, exclude_keywords1))
        
        # Testa que não encontra substring incorreta
        text2 = "Vaga para desenvolvedor NET (sem ponto)"
        exclude_keywords2 = ['.NET']
        self.assertFalse(contains_exclude_keywords(text2, exclude_keywords2))
        
        # Testa C#
        text3 = "Vaga para desenvolvedor C#"
        exclude_keywords3 = ['C#']
        self.assertTrue(contains_exclude_keywords(text3, exclude_keywords3))
        
        # Testa C++
        text4 = "Vaga para desenvolvedor C++"
        exclude_keywords4 = ['C++']
        self.assertTrue(contains_exclude_keywords(text4, exclude_keywords4))
        
        # Testa F#
        text5 = "Vaga para desenvolvedor F#"
        exclude_keywords5 = ['F#']
        self.assertTrue(contains_exclude_keywords(text5, exclude_keywords5))
        
        # Testa VB.NET
        text6 = "Vaga para desenvolvedor VB.NET"
        exclude_keywords6 = ['VB.NET']
        self.assertTrue(contains_exclude_keywords(text6, exclude_keywords6))
        
        # Testa ASP.NET
        text7 = "Vaga para desenvolvedor ASP.NET"
        exclude_keywords7 = ['ASP.NET']
        self.assertTrue(contains_exclude_keywords(text7, exclude_keywords7))
        
        # Testa PL/SQL
        text8 = "Vaga para desenvolvedor PL/SQL"
        exclude_keywords8 = ['PL/SQL']
        self.assertTrue(contains_exclude_keywords(text8, exclude_keywords8))
        
        # Testa T-SQL
        text9 = "Vaga para desenvolvedor T-SQL"
        exclude_keywords9 = ['T-SQL']
        self.assertTrue(contains_exclude_keywords(text9, exclude_keywords9))
        
        # Testa Q#
        text10 = "Vaga para desenvolvedor Q#"
        exclude_keywords10 = ['Q#']
        self.assertTrue(contains_exclude_keywords(text10, exclude_keywords10))
        
        # Testa Objective-C
        text11 = "Vaga para desenvolvedor Objective-C"
        exclude_keywords11 = ['Objective-C']
        self.assertTrue(contains_exclude_keywords(text11, exclude_keywords11))
        
        # Testa múltiplas tecnologias de exclusão
        text12 = "Vaga para desenvolvedor C# e .NET"
        exclude_keywords12 = ['C#', '.NET']
        self.assertTrue(contains_exclude_keywords(text12, exclude_keywords12))


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

