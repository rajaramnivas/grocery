import React, { useState, useEffect } from 'react';
import { adminService, productService } from '../services/api';
import AdminShoppingLists from './AdminShoppingLists';

// Local SVG placeholder to avoid external image requests
const INVENTORY_PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='100%' height='100%' fill='%23e5e7eb'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='10'>No Image</text></svg>";
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [dailyDeals, setDailyDeals] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [dealMessage, setDealMessage] = useState(null);
  const [ecoMessage, setEcoMessage] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    costPrice: '',
    buyingDate: '',
    expiryDate: '',
    category: 'Rice & Grains',
    stock: '',
    image: '',
    rating: 4.0,
    sku: ''
  });

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'inventory') {
      fetchProducts();
    } else if (activeTab === 'deals') {
      // For Daily Deals tab, we need both:
      // - current deals (to show which products are active deals)
      // - full product list (so admin can pick 3–5 products)
      fetchDailyDeals();
      fetchProducts();
    } else if (activeTab === 'eco') {
      fetchProducts();
    }
    // Shopping lists tab has its own component that handles fetching
  }, [activeTab]);

  // Lock background scroll when any modal is open
  useEffect(() => {
    if (showProductModal || selectedOrder) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showProductModal, selectedOrder]);

  // Auto-refresh inventory data periodically when on the Inventory tab
  useEffect(() => {
    if (activeTab !== 'inventory') return;

    const intervalId = setInterval(() => {
      // Avoid refreshing while editing/adding a product to prevent UI glitches
      if (!showProductModal) {
        refreshInventorySilently();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(intervalId);
  }, [activeTab, showProductModal]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllOrders();
      setOrders(response.data);
    } catch (error) {
      alert('Error fetching orders: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.getProducts();
      setProducts(response.data);
    } catch (error) {
      alert('Error fetching products: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const refreshInventorySilently = async () => {
    try {
      const response = await productService.getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error('Error auto-refreshing inventory:', error.response?.data || error.message);
    }
  };

  const fetchDailyDeals = async () => {
    setLoading(true);
    try {
      const response = await adminService.getDailyDeals();
      setDailyDeals(response.data);
    } catch (error) {
      alert('Error fetching daily deals: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDailyDeal = async (productId) => {
    try {
      const response = await adminService.setDailyDeal(productId);
      setDealMessage({ type: 'success', text: response.data.message });
      fetchDailyDeals();
      fetchProducts();
      setTimeout(() => setDealMessage(null), 3000);
    } catch (error) {
      setDealMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error updating daily deal'
      });
      setTimeout(() => setDealMessage(null), 3000);
    }
  };

  const handleToggleOrganic = async (productId) => {
    try {
      const response = await adminService.toggleOrganic(productId);
      setEcoMessage({ type: 'success', text: response.data.message });
      fetchProducts();
      setTimeout(() => setEcoMessage(null), 3000);
    } catch (error) {
      setEcoMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error updating organic status'
      });
      setTimeout(() => setEcoMessage(null), 3000);
    }
  };

  const handleToggleLocal = async (productId) => {
    try {
      const response = await adminService.toggleLocal(productId);
      setEcoMessage({ type: 'success', text: response.data.message });
      fetchProducts();
      setTimeout(() => setEcoMessage(null), 3000);
    } catch (error) {
      setEcoMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error updating local status'
      });
      setTimeout(() => setEcoMessage(null), 3000);
    }
  };

  const handleToggleFresh = async (productId) => {
    try {
      const response = await adminService.toggleFresh(productId);
      setEcoMessage({ type: 'success', text: response.data.message });
      fetchProducts();
      setTimeout(() => setEcoMessage(null), 3000);
    } catch (error) {
      setEcoMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error updating freshness status'
      });
      setTimeout(() => setEcoMessage(null), 3000);
    }
  };

  const handleUpdateOrderStatus = async (orderId, status, paymentStatus, promptForNotes = true) => {
    try {
      const notes = promptForNotes ? prompt('Add admin notes (optional):') : '';
      const trackingNumber = '';
      await adminService.updateOrderStatus(orderId, status, paymentStatus, trackingNumber, notes);
      alert('Order status updated successfully');
      fetchOrders();
      setSelectedOrder(null);
    } catch (error) {
      alert('Error updating order: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateInventory = async (productId, currentStock) => {
    const newStock = prompt(`Current stock: ${currentStock}\nEnter new stock quantity:`, currentStock);
    if (newStock !== null && !isNaN(newStock)) {
      try {
        await adminService.updateInventory(productId, parseInt(newStock));
        alert('Inventory updated successfully');
        fetchProducts();
      } catch (error) {
        alert('Error updating inventory: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: '',
      costPrice: '',
      category: 'Vegetables',
      stock: '',
      image: '',
      rating: 4.0,
      sku: '',
      buyingDate: ''
    });
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      costPrice: product.costPrice || '',
      category: product.category,
      stock: product.stock,
      image: product.image || '',
      rating: product.rating || 4.0,
      sku: product.sku || '',
      buyingDate: product.buyingDate ? product.buyingDate.split('T')[0] : '',
      expiryDate: product.expiryDate ? product.expiryDate.split('T')[0] : ''
    });
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      try {
        await adminService.deleteProduct(productId);
        alert('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        alert('Error deleting product: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleProductFormChange = (e) => {
    const { name, value } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        costPrice: productForm.costPrice ? parseFloat(productForm.costPrice) : undefined,
        buyingDate: productForm.buyingDate ? new Date(productForm.buyingDate) : undefined,
        expiryDate: productForm.expiryDate ? new Date(productForm.expiryDate) : undefined,
        stock: parseInt(productForm.stock),
        rating: parseFloat(productForm.rating)
      };

      // If SKU is not provided, avoid sending an empty string to the backend
      // so Mongo's unique index on sku does not see duplicate "" values.
      if (!productForm.sku || productForm.sku.trim() === '') {
        delete productData.sku;
      } else {
        productData.sku = productForm.sku.trim();
      }

      if (editingProduct) {
        await adminService.updateProduct(editingProduct._id, productData);
        alert('Product updated successfully');
      } else {
        await adminService.createProduct(productData);
        alert('Product created successfully');
      }

      setShowProductModal(false);
      fetchProducts();
    } catch (error) {
      alert('Error saving product: ' + (error.response?.data?.message || error.message));
    }
  };

  const calculateProfit = (product) => {
    if (!product.costPrice || !product.price) return null;
    const profitPerUnit = product.price - product.costPrice;
    const totalProfit = profitPerUnit * product.stock;
    const profitMargin = ((profitPerUnit / product.price) * 100).toFixed(2);
    return {
      profitPerUnit: profitPerUnit.toFixed(2),
      totalProfit: totalProfit.toFixed(2),
      profitMargin: profitMargin
    };
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      pending: 'bg-orange-500',
      processing: 'bg-blue-500',
      delivered: 'bg-green-500',
      cancelled: 'bg-red-500',
    };
    return classes[status] || 'bg-gray-500';
  };

  const getStockColor = (stock) => {
    if (stock === 0) return 'text-danger font-bold';
    if (stock < 10) return 'text-orange-600 font-bold';
    return 'text-success font-bold';
  };

  const renderOrderDetails = () => {
    if (!selectedOrder) return null;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '1.5rem', overscrollBehavior: 'contain' }}
      >
        <div
          className="bg-white w-full shadow-2xl"
          style={{
            maxWidth: '42rem',
            maxHeight: '85vh',
            borderRadius: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
              padding: '1rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.25rem' }}>📋</span>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                Order Details - #{selectedOrder._id.slice(-8)}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '2rem',
                height: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#fff',
                fontSize: '1.1rem',
                fontWeight: 700,
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.35)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
              title="Close"
            >
              ✕
            </button>
          </div>

          {/* Scrollable body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>

            {/* Customer Information */}
            <div style={{ marginBottom: '1.1rem' }}>
              <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: '0.5rem' }}>
                Customer Information
              </h3>
              <div style={{ background: '#f8fafc', borderRadius: '0.5rem', padding: '0.75rem 1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem 1.5rem', fontSize: '0.85rem' }}>
                <p style={{ margin: 0 }}><strong style={{ color: '#475569' }}>Name:</strong> {selectedOrder.userId?.name || 'N/A'}</p>
                <p style={{ margin: 0 }}><strong style={{ color: '#475569' }}>Phone:</strong> {selectedOrder.userId?.phone || 'N/A'}</p>
                <p style={{ margin: 0, gridColumn: 'span 2' }}><strong style={{ color: '#475569' }}>Email:</strong> {selectedOrder.userId?.email || 'N/A'}</p>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0 0 1.1rem' }} />

            {/* Order Information */}
            <div style={{ marginBottom: '1.1rem' }}>
              <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: '0.5rem' }}>
                Order Information
              </h3>
              <div style={{ background: '#f8fafc', borderRadius: '0.5rem', padding: '0.75rem 1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem 1.5rem', fontSize: '0.85rem' }}>
                <p style={{ margin: 0 }}><strong style={{ color: '#475569' }}>Order Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                <p style={{ margin: 0 }}><strong style={{ color: '#475569' }}>Payment:</strong> {selectedOrder.paymentMethod.replace('_', ' ').toUpperCase()}</p>
                <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <strong style={{ color: '#475569' }}>Status:</strong>
                  <span className={`inline-block px-2 py-0.5 rounded text-white text-xs font-semibold ${getStatusBadgeClass(selectedOrder.status)}`}>
                    {selectedOrder.status.toUpperCase()}
                  </span>
                </p>
                <p style={{ margin: 0 }}><strong style={{ color: '#475569' }}>Payment Status:</strong> {selectedOrder.paymentStatus}</p>
                {selectedOrder.trackingNumber && (
                  <p style={{ margin: 0, gridColumn: 'span 2' }}><strong style={{ color: '#475569' }}>Tracking:</strong> {selectedOrder.trackingNumber}</p>
                )}
              </div>
            </div>

            {/* Special Instructions */}
            {selectedOrder.notes && selectedOrder.notes.trim() && (
              <div style={{ marginBottom: '1.1rem', padding: '0.75rem 1rem', background: '#fefce8', border: '1px solid #fbbf24', borderRadius: '0.5rem' }}>
                <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#92400e', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  📝 Special Instructions
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#374151', fontStyle: 'italic' }}>"{selectedOrder.notes}"</p>
              </div>
            )}

            {/* Admin Notes */}
            {selectedOrder.adminNotes && selectedOrder.adminNotes.trim() && (
              <div style={{ marginBottom: '1.1rem', padding: '0.75rem 1rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '0.5rem' }}>
                <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  🧾 Admin Notes
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>{selectedOrder.adminNotes}</p>
              </div>
            )}

            {/* Customer Feedback */}
            {selectedOrder.feedback && selectedOrder.feedback.rating && (
              <div style={{ marginBottom: '1.1rem', padding: '0.75rem 1rem', background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '0.5rem' }}>
                <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e40af', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  ⭐ Customer Feedback
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} style={{ fontSize: '1rem', color: star <= selectedOrder.feedback.rating ? '#eab308' : '#d1d5db' }}>★</span>
                    ))}
                  </div>
                  <span style={{ fontWeight: 700, color: '#1e40af' }}>{selectedOrder.feedback.rating}/5</span>
                </div>
                {selectedOrder.feedback.comment && selectedOrder.feedback.comment.trim() && (
                  <p style={{ margin: '0.3rem 0 0', fontSize: '0.85rem', color: '#374151', fontStyle: 'italic' }}>"{selectedOrder.feedback.comment}"</p>
                )}
                <p style={{ margin: '0.3rem 0 0', fontSize: '0.7rem', color: '#94a3b8' }}>
                  Submitted on {new Date(selectedOrder.feedback.submittedAt).toLocaleString()}
                </p>
              </div>
            )}

            <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0 0 1.1rem' }} />

            {/* Shipping Address */}
            <div style={{ marginBottom: '1.1rem' }}>
              <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: '0.5rem' }}>
                Shipping Address
              </h3>
              <div style={{ background: '#f8fafc', borderRadius: '0.5rem', padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
                <p style={{ margin: 0 }}>{selectedOrder.shippingAddress.street}</p>
                <p style={{ margin: 0 }}>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                <p style={{ margin: 0 }}>{selectedOrder.shippingAddress.zipCode}, {selectedOrder.shippingAddress.country}</p>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0 0 1.1rem' }} />

            {/* Items */}
            <div style={{ marginBottom: '1.1rem' }}>
              <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: '0.5rem' }}>
                Items Ordered
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {selectedOrder.items.map((item, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: '0.4rem', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>{item.name}</span>
                    <span style={{ color: '#64748b', whiteSpace: 'nowrap' }}>{item.quantity} × ₹{item.price} = <strong style={{ color: '#0f172a' }}>₹{item.quantity * item.price}</strong></span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div style={{ padding: '0.75rem 1rem', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '0.5rem', marginBottom: '1.1rem' }}>
              <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#166534' }}>Total Amount: ₹{selectedOrder.totalAmount}</p>
            </div>

            {/* Update Status */}
            <div style={{ marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: '0.5rem' }}>
                Update Order Status
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {selectedOrder.status === 'pending' && (
                  <button
                    onClick={() => handleUpdateOrderStatus(selectedOrder._id, 'processing', 'pending', false)}
                    style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', fontWeight: 600, border: 'none', borderRadius: '0.4rem', background: '#3b82f6', color: '#fff', cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#2563eb')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#3b82f6')}
                  >
                    Approve & Process
                  </button>
                )}
                {selectedOrder.status === 'processing' && (
                  <button
                    onClick={() => handleUpdateOrderStatus(selectedOrder._id, 'delivered', selectedOrder.paymentMethod === 'cash_on_delivery' ? 'completed' : 'pending', false)}
                    style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', fontWeight: 600, border: 'none', borderRadius: '0.4rem', background: '#22c55e', color: '#fff', cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#16a34a')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#22c55e')}
                  >
                    Mark as Delivered
                  </button>
                )}
                {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                  <button
                    onClick={() => handleUpdateOrderStatus(selectedOrder._id, 'cancelled', 'failed')}
                    style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', fontWeight: 600, border: 'none', borderRadius: '0.4rem', background: '#ef4444', color: '#fff', cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#dc2626')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#ef4444')}
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Footer */}
          <div style={{ padding: '0.75rem 1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
            <button
              onClick={() => setSelectedOrder(null)}
              style={{
                padding: '0.45rem 1.5rem',
                border: '1px solid #cbd5e1',
                borderRadius: '0.4rem',
                background: '#fff',
                color: '#475569',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#94a3b8'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderOrders = () => (
    <div>
      <h2 className="text-3xl font-bold text-primary mb-6">Order Management</h2>
      {loading ? (
        <p className="text-lg text-gray-600">Loading orders...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left border border-gray-300 font-bold text-primary">Order ID</th>
                <th className="p-3 text-left border border-gray-300 font-bold text-primary">Customer</th>
                <th className="p-3 text-left border border-gray-300 font-bold text-primary">Date</th>
                <th className="p-3 text-left border border-gray-300 font-bold text-primary">Total</th>
                <th className="p-3 text-left border border-gray-300 font-bold text-primary">Payment</th>
                <th className="p-3 text-left border border-gray-300 font-bold text-primary">Status</th>
                <th className="p-3 text-left border border-gray-300 font-bold text-primary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const displayOrderId = order.orderId || `#${order._id.slice(-8)}`;
                return (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="p-3 border border-gray-300">
                    {displayOrderId}
                    {order.notes && order.notes.trim() && (
                      <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded" title={order.notes}>
                        📝 Has Notes
                      </span>
                    )}
                    {order.feedback && order.feedback.rating && (
                      <span className="ml-2 text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded" title={`Rating: ${order.feedback.rating}/5`}>
                        ⭐ {order.feedback.rating}/5
                      </span>
                    )}
                  </td>
                  <td className="p-3 border border-gray-300">{order.userId?.name || 'N/A'}</td>
                  <td className="p-3 border border-gray-300">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 border border-gray-300">₹{order.totalAmount}</td>
                  <td className="p-3 border border-gray-300">
                    {order.paymentMethod === 'cash_on_delivery' ? 'COD' : order.paymentMethod}
                  </td>
                  <td className="p-3 border border-gray-300">
                    <span className={`px-3 py-1 rounded text-white text-xs font-semibold ${getStatusBadgeClass(order.status)}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 border border-gray-300">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderInventory = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-primary">Inventory Management</h2>
        <button
          onClick={handleAddProduct}
          className="px-6 py-3 bg-success text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
        >
          + Add New Product
        </button>
      </div>
      {loading ? (
        <p className="text-lg text-gray-600">Loading products...</p>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100">
                <th className="p-3 text-left border border-gray-300 font-bold text-primary">Image</th>
                <th className="p-3 text-left border border-gray-300 font-bold text-primary">Product</th>
                <th className="p-3 text-left border border-gray-300 font-bold text-primary">Category</th>
                <th className="p-3 text-right border border-gray-300 font-bold text-primary">Cost Price</th>
                <th className="p-3 text-right border border-gray-300 font-bold text-primary">Selling Price</th>
                <th className="p-3 text-right border border-gray-300 font-bold text-primary">Profit/Unit</th>
                <th className="p-3 text-center border border-gray-300 font-bold text-primary">Stock</th>
                <th className="p-3 text-right border border-gray-300 font-bold text-primary">Total Profit</th>
                <th className="p-3 text-left border border-gray-300 font-bold text-primary">Buying Date</th>
                <th className="p-3 text-left border border-gray-300 font-bold text-primary">Expiry Date</th>
                <th className="p-3 text-left border border-gray-300 font-bold text-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
              {products.map((product) => {
                const profit = calculateProfit(product);
                const productImageSrc = !product.image || product.image.includes('via.placeholder.com')
                  ? INVENTORY_PLACEHOLDER_IMAGE
                  : product.image;
                return (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="p-3 border border-gray-300">
                      <img
                        src={productImageSrc}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          if (e.target.src !== INVENTORY_PLACEHOLDER_IMAGE) {
                            e.target.src = INVENTORY_PLACEHOLDER_IMAGE;
                          }
                        }}
                      />
                    </td>
                    <td className="p-3 border border-gray-300">
                      <div className="font-semibold">{product.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                    </td>
                    <td className="p-3 border border-gray-300">{product.category}</td>
                    <td className="p-3 border border-gray-300 text-right">
                      {product.costPrice ? `₹${product.costPrice}` : '-'}
                    </td>
                    <td className="p-3 border border-gray-300 font-semibold text-right">₹{product.price}</td>
                    <td className="p-3 border border-gray-300 text-right">
                      {profit ? (
                        <span className={`font-semibold ${parseFloat(profit.profitPerUnit) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ₹{profit.profitPerUnit}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className={`p-3 border border-gray-300 text-center ${getStockColor(product.stock)}`}>
                      {product.stock}
                    </td>
                    <td className="p-3 border border-gray-300 text-right">
                      {profit ? (
                        <div>
                          <span className={`font-bold ${parseFloat(profit.totalProfit) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ₹{profit.totalProfit}
                          </span>
                          <div className="text-xs text-gray-500">({profit.profitMargin}%)</div>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-3 border border-gray-300 text-sm">
                      {product.buyingDate ? new Date(product.buyingDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="p-3 border border-gray-300 text-sm">
                      {product.expiryDate ? (
                        <span style={{ color: new Date(product.expiryDate) < new Date() ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                          {new Date(product.expiryDate).toLocaleDateString()}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="p-3 border border-gray-300">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleUpdateInventory(product._id, product.stock)}
                          className="px-3 py-1 bg-success text-white rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          Stock
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id, product.name)}
                          className="px-3 py-1 bg-danger text-white rounded text-sm hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderDailyDeals = () => (
    <div>
      <div className="mb-6 admin-deals-header">
        <h2 className="text-3xl font-bold text-primary mb-4">⚡ Daily Deals Management</h2>
        <p className="text-gray-600 mb-4">
          Mark <span className="font-semibold">3–5 products</span> as today's deals using a simple
          boolean flag in the database. Each deal gives customers
          <span className="font-semibold"> 50% OFF</span> on the first
          <span className="font-semibold"> 10 items</span> sold today and encourages them to
          visit your store every day.
        </p>

        {dealMessage && (
          <div className={`mb-4 p-4 rounded-lg font-semibold ${dealMessage.type === 'success'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
            }`}>
            {dealMessage.text}
          </div>
        )}

        {loading ? (
          <p className="text-lg text-gray-600">Loading daily deals...</p>
        ) : dailyDeals.length > 0 ? (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-red-600 mb-4">Current Daily Deals ({dailyDeals.length}/5)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 admin-deals-grid">
              {dailyDeals.map((product) => (
                <div key={product._id} className="admin-deal-card">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-primary text-lg">{product.name}</h4>
                      <p className="text-sm text-gray-600">{product.category}</p>
                    </div>
                    <span className="text-2xl">🔥</span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="text-2xl font-bold text-red-600">₹{product.price}</p>
                      {product.originalPrice && (
                        <p className="text-sm line-through text-gray-600">₹{product.originalPrice}</p>
                      )}
                      {typeof product.dailyDealRemaining === 'number' && (
                        <p className="text-xs font-semibold text-red-700 mt-1">
                          Offer left today: {product.dailyDealRemaining} / 10
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-700">Stock: {product.stock}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleDailyDeal(product._id)}
                    className="admin-deal-remove-btn"
                  >
                    Remove from Daily Deals
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div>
        <h3 className="text-xl font-bold text-primary mb-4">Add Products to Daily Deals</h3>
        {loading ? (
          <p className="text-lg text-gray-600">Loading products...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left border border-gray-300 font-bold text-primary">Product</th>
                  <th className="p-3 text-left border border-gray-300 font-bold text-primary">Category</th>
                  <th className="p-3 text-left border border-gray-300 font-bold text-primary">Price</th>
                  <th className="p-3 text-left border border-gray-300 font-bold text-primary">Stock</th>
                  <th className="p-3 text-left border border-gray-300 font-bold text-primary">Status</th>
                  <th className="p-3 text-left border border-gray-300 font-bold text-primary">Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product._id}
                    className={`hover:bg-gray-50 ${product.isDailyDeal ? 'bg-orange-50' : ''}`}
                  >
                    <td className="p-3 border border-gray-300 font-semibold">{product.name}</td>
                    <td className="p-3 border border-gray-300">{product.category}</td>
                    <td className="p-3 border border-gray-300">₹{product.price}</td>
                    <td className="p-3 border border-gray-300">{product.stock}</td>
                    <td className="p-3 border border-gray-300">
                      {product.isDailyDeal ? (
                        <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded text-xs font-bold">
                          🔥 DEAL
                        </span>
                      ) : (
                        <span className="text-gray-500 text-sm">-</span>
                      )}
                    </td>
                    <td className="p-3 border border-gray-300">
                      {(() => {
                        const isDisabled = dailyDeals.length >= 5 && !product.isDailyDeal;
                        const variantClass = isDisabled
                          ? 'deal-action-btn-disabled'
                          : product.isDailyDeal
                            ? 'deal-action-btn-remove'
                            : 'deal-action-btn-add';
                        return (
                          <button
                            onClick={() => handleToggleDailyDeal(product._id)}
                            disabled={isDisabled}
                            className={`deal-action-btn ${variantClass}`}
                          >
                            {product.isDailyDeal ? 'Remove' : 'Add'}
                          </button>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
  const renderEcoFriendly = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-primary mb-4">🌿 Product Attributes Management</h2>
        <p className="text-gray-600 mb-4">
          Mark products as Organic, Local, or Fresh Today to build trust and transparency with customers.
        </p>

        {ecoMessage && (
          <div className={`mb-4 p-4 rounded-lg font-semibold ${ecoMessage.type === 'success'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
            }`}>
            {ecoMessage.text}
          </div>
        )}

        {loading ? (
          <p className="text-lg text-gray-600">Loading products...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left border border-gray-300 font-bold text-primary">Product</th>
                  <th className="p-3 text-left border border-gray-300 font-bold text-primary">Category</th>
                  <th className="p-3 text-left border border-gray-300 font-bold text-primary">Price</th>
                  <th className="p-3 text-left border border-gray-300 font-bold text-primary">Stock</th>
                  <th className="p-3 text-left border border-gray-300 font-bold text-primary">Organic</th>
                  <th className="p-3 text-left border border-gray-300 font-bold text-primary">Local</th>
                  <th className="p-3 text-left border border-gray-300 font-bold text-primary">Fresh Today</th>
                  <th className="p-3 text-left border border-gray-300 font-bold text-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="p-3 border border-gray-300 font-semibold">{product.name}</td>
                    <td className="p-3 border border-gray-300">{product.category}</td>
                    <td className="p-3 border border-gray-300">₹{product.price}</td>
                    <td className="p-3 border border-gray-300">
                      {product.stock <= 10 && product.stock > 0 ? (
                        <span className="text-orange-600 font-bold">⚠️ {product.stock}</span>
                      ) : (
                        <span>{product.stock}</span>
                      )}
                    </td>
                    <td className="p-3 border border-gray-300">
                      {product.isOrganic ? (
                        <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded text-xs font-bold">
                          🌿 Organic
                        </span>
                      ) : (
                        <span className="text-gray-500 text-sm">-</span>
                      )}
                    </td>
                    <td className="p-3 border border-gray-300">
                      {product.isLocal ? (
                        <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded text-xs font-bold">
                          📍 Local
                        </span>
                      ) : (
                        <span className="text-gray-500 text-sm">-</span>
                      )}
                    </td>
                    <td className="p-3 border border-gray-300">
                      {product.isFreshToday ? (
                        <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded text-xs font-bold animate-pulse">
                          ✨ Fresh
                        </span>
                      ) : (
                        <span className="text-gray-500 text-sm">-</span>
                      )}
                    </td>
                    <td className="p-3 border border-gray-300">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => handleToggleOrganic(product._id)}
                          className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${product.isOrganic
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                            }`}
                        >
                          {product.isOrganic ? 'Remove Organic' : 'Add Organic'}
                        </button>
                        <button
                          onClick={() => handleToggleLocal(product._id)}
                          className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${product.isLocal
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                            }`}
                        >
                          {product.isLocal ? 'Remove Local' : 'Add Local'}
                        </button>
                        <button
                          onClick={() => handleToggleFresh(product._id)}
                          className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${product.isFreshToday
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                            }`}
                        >
                          {product.isFreshToday ? 'Remove Fresh' : 'Mark Fresh'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-primary mb-8">Admin Dashboard</h1>

      <div className="flex gap-0 mb-6 border-b-2 border-gray-300">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-3 font-semibold text-lg transition-colors border-b-4 ${activeTab === 'orders'
            ? 'bg-blue-500 text-white border-blue-700'
            : 'bg-transparent text-gray-700 border-transparent hover:bg-gray-100'
            }`}
        >
          Orders
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-6 py-3 font-semibold text-lg transition-colors border-b-4 ${activeTab === 'inventory'
            ? 'bg-blue-500 text-white border-blue-700'
            : 'bg-transparent text-gray-700 border-transparent hover:bg-gray-100'
            }`}
        >
          Inventory
        </button>
        <button
          onClick={() => setActiveTab('deals')}
          className={`px-6 py-3 font-semibold text-lg transition-colors border-b-4 ${activeTab === 'deals'
            ? 'bg-red-600 text-white border-red-800'
            : 'bg-transparent text-gray-700 border-transparent hover:bg-gray-100'
            }`}
        >
          ⚡ Daily Deals
        </button>
        <button
          onClick={() => setActiveTab('eco')}
          className={`px-6 py-3 font-semibold text-lg transition-colors border-b-4 ${activeTab === 'eco'
            ? 'bg-green-600 text-white border-green-800'
            : 'bg-transparent text-gray-700 border-transparent hover:bg-gray-100'
            }`}
        >
          🌿 Eco-Friendly
        </button>
        <button
          onClick={() => setActiveTab('shopping-lists')}
          className={`px-6 py-3 font-semibold text-lg transition-colors border-b-4 ${activeTab === 'shopping-lists'
            ? 'bg-purple-600 text-white border-purple-800'
            : 'bg-transparent text-gray-700 border-transparent hover:bg-gray-100'
            }`}
        >
          🛍️ Shopping Lists
        </button>
      </div>

      {activeTab === 'orders' && renderOrders()}
      {activeTab === 'inventory' && renderInventory()}
      {activeTab === 'deals' && renderDailyDeals()}
      {activeTab === 'eco' && renderEcoFriendly()}
      {activeTab === 'shopping-lists' && <AdminShoppingLists />}

      {renderOrderDetails()}

      {/* Product Modal */}
      {showProductModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '1rem', overscrollBehavior: 'contain' }}
        >
          <div
            className="bg-white w-full shadow-2xl"
            style={{
              maxWidth: '40rem',
              maxHeight: '80vh',
              borderRadius: '0.75rem',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                padding: '0.75rem 1.25rem',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.25rem' }}>{editingProduct ? '✏️' : '📦'}</span>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#fff', letterSpacing: '0.01em' }}>
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '2.2rem',
                  height: '2.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#fff',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.35)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Scrollable form body */}
            <form
              onSubmit={handleProductSubmit}
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1rem 1.25rem 0.75rem',
                fontSize: '0.85rem',
              }}
            >
              {/* Section: Basic Info */}
              <fieldset style={{ border: 'none', margin: 0, padding: 0, marginBottom: '0.9rem' }}>
                <legend style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: '0.5rem', display: 'block' }}>
                  Basic Information
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '0.6rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: '0.2rem' }}>
                      Product Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={productForm.name}
                      onChange={handleProductFormChange}
                      required
                      className="input-field"
                      placeholder="Enter product name"
                      style={{ padding: '0.4rem 0.65rem', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: '0.2rem' }}>
                      Category <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select
                      name="category"
                      value={productForm.category}
                      onChange={handleProductFormChange}
                      required
                      className="input-field"
                      style={{ padding: '0.4rem 0.65rem', fontSize: '0.85rem' }}
                    >
                      <option value="Rice & Grains">Rice & Grains</option>
                      <option value="Flours">Flours</option>
                      <option value="Pulses & Dals">Pulses & Dals</option>
                      <option value="Spices & Masalas">Spices & Masalas</option>
                      <option value="Cooking Essentials">Cooking Essentials</option>
                      <option value="Dairy Products">Dairy Products</option>
                      <option value="Eggs & Bakery">Eggs & Bakery</option>
                      <option value="Fruits (Daily Use)">Fruits (Daily Use)</option>
                      <option value="Vegetables (Daily Use)">Vegetables (Daily Use)</option>
                      <option value="Snacks & Biscuits">Snacks & Biscuits</option>
                      <option value="Instant & Packed Foods">Instant & Packed Foods</option>
                      <option value="Beverages">Beverages</option>
                      <option value="Personal Care">Personal Care</option>
                      <option value="Cleaning & Household">Cleaning & Household</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: '0.2rem' }}>
                      Description <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <textarea
                      name="description"
                      value={productForm.description}
                      onChange={handleProductFormChange}
                      required
                      rows="2"
                      className="input-field resize-none"
                      placeholder="Enter detailed product description"
                      style={{ padding: '0.4rem 0.65rem', fontSize: '0.85rem' }}
                    ></textarea>
                  </div>
                </div>
              </fieldset>

              {/* Divider */}
              <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0 0 0.9rem' }} />

              {/* Section: Pricing & Stock */}
              <fieldset style={{ border: 'none', margin: 0, padding: 0, marginBottom: '0.9rem' }}>
                <legend style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: '0.5rem', display: 'block' }}>
                  Pricing & Stock
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '0.6rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: '0.2rem' }}>
                      Selling Price (₹) <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={productForm.price}
                      onChange={handleProductFormChange}
                      required
                      min="0"
                      step="0.01"
                      className="input-field"
                      placeholder="0.00"
                      style={{ padding: '0.4rem 0.65rem', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: '0.2rem' }}>
                      Cost Price (₹)
                    </label>
                    <input
                      type="number"
                      name="costPrice"
                      value={productForm.costPrice}
                      onChange={handleProductFormChange}
                      min="0"
                      step="0.01"
                      className="input-field"
                      placeholder="0.00"
                      style={{ padding: '0.4rem 0.65rem', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: '0.2rem' }}>
                      Stock Quantity <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={productForm.stock}
                      onChange={handleProductFormChange}
                      required
                      min="0"
                      className="input-field"
                      placeholder="0"
                      style={{ padding: '0.4rem 0.65rem', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              </fieldset>

              {/* Divider */}
              <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0 0 0.9rem' }} />

              {/* Section: Additional Details */}
              <fieldset style={{ border: 'none', margin: 0, padding: 0, marginBottom: '0.9rem' }}>
                <legend style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: '0.5rem', display: 'block' }}>
                  Additional Details
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '0.6rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: '0.2rem' }}>
                      Buying Date
                    </label>
                    <input
                      type="date"
                      name="buyingDate"
                      value={productForm.buyingDate}
                      onChange={handleProductFormChange}
                      className="input-field"
                      style={{ padding: '0.4rem 0.65rem', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: '0.2rem' }}>
                      Expiry Date <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={productForm.expiryDate}
                      onChange={handleProductFormChange}
                      required
                      className="input-field"
                      style={{ padding: '0.4rem 0.65rem', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: '0.2rem' }}>
                      Rating (0-5)
                    </label>
                    <input
                      type="number"
                      name="rating"
                      value={productForm.rating}
                      onChange={handleProductFormChange}
                      min="0"
                      max="5"
                      step="0.1"
                      className="input-field"
                      placeholder="4.0"
                      style={{ padding: '0.4rem 0.65rem', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: '0.2rem' }}>
                      Image URL
                    </label>
                    <input
                      type="url"
                      name="image"
                      value={productForm.image}
                      onChange={handleProductFormChange}
                      className="input-field"
                      placeholder="https://example.com/image.jpg"
                      style={{ padding: '0.4rem 0.65rem', fontSize: '0.85rem' }}
                    />
                    {productForm.image && (
                      <div style={{ marginTop: '0.5rem' }}>
                        {(() => {
                          const previewSrc = !productForm.image || productForm.image.includes('via.placeholder.com')
                            ? INVENTORY_PLACEHOLDER_IMAGE
                            : productForm.image;
                          return (
                            <img
                              src={previewSrc}
                              alt="Preview"
                              style={{
                                width: '4.5rem',
                                height: '4.5rem',
                                objectFit: 'cover',
                                borderRadius: '0.4rem',
                                border: '2px solid #e2e8f0',
                              }}
                              onError={(e) => {
                                if (e.target.src !== INVENTORY_PLACEHOLDER_IMAGE) {
                                  e.target.src = INVENTORY_PLACEHOLDER_IMAGE;
                                }
                              }}
                            />
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </fieldset>

              {/* Footer actions */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.6rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid #e2e8f0',
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  style={{
                    padding: '0.45rem 1.2rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '0.4rem',
                    background: '#fff',
                    color: '#475569',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#94a3b8'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.45rem 1.5rem',
                    border: 'none',
                    borderRadius: '0.4rem',
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(34,197,94,0.3)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(34,197,94,0.45)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(34,197,94,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  {editingProduct ? '✓ Update Product' : '✓ Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
