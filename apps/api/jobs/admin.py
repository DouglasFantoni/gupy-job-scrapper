from django.contrib import admin
from .models import Config, Search, Vacancy, SearchVacancy


@admin.register(Config)
class ConfigAdmin(admin.ModelAdmin):
    list_display = ['id', 'title_keywords', 'date_start', 'created_at']
    list_filter = ['created_at']
    search_fields = ['title_keywords', 'description_required_keywords']


@admin.register(Search)
class SearchAdmin(admin.ModelAdmin):
    list_display = ['id', 'config', 'status', 'created_at', 'completed_at']
    list_filter = ['status', 'created_at']
    readonly_fields = ['created_at', 'started_at', 'completed_at']


@admin.register(Vacancy)
class VacancyAdmin(admin.ModelAdmin):
    list_display = ['job_id', 'name', 'career_page_name', 'published_date', 'is_viewed', 'is_deleted']
    list_filter = ['published_date', 'viewed_at', 'deleted_at', 'career_page_name']
    search_fields = ['name', 'description', 'job_id', 'career_page_name']
    readonly_fields = ['created_at', 'updated_at']
    
    def is_viewed(self, obj):
        return obj.is_viewed
    is_viewed.boolean = True
    
    def is_deleted(self, obj):
        return obj.is_deleted
    is_deleted.boolean = True


@admin.register(SearchVacancy)
class SearchVacancyAdmin(admin.ModelAdmin):
    list_display = ['search', 'vacancy', 'created_at']
    list_filter = ['created_at']

