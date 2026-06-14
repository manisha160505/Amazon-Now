import axios from 'axios';
import type {
  GenerateCartRequest,
  GenerateCartResponse,
  BundleTemplate,
  Product,
  RecommendationsResponse,
  SplitBillResponse,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const sessionId = localStorage.getItem('flash_session_id') || generateSessionId();
  localStorage.setItem('flash_session_id', sessionId);
  config.headers['X-Session-Id'] = sessionId;
  return config;
});

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export async function generateCart(
  query: string,
  budget?: number,
  context?: Record<string, string>
): Promise<GenerateCartResponse> {
  const payload: GenerateCartRequest = { query };
  if (budget !== undefined && budget > 0) {
    payload.budget = budget;
  }
  if (context && Object.keys(context).length > 0) {
    payload.context = context;
  }
  const response = await api.post<GenerateCartResponse>('/generate-cart', payload);
  return response.data;
}

export async function addBundleToCart(
  bundleId: string,
  productIds?: string[]
): Promise<{ success: boolean; message: string }> {
  const response = await api.post('/add-bundle-to-cart', {
    bundleId,
    products: productIds,
  });
  return response.data;
}

export async function splitBill(total: number, people: number): Promise<SplitBillResponse> {
  const response = await api.post<SplitBillResponse>('/split-bill', { total, people });
  return response.data;
}

export async function getBundles(): Promise<BundleTemplate[]> {
  const response = await api.get<BundleTemplate[]>('/bundles');
  return response.data;
}

export async function getProducts(category?: string): Promise<Product[]> {
  const response = await api.get<Product[]>('/products', {
    params: category ? { category } : undefined,
  });
  return response.data;
}

export async function getTrendingProducts(): Promise<Product[]> {
  const response = await api.get<{ products: Product[] }>('/trending');
  return response.data.products;
}

export async function getRecommendations(): Promise<RecommendationsResponse> {
  const response = await api.get<RecommendationsResponse>('/recommendations');
  return response.data;
}

export async function getCalendarEvents(): Promise<
  { id: string; title: string; date: string; daysLeft: number; type: string; suggestedQuery: string }[]
> {
  const response = await api.get('/calendar-events');
  return response.data;
}

export default api;
