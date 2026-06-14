import { Package, Clock, Zap } from 'lucide-react';

interface BundleCardProps {
  bundleName: string;
  intent: string;
  urgency: string;
  category: string;
  itemCount: number;
  estimatedDelivery: string;
}

const urgencyColors: Record<string, string> = {
  High: 'bg-red-100 text-red-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Low: 'bg-green-100 text-green-700',
};

export default function BundleCard({
  bundleName,
  intent,
  urgency,
  category,
  itemCount,
  estimatedDelivery,
}: BundleCardProps) {
  return (
    <div className="bg-gradient-to-br from-amazon-dark to-amazon-light rounded-2xl p-6 text-white shadow-xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap size={18} className="text-amazon-orange fill-current" />
            <span className="text-amazon-orange font-semibold text-sm uppercase tracking-wider">
              Flash Bundle
            </span>
          </div>
          <h2 className="text-2xl font-bold">{bundleName}</h2>
          <p className="text-gray-300 mt-1">Intent: {intent}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${urgencyColors[urgency] || 'bg-gray-100 text-gray-700'}`}>
          {urgency} Urgency
        </div>
      </div>
      <div className="flex items-center gap-6 mt-6 text-sm">
        <div className="flex items-center gap-2">
          <Package size={16} className="text-amazon-orange" />
          <span>{itemCount} items</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-amazon-orange" />
          <span>Delivery by {estimatedDelivery}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-white/10 rounded text-xs">{category}</span>
        </div>
      </div>
    </div>
  );
}
