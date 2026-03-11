import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { productService, wishlistService } from '../services/api';
import EcoFriendlyBadge from './EcoFriendlyBadge';
import ProductTags from './ProductTags';
import { getProductImageUrl, getFallbackImageUrl } from '../utils/imageUtils';

const ProductListing = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [searchError, setSearchError] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [wishlistItems, setWishlistItems] = useState(new Set());
  const { token } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    if (!searchError) {
      fetchProducts();
    }
    if (token) {
      loadWishlist();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, search, sortBy, token, searchError]);

  const validateSearchInput = (value) => {
    if (value.length > 100) {
      return 'Search can be maximum 100 characters';
    }

    if (!/^[a-zA-Z0-9\s'-]*$/.test(value)) {
      return 'Please enter a valid product name (letters, numbers, spaces, apostrophe, and hyphen only)';
    }

    return '';
  };

  const loadWishlist = async () => {
    try {
      const response = await wishlistService.getWishlist();
      const wishlistIds = new Set(response.data.products?.map(item => item.productId._id) || []);
      setWishlistItems(wishlistIds);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    }
  };

  const fetchProducts = async () => {
    if (searchError) {
      setProducts([]);
      return;
    }

    setLoading(true);
    try {
      const response = await productService.getProducts(category, search, sortBy);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      if (error.response?.status === 400) {
        setSearchError(error.response?.data?.message || 'Invalid product search input');
      }
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Rice & Grains',
    'Flours',
    'Pulses & Dals',
    'Spices & Masalas',
    'Cooking Essentials',
    'Dairy Products',
    'Eggs & Bakery',
    'Fruits (Daily Use)',
    'Vegetables (Daily Use)',
    'Snacks & Biscuits',
    'Instant & Packed Foods',
    'Beverages',
    'Personal Care',
    'Cleaning & Household',
  ];

  return (
    <div className="container py-6">
      <h2 className="text-3xl font-bold text-primary mb-6">Products</h2>

      <div className="d-flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => {
            const value = e.target.value;
            setSearch(value);
            setSearchError(validateSearchInput(value));
          }}
          className="input-field max-w-sm"
          style={{ flexGrow: 1 }}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input-field max-w-xs"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="input-field max-w-xs"
        >
          <option value="">Default Sorting</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>
      {searchError && (
        <p className="text-center text-danger py-2 font-semibold">
          Invalid product: {searchError}
        </p>
      )}

      {loading ? (
        <p className="text-center text-lg text-gray-500 py-8">Loading products...</p>
      ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="card d-flex flex-column"
                style={{ position: 'relative', overflow: 'hidden', padding: 0 }}
              >
                <div style={{ position: 'relative', width: '100%', height: '192px', backgroundColor: '#f3f4f6' }}>
                  <img 
                    src={getProductImageUrl(product)}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => e.target.src = getFallbackImageUrl(product.name)}
                  />
                  {product.stock === 0 && (
                    <div className="d-flex align-center justify-center" style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.5)' }}>
                      <span className="text-white font-bold text-lg">OUT OF STOCK</span>
                    </div>
                  )}
                </div>
                
                <div className="p-4 d-flex flex-column" style={{ flexGrow: 1 }}>
                  <h3 className="text-lg font-semibold text-primary mb-2" style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.name}</h3>
                  
                  {/* Product Tags - Low Stock & Fresh Today */}
                  <div className="mb-2">
                    <ProductTags stock={product.stock} isFreshToday={product.isFreshToday} size="small" />
                  </div>
                  
                  {/* Eco-Friendly Badges */}
                  <div className="mb-2">
                    <EcoFriendlyBadge isOrganic={product.isOrganic} isLocal={product.isLocal} size="small" />
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '40px' }}>{product.description}</p>
                  {(product.reviews?.length > 0 || product.rating) && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-700 font-semibold">
                        Rating: ⭐ {Number(product.rating || 0).toFixed(1)}/5
                        {product.reviews?.length ? ` (${product.reviews.length} feedback${product.reviews.length > 1 ? 's' : ''})` : ''}
                      </p>
                      {product.reviews?.length > 0 && product.reviews[product.reviews.length - 1]?.comment && (
                        <p className="text-xs text-gray-500 font-italic" style={{ fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          "{product.reviews[product.reviews.length - 1].comment}"
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className="d-flex align-center justify-between mb-3 mt-auto">
                    <span className="text-2xl font-bold text-success">
                      ₹{product.price}
                    </span>
                    {product.rating && (
                      <div className="d-flex align-center gap-1">
                        <span style={{ color: '#eab308' }}>★</span>
                        <span className="text-sm font-semibold">{product.rating}</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs mb-1 font-semibold" style={{ color: product.stock === 0 ? 'var(--color-danger)' : product.stock < 10 ? '#ea580c' : 'var(--color-text-light)' }}>
                    {product.stock === 0 ? 'Out of Stock' : `Stock: ${product.stock}`}
                  </p>

                  {product.expiryDate && (
                    <p className="text-xs mb-3 font-semibold" style={{ color: new Date(product.expiryDate) < new Date() ? '#dc2626' : '#16a34a' }}>
                      {new Date(product.expiryDate) < new Date() ? '⚠ Expired: ' : 'Expiry: '}
                      {new Date(product.expiryDate).toLocaleDateString()}
                    </p>
                  )}
                  {!product.expiryDate && <div style={{ marginBottom: '0.75rem' }} />}
                  
                  <div className="d-flex gap-2">
                    <button
                      onClick={() => {
                        if (token) {
                          if (!localStorage.getItem('userBudget')) {
                            alert('Please set your budget in the Cart page before adding products.');
                            return;
                          }
                          if (product.stock > 0) {
                            addToCart(product._id, 1, token);
                            alert('Added to cart!');
                          } else {
                            alert('Product is out of stock');
                          }
                        } else {
                          alert('Please login first');
                        }
                      }}
                      disabled={product.stock === 0}
                      className="btn"
                      style={{ 
                        flexGrow: 1, 
                        backgroundColor: product.stock === 0 ? '#d1d5db' : 'var(--color-primary)',
                        color: product.stock === 0 ? '#6b7280' : 'white',
                        cursor: product.stock === 0 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                    
                    <button
                      onClick={async () => {
                        if (!token) {
                          alert('Please login first');
                          return;
                        }
                        try {
                          if (wishlistItems.has(product._id)) {
                            await wishlistService.removeFromWishlist(product._id);
                            setWishlistItems(prev => {
                              const newSet = new Set(prev);
                              newSet.delete(product._id);
                              return newSet;
                            });
                          } else {
                            await wishlistService.addToWishlist(product._id);
                            setWishlistItems(prev => new Set([...prev, product._id]));
                          }
                        } catch (error) {
                          console.error('Error updating wishlist:', error);
                          console.error('Error details:', error.response?.data || error.message);
                          alert('Failed to update wishlist. Please try again.');
                        }
                      }}
                      className="btn"
                      style={{ 
                        backgroundColor: wishlistItems.has(product._id) ? '#ef4444' : '#d1d5db',
                        color: wishlistItems.has(product._id) ? 'white' : '#374151'
                      }}
                      title={wishlistItems.has(product._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    >
                      {wishlistItems.has(product._id) ? '❤️' : '🤍'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
        <p className="text-center text-lg text-gray-600 py-8">
          Invalid product search: no such product found.
        </p>
      )}
    </div>
  );
};

export default ProductListing;
