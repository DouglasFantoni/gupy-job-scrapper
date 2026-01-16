import requests
from urllib.parse import quote
from typing import List, Dict, Tuple, Optional
from concurrent.futures import ThreadPoolExecutor, as_completed
import logging

logger = logging.getLogger(__name__)

MAX_WORKERS = 10

HEADERS = {
    'accept': 'application/json, text/plain, */*',
    'accept-encoding': 'gzip, deflate, br, zstd',
    'accept-language': 'en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7,es;q=0.6',
    'connection': 'keep-alive',
    'host': 'employability-portal.gupy.io',
    'origin': 'https://portal.gupy.io',
    'referer': 'https://portal.gupy.io/',
    'sec-ch-ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'
}

API_BASE_URL = "https://employability-portal.gupy.io/api/v1/jobs"


def build_api_url(
    keyword: str,
    offset: int = 0,
    limit: int = 100,
    workplace_types: Optional[List[str]] = None,
    state: Optional[str] = None,
    country: Optional[str] = None,
    job_types: Optional[List[str]] = None
) -> str:
    limit = min(limit, 100)
    
    keyword_encoded = quote(keyword)
    
    params = [
        f"jobName={keyword_encoded}",
        f"offset={offset}",
        f"limit={limit}"
    ]
    
    if workplace_types and len(workplace_types) > 0:
        workplace_types_str = ','.join(workplace_types)
        params.append(f"workplaceTypes={workplace_types_str}")
    
    if state and state.strip():
        state_encoded = quote(state.strip())
        params.append(f"state={state_encoded}")
    
    if country and country.strip():
        country_encoded = quote(country.strip())
        params.append(f"country={country_encoded}")
    
    if job_types and len(job_types) > 0:
        job_types_str = ','.join(job_types)
        params.append(f"jobTypes={job_types_str}")
    
    url = f"{API_BASE_URL}?{'&'.join(params)}"
    return url


def fetch_jobs_from_api(
    keyword: str,
    offset: int = 0,
    limit: int = 100,
    workplace_types: Optional[List[str]] = None,
    state: Optional[str] = None,
    country: Optional[str] = None,
    job_types: Optional[List[str]] = None
) -> Tuple[Optional[List[Dict]], int]:
    url = build_api_url(keyword, offset, limit, workplace_types, state, country, job_types)
    
    try:
        response = requests.get(url, headers=HEADERS, timeout=30)
        response.raise_for_status()
        
        json_data = response.json()
        jobs = json_data.get('data', [])
        pagination = json_data.get('pagination', {})
        total = pagination.get('total', len(jobs))
        
        return jobs, total
    
    except requests.exceptions.Timeout:
        logger.error(f"Timeout ao buscar dados para '{keyword}'")
        return None, 0
    except requests.exceptions.HTTPError as e:
        logger.error(f"Erro HTTP ao buscar dados para '{keyword}': {e}")
        if hasattr(e, 'response') and hasattr(e.response, 'status_code'):
            logger.error(f"Status code: {e.response.status_code}")
        return None, 0
    except requests.exceptions.RequestException as e:
        logger.error(f"Erro ao buscar dados para '{keyword}': {e}")
        return None, 0
    except ValueError as e:
        logger.error(f"Erro ao processar JSON para '{keyword}': {e}")
        return None, 0


def _fetch_page(
    session: requests.Session,
    keyword: str,
    offset: int,
    limit: int,
    workplace_types: Optional[List[str]],
    state: Optional[str],
    country: Optional[str],
    job_types: Optional[List[str]]
) -> Tuple[int, Optional[List[Dict]]]:
    """Busca uma página específica de vagas. Retorna (offset, jobs) para ordenação."""
    url = build_api_url(keyword, offset, limit, workplace_types, state, country, job_types)

    try:
        response = session.get(url, timeout=30)
        response.raise_for_status()

        json_data = response.json()
        jobs = json_data.get('data', [])
        return offset, jobs

    except Exception as e:
        logger.error(f"Erro ao buscar página offset={offset} para '{keyword}': {e}")
        return offset, None


def fetch_all_jobs_from_api(
    keyword: str,
    workplace_types: Optional[List[str]] = None,
    state: Optional[str] = None,
    country: Optional[str] = None,
    job_types: Optional[List[str]] = None
) -> Tuple[Optional[List[Dict]], int]:
    limit = 100

    first_jobs, total_available = fetch_jobs_from_api(
        keyword,
        offset=0,
        limit=limit,
        workplace_types=workplace_types,
        state=state,
        country=country,
        job_types=job_types
    )

    if first_jobs is None:
        return None, 0

    if len(first_jobs) >= total_available or total_available <= limit:
        return first_jobs, total_available

    # Calcula os offsets restantes
    offsets = list(range(limit, total_available, limit))

    if not offsets:
        return first_jobs, total_available

    logger.info(f"Buscando {len(offsets)} páginas em paralelo para '{keyword}' (total: {total_available} vagas)")

    session = requests.Session()
    session.headers.update(HEADERS)

    all_jobs = list(first_jobs)  # Copia a primeira página
    failed = False

    try:
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            futures = {
                executor.submit(
                    _fetch_page,
                    session,
                    keyword,
                    offset,
                    limit,
                    workplace_types,
                    state,
                    country,
                    job_types
                ): offset
                for offset in offsets
            }

            for future in as_completed(futures):
                offset, jobs = future.result()

                if jobs is None:
                    failed = True
                    break

                all_jobs.extend(jobs)
    finally:
        session.close()

    if failed:
        return None, 0

    return all_jobs, total_available
