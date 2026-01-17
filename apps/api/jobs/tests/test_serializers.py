"""
Testes para jobs.serializers
"""
from django.test import TestCase
from jobs.models import Config, Search, Vacancy
from jobs.serializers import ConfigSerializer, SearchSerializer, VacancySerializer
from datetime import date, datetime
from django.utils import timezone


class ConfigSerializerTestCase(TestCase):
    """Testes para ConfigSerializer"""
    
    def setUp(self):
        """Setup para testes"""
        self.valid_data = {
            'name': 'Busca Python',
            'title_keywords': 'python, django',
            'description_required_keywords': 'react, javascript',
            'workplace_types': ['remote', 'hybrid'],
            'exclude_keywords': ['inglês avançado'],
            'state': 'São Paulo',
            'country': 'Brasil',
            'job_types': ['vacancy_type_effective']
        }
    
    def test_serializer_valid_data(self):
        """Testa serialização de dados válidos"""
        serializer = ConfigSerializer(data=self.valid_data)
        self.assertTrue(serializer.is_valid())
    
    def test_serializer_name_required(self):
        """Testa que name é obrigatório"""
        data = self.valid_data.copy()
        data['name'] = ''
        serializer = ConfigSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('name', serializer.errors)
    
    def test_serializer_title_keywords_required(self):
        """Testa que title_keywords é obrigatório"""
        data = self.valid_data.copy()
        data['title_keywords'] = ''
        serializer = ConfigSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('title_keywords', serializer.errors)
    
    def test_serializer_workplace_types_validation(self):
        """Testa validação de workplace_types"""
        data = self.valid_data.copy()
        data['workplace_types'] = ['invalid_type']
        serializer = ConfigSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('workplace_types', serializer.errors)
    
    def test_serializer_workplace_types_string(self):
        """Testa que workplace_types aceita string"""
        data = self.valid_data.copy()
        data['workplace_types'] = 'remote,hybrid'
        serializer = ConfigSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        result = set(serializer.validated_data['workplace_types'])
        self.assertEqual(result, {'hybrid', 'remote'})
    
    def test_serializer_job_types_validation(self):
        """Testa validação de job_types"""
        data = self.valid_data.copy()
        data['job_types'] = ['invalid_job_type']
        serializer = ConfigSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('job_types', serializer.errors)
    
    def test_serializer_exclude_keywords_string(self):
        """Testa que exclude_keywords aceita string"""
        data = self.valid_data.copy()
        data['exclude_keywords'] = 'inglês, espanhol'
        serializer = ConfigSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        self.assertIsInstance(serializer.validated_data['exclude_keywords'], list)


class SearchSerializerTestCase(TestCase):
    """Testes para SearchSerializer"""
    
    def setUp(self):
        """Setup para testes"""
        self.config = Config.objects.create(
            name='Busca Python',
            title_keywords='python',
            description_required_keywords='django',
            workplace_types=['remote'],
            exclude_keywords=[]
        )
    
    def test_create_search_with_snapshot(self):
        """Testa criação de busca com snapshot"""
        serializer = SearchSerializer(data={'config': self.config.id})
        self.assertTrue(serializer.is_valid())
        search = serializer.save()
        
        self.assertIsNotNone(search.config_snapshot)
        self.assertEqual(search.config_snapshot['name'], 'Busca Python')
        self.assertEqual(search.config_snapshot['title_keywords'], 'python')
        self.assertEqual(search.status, 'pending')


class VacancySerializerTestCase(TestCase):
    """Testes para VacancySerializer"""
    
    def setUp(self):
        """Setup para testes"""
        self.vacancy_data = {
            'job_id': 'test-123',
            'company_id': 'company-123',
            'name': 'Desenvolvedor Python',
            'description': 'Vaga para desenvolvedor',
            'career_page_name': 'Test Company',
            'type': 'CLT',
            'published_date': timezone.now(),
            'workplace_types': ['remote'],
            'city': 'São Paulo',
            'state': 'SP',
            'country': 'Brasil',
            'job_url': 'https://example.com/job/123'
        }
    
    def test_vacancy_workplace_types_display(self):
        """Testa display de workplace_types"""
        vacancy = Vacancy.objects.create(**self.vacancy_data)
        serializer = VacancySerializer(vacancy)
        
        self.assertEqual(serializer.data['workplace_types_display'], 'Remoto')
    
    def test_vacancy_is_viewed_property(self):
        """Testa propriedade is_viewed"""
        vacancy = Vacancy.objects.create(**self.vacancy_data)
        self.assertFalse(vacancy.is_viewed)
        
        vacancy.viewed_at = timezone.now()
        vacancy.save()
        self.assertTrue(vacancy.is_viewed)

