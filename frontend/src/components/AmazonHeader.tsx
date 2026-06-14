import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  MapPin,
  Search,
  ShoppingCart,
  Menu,
  User,
  Zap,
} from 'lucide-react';
import FlashToggle from './FlashToggle';

interface AmazonHeaderProps {
  onSearch?: (query: string) => void;
  searchValue?: string;
}

export default function AmazonHeader({ onSearch, searchValue = '' }: AmazonHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState(searchValue);
  const isFlashMode = location.pathname !== '/';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    if (onSearch) {
      onSearch(search);
    } else if (isFlashMode) {
      // Already in flash flow
    } else {
      navigate('/flash', { state: { prefill: search } });
    }
  };

  return (
    <header className="bg-amazon-dark text-white sticky top-0 z-50">
      {/* Top bar */}
      <div className="flex items-center gap-4 px-4 py-2">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1 hover:opacity-90">
          <div className="bg-amazon-orange text-amazon-dark p-1 rounded">
            <Zap size={18} className="fill-current" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            amazon<span className="text-amazon-orange">.in</span>
          </span>
        </Link>

        {/* Deliver to */}
        <div className="hidden md:flex items-center gap-1 text-xs cursor-pointer hover:outline hover:outline-1 hover:outline-white/30 p-2 rounded">
          <MapPin size={16} className="text-white" />
          <div className="text-left">
            <div className="text-gray-300">Deliver to</div>
            <div className="font-bold">User 560001</div>
          </div>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex-1 flex max-w-3xl mx-4">
          <select className="bg-gray-100 text-gray-700 text-xs px-2 rounded-l-md border-r border-gray-300 outline-none">
            <option>All</option>
            <option>Grocery</option>
            <option>Healthcare</option>
            <option>Household</option>
            <option>Baby</option>
          </select>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tell us your situation, e.g. I have a fever"
            className="flex-1 px-4 py-2 text-gray-900 outline-none"
          />
          <button
            type="submit"
            className="bg-amazon-orange hover:bg-yellow-500 text-amazon-dark px-4 rounded-r-md transition-colors"
          >
            <Search size={20} />
          </button>
        </form>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:block cursor-pointer hover:outline hover:outline-1 hover:outline-white/30 p-2 rounded">
            <div className="text-xs text-gray-300">Hello, User</div>
            <div className="text-sm font-bold flex items-center gap-1">
              Account & Lists <User size={14} />
            </div>
          </div>

          <div className="hidden sm:block cursor-pointer hover:outline hover:outline-1 hover:outline-white/30 p-2 rounded">
            <div className="text-xs text-gray-300">Returns</div>
            <div className="text-sm font-bold">& Orders</div>
          </div>

          <div className="relative cursor-pointer hover:outline hover:outline-1 hover:outline-white/30 p-2 rounded">
            <ShoppingCart size={28} />
            <span className="absolute top-0 right-1 bg-amazon-orange text-amazon-dark text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              0
            </span>
          </div>
        </div>
      </div>

      {/* Sub nav */}
      <div className="flex items-center gap-6 bg-amazon-light px-4 py-1.5 text-sm overflow-x-auto">
        <button className="flex items-center gap-1 font-bold hover:outline hover:outline-1 hover:outline-white/30 px-2 py-1 rounded whitespace-nowrap">
          <Menu size={16} /> All
        </button>
        <Link to="/" className="hover:outline hover:outline-1 hover:outline-white/30 px-2 py-1 rounded whitespace-nowrap">
          Home
        </Link>
        <Link to="/flash" className="hover:outline hover:outline-1 hover:outline-white/30 px-2 py-1 rounded whitespace-nowrap">
          Flash Mode
        </Link>
        <Link to="/calendar" className="hover:outline hover:outline-1 hover:outline-white/30 px-2 py-1 rounded whitespace-nowrap">
          Calendar
        </Link>
        <span className="hover:outline hover:outline-1 hover:outline-white/30 px-2 py-1 rounded cursor-pointer whitespace-nowrap">
          Best Sellers
        </span>
        <span className="hover:outline hover:outline-1 hover:outline-white/30 px-2 py-1 rounded cursor-pointer whitespace-nowrap">
          Today's Deals
        </span>
        <span className="hover:outline hover:outline-1 hover:outline-white/30 px-2 py-1 rounded cursor-pointer whitespace-nowrap">
          Customer Service
        </span>
        <div className="ml-auto flex items-center gap-2">
          <FlashToggle isFlashMode={isFlashMode} onToggle={(value) => navigate(value ? '/flash' : '/')} />
        </div>
      </div>
    </header>
  );
}
