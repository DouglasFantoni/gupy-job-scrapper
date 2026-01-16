"""
Testes para jobs.models
"""
from django.test import TestCase
from jobs.models import Config, Search, Vacancy, SearchVacancy
from datetime import date, datetime
from django.utils import timezone


class ConfigModelTestCase(TestCase):
    """Testes para modelo Config"""
    
    def test_create_config(self):
        """Testa criação de configuração"""
        config = Config.objects.create(
            title_keywords='python, django',
            description_required_keywords='react',
            workplace_types=['remote'],
            exclude_keywords=['inglês']
        )
        self.assertIsNotNone(config.id)
        self.assertEqual(config.title_keywords, 'python, django')
    
    def test_config_ordering(self):
        """Testa ordenação de configurações"""
        config1 = Config.objects.create(
            title_keywords='python',
            description_required_keywords='django',
            workplace_types=[],
            exclude_keywords=[]
        )
        config2 = Config.objects.create(
            title_keywords='react',
            description_required_keywords='javascript',
            workplace_types=[],
            exclude_keywords=[]
        )
        
        configs = list(Config.objects.all())
        self.assertEqual(configs[0].id, config2.id)


class SearchModelTestCase(TestCase):
    """Testes para modelo Search"""
    
    def setUp(self):
        """Setup para testes"""
        self.config = Config.objects.create(
            title_keywords='python',
            description_required_keywords='django',
            workplace_types=['remote'],
            exclude_keywords=[]
        )
    
    def test_create_search(self):
        """Testa criação de busca"""
        search = Search.objects.create(
            config=self.config,
            config_snapshot={
                'title_keywords': 'python',
                'workplace_types': ['remote']
            },
            status='pending'
        )
        self.assertIsNotNone(search.id)
        self.assertEqual(search.status, 'pending')
    
    def test_search_status_choices(self):
        """Testa choices de status"""
        search = Search.objects.create(
            config=self.config,
            config_snapshot={},
            status='running'
        )
        self.assertEqual(search.status, 'running')
        
        search.status = 'completed'
        search.save()
        self.assertEqual(search.status, 'completed')


class VacancyModelTestCase(TestCase):
    """Testes para modelo Vacancy"""
    
    def test_create_vacancy(self):
        """Testa criação de vaga"""
        vacancy = Vacancy.objects.create(
            job_id='test-123',
            name='Python Developer',
            description='Python developer position',
            career_page_name='Test Company',
            type='CLT',
            published_date=timezone.now(),
            workplace_types=['remote'],
            city='São Paulo',
            state='SP',
            country='Brasil',
            job_url='https://example.com/job/123'
        )
        self.assertIsNotNone(vacancy.id)
        self.assertEqual(vacancy.job_id, 'test-123')
    
    def test_vacancy_is_viewed_property(self):
        """Testa propriedade is_viewed"""
        vacancy = Vacancy.objects.create(
            job_id='test-123',
            name='Test',
            description='Test',
            career_page_name='Test',
            type='CLT',
            published_date=timezone.now(),
            workplace_types=[],
            city='',
            state='',
            country='',
            job_url='https://example.com'
        )
        self.assertFalse(vacancy.is_viewed)
        
        vacancy.viewed_at = timezone.now()
        vacancy.save()
        self.assertTrue(vacancy.is_viewed)
    
    def test_vacancy_is_deleted_property(self):
        """Testa propriedade is_deleted"""
        vacancy = Vacancy.objects.create(
            job_id='test-123',
            name='Test',
            description='Test',
            career_page_name='Test',
            type='CLT',
            published_date=timezone.now(),
            workplace_types=[],
            city='',
            state='',
            country='',
            job_url='https://example.com'
        )
        self.assertFalse(vacancy.is_deleted)
        
        vacancy.deleted_at = timezone.now()
        vacancy.save()
        self.assertTrue(vacancy.is_deleted)
    
    def test_vacancy_search_relationship(self):
        """Testa relacionamento com Search"""
        config = Config.objects.create(
            title_keywords='python',
            description_required_keywords='django',
            workplace_types=[],
            exclude_keywords=[]
        )
        search = Search.objects.create(
            config=config,
            config_snapshot={},
            status='completed'
        )
        vacancy = Vacancy.objects.create(
            job_id='test-123',
            name='Test',
            description='Test',
            career_page_name='Test',
            type='CLT',
            published_date=timezone.now(),
            workplace_types=[],
            city='',
            state='',
            country='',
            job_url='https://example.com'
        )
        
        SearchVacancy.objects.create(search=search, vacancy=vacancy)
        
        self.assertIn(search, vacancy.searches.all())
        self.assertIn(vacancy, search.vacancies.all())

