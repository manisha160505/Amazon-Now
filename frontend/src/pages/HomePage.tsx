import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, TrendingUp, Clock, RotateCcw } from 'lucide-react';
import AmazonHeader from '../components/AmazonHeader';
import AmazonFooter from '../components/AmazonFooter';
import ProductCard from '../components/ProductCard';
import { getRecommendations } from '../services/api';
import type { Product, RecommendationsResponse } from '../types';

export default function HomePage() {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<RecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecommendations()
      .then(setRecommendations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleProductClick = (product: Product) => {
    navigate('/flash', { state: { prefill: product.productName } });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <AmazonHeader />

      {/* Hero banner */}
      <div className="relative bg-gradient-to-r from-amazon-light to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amazon-orange text-amazon-dark rounded-full text-sm font-bold mb-4">
              <Zap size={16} className="fill-current" />
              Introducing Flash Mode
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
              Tell us your situation,<br />
              <span className="text-amazon-orange">not the product.</span>
            </h1>
            <p className="text-lg text-gray-200 mb-8">
              Need something urgently? Describe your situation and get a complete ready-to-buy bundle in seconds.
            </p>
            <button
              onClick={() => navigate('/flash')}
              className="group inline-flex items-center gap-2 px-8 py-3 bg-amazon-orange text-amazon-dark rounded-lg font-bold hover:bg-yellow-400 transition-colors"
            >
              Try Flash Mode
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-3">
              <Clock size={20} />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Under 5 seconds</h3>
            <p className="text-sm text-gray-600">From situation to ready-to-buy cart</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 mb-3">
              <Zap size={20} />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Smart Bundles</h3>
            <p className="text-sm text-gray-600">Complete experiences, not single products</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-3">
              <TrendingUp size={20} />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Trending Now</h3>
            <p className="text-sm text-gray-600">Based on recent searches and demands</p>
          </div>
        </div>

        {/* Recent searches */}
        {recommendations?.recentSearches && recommendations.recentSearches.length > 0 && (
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <RotateCcw size={18} className="text-amazon-blue" />
              <h2 className="text-lg font-bold text-gray-900">Recent Searches</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {recommendations.recentSearches.map((query, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate('/flash', { state: { prefill: query } })}
                  className="px-4 py-2 bg-gray-100 hover:bg-amazon-orange/20 text-sm text-gray-700 rounded-full transition-colors"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Trending products */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={20} className="text-amazon-orange" />
              <h2 className="text-xl font-bold text-gray-900">Trending Now</h2>
            </div>
            <button
              onClick={() => navigate('/flash')}
              className="text-sm text-amazon-blue hover:text-amazon-orange hover:underline"
            >
              Explore Flash Mode →
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-100 animate-pulse h-64 rounded-lg"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recommendations?.trendingProducts.map((product) => (
                <ProductCard
                  key={product.productId}
                  product={product}
                  onClick={handleProductClick}
                />
              ))}
            </div>
          )}
        </div>

        {/* Trending bundles */}
        {recommendations?.trendingBundles && recommendations.trendingBundles.length > 0 && (
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Popular Bundles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {recommendations.trendingBundles.map((bundleId) => (
                <button
                  key={bundleId}
                  onClick={() => navigate('/flash', { state: { prefill: bundleId.replace(/-/g, ' ') } })}
                  className="p-4 bg-gradient-to-br from-amazon-dark to-amazon-light text-white rounded-lg text-left hover:shadow-md transition-shadow"
                >
                  <Zap size={16} className="text-amazon-orange mb-2" />
                  <span className="font-semibold text-sm capitalize">
                    {bundleId.replace(/-/g, ' ')}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      <AmazonFooter />
    </div>
  );
}
