import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { shoppingListService, cartService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import EcoFriendlyBadge from '../components/EcoFriendlyBadge';
import ProductTags from '../components/ProductTags';
import { getProductImageUrl, getFallbackImageUrl } from '../utils/imageUtils';

const ShoppingLists = () => {
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [message, setMessage] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectAll, setSelectAll] = useState(true);
  const { fetchCart } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLists();
  }, []);

  useEffect(() => {
    if (selectedList) {
      // Select all available products by default
      const availableProductIds = selectedList.products
        .filter(p => p.stock > 0)
        .map(p => p._id);
      setSelectedProducts(availableProductIds);
      setSelectAll(availableProductIds.length === selectedList.products.filter(p => p.stock > 0).length);
    }
  }, [selectedList]);

  const fetchLists = async () => {
    setLoading(true);
    try {
      const response = await shoppingListService.getAllLists();
      setLists(response.data);
    } catch (error) {
      console.error('Error fetching shopping lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchListDetails = async (listId) => {
    setLoading(true);
    try {
      const response = await shoppingListService.getListById(listId);
      setSelectedList(response.data);
    } catch (error) {
      console.error('Error fetching list details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (listId) => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (!localStorage.getItem('userBudget')) {
      alert('Please set your budget in the Cart page before adding products.');
      return;
    }
    setAddingToCart(listId);
    setMessage(null);
    try {
      const response = await shoppingListService.addListToCart(listId);
      await fetchCart();
      
      setMessage({
        type: 'success',
        text: response.data.message || `Items added to cart successfully!`
      });
      
      setTimeout(() => setMessage(null), 4000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setMessage({
        type: 'error',
        text: 'Failed to add items to cart. Please try again.'
      });
      setTimeout(() => setMessage(null), 4000);
    } finally {
      setAddingToCart(null);
    }
  };

  const handleToggleProduct = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts([]);
    } else {
      const availableProductIds = selectedList.products
        .filter(p => p.stock > 0)
        .map(p => p._id);
      setSelectedProducts(availableProductIds);
    }
    setSelectAll(!selectAll);
  };

  const handleAddSelectedToCart = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (!localStorage.getItem('userBudget')) {
      alert('Please set your budget in the Cart page before adding products.');
      return;
    }

    if (selectedProducts.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one product' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setAddingToCart(true);
    setMessage(null);
    try {
      await shoppingListService.addListToCart(selectedList._id, selectedProducts);
      await fetchCart();
      
      setMessage({
        type: 'success',
        text: `${selectedProducts.length} item(s) added to cart successfully!`
      });
      
      setTimeout(() => setMessage(null), 4000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setMessage({
        type: 'error',
        text: 'Failed to add items to cart. Please try again.'
      });
      setTimeout(() => setMessage(null), 4000);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddSingleProduct = async (productId) => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (!localStorage.getItem('userBudget')) {
      alert('Please set your budget in the Cart page before adding products.');
      return;
    }

    try {
      await cartService.addToCart(productId, 1);
      await fetchCart();
      setMessage({ type: 'success', text: 'Added to cart!' });
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add to cart' });
      setTimeout(() => setMessage(null), 2000);
    }
  };

  if (loading && !selectedList) {
    return <p className="p-6 text-center text-lg text-gray-600">Loading shopping lists...</p>;
  }

  if (selectedList) {
    return (
      <div className="p-6 max-w-7xl mx-auto shopping-lists-page">
        <button
          onClick={() => {
            setSelectedList(null);
            setSelectedProducts([]);
          }}
          className="mb-6 px-5 py-2 rounded-full border border-gray-300 bg-white text-primary font-semibold shadow-sm hover:shadow-md hover:border-primary transition-colors"
        >
          ← Back to Lists
        </button>

        {message && (
          <div className={`mb-4 p-4 rounded-lg font-semibold ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-300' 
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}>
            {message.text}
          </div>
        )}

        <div
          className="text-white p-6 rounded-lg mb-6 shadow-md"
          style={{
            background: 'linear-gradient(120deg, #16a34a, #22c55e, #0ea5e9)',
          }}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {selectedList.iconUrl ? (
                  <img 
                    src={selectedList.iconUrl} 
                    alt={selectedList.name}
                    className="w-16 h-16 object-contain rounded"
                  />
                ) : (
                  <span className="text-4xl">{selectedList.icon}</span>
                )}
                <h2 className="text-4xl font-bold">{selectedList.name}</h2>
              </div>
              <p className="text-lg opacity-90">{selectedList.description}</p>
              <p className="mt-2 text-sm opacity-80">
                {selectedList.products.length} products available • {selectedProducts.length} selected
              </p>
            </div>
            <div className="flex flex-col gap-2 text-right">
              <button
                onClick={handleSelectAll}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-semibold transition-colors"
              >
                {selectAll ? '☐ Deselect All' : '☑ Select All'}
              </button>
              <button
                onClick={handleAddSelectedToCart}
                disabled={addingToCart || selectedProducts.length === 0}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  addingToCart || selectedProducts.length === 0
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-white text-green-600 hover:bg-gray-100'
                }`}
              >
                {addingToCart ? 'Adding...' : `🛒 Add ${selectedProducts.length} to Cart`}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {selectedList.products.map((product) => {
            const isSelected = selectedProducts.includes(product._id);
            const isOutOfStock = product.stock === 0;
            
            return (
              <div
                key={product._id}
                onClick={() => !isOutOfStock && handleToggleProduct(product._id)}
                className={`border-2 rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer ${
                  isSelected ? 'border-green-500 bg-green-50 ring-2 ring-green-300' : 'border-gray-200 bg-white'
                } ${isOutOfStock ? 'opacity-60 cursor-not-allowed' : ''}`}
                style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
              >
                {/* Product Image */}
                <div className="relative bg-gray-100"
                     style={{
                       width: '100%',
                       height: '192px',
                       overflow: 'hidden',
                     }}
                >
                  <img
                    src={getProductImageUrl(product)}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target.src = getFallbackImageUrl(product.name))}
                  />
                  
                  {/* Selection Checkbox */}
                  {!isOutOfStock && (
                    <div
                      className="absolute top-3 left-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <label className="flex items-center justify-center w-8 h-8 rounded-md bg-white shadow-md border-2 border-gray-300 cursor-pointer hover:border-green-500 transition-colors"
                             style={isSelected ? { backgroundColor: '#16a34a', borderColor: '#16a34a' } : {}}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleProduct(product._id)}
                          className="sr-only"
                        />
                        {isSelected && (
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </label>
                    </div>
                  )}

                  {/* Out of Stock Badge */}
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Content */}
                <div className="p-4 d-flex flex-column" style={{ flexGrow: 1 }}>
                  <h3 className="font-bold text-primary text-lg mb-2 line-clamp-2 min-h-[3.5rem]">
                    {product.name}
                  </h3>

                  {/* Product Description */}
                  {product.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[2.5rem]">
                      {product.description}
                    </p>
                  )}

                  {/* Product Tags */}
                  <div className="mb-2" style={{ minHeight: '24px' }}>
                    <ProductTags stock={product.stock} isFreshToday={product.isFreshToday} size="small" />
                  </div>

                  {/* Eco-Friendly Badges */}
                  <div className="mb-3" style={{ minHeight: '24px' }}>
                    <EcoFriendlyBadge isOrganic={product.isOrganic} isLocal={product.isLocal} size="small" />
                  </div>

                  {/* Price Section */}
                  <div className="mb-3">
                    {product.originalPrice && product.originalPrice > product.price ? (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-2xl font-bold text-primary">₹{product.price}</p>
                          <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                          </span>
                        </div>
                        <p className="text-sm line-through text-gray-500">
                          MRP: ₹{product.originalPrice}
                        </p>
                      </div>
                    ) : (
                      <p className="text-2xl font-bold text-primary">₹{product.price}</p>
                    )}
                  </div>

                  {/* Stock & Category */}
                  <div className="flex justify-between items-center mb-3">
                    <p className={`text-xs font-semibold ${
                      product.stock > 10 ? 'text-green-600' : 
                      product.stock > 0 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </p>
                    <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {product.category}
                    </p>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleAddSingleProduct(product._id); }}
                    disabled={isOutOfStock}
                    className={`w-full py-2 rounded-lg font-semibold transition-colors ${
                      isOutOfStock
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                    style={{ marginTop: 'auto' }}
                  >
                    {isOutOfStock ? 'Out of Stock' : '🛒 Add to Cart'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto shopping-lists-page">
      <div className="mb-10 text-center shopping-lists-hero">
        <h1 className="text-4xl font-bold text-primary mb-3 shopping-lists-hero-title">🛍️ Meal-Based Shopping Lists</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Quick and easy shopping with our curated lists - add entire collections to your cart with one click!
        </p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg font-semibold ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-300' 
            : 'bg-red-100 text-red-800 border border-red-300'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lists.map((list) => (
          <div
            key={list._id || list.id}
            className="shopping-list-card p-6 transition-all"
            style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
          >
            <div className="text-center mb-4">
              {list.iconUrl ? (
                <img 
                  src={list.iconUrl} 
                  alt={list.name}
                  className="w-16 h-16 mx-auto mb-3 object-contain rounded"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextElementSibling) {
                      e.target.nextElementSibling.style.display = 'block';
                    }
                  }}
                />
              ) : null}
              <div className={list.iconUrl ? 'hidden' : ''} style={!list.iconUrl ? {display: 'block'} : {}}>
                <div className="shopping-list-icon-pill text-3xl">{list.icon}</div>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-2">{list.name}</h3>
              <p className="text-gray-600 text-sm mb-2">{list.description}</p>
              <p className="text-xs text-gray-500">
                {list.itemCount || list.products?.length || 0} products
              </p>
            </div>

            <div className="space-y-3" style={{ marginTop: 'auto' }}>
              <button
                onClick={() => fetchListDetails(list._id || list.id)}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                View Products
              </button>
              <button
                onClick={() => handleAddToCart(list._id || list.id)}
                disabled={addingToCart === (list._id || list.id)}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed"
              >
                {addingToCart === (list._id || list.id) ? 'Adding...' : '🛒 Add All to Cart'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {lists.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No shopping lists available at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default ShoppingLists;
