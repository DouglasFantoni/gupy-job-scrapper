from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils import timezone
from django.db import transaction
from datetime import datetime
import threading
import logging

from .models import Config, Search, Vacancy, SearchVacancy
from .serializers import ConfigSerializer, SearchSerializer, VacancySerializer, VacancyListSerializer
from gupy_scraper import JobScraperService
from .utils import parse_keywords, parse_date_from_snapshot

logger = logging.getLogger(__name__)


def run_search_task(search_id):
    """
    Executa a busca de vagas em background
    """
    try:
        search = Search.objects.get(id=search_id)
        search.status = 'running'
        search.started_at = timezone.now()
        search.save()
        
        config = search.config
        config_snapshot = search.config_snapshot
        
        title_keywords = parse_keywords(config.title_keywords)
        description_keywords_str = config_snapshot.get('description_required_keywords', '') or config.description_required_keywords or ''
        description_keywords = parse_keywords(description_keywords_str)
        
        date_start_dt = parse_date_from_snapshot(config_snapshot.get('date_start'))
        
        scraper = JobScraperService(
            date_start=date_start_dt if date_start_dt else None,
            description_required_keywords=description_keywords,
            workplace_types=config_snapshot.get('workplace_types', []),
            exclude_keywords=config_snapshot.get('exclude_keywords', []),
            state=config_snapshot.get('state') or None,
            country=config_snapshot.get('country') or None,
            job_types=config_snapshot.get('job_types', [])
        )
        
        vacancies_data, stats = scraper.search_jobs(title_keywords)
        
        logger.info(f"Search {search_id}: Encontradas {len(vacancies_data)} vagas válidas")
        logger.info(f"Search {search_id}: Stats: {stats}")
        
        saved_count = 0
        with transaction.atomic():
            for vacancy_data in vacancies_data:
                vacancy, created = Vacancy.objects.get_or_create(
                    job_id=vacancy_data['job_id'],
                    defaults={
                        'company_id': vacancy_data.get('company_id', ''),
                        'name': vacancy_data.get('name', ''),
                        'description': vacancy_data.get('description', ''),
                        'career_page_name': vacancy_data.get('career_page_name', ''),
                        'type': vacancy_data.get('type', ''),
                        'published_date': vacancy_data.get('published_date'),
                        'workplace_types': vacancy_data.get('workplace_types', []),
                        'city': vacancy_data.get('city', ''),
                        'state': vacancy_data.get('state', ''),
                        'country': vacancy_data.get('country', ''),
                        'job_url': vacancy_data.get('job_url', ''),
                    }
                )
                
                SearchVacancy.objects.get_or_create(
                    search=search,
                    vacancy=vacancy
                )
                
                if created:
                    saved_count += 1
        
        search.status = 'completed'
        search.completed_at = timezone.now()
        search.save()
        
        logger.info(f"Search {search_id}: Concluída. {saved_count} novas vagas salvas")
        
    except Exception as e:
        logger.error(f"Erro ao executar busca {search_id}: {str(e)}", exc_info=True)
        try:
            search = Search.objects.get(id=search_id)
            search.status = 'error'
            search.error_message = str(e)
            search.completed_at = timezone.now()
            search.save()
        except Exception as save_error:
            logger.error(f"Erro ao salvar status de erro da busca {search_id}: {str(save_error)}", exc_info=True)


class ConfigViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar configurações de busca
    """
    queryset = Config.objects.all()
    serializer_class = ConfigSerializer
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['get'])
    def latest(self, request):
        """Retorna a última configuração criada"""
        latest_config = self.queryset.first()
        if latest_config:
            serializer = self.get_serializer(latest_config)
            return Response(serializer.data)
        return Response(None, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['get'], url_path='latest_search')
    def latest_search(self, request, pk=None):
        """Retorna a última busca de uma config específica"""
        config = self.get_object()
        latest_search = Search.objects.filter(config=config).order_by('-created_at').first()
        if latest_search:
            serializer = SearchSerializer(latest_search)
            return Response(serializer.data)
        return Response(None, status=status.HTTP_404_NOT_FOUND)


class SearchViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar buscas de vagas
    """
    queryset = Search.objects.all()
    serializer_class = SearchSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        """Cria uma nova busca e inicia processamento em background"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        search = serializer.save()
        
        thread = threading.Thread(target=run_search_task, args=(search.id,))
        thread.daemon = True
        thread.start()
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'], url_path='status')
    def status(self, request, pk=None):
        """Retorna o status de uma busca específica"""
        search = self.get_object()
        serializer = self.get_serializer(search)
        return Response(serializer.data)


class VacancyViewSet(viewsets.ModelViewSet):
    """
    ViewSet para listar e gerenciar vagas
    """
    queryset = Vacancy.objects.all()
    permission_classes = [AllowAny]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return VacancyListSerializer
        return VacancySerializer
    
    def get_queryset(self):
        queryset = Vacancy.objects.all()
        
        search_id = self.request.query_params.get('search_id', None)
        if search_id:
            queryset = queryset.filter(searches__id=search_id)
        
        exclude_deleted = self.request.query_params.get('exclude_deleted', 'true')
        if exclude_deleted.lower() == 'true':
            queryset = queryset.filter(deleted_at__isnull=True)
        
        queryset = queryset.order_by('-published_date')
        
        return queryset.distinct()
    
    def create(self, request, *args, **kwargs):
        return Response(
            {'error': 'Criação de vagas não permitida via API'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )
    
    def update(self, request, *args, **kwargs):
        return Response(
            {'error': 'Atualização de vagas não permitida via API'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )
    
    def destroy(self, request, *args, **kwargs):
        return Response(
            {'error': 'Use o endpoint /delete/ para soft delete'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )
    
    @action(detail=True, methods=['post'], url_path='view')
    def view(self, request, pk=None):
        """Marca uma vaga como vista"""
        vacancy = self.get_object()
        if not vacancy.viewed_at:
            vacancy.viewed_at = timezone.now()
            vacancy.save()
        serializer = self.get_serializer(vacancy)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], url_path='delete')
    def delete_vacancy(self, request, pk=None):
        """Soft delete de uma vaga"""
        vacancy = self.get_object()
        if not vacancy.deleted_at:
            vacancy.deleted_at = timezone.now()
            vacancy.save()
        serializer = self.get_serializer(vacancy)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='open-all-unviewed')
    def open_all_unviewed(self, request):
        """Retorna URLs de todas as vagas não vistas de uma search específica"""
        search_id = request.query_params.get('search_id', None)
        if not search_id:
            return Response(
                {'error': 'search_id é obrigatório'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            search = Search.objects.get(id=search_id)
        except Search.DoesNotExist:
            return Response(
                {'error': 'Search não encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        vacancies = Vacancy.objects.filter(
            searches=search,
            viewed_at__isnull=True,
            deleted_at__isnull=True
        ).values_list('job_url', flat=True)
        
        urls = list(vacancies)
        
        return Response({
            'urls': urls,
            'count': len(urls)
        })

