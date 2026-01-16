from datetime import datetime
from typing import List, Dict, Tuple, Optional
import logging

from .api_client import fetch_all_jobs_from_api
from .utils import contains_exclude_keywords, find_word_keys, parse_published_date

logger = logging.getLogger(__name__)


class JobScraperService:
    def __init__(
        self,
        date_start: Optional[datetime] = None,
        description_required_keywords: Optional[List[str]] = None,
        workplace_types: Optional[List[str]] = None,
        exclude_keywords: Optional[List[str]] = None,
        state: Optional[str] = None,
        country: Optional[str] = None,
        job_types: Optional[List[str]] = None
    ):
        self.date_start = date_start
        self.description_required_keywords = description_required_keywords or []
        self.workplace_types = workplace_types or []
        self.exclude_keywords = exclude_keywords or []
        self.state = state
        self.country = country
        self.job_types = job_types or []
        self.processed_job_ids = set()
    
    def process_job(self, job: Dict) -> Tuple[bool, str, Optional[Dict]]:
        job_id = job.get('id')
        
        if not job_id:
            return False, "sem_id", None
        
        if job_id in self.processed_job_ids:
            return False, "duplicada", None
        
        self.processed_job_ids.add(job_id)
        
        published_date_str = job.get('publishedDate', '')
        published_date = parse_published_date(published_date_str)
        
        if not published_date:
            return False, "data_invalida", None
        
        if self.date_start:
            published_date_only = published_date.date()
            date_start_only = self.date_start.date()
            if published_date_only < date_start_only:
                return False, "data_antiga", None
        
        description = job.get('description', '')
        
        if self.exclude_keywords and contains_exclude_keywords(description, self.exclude_keywords):
            return False, "contem_termos_exclusao", None
        
        if self.description_required_keywords and not find_word_keys(self.description_required_keywords, description):
            return False, "sem_palavras_chave", None
        
        job_workplace_types = job.get('workplaceTypes', [])
        
        if not isinstance(job_workplace_types, list):
            job_workplace_types = []
        
        if not job_workplace_types and job.get('isRemoteWork'):
            job_workplace_types = ['remote']
        
        if self.workplace_types and len(self.workplace_types) > 0:
            if not any(wt in self.workplace_types for wt in job_workplace_types):
                return False, "workplace_type_nao_permitido", None
        
        processed_data = {
            'job_id': str(job_id),
            'company_id': str(job.get('companyId', '')),
            'name': job.get('name', ''),
            'description': description,
            'career_page_name': job.get('careerPageName', ''),
            'type': job.get('type', ''),
            'published_date': published_date,
            'workplace_types': job_workplace_types if isinstance(job_workplace_types, list) else [],
            'city': job.get('city', ''),
            'state': job.get('state', ''),
            'country': job.get('country', ''),
            'job_url': job.get('jobUrl', ''),
        }
        
        return True, "salva", processed_data
    
    def search_jobs(self, title_keywords: List[str]) -> Tuple[List[Dict], Dict[str, int]]:
        all_vacancies = []
        stats = {
            "sem_id": 0,
            "duplicada": 0,
            "data_invalida": 0,
            "data_antiga": 0,
            "sem_palavras_chave": 0,
            "contem_termos_exclusao": 0,
            "workplace_type_nao_permitido": 0,
            "salva": 0
        }
        
        for keyword in title_keywords:
            logger.info(f"Buscando vagas para: '{keyword}'")
            
            jobs, total_available = fetch_all_jobs_from_api(
                keyword,
                workplace_types=self.workplace_types if self.workplace_types else None,
                state=self.state if self.state else None,
                country=self.country if self.country else None,
                job_types=self.job_types if self.job_types else None
            )
            
            if jobs is None:
                continue
            
            logger.info(f"Total de vagas disponíveis na API: {total_available}")
            logger.info(f"Vagas recuperadas: {len(jobs)}")
            
            for job in jobs:
                should_save, reason, processed_data = self.process_job(job)
                stats[reason] = stats.get(reason, 0) + 1
                
                if should_save and processed_data:
                    all_vacancies.append(processed_data)
                    stats["salva"] += 1
        
        return all_vacancies, stats
