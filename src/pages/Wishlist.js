import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { wishlistService, cartService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Wishlist = () => {
  const { fetchCart } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    loadWishlist();
  }, [token, navigate]);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const response = await wishlistService.getWishlist();
      setWishlist(response.data.products || []);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      setMessageType('error');
      setMessage('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await wishlistService.removeFromWishlist(productId);
      setWishlist(wishlist.filter(item => item.productId._id !== productId));
      setMessageType('success');
      setMessage('Removed from wishlist');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      setMessageType('error');
      setMessage(error.response?.data?.message || 'Failed to remove from wishlist');
    }
  };

  const handleAddToCart = async (productId, productName) => {
    try {
      await cartService.addToCart(productId, 1);
      await fetchCart(token);
      setMessageType('success');
      setMessage(`${productName} added to cart!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setMessageType('error');
      setMessage('Failed to add to cart');
    }
  };

  // Previously this function moved the item and removed it from wishlist.
  // Business rule updated: adding to cart should NOT remove from wishlist.
  const handleMoveToCart = async (productId, productName) => {
    try {
      await handleAddToCart(productId, productName);
      // Intentionally keep product in wishlist
    } catch (error) {
      console.error('Error adding wishlist item to cart:', error);
    }
  };

  const handleClearWishlist = async () => {
    if (!window.confirm('Are you sure you want to clear your entire wishlist?')) {
      return;
    }

    try {
      await wishlistService.clearWishlist();
      setWishlist([]);
      setMessageType('success');
      setMessage('Wishlist cleared');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      setMessageType('error');
      setMessage('Failed to clear wishlist');
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600 text-lg">Loading wishlist...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-primary">❤️ My Wishlist</h2>
        {wishlist.length > 0 && (
          <button
            onClick={handleClearWishlist}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
          >
            Clear Wishlist
          </button>
        )}
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg font-semibold ${
            messageType === 'success'
              ? 'bg-green-100 text-green-800 border border-green-400'
              : 'bg-red-100 text-red-800 border border-red-400'
          }`}
        >
          {message}
        </div>
      )}

      {wishlist.length === 0 ? (
        <div className="text-center py-12 bg-light rounded-lg">
          <p className="text-gray-600 text-xl mb-4">Your wishlist is empty</p>
          <p className="text-gray-500 mb-6">Start adding products to your wishlist for later!</p>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {wishlist.map((item) => (
              <div
                key={item.productId._id}
                className="card hover:shadow-lg transition-shadow overflow-hidden"
                style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
              >
                {/* Product Image */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '192px',
                    backgroundColor: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {item.productId.image && (
                    <img
                      src={item.productId.image}
                      alt={item.productId.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4 d-flex flex-column" style={{ flexGrow: 1 }}>
                  <h3 className="font-bold text-primary text-lg mb-2 truncate">
                    {item.productId.name}
                  </h3>

                  <p
                    className="text-gray-600 text-sm mb-3"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      minHeight: '40px',
                    }}
                  >
                    {item.productId.description}
                  </p>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-2xl font-bold text-success">
                      ₹{item.productId.price}
                    </p>
                    {item.productId.originalPrice && (
                      <p className="text-sm text-gray-500 line-through">
                        ₹{item.productId.originalPrice}
                      </p>
                    )}
                  </div>

                  {/* Stock Status */}
                  <div className="mb-3">
                    {item.productId.stock > 0 ? (
                      <p className="text-sm text-success font-semibold">In Stock</p>
                    ) : (
                      <p className="text-sm text-danger font-semibold">Out of Stock</p>
                    )}
                  </div>

                  {/* Eco-Friendly Badges */}
                  <div
                    className="flex gap-2 mb-4"
                    style={{ minHeight: '24px' }}
                  >
                    {item.productId.isOrganic && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-semibold">
                        🌿 Organic
                      </span>
                    )}
                    {item.productId.isLocal && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-semibold">
                        📍 Local
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMoveToCart(item.productId._id, item.productId.name)}
                      disabled={item.productId.stock === 0}
                      className="btn btn-primary w-100"
                      style={{
                        flexGrow: 1,
                        opacity: item.productId.stock === 0 ? 0.6 : 1,
                        cursor: item.productId.stock === 0 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      🛒 Add to Cart
                    </button>
                    <button
                      onClick={() => handleRemoveFromWishlist(item.productId._id)}
                      className="btn btn-outline w-100"
                      style={{ flexGrow: 1 }}
                    >
                      ❌ Remove
                    </button>
                  </div>

                  {/* Added Date */}
                  <p
                    className="text-xs text-gray-500 text-center"
                    style={{ marginTop: 'auto' }}
                  >
                    Saved {new Date(item.addedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-light p-6 rounded-lg">
            <p className="text-lg font-bold text-primary">
              Total Items: {wishlist.length}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              You have {wishlist.length} item{wishlist.length !== 1 ? 's' : ''} saved for later
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default Wishlist;
