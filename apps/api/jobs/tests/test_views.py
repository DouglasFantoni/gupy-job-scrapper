"""
Testes para jobs.views
"""
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from jobs.models import Config, Search, Vacancy
from datetime import date
import json


class ConfigViewSetTestCase(TestCase):
    """Testes para ConfigViewSet"""
    
    def setUp(self):
        """Setup para testes"""
        self.client = APIClient()
        self.config_data = {
            'title_keywords': 'python, django',
            'description_required_keywords': 'react',
            'workplace_types': ['remote'],
            'exclude_keywords': [],
            'state': 'São Paulo',
            'country': 'Brasil',
            'job_types': ['vacancy_type_effective']
        }
    
    def test_create_config(self):
        """Testa criação de configuração"""
        response = self.client.post('/api/configs/', self.config_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('id', response.data)
    
    def test_list_configs(self):
        """Testa listagem de configurações"""
        Config.objects.create(**self.config_data)
        response = self.client.get('/api/configs/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_get_latest_config(self):
        """Testa obtenção da última configuração"""
        config = Config.objects.create(**self.config_data)
        response = self.client.get('/api/configs/latest/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], config.id)
    
    def test_get_latest_config_not_found(self):
        """Testa quando não há configurações"""
        response = self.client.get('/api/configs/latest/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_delete_config(self):
        """Testa exclusão de configuração"""
        config = Config.objects.create(**self.config_data)
        response = self.client.delete(f'/api/configs/{config.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Config.objects.filter(id=config.id).exists())


class SearchViewSetTestCase(TestCase):
    """Testes para SearchViewSet"""
    
    def setUp(self):
        """Setup para testes"""
        self.client = APIClient()
        self.config = Config.objects.create(
            title_keywords='python',
            description_required_keywords='django',
            workplace_types=['remote'],
            exclude_keywords=[]
        )
    
    def test_create_search(self):
        """Testa criação de busca"""
        response = self.client.post('/api/searches/', {'config': self.config.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('id', response.data)
        self.assertEqual(response.data['status'], 'pending')
    
    def test_get_search_status(self):
        """Testa obtenção de status de busca"""
        search = Search.objects.create(
            config=self.config,
            config_snapshot={},
            status='running'
        )
        response = self.client.get(f'/api/searches/{search.id}/status/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'running')


class VacancyViewSetTestCase(TestCase):
    """Testes para VacancyViewSet"""
    
    def setUp(self):
        """Setup para testes"""
        self.client = APIClient()
        self.config = Config.objects.create(
            title_keywords='python',
            description_required_keywords='django',
            workplace_types=['remote'],
            exclude_keywords=[]
        )
        self.search = Search.objects.create(
            config=self.config,
            config_snapshot={},
            status='completed'
        )
        self.vacancy = Vacancy.objects.create(
            job_id='test-123',
            name='Python Developer',
            description='Python developer position',
            career_page_name='Test Company',
            type='CLT',
            published_date=date.today(),
            workplace_types=['remote'],
            city='São Paulo',
            state='SP',
            country='Brasil',
            job_url='https://example.com/job/123'
        )
        self.vacancy.searches.add(self.search)
    
    def test_list_vacancies(self):
        """Testa listagem de vagas"""
        response = self.client.get('/api/vacancies/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_list_vacancies_with_search_id(self):
        """Testa listagem filtrada por search_id"""
        response = self.client.get(f'/api/vacancies/?search_id={self.search.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_mark_vacancy_viewed(self):
        """Testa marcar vaga como vista"""
        response = self.client.post(f'/api/vacancies/{self.vacancy.id}/view/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.vacancy.refresh_from_db()
        self.assertIsNotNone(self.vacancy.viewed_at)
    
    def test_delete_vacancy(self):
        """Testa soft delete de vaga"""
        response = self.client.post(f'/api/vacancies/{self.vacancy.id}/delete/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.vacancy.refresh_from_db()
        self.assertIsNotNone(self.vacancy.deleted_at)
    
    def test_get_unviewed_urls(self):
        """Testa obtenção de URLs não vistas"""
        response = self.client.get(f'/api/vacancies/open-all-unviewed/?search_id={self.search.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('urls', response.data)
        self.assertIn('count', response.data)
    
    def test_create_vacancy_not_allowed(self):
        """Testa que criação de vaga não é permitida via API"""
        response = self.client.post('/api/vacancies/', {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

