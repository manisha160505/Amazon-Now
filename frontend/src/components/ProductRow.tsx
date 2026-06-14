import { Minus, Plus, Trash2, Truck } from 'lucide-react';
import type { CartProduct } from '../types';

interface ProductRowProps {
  product: CartProduct;
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export default function ProductRow({ product, onQuantityChange, onRemove }: ProductRowProps) {
  const imageUrl = product.imageUrl || '/product-images/placeholder.svg';

  return (
    <div className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-24 h-24 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
        <img
          src={imageUrl}
          alt={product.productName}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/product-images/placeholder.svg';
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div>
            <h3 className="font-semibold text-gray-900 truncate">{product.productName}</h3>
            <p className="text-sm text-gray-500">{product.category}</p>
          </div>
          <button
            onClick={() => onRemove(product.productId)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Remove item"
          >
            <Trash2 size={16} />
          </button>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1 text-sm text-amazon-green">
            <Truck size={14} />
            <span>{product.deliveryTime}</span>
          </div>
          <div className="text-lg font-bold text-gray-900">₹{product.price.toFixed(0)}</div>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center border border-gray-200 rounded-lg">
            <button
              onClick={() => onQuantityChange(product.productId, Math.max(0, product.quantity - 1))}
              className="p-2 hover:bg-gray-100 rounded-l-lg transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>
            <span className="w-10 text-center text-sm font-medium">{product.quantity}</span>
            <button
              onClick={() => onQuantityChange(product.productId, product.quantity + 1)}
              className="p-2 hover:bg-gray-100 rounded-r-lg transition-colors"
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="text-sm text-gray-600">
            Total: <span className="font-semibold">₹{(product.price * product.quantity).toFixed(0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
