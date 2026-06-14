export interface CartProduct {
  productId: string;
  productName: string;
  category: string;
  price: number;
  imageUrl: string;
  deliveryTime: string;
  quantity: number;
}

export interface ClarifyingQuestion {
  id: string;
  text: string;
  options: string[];
}

export interface GenerateCartRequest {
  query: string;
  budget?: number;
  context?: Record<string, string>;
}

export interface GenerateCartResponse {
  intent?: string;
  urgency?: string;
  category?: string;
  bundle?: string;
  bundleId?: string;
  products: CartProduct[];
  total: number;
  estimatedDelivery?: string;
  questions?: ClarifyingQuestion[];
  prefilledContext?: Record<string, string>;
}

export interface BundleTemplate {
  bundleId: string;
  bundleName: string;
  intent: string;
  category: string;
  urgency: string;
  keywords: string[];
  products: { productId: string; quantity: number; defaultSelected: boolean }[];
}

export interface Product {
  productId: string;
  productName: string;
  category: string;
  price: number;
  imageUrl: string;
  deliveryTime: string;
  stock: number;
}

export interface SplitBillResponse {
  total: number;
  people: number;
  perPerson: number;
  remainder: number;
}

export interface RecommendationsResponse {
  trendingProducts: Product[];
  recentSearches: string[];
  trendingBundles: string[];
}
