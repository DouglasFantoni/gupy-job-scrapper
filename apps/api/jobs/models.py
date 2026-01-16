from django.db import models


class Config(models.Model):
    """Configuração de busca de vagas"""
    title_keywords = models.TextField(
        help_text="Palavras-chave para buscar no título, separadas por vírgula"
    )
    date_start = models.DateField(
        blank=True,
        null=True,
        help_text="Data mínima de publicação das vagas"
    )
    description_required_keywords = models.TextField(
        blank=True,
        default='',
        help_text="Palavras-chave obrigatórias na descrição, separadas por vírgula"
    )
    workplace_types = models.JSONField(
        default=list,
        help_text="Tipos de local de trabalho: remote, hybrid, on-site"
    )
    exclude_keywords = models.JSONField(
        default=list,
        help_text="Termos que excluem a vaga se encontrados na descrição"
    )
    state = models.CharField(
        max_length=200,
        blank=True,
        default='',
        help_text="Estado para filtrar vagas (nome completo, ex: São Paulo)"
    )
    country = models.CharField(
        max_length=200,
        blank=True,
        default='',
        help_text="País para filtrar vagas (ex: Brasil)"
    )
    job_types = models.JSONField(
        default=list,
        help_text="Tipos de vaga: vacancy_type_effective, vacancy_type_internship, vacancy_type_temporary, vacancy_type_talent_pool, vacancy_legal_entity"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Configuração'
        verbose_name_plural = 'Configurações'

    def __str__(self):
        return f"Config {self.id} - {self.title_keywords[:50]}"


class Search(models.Model):
    """Busca de vagas executada"""
    STATUS_CHOICES = [
        ('pending', 'Pendente'),
        ('running', 'Em execução'),
        ('completed', 'Concluída'),
        ('error', 'Erro'),
    ]

    config = models.ForeignKey(
        Config,
        on_delete=models.CASCADE,
        related_name='searches',
        help_text="Configuração usada para esta busca"
    )
    config_snapshot = models.JSONField(
        help_text="Snapshot da configuração no momento da busca"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    error_message = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Busca'
        verbose_name_plural = 'Buscas'

    def __str__(self):
        return f"Search {self.id} - {self.status}"


class Vacancy(models.Model):
    """Vaga de emprego"""
    job_id = models.CharField(
        max_length=100,
        unique=True,
        db_index=True,
        help_text="ID único da vaga na API Gupy"
    )
    company_id = models.CharField(max_length=100, blank=True)
    name = models.CharField(max_length=500, help_text="Título da vaga")
    description = models.TextField(blank=True)
    career_page_name = models.CharField(max_length=200, blank=True)
    type = models.CharField(max_length=100, blank=True)
    published_date = models.DateTimeField()
    workplace_types = models.JSONField(
        default=list,
        help_text="Tipos de local de trabalho da vaga"
    )
    city = models.CharField(max_length=200, blank=True)
    state = models.CharField(max_length=200, blank=True)
    country = models.CharField(max_length=200, blank=True)
    job_url = models.URLField(help_text="URL da vaga")
    
    viewed_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    searches = models.ManyToManyField(
        Search,
        through='SearchVacancy',
        related_name='vacancies'
    )

    class Meta:
        ordering = ['-published_date']
        verbose_name = 'Vaga'
        verbose_name_plural = 'Vagas'
        indexes = [
            models.Index(fields=['-published_date']),
            models.Index(fields=['viewed_at']),
            models.Index(fields=['deleted_at']),
        ]

    def __str__(self):
        return f"{self.name} - {self.job_id}"

    @property
    def is_viewed(self):
        return self.viewed_at is not None

    @property
    def is_deleted(self):
        return self.deleted_at is not None


class SearchVacancy(models.Model):
    """Tabela intermediária entre Search e Vacancy"""
    search = models.ForeignKey(Search, on_delete=models.CASCADE)
    vacancy = models.ForeignKey(Vacancy, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [['search', 'vacancy']]
        ordering = ['-created_at']

    def __str__(self):
        return f"Search {self.search.id} - Vacancy {self.vacancy.job_id}"

