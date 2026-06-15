import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, CreditCard, Truck, Users, Share2, Minus, Plus } from 'lucide-react';
import AmazonHeader from '../components/AmazonHeader';
import AmazonFooter from '../components/AmazonFooter';
import BundleCard from '../components/BundleCard';
import ProductRow from '../components/ProductRow';
import { addBundleToCart, splitBill } from '../services/api';
import { saveCartToHistory } from '../utils/cartHistory';
import type { GenerateCartResponse, SplitBillResponse } from '../types';

interface LocationState {
  cart: GenerateCartResponse;
  query: string;
  budget?: number;
}

export default function GeneratedCartPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialCart = (location.state as LocationState)?.cart;
  const query = (location.state as LocationState)?.query || '';
  const budget = (location.state as LocationState)?.budget;

  const [cart, setCart] = useState<GenerateCartResponse | null>(initialCart || null);
  const [adding, setAdding] = useState(false);

  // Cart is always a completed response on this page, so provide safe fallbacks.
  const bundleName = cart?.bundle || 'Flash Bundle';
  const bundleId = cart?.bundleId || '';
  const intent = cart?.intent || '';
  const urgency = cart?.urgency || '';
  const category = cart?.category || '';
  const estimatedDelivery = cart?.estimatedDelivery || '';
  const [added, setAdded] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  // Split bill state
  const [splitPeople, setSplitPeople] = useState(2);
  const [splitResult, setSplitResult] = useState<SplitBillResponse | null>(null);
  const [showSplit, setShowSplit] = useState(false);

  useEffect(() => {
    if (cart && showSplit) {
      splitBill(cart.total, splitPeople).then(setSplitResult).catch(console.error);
    }
  }, [cart, splitPeople, showSplit]);

  useEffect(() => {
    if (cart && query) {
      saveCartToHistory(query, cart);
    }
  }, [cart, query]);

  if (!cart) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">No bundle generated</h1>
        <button
          onClick={() => navigate('/flash')}
          className="px-6 py-3 bg-amazon-orange text-amazon-dark rounded-lg font-bold"
        >
          Try Flash Mode
        </button>
      </div>
    );
  }

  const handleQuantityChange = (productId: string, quantity: number) => {
    setCart((prev) => {
      if (!prev) return prev;
      const updatedProducts = prev.products
        .map((p) => (p.productId === productId ? { ...p, quantity } : p))
        .filter((p) => p.quantity > 0);
      const total = updatedProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);
      return { ...prev, products: updatedProducts, total: roundToTwo(total) };
    });
  };

  const handleRemove = (productId: string) => {
    handleQuantityChange(productId, 0);
  };

  const handleAddEntireBundle = async () => {
    setAdding(true);
    try {
      const productIds = cart.products.map((p) => p.productId);
      await addBundleToCart(bundleId, productIds);
      setAdded(true);
      setTimeout(() => setAdded(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const handleCheckout = () => {
    setCheckingOut(true);
    setTimeout(() => {
      alert(`Order placed! Total: ₹${cart.total.toFixed(0)}\nEstimated delivery: ${estimatedDelivery}`);
      setCheckingOut(false);
    }, 800);
  };

  const handleShareSplit = () => {
    if (!splitResult) return;
    const text = `Amazon Flash Mode bill split\nTotal: ₹${splitResult.total.toFixed(0)}\nPeople: ${splitResult.people}\nEach pays: ₹${splitResult.perPerson.toFixed(2)}`;
    if (navigator.share) {
      navigator.share({ title: 'Split Bill', text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Split details copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <AmazonHeader />

      <main className="flex-1 px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-sm text-gray-600 mb-4">
            Flash Cart for: <span className="font-medium text-gray-900">"{query}"</span>
            {budget && (
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                Budget: ₹{budget}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - bundle + products */}
            <div className="lg:col-span-2 space-y-4">
              <BundleCard
                bundleName={bundleName}
                intent={intent}
                urgency={urgency}
                category={category}
                itemCount={cart.products.length}
                estimatedDelivery={estimatedDelivery}
              />

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Bundle Items</h2>
                <div className="space-y-3">
                  {cart.products.map((product) => (
                    <ProductRow
                      key={product.productId}
                      product={product}
                      onQuantityChange={handleQuantityChange}
                      onRemove={handleRemove}
                    />
                  ))}
                </div>
              </div>

              {cart.products.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <p className="text-gray-500">Your bundle is empty.</p>
                  <button
                    onClick={() => navigate('/flash')}
                    className="mt-4 px-6 py-2 bg-amazon-dark text-white rounded-lg font-medium"
                  >
                    Start Over
                  </button>
                </div>
              )}
            </div>

            {/* Right column - order summary + split bill */}
            <div className="space-y-4">
              {cart.products.length > 0 && (
                <>
                  <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Items ({cart.products.length})</span>
                        <span>₹{cart.total.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery</span>
                        <span className="text-green-600">FREE</span>
                      </div>
                      <div className="border-t border-gray-200 pt-2 flex justify-between text-lg font-bold">
                        <span>Order Total</span>
                        <span>₹{cart.total.toFixed(0)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-amazon-green mb-4">
                      <Truck size={16} />
                      <span>Delivery by {estimatedDelivery}</span>
                    </div>

                    <button
                      onClick={handleAddEntireBundle}
                      disabled={adding || added}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold mb-3 transition-all ${
                        added
                          ? 'bg-green-500 text-white'
                          : 'bg-amazon-yellow text-amazon-dark hover:bg-yellow-400'
                      }`}
                    >
                      {added ? (
                        <>
                          <CheckCircle size={18} />
                          Added to Cart
                        </>
                      ) : adding ? (
                        <>
                          <span className="w-4 h-4 border-2 border-amazon-dark/30 border-t-amazon-dark rounded-full animate-spin"></span>
                          Adding...
                        </>
                      ) : (
                        'Add Entire Bundle'
                      )}
                    </button>

                    <button
                      onClick={handleCheckout}
                      disabled={checkingOut}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amazon-orange text-amazon-dark rounded-lg font-bold hover:bg-yellow-400 transition-colors disabled:opacity-70"
                    >
                      {checkingOut ? (
                        <>
                          <span className="w-4 h-4 border-2 border-amazon-dark/30 border-t-amazon-dark rounded-full animate-spin"></span>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard size={18} />
                          Checkout
                        </>
                      )}
                    </button>
                  </div>

                  {/* Split Bill */}
                  <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Users size={20} className="text-amazon-blue" />
                      <h2 className="text-lg font-bold text-gray-900">Split the Bill</h2>
                    </div>

                    {!showSplit ? (
                      <button
                        onClick={() => setShowSplit(true)}
                        className="w-full py-2 border border-amazon-blue text-amazon-blue rounded-lg font-medium hover:bg-amazon-blue hover:text-white transition-colors"
                      >
                        Split with friends
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-2">
                            Number of people
                          </label>
                          <div className="flex items-center border border-gray-300 rounded-lg w-fit">
                            <button
                              onClick={() => setSplitPeople((p) => Math.max(2, p - 1))}
                              className="p-2 hover:bg-gray-100 rounded-l-lg"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-12 text-center font-medium">{splitPeople}</span>
                            <button
                              onClick={() => setSplitPeople((p) => Math.min(100, p + 1))}
                              className="p-2 hover:bg-gray-100 rounded-r-lg"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>

                        {splitResult && (
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-600">Each person pays</span>
                              <span className="text-2xl font-bold text-gray-900">
                                ₹{splitResult.perPerson.toFixed(2)}
                              </span>
                            </div>
                            {splitResult.remainder > 0 && (
                              <div className="text-xs text-gray-500 mb-3">
                                ₹{splitResult.remainder.toFixed(2)} remainder added to one person
                              </div>
                            )}
                            <button
                              onClick={handleShareSplit}
                              className="flex items-center justify-center gap-2 w-full py-2 bg-amazon-dark text-white rounded-lg text-sm font-medium hover:bg-amazon-light transition-colors"
                            >
                              <Share2 size={14} />
                              Share Split
                            </button>
                          </div>
                        )}

                        <button
                          onClick={() => setShowSplit(false)}
                          className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
                        >
                          Close
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <AmazonFooter />
    </div>
  );
}

function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}
