import type { GenerateCartResponse } from '../types';

export interface CartHistoryItem {
  id: string;
  query: string;
  cart: GenerateCartResponse;
  savedAt: number;
}

const STORAGE_KEY = 'flash_cart_history';
const MAX_ITEMS = 8;

export function saveCartToHistory(query: string, cart: GenerateCartResponse): void {
  try {
    const history = getCartHistory();
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newItem: CartHistoryItem = { id, query, cart, savedAt: Date.now() };

    // Avoid duplicate consecutive entries for the same query
    const filtered = history.filter((item) => item.query.toLowerCase() !== query.toLowerCase());
    const updated = [newItem, ...filtered].slice(0, MAX_ITEMS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors (e.g. private mode)
  }
}

export function getCartHistory(): CartHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartHistoryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function clearCartHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}
