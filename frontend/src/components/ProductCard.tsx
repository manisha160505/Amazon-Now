import { Star, Truck } from 'lucide-react';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const imageUrl = product.imageUrl || '/product-images/placeholder.svg';

  return (
    <div
      onClick={() => onClick?.(product)}
      className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-lg hover:border-amazon-orange/50 transition-all cursor-pointer flex flex-col h-full"
    >
      <div className="aspect-square bg-gray-50 rounded-md overflow-hidden flex items-center justify-center mb-3">
        <img
          src={imageUrl}
          alt={product.productName}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/product-images/placeholder.svg';
          }}
        />
      </div>
      <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 flex-1">
        {product.productName}
      </h3>
      <div className="flex items-center gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <Star key={i} size={12} className="text-amazon-orange fill-current" />
        ))}
        <Star size={12} className="text-gray-300" />
        <span className="text-xs text-amazon-blue ml-1">Flash Pick</span>
      </div>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-xs align-top">₹</span>
        <span className="text-xl font-bold text-gray-900">{Math.floor(product.price)}</span>
        <span className="text-xs text-gray-500">
          {Math.round((product.price % 1) * 100).toString().padStart(2, '0')}
        </span>
      </div>
      <div className="flex items-center gap-1 text-xs text-amazon-green">
        <Truck size={12} />
        <span>Get it by {product.deliveryTime}</span>
      </div>
    </div>
  );
}
