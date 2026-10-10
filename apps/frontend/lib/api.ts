import axios from 'axios';
import { Config, Search, Vacancy } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

export const getLatestConfig = async (): Promise<Config | null> => {
  try {
    const response = await api.get('/configs/latest/');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const getConfigs = async (): Promise<Config[]> => {
  try {
    const response = await api.get('/configs/');
    return response.data.results || response.data;
  } catch (error) {
    return [];
  }
};

export const saveConfig = async (config: Omit<Config, 'id'>): Promise<Config> => {
  const response = await api.post('/configs/', config);
  return response.data;
};

export const updateConfig = async (id: number, config: Partial<Config>): Promise<Config> => {
  const response = await api.put(`/configs/${id}/`, config);
  return response.data;
};

export const deleteConfig = async (id: number): Promise<void> => {
  await api.delete(`/configs/${id}/`);
};

export const getLatestSearchByConfig = async (configId: number): Promise<Search | null> => {
  try {
    const response = await api.get(`/configs/${configId}/latest_search/`);
    return response.data;
  } catch (error) {
    return null;
  }
};

export const startSearch = async (configId: number): Promise<Search> => {
  const response = await api.post('/searches/', { config: configId });
  return response.data;
};

export const getSearchStatus = async (searchId: number): Promise<Search> => {
  const response = await api.get(`/searches/${searchId}/status/`);
  return response.data;
};

export const getVacancies = async (searchId: number, excludeDeleted: boolean = true): Promise<Vacancy[]> => {
  try {
    const response = await api.get('/vacancies/', {
      params: {
        search_id: searchId,
        exclude_deleted: excludeDeleted,
      },
    });
    // The viewset might return paginated results or a direct list. Let's assume list.
    return response.data.results || response.data;
  } catch (error) {
    return [];
  }
};

export const markVacancyViewed = async (vacancyId: number): Promise<Vacancy> => {
  const response = await api.post(`/vacancies/${vacancyId}/view/`);
  return response.data;
};

export const deleteVacancy = async (vacancyId: number): Promise<Vacancy> => {
  const response = await api.post(`/vacancies/${vacancyId}/delete/`);
  return response.data;
};
