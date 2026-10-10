export interface Config {
  id?: number;
  name: string;
  title_keywords: string;
  date_start: string | null;
  description_required_keywords: string;
  workplace_types: string[];
  exclude_keywords: string[];
  state: string;
  country: string;
  job_types: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Search {
  id: number;
  config: number;
  config_snapshot: Config;
  status: 'pending' | 'running' | 'completed' | 'error';
  error_message: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface Vacancy {
  id: number;
  job_id: string;
  company_id: string;
  name: string;
  description: string;
  career_page_name: string;
  type: string;
  published_date: string;
  workplace_types: string[];
  workplace_types_display?: string;
  city: string;
  state: string;
  country: string;
  job_url: string;
  is_viewed: boolean;
  is_deleted: boolean;
  viewed_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}
