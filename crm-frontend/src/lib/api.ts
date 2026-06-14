import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_CRM_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
});

export const getCustomers = async (page = 1, search = '', city = '', gender = '') => {
  const { data } = await api.get('/customers', { params: { page, search, city, gender } });
  return data;
};

export const getCustomer = async (id: string) => {
  const { data } = await api.get(`/customers/${id}`);
  return data;
};

export const getAnalyticsOverview = async () => {
  const { data } = await api.get('/analytics/overview');
  return data;
};

export const getCampaignsPerformance = async () => {
  const { data } = await api.get('/analytics/campaigns/performance');
  return data;
};

export const getCustomerDistribution = async () => {
  const { data } = await api.get('/analytics/customers/distribution');
  return data;
};

export const getCampaigns = async () => {
  const { data } = await api.get('/campaigns');
  return data;
};

export const getCampaign = async (id: string) => {
  const { data } = await api.get(`/campaigns/${id}`);
  return data;
};

export const createCampaign = async (payload: any) => {
  const { data } = await api.post('/campaigns', payload);
  return data;
};

export const launchCampaign = async (id: string) => {
  const { data } = await api.post(`/campaigns/${id}/launch`);
  return data;
};

export const getCampaignCommunications = async (id: string, page = 1) => {
  const { data } = await api.get(`/campaigns/${id}/communications`, { params: { page } });
  return data;
};

export const getCampaignFunnel = async (id: string) => {
  const { data } = await api.get(`/analytics/campaigns/${id}/funnel`);
  return data;
};

export const getSegments = async () => {
  const { data } = await api.get('/segments');
  return data;
};

export const createSegment = async (payload: any) => {
  const { data } = await api.post('/segments', payload);
  return data;
};

export const previewSegment = async (rules: any) => {
  const { data } = await api.post('/segments/preview', { rules });
  return data;
};

export const sendChat = async (messages: any[], sessionId?: string) => {
  const { data } = await api.post('/ai/chat', { messages, session_id: sessionId });
  return data;
};

export const getAiSuggestions = async () => {
  const { data } = await api.get('/ai/suggestions');
  return data;
};
