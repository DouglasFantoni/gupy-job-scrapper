from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'configs', views.ConfigViewSet, basename='config')
router.register(r'searches', views.SearchViewSet, basename='search')
router.register(r'vacancies', views.VacancyViewSet, basename='vacancy')

urlpatterns = [
    path('', include(router.urls)),
]

