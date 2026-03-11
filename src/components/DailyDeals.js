import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { productService, cartService } from '../services/api';
import EcoFriendlyBadge from './EcoFriendlyBadge';
import ProductTags from './ProductTags';
import MaterialIcon from './MaterialIcon';

const DailyDeals = ({ showTitle = true }) => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [addingToCart, setAddingToCart] = useState(null);
  const navigate = useNavigate();
  const { token } = useAuth();
  const { fetchCart } = useCart();

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const response = await productService.getDailyDeals();
      setDeals(response.data);
    } catch (error) {
      console.error('Error fetching daily deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (!localStorage.getItem('userBudget')) {
      alert('Please set your budget in the Cart page before adding products.');
      return;
    }

    setAddingToCart(productId);
    try {
      const response = await cartService.addToCart(productId, 1);
      console.log('Cart response:', response);
      await fetchCart();
      setMessage({ type: 'success', text: 'Added to cart!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Failed to add to cart';
      setMessage({ type: 'error', text: errorMessage });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setAddingToCart(null);
    }
  };

  return (
    <div className="py-12 px-6 daily-deals-section">
      <div className="container max-w-5xl mx-auto">
        {showTitle && (
          <div className="mb-10 text-center flex-column gap-3 align-center daily-deals-header">
            <p className="daily-deals-kicker text-xs font-semibold text-orange-600 tracking-widest mb-1">
              LIMITED TIME ONLY
            </p>
            <h2 className="text-3xl font-bold tracking-wide daily-deals-title">
              ⚡ TODAY'S DEALS ⚡
            </h2>
            <p className="text-sm text-gray-600 max-w-2xl mx-auto mt-2 daily-deals-subtitle">
              Today only: selected products at <span className="font-semibold text-success">50% OFF</span>,
              limited to <span className="font-semibold">10 discounted items</span> per deal.
            </p>
          </div>
        )}

        {loading && (
          <p className="text-center text-gray-600 mb-4">Loading today's deals...</p>
        )}

        {message && (
          <div className={`mb-4 p-4 rounded-lg text-center font-semibold ${
            message.type === 'success'
              ? 'alert-success'
              : 'alert-danger'
          }`}>
            {message.text}
          </div>
        )}

        {/* Deals container */}
        <div
          className="bg-white rounded-xl p-8 border mx-auto daily-deals-shell"
        >
          {(!deals || deals.length === 0) && !loading ? (
            <p className="text-center text-gray-600 font-medium">
              No daily deals are available right now. Please check back later.
            </p>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 daily-deals-grid">
            {deals.map((product) => {
              const totalDealLimit = 10;
              const hasDailyLimit = typeof product.dailyDealRemaining === 'number';
              const remaining = hasDailyLimit ? Math.max(product.dailyDealRemaining, 0) : null;
              const claimed = hasDailyLimit ? Math.min(totalDealLimit, Math.max(totalDealLimit - remaining, 0)) : 0;
              const progress = hasDailyLimit && totalDealLimit > 0 ? (claimed / totalDealLimit) * 100 : 0;
              const isDealSoldOut = hasDailyLimit && remaining === 0;
              const hasDiscount = product.originalPrice && product.originalPrice > product.price;
              const discountPercent = hasDiscount
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : null;

              return (
                <div
                  key={product._id}
                  className="card d-flex flex-column deal-card"
                >
                  {/* Deal Badge */}
                  <div className="d-flex align-center gap-1 rounded-full text-white font-semibold" style={{ position: 'absolute', top: '16px', left:'16px', padding: '4px 12px', background: '#FF7043', fontSize: '11px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <MaterialIcon name="local_fire_department" size={16} />
                    <span>FLASH DEAL</span>
                  </div>

                  {/* Discount Badge */}
                  {hasDiscount && (
                    <div className="d-flex align-center gap-1 rounded-full text-white font-semibold" style={{ position: 'absolute', top: '16px', right:'16px', padding: '4px 10px', background: '#FF7043', fontSize: '11px', border: '1px solid #FFAB91', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                      <MaterialIcon name="sell" size={14} />
                      <span>{discountPercent}% OFF</span>
                    </div>
                  )}

                  {/* Product Content */}
                  <div className="d-flex flex-column h-100 mt-8 pt-8">
                    <h3 className="font-semibold text-md text-gray-800 mb-1" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {product.name}
                    </h3>

                    {/* Category */}
                    <p className="text-gray-500 mb-3" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {product.category}
                    </p>

                    {/* Product Tags - Low Stock & Fresh Today */}
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      <ProductTags stock={product.stock} isFreshToday={product.isFreshToday} size="small" />
                      <EcoFriendlyBadge isOrganic={product.isOrganic} isLocal={product.isLocal} size="small" />
                    </div>

                    {/* Price Section */}
                    <div className="mb-3">
                      {hasDiscount ? (
                        <div>
                          <p className="text-gray-500 text-xs" style={{ textDecoration: 'line-through' }}>
                            ₹{product.originalPrice}
                          </p>
                          <div className="d-flex justify-between align-end gap-2 mt-1">
                            <p className="text-2xl font-bold" style={{ color: '#00796B' }}>₹{product.price}</p>
                            <span className="d-flex align-center rounded-full font-semibold" style={{ padding: '2px 10px', background: '#F9FBF7', color: '#1B5E20', fontSize: '11px', border: '1px solid #DCEEDD' }}>
                              Extra {discountPercent}% today
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-2xl font-bold" style={{ color: '#00796B' }}>₹{product.price}</p>
                      )}
                    </div>

                    {/* Daily deal remaining + progress */}
                    {hasDailyLimit && (
                      <div className="mb-3">
                        <div className="d-flex justify-between mb-1" style={{ fontSize: '11px', color: '#64748b' }}>
                          <span
                            style={{ fontWeight: remaining > 0 && remaining <= 2 ? '600' : '500', color: remaining > 0 ? (remaining <= 2 ? '#FF7043' : '#1B5E20') : '#64748b' }}
                          >
                            {remaining > 0
                              ? remaining <= 2
                                ? `Only ${remaining} left today`
                                : `Limited-time offer`
                              : `Today's deal sold out`}
                          </span>
                          <span>{remaining > 0 ? `${remaining} left of ${totalDealLimit}` : `0 left`}</span>
                        </div>
                        <div className="w-100 rounded-full overflow-hidden" style={{ height: '6px', backgroundColor: '#f1f5f9' }}>
                          <div
                            className="h-100"
                            style={{ width: `${progress}%`, backgroundColor: '#FF7043', transition: 'width 0.3s ease' }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Stock Status */}
                    <div className="mb-4">
                      <p
                        className="text-xs font-medium"
                        style={{ color: product.stock > 5 ? '#1B5E20' : product.stock > 0 ? '#FF7043' : '#E53935' }}
                      >
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                      </p>
                    </div>

                    {/* Spacer to push button to bottom */}
                    <div style={{ flex: 1 }} />

                    {/* Add to Cart Button */}
                    {isDealSoldOut ? (
                      <button
                        disabled
                        className="w-100 btn d-flex align-center justify-center gap-2"
                        style={{ background: '#f1f5f9', color: '#64748b', borderRadius: '999px', padding: '10px 0', fontSize: '14px' }}
                      >
                        <MaterialIcon name="block" size={18} /> Deal Sold Out Today
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(product._id)}
                        disabled={addingToCart === product._id || product.stock === 0}
                        className="w-100 btn d-flex align-center justify-center gap-2"
                        style={{ 
                          background: addingToCart === product._id || product.stock === 0 ? '#e2e8f0' : '#1B5E20',
                          color: addingToCart === product._id || product.stock === 0 ? '#64748b' : 'white',
                          borderRadius: '999px', padding: '10px 0', fontSize: '14px',
                          border: 'none', cursor: addingToCart === product._id || product.stock === 0 ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {addingToCart === product._id ? (
                          <>
                            <MaterialIcon name="hourglass_top" size={18} /> Adding...
                          </>
                        ) : (
                          <>
                            <MaterialIcon name="add_shopping_cart" size={18} /> Add to Cart
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default DailyDeals;
