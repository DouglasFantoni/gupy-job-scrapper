from rest_framework import serializers
from .models import Config, Search, Vacancy
from .constants import VALID_WORKPLACE_TYPES, VALID_JOB_TYPES, format_workplace_types
from .utils import parse_keywords


class ConfigSerializer(serializers.ModelSerializer):
    date_start = serializers.DateField(required=False, allow_null=True)
    description_required_keywords = serializers.CharField(required=False, allow_blank=True, default='')
    workplace_types = serializers.JSONField(required=False, default=list)
    exclude_keywords = serializers.JSONField(required=False, default=list)
    state = serializers.CharField(required=False, allow_blank=True, default='')
    country = serializers.CharField(required=False, allow_blank=True, default='')
    job_types = serializers.JSONField(required=False, default=list)
    
    class Meta:
        model = Config
        fields = ['id', 'title_keywords', 'date_start', 'description_required_keywords', 
                  'workplace_types', 'exclude_keywords', 'state', 'country', 'job_types',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_title_keywords(self, value):
        """Valida que title_keywords é obrigatório e não está vazio"""
        if not value or not value.strip():
            raise serializers.ValidationError("Palavras-chave no título são obrigatórias.")
        return value.strip()
    
    def validate_workplace_types(self, value):
        """Valida que workplace_types é uma lista válida"""
        if isinstance(value, str):
            value = parse_keywords(value)
        elif not isinstance(value, list):
            raise serializers.ValidationError("workplace_types deve ser uma lista ou string separada por vírgula")
        
        for wt in value:
            if wt not in VALID_WORKPLACE_TYPES:
                raise serializers.ValidationError(
                    f"Tipo inválido: {wt}. Valores permitidos: {VALID_WORKPLACE_TYPES}"
                )
        return value
    
    def validate_exclude_keywords(self, value):
        """Valida que exclude_keywords é uma lista"""
        if isinstance(value, str):
            value = parse_keywords(value)
        elif not isinstance(value, list):
            raise serializers.ValidationError("exclude_keywords deve ser uma lista ou string separada por vírgula")
        return value
    
    def validate_job_types(self, value):
        """Valida que job_types é uma lista válida"""
        # Aceitar tanto lista quanto string
        if isinstance(value, str):
            value = parse_keywords(value)
        elif not isinstance(value, list):
            raise serializers.ValidationError("job_types deve ser uma lista ou string separada por vírgula")
        
        for jt in value:
            if jt not in VALID_JOB_TYPES:
                raise serializers.ValidationError(
                    f"Tipo de vaga inválido: {jt}. Valores permitidos: {VALID_JOB_TYPES}"
                )
        return value


class SearchSerializer(serializers.ModelSerializer):
    config_details = ConfigSerializer(source='config', read_only=True)
    
    class Meta:
        model = Search
        fields = ['id', 'config', 'config_details', 'config_snapshot', 'status', 
                  'error_message', 'created_at', 'started_at', 'completed_at']
        read_only_fields = ['id', 'config_snapshot', 'status', 'error_message', 
                           'created_at', 'started_at', 'completed_at']
    
    def create(self, validated_data):
        """Cria uma busca e salva snapshot da configuração"""
        config = validated_data['config']
        
        config_snapshot = {
            'title_keywords': config.title_keywords,
            'date_start': config.date_start.isoformat() if config.date_start else None,
            'description_required_keywords': config.description_required_keywords or '',
            'workplace_types': config.workplace_types,
            'exclude_keywords': config.exclude_keywords,
            'state': config.state or '',
            'country': config.country or '',
            'job_types': config.job_types or [],
        }
        
        search = Search.objects.create(
            config=config,
            config_snapshot=config_snapshot,
            status='pending'
        )
        
        return search


class VacancySerializer(serializers.ModelSerializer):
    workplace_types_display = serializers.SerializerMethodField()
    is_viewed = serializers.BooleanField(read_only=True)
    is_deleted = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Vacancy
        fields = ['id', 'job_id', 'company_id', 'name', 'description', 'career_page_name',
                  'type', 'published_date', 'workplace_types', 'workplace_types_display',
                  'city', 'state', 'country', 'job_url', 'viewed_at', 'deleted_at',
                  'is_viewed', 'is_deleted', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_workplace_types_display(self, obj):
        """Retorna workplace_types formatado para exibição"""
        return format_workplace_types(obj.workplace_types)


class VacancyListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listagem"""
    workplace_types_display = serializers.SerializerMethodField()
    is_viewed = serializers.BooleanField(read_only=True)
    is_deleted = serializers.BooleanField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    published_date = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = Vacancy
        fields = ['id', 'job_id', 'name', 'description', 'career_page_name', 'workplace_types_display',
                  'job_url', 'published_date', 'created_at', 'is_viewed', 'is_deleted', 'city', 'state', 'country', 'workplace_types']
        read_only_fields = ['id', 'created_at', 'published_date']
    
    def get_workplace_types_display(self, obj):
        """Retorna workplace_types formatado para exibição"""
        return format_workplace_types(obj.workplace_types)

