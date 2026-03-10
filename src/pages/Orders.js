


import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/api';
import billService from '../services/billService';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reorderingId, setReorderingId] = useState(null);
  const [reorderMessage, setReorderMessage] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelMessage, setCancelMessage] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({ orderId: null, rating: 0, comment: '' });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [productFeedbackForm, setProductFeedbackForm] = useState({ orderId: null, productId: null, rating: 0, comment: '' });
  const [submittingProductFeedback, setSubmittingProductFeedback] = useState(false);
  const [productFeedbackMessage, setProductFeedbackMessage] = useState(null);
  const [downloadingBillId, setDownloadingBillId] = useState(null);
  const [billMessage, setBillMessage] = useState(null);
  const [generatingBillOrderId, setGeneratingBillOrderId] = useState(null);
  const { token } = useAuth();
  const { getCart } = useCart();

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await orderService.getUserOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending Approval',
      processing: 'Processing',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return labels[status] || status;
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      cash_on_delivery: 'Cash on Delivery',
      credit_card: 'Credit Card',
      debit_card: 'Debit Card',
      upi: 'UPI',
      net_banking: 'Net Banking',
    };
    return labels[method] || method;
  };

  const handleReorder = async (orderId) => {
    setReorderingId(orderId);
    setReorderMessage(null);
    try {
      const response = await orderService.reorder(orderId);
      
      // Update cart in context
      if (token) {
        await getCart(token);
      }
      
      // Show success message
      const { addedCount, unavailableItems } = response.data;
      let message = `✓ ${addedCount} item(s) added to cart!`;
      
      if (unavailableItems && unavailableItems.length > 0) {
        message += ` Note: ${unavailableItems.length} item(s) unavailable: ${unavailableItems.join(', ')}`;
      }
      
      setReorderMessage({ type: 'success', text: message });
      
      // Clear message after 5 seconds
      setTimeout(() => setReorderMessage(null), 5000);
    } catch (error) {
      console.error('Error reordering:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.message || 'Failed to reorder. Please try again.';
      setReorderMessage({ 
        type: 'error', 
        text: errorMsg
      });
      setTimeout(() => setReorderMessage(null), 5000);
    } finally {
      setReorderingId(null);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }

    setCancellingId(orderId);
    setCancelMessage(null);
    try {
      await orderService.cancelOrder(orderId);
      
      // Update the selected order and orders list
      const updatedOrders = orders.map(order => 
        order._id === orderId ? { ...order, status: 'cancelled' } : order
      );
      setOrders(updatedOrders);
      
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: 'cancelled' });
      }
      
      setCancelMessage({ 
        type: 'success', 
        text: '✓ Order cancelled successfully!' 
      });
      
      setTimeout(() => setCancelMessage(null), 5000);
    } catch (error) {
      console.error('Error cancelling order:', error);
      const errorMsg = error.response?.data?.message || 'Failed to cancel order. Please try again.';
      setCancelMessage({ 
        type: 'error', 
        text: errorMsg
      });
      setTimeout(() => setCancelMessage(null), 5000);
    } finally {
      setCancellingId(null);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackForm.rating || feedbackForm.rating < 1 || feedbackForm.rating > 5) {
      setFeedbackMessage({ type: 'error', text: 'Please select a rating between 1 and 5' });
      return;
    }

    setSubmittingFeedback(true);
    try {
      await orderService.submitFeedback(feedbackForm.orderId, feedbackForm.rating, feedbackForm.comment);
      
      // Refresh orders to show updated feedback
      await fetchOrders();
      
      // Reset form
      setFeedbackForm({ orderId: null, rating: 0, comment: '' });
      setFeedbackMessage({ type: 'success', text: '✓ Thank you for your feedback!' });
      
      setTimeout(() => setFeedbackMessage(null), 5000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setFeedbackMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to submit feedback. Please try again.' 
      });
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleSubmitProductFeedback = async (e, productId) => {
    e.preventDefault();
    if (!productFeedbackForm.rating || productFeedbackForm.rating < 1 || productFeedbackForm.rating > 5) {
      setProductFeedbackMessage({ type: 'error', text: 'Please select a rating between 1 and 5' });
      return;
    }

    setSubmittingProductFeedback(true);
    try {
      await orderService.submitProductFeedback(
        productFeedbackForm.orderId, 
        productId, 
        productFeedbackForm.rating, 
        productFeedbackForm.comment
      );
      
      // Refresh orders to show updated feedback
      await fetchOrders();
      
      // Update selected order if viewing details
      if (selectedOrder && selectedOrder._id === productFeedbackForm.orderId) {
        const updatedOrder = await orderService.getOrderById(selectedOrder._id);
        setSelectedOrder(updatedOrder.data);
      }
      
      // Reset form
      setProductFeedbackForm({ orderId: null, productId: null, rating: 0, comment: '' });
      setProductFeedbackMessage({ type: 'success', text: '✓ Thank you for your product feedback!' });
      
      setTimeout(() => setProductFeedbackMessage(null), 5000);
    } catch (error) {
      console.error('Error submitting product feedback:', error);
      setProductFeedbackMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to submit product feedback. Please try again.' 
      });
    } finally {
      setSubmittingProductFeedback(false);
    }
  };

  const handleDownloadBill = async (order) => {
    if (!order?.billId) return;

    setDownloadingBillId(order.billId);
    setBillMessage(null);
    try {
      const response = await billService.downloadBill(order.billId);
      const orderSuffix = order.orderId || order._id.slice(-8);
      const filename = `bill-${orderSuffix}.pdf`;

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      setBillMessage({ type: 'success', text: 'Bill downloaded successfully.' });
      setTimeout(() => setBillMessage(null), 5000);
    } catch (error) {
      setBillMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to download bill. Please try again.',
      });
      setTimeout(() => setBillMessage(null), 5000);
    } finally {
      setDownloadingBillId(null);
    }
  };

  const handleGenerateBill = async (order) => {
    if (!order?._id) return;

    setGeneratingBillOrderId(order._id);
    setBillMessage(null);
    try {
      await billService.generateBill(order._id, '');

      // Refresh orders and selected order to get the new billId
      await fetchOrders();
      if (selectedOrder && selectedOrder._id === order._id) {
        const updatedOrder = await orderService.getOrderById(order._id);
        setSelectedOrder(updatedOrder.data);
      }

      setBillMessage({
        type: 'success',
        text: 'Bill generated successfully. You can now download it.',
      });
      setTimeout(() => setBillMessage(null), 5000);
    } catch (error) {
      setBillMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to generate bill. Please try again.',
      });
      setTimeout(() => setBillMessage(null), 5000);
    } finally {
      setGeneratingBillOrderId(null);
    }
  };

  const renderStars = (rating, interactive = false, onSelect = null) => {
    return (
      <div className="d-flex gap-1" style={{ alignItems: 'center' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => onSelect(star) : undefined}
            disabled={!interactive}
            style={{
              fontSize: '1.5rem',
              cursor: interactive ? 'pointer' : 'default',
              transition: 'transform 0.2s',
              color: star <= rating ? '#eab308' : '#d1d5db',
              background: 'none',
              border: 'none',
              padding: 0
            }}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return <p className="p-6 text-center text-lg text-gray-600">Loading orders...</p>;
  }

  if (orders.length === 0) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-3xl font-bold text-primary mb-2">No Orders Yet</h2>
        <p className="text-gray-600">Start shopping to place your first order</p>
      </div>
    );
  }

  if (selectedOrder) {
    return (
      <div className="p-6 mx-auto" style={{ maxWidth: '56rem' }}>
        <button
          onClick={() => setSelectedOrder(null)}
          className="btn mb-6"
          style={{ padding: '0.5rem 1rem', backgroundColor: '#9ca3af', color: 'white', fontWeight: '600' }}
        >
          ← Back to Orders
        </button>

        {reorderMessage && (
          <div className="mb-4 p-4 rounded-lg font-semibold" style={{
            backgroundColor: reorderMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: reorderMessage.type === 'success' ? '#166534' : '#991b1b',
            border: `1px solid ${reorderMessage.type === 'success' ? '#86efac' : '#fca5a5'}`
          }}>
            {reorderMessage.text}
          </div>
        )}

        {cancelMessage && (
          <div className="mb-4 p-4 rounded-lg font-semibold" style={{
            backgroundColor: cancelMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: cancelMessage.type === 'success' ? '#166534' : '#991b1b',
            border: `1px solid ${cancelMessage.type === 'success' ? '#86efac' : '#fca5a5'}`
          }}>
            {cancelMessage.text}
          </div>
        )}

        {billMessage && (
          <div className="mb-4 p-4 rounded-lg font-semibold" style={{
            backgroundColor: billMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: billMessage.type === 'success' ? '#166534' : '#991b1b',
            border: `1px solid ${billMessage.type === 'success' ? '#86efac' : '#fca5a5'}`
          }}>
            {billMessage.text}
          </div>
        )}
        
        <div className="d-flex justify-between align-center mb-6 gap-4 flex-wrap">
          <h2 className="text-3xl font-bold text-primary">Order Details</h2>
          <div className="d-flex gap-3">
            {selectedOrder.status === 'pending' && (
              <button
                onClick={() => handleCancelOrder(selectedOrder._id)}
                disabled={cancellingId === selectedOrder._id}
                className="btn"
                style={{
                  padding: '0.75rem 1.5rem',
                  fontWeight: '600',
                  backgroundColor: cancellingId === selectedOrder._id ? '#d1d5db' : '#dc2626',
                  color: cancellingId === selectedOrder._id ? '#4b5563' : 'white',
                  cursor: cancellingId === selectedOrder._id ? 'not-allowed' : 'pointer'
                }}
              >
                {cancellingId === selectedOrder._id ? 'Cancelling...' : '✕ Cancel Order'}
              </button>
            )}
            <button
              onClick={() => handleReorder(selectedOrder._id)}
              disabled={reorderingId === selectedOrder._id}
              className="btn"
              style={{
                padding: '0.75rem 1.5rem',
                fontWeight: '600',
                backgroundColor: reorderingId === selectedOrder._id ? '#d1d5db' : '#16a34a',
                color: reorderingId === selectedOrder._id ? '#4b5563' : 'white',
                cursor: reorderingId === selectedOrder._id ? 'not-allowed' : 'pointer'
              }}
            >
              {reorderingId === selectedOrder._id ? 'Adding to Cart...' : '🔄 Reorder All Items'}
            </button>
          </div>
        </div>
        <div className="p-6 d-flex flex-column gap-6" style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
          <div>
            <h3 className="text-xl font-bold text-primary mb-3">
              Order {selectedOrder.orderId || `#${selectedOrder._id.slice(-8)}`}
            </h3>
            <div className="d-flex flex-column gap-2">
              <p><strong>Order Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              <div className="d-flex align-center gap-2">
                <strong>Status:</strong>
                <span className="badge text-white" style={{
                  backgroundColor: selectedOrder.status === 'pending' ? '#f97316' :
                                 selectedOrder.status === 'processing' ? '#3b82f6' :
                                 selectedOrder.status === 'delivered' ? '#22c55e' :
                                 '#ef4444'
                }}>
                  {getStatusLabel(selectedOrder.status)}
                </span>
              </div>
              <p><strong>Payment Method:</strong> {getPaymentMethodLabel(selectedOrder.paymentMethod)}</p>
              {selectedOrder.trackingNumber && (
                <p><strong>Tracking Number:</strong> {selectedOrder.trackingNumber}</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-primary mb-3">Items</h3>
            {productFeedbackMessage && (
              <div className="mb-4 p-3 rounded-lg font-semibold" style={{
                backgroundColor: productFeedbackMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
                color: productFeedbackMessage.type === 'success' ? '#166534' : '#991b1b',
                border: `1px solid ${productFeedbackMessage.type === 'success' ? '#86efac' : '#fca5a5'}`
              }}>
                {productFeedbackMessage.text}
              </div>
            )}
            <div className="d-flex flex-column gap-4">
              {selectedOrder.items.map((item, index) => (
                <div 
                  key={index}
                  className="p-4 bg-light"
                  style={{ borderRadius: '0.5rem', border: '2px solid #e5e7eb' }}
                >
                  <p className="font-bold text-primary text-lg">{item.name}</p>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  <p className="text-sm text-gray-600">Price: ₹{item.price}</p>
                  <p className="font-semibold text-primary">Subtotal: ₹{item.price * item.quantity}</p>
                  
                  {/* Product Feedback Section - Only for delivered orders */}
                  {selectedOrder.status === 'delivered' && (
                    <div className="mt-4 pt-4" style={{ borderTop: '2px solid #d1d5db' }}>
                      {item.feedback && item.feedback.rating ? (
                        <div className="p-3 bg-white" style={{ borderRadius: '0.5rem' }}>
                          <p className="text-sm font-semibold" style={{ color: '#15803d', marginBottom: '0.5rem' }}>✓ You've rated this product</p>
                          <div className="mb-2">
                            {renderStars(item.feedback.rating)}
                          </div>
                          {item.feedback.comment && (
                            <p className="text-sm text-gray-700" style={{ fontStyle: 'italic' }}>"{item.feedback.comment}"</p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            Rated on {new Date(item.feedback.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                      ) : (
                        <div className="p-3 bg-white" style={{ borderRadius: '0.5rem' }}>
                          <p className="text-sm font-semibold mb-3" style={{ color: '#1d4ed8' }}>Rate this product:</p>
                          <form onSubmit={(e) => handleSubmitProductFeedback(e, item.productId)}>
                            <div className="mb-3">
                              {renderStars(
                                productFeedbackForm.orderId === selectedOrder._id && 
                                productFeedbackForm.productId === item.productId 
                                  ? productFeedbackForm.rating 
                                  : 0,
                                true,
                                (rating) => setProductFeedbackForm({ 
                                  orderId: selectedOrder._id, 
                                  productId: item.productId, 
                                  rating, 
                                  comment: productFeedbackForm.productId === item.productId ? productFeedbackForm.comment : '' 
                                })
                              )}
                            </div>
                            <textarea
                              value={
                                productFeedbackForm.orderId === selectedOrder._id && 
                                productFeedbackForm.productId === item.productId 
                                  ? productFeedbackForm.comment 
                                  : ''
                              }
                              onChange={(e) => setProductFeedbackForm({ 
                                orderId: selectedOrder._id, 
                                productId: item.productId, 
                                rating: productFeedbackForm.productId === item.productId ? productFeedbackForm.rating : 0,
                                comment: e.target.value 
                              })}
                              placeholder="Share your thoughts about this product (optional)..."
                              className="input-field w-100 text-sm"
                              rows="2"
                              maxLength={300}
                            />
                            <button
                              type="submit"
                              disabled={
                                submittingProductFeedback || 
                                (productFeedbackForm.productId === item.productId && productFeedbackForm.rating === 0)
                              }
                              className="btn mt-2 font-semibold"
                              style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: (submittingProductFeedback || (productFeedbackForm.productId === item.productId && productFeedbackForm.rating === 0)) ? '#9ca3af' : '#2563eb',
                                color: 'white',
                                cursor: (submittingProductFeedback || (productFeedbackForm.productId === item.productId && productFeedbackForm.rating === 0)) ? 'not-allowed' : 'pointer'
                              }}
                            >
                              {submittingProductFeedback && productFeedbackForm.productId === item.productId 
                                ? 'Submitting...' 
                                : 'Submit Product Rating'}
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-primary mb-3">Shipping Address</h3>
            <div className="text-gray-700">
              <p>{selectedOrder.shippingAddress.street}</p>
              <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
              <p>{selectedOrder.shippingAddress.zipCode}</p>
              <p>{selectedOrder.shippingAddress.country}</p>
            </div>
          </div>

          {selectedOrder.notes && (
            <div>
              <h3 className="text-xl font-bold text-primary mb-3">Order Notes</h3>
              <p className="p-4 text-gray-700" style={{ backgroundColor: '#fefce8', border: '1px solid #fef08a', borderRadius: '0.5rem' }}>
                {selectedOrder.notes}
              </p>
            </div>
          )}

          <div className="p-6" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.5rem' }}>
            <p className="text-2xl font-bold text-success">Total Amount: ₹{selectedOrder.totalAmount}</p>
          </div>

          {selectedOrder.status === 'delivered' && (
            <div className="p-6" style={{ backgroundColor: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '0.5rem' }}>
              <h3 className="text-xl font-bold text-primary mb-3">Bill</h3>
              {selectedOrder.billId ? (
                <button
                  onClick={() => handleDownloadBill(selectedOrder)}
                  disabled={downloadingBillId === selectedOrder.billId}
                  className="btn"
                  style={{
                    padding: '0.75rem 1.5rem',
                    fontWeight: '600',
                    backgroundColor: downloadingBillId === selectedOrder.billId ? '#d1d5db' : '#4f46e5',
                    color: downloadingBillId === selectedOrder.billId ? '#4b5563' : 'white',
                    cursor: downloadingBillId === selectedOrder.billId ? 'not-allowed' : 'pointer'
                  }}
                >
                  {downloadingBillId === selectedOrder.billId ? 'Downloading...' : 'Download Bill'}
                </button>
              ) : (
                <div className="d-flex flex-wrap gap-3 align-center">
                  <p className="text-sm text-gray-700" style={{ flexGrow: 1 }}>
                    Your bill is ready to be generated. Click below to create it now.
                  </p>
                  <button
                    onClick={() => handleGenerateBill(selectedOrder)}
                    disabled={generatingBillOrderId === selectedOrder._id}
                    className="btn"
                    style={{
                      padding: '0.75rem 1.5rem',
                      fontWeight: '600',
                      backgroundColor: generatingBillOrderId === selectedOrder._id ? '#d1d5db' : '#4f46e5',
                      color: generatingBillOrderId === selectedOrder._id ? '#4b5563' : 'white',
                      cursor: generatingBillOrderId === selectedOrder._id ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {generatingBillOrderId === selectedOrder._id ? 'Generating Bill...' : 'Generate Bill'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Feedback Section */}
          {selectedOrder.status === 'delivered' && (
            <div className="p-6 bg-light" style={{ border: '2px solid #93c5fd', borderRadius: '0.5rem', backgroundColor: '#eff6ff' }}>
              <h3 className="text-xl font-bold text-primary mb-4">📝 Order Feedback</h3>
              
              {selectedOrder.feedback && selectedOrder.feedback.rating ? (
                <div className="d-flex flex-column gap-3">
                  <p className="font-semibold" style={{ color: '#15803d' }}>✓ You've already submitted feedback for this order</p>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Your Rating:</p>
                    {renderStars(selectedOrder.feedback.rating)}
                  </div>
                  {selectedOrder.feedback.comment && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Your Comment:</p>
                      <p className="text-gray-700" style={{ fontStyle: 'italic' }}>"{selectedOrder.feedback.comment}"</p>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Submitted on {new Date(selectedOrder.feedback.submittedAt).toLocaleString()}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitFeedback} className="d-flex flex-column gap-4">
                  {feedbackMessage && (
                    <div className="p-3 rounded-lg font-semibold" style={{
                      backgroundColor: feedbackMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
                      color: feedbackMessage.type === 'success' ? '#166534' : '#991b1b',
                      border: `1px solid ${feedbackMessage.type === 'success' ? '#86efac' : '#fca5a5'}`
                    }}>
                      {feedbackMessage.text}
                    </div>
                  )}

                  <div>
                    <label className="input-label mb-2">
                      How would you rate your experience? *
                    </label>
                    {renderStars(
                      feedbackForm.orderId === selectedOrder._id ? feedbackForm.rating : 0,
                      true,
                      (rating) => setFeedbackForm({ orderId: selectedOrder._id, rating, comment: feedbackForm.comment })
                    )}
                    {feedbackForm.orderId === selectedOrder._id && feedbackForm.rating > 0 && (
                      <p className="text-sm text-gray-600 mt-1">
                        {feedbackForm.rating === 5 && '⭐ Excellent!'}
                        {feedbackForm.rating === 4 && '😊 Very Good!'}
                        {feedbackForm.rating === 3 && '👍 Good'}
                        {feedbackForm.rating === 2 && '😐 Fair'}
                        {feedbackForm.rating === 1 && '😞 Poor'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="input-label mb-2">
                      Additional Comments (optional)
                    </label>
                    <textarea
                      value={feedbackForm.orderId === selectedOrder._id ? feedbackForm.comment : ''}
                      onChange={(e) => setFeedbackForm({ 
                        orderId: selectedOrder._id, 
                        rating: feedbackForm.orderId === selectedOrder._id ? feedbackForm.rating : 0, 
                        comment: e.target.value 
                      })}
                      placeholder="Tell us about your experience..."
                      className="input-field w-100"
                      rows="4"
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {feedbackForm.orderId === selectedOrder._id ? feedbackForm.comment.length : 0}/500 characters
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingFeedback || (feedbackForm.orderId === selectedOrder._id && feedbackForm.rating === 0)}
                    className="btn w-100 font-semibold"
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: (submittingFeedback || (feedbackForm.orderId === selectedOrder._id && feedbackForm.rating === 0)) ? '#9ca3af' : '#2563eb',
                      color: 'white',
                      cursor: (submittingFeedback || (feedbackForm.orderId === selectedOrder._id && feedbackForm.rating === 0)) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 mx-auto" style={{ maxWidth: '56rem' }}>
      <h2 className="text-3xl font-bold text-primary mb-6">My Orders</h2>

      {reorderMessage && (
        <div className="mb-4 p-4 rounded-lg font-semibold" style={{
          backgroundColor: reorderMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: reorderMessage.type === 'success' ? '#166534' : '#991b1b',
          border: `1px solid ${reorderMessage.type === 'success' ? '#86efac' : '#fca5a5'}`
        }}>
          {reorderMessage.text}
        </div>
      )}

      {cancelMessage && (
        <div className="mb-4 p-4 rounded-lg font-semibold" style={{
          backgroundColor: cancelMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: cancelMessage.type === 'success' ? '#166534' : '#991b1b',
          border: `1px solid ${cancelMessage.type === 'success' ? '#86efac' : '#fca5a5'}`
        }}>
          {cancelMessage.text}
        </div>
      )}

      {billMessage && (
        <div className="mb-4 p-4 rounded-lg font-semibold" style={{
          backgroundColor: billMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: billMessage.type === 'success' ? '#166534' : '#991b1b',
          border: `1px solid ${billMessage.type === 'success' ? '#86efac' : '#fca5a5'}`
        }}>
          {billMessage.text}
        </div>
      )}

      <div className="d-flex flex-column gap-4">
        {orders.map((order) => {
          const displayOrderId = order.orderId || `#${order._id.slice(-8)}`;
          return (
          <div
            key={order._id}
            className="card"
          >
            <div 
              style={{ cursor: 'pointer' }}
              onClick={() => setSelectedOrder(order)}
            >
              <div className="d-flex justify-between align-start mb-4">
                <h3 className="text-lg font-bold text-primary">Order {displayOrderId}</h3>
                <div className="d-flex gap-2">
                  <span className="badge text-white" style={{
                    backgroundColor: order.status === 'pending' ? '#f97316' :
                                   order.status === 'processing' ? '#3b82f6' :
                                   order.status === 'delivered' ? '#22c55e' :
                                   '#ef4444'
                  }}>
                    {getStatusLabel(order.status)}
                  </span>
                  {order.status === 'delivered' && order.feedback && order.feedback.rating && (
                    <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
                      ⭐ {order.feedback.rating}/5
                    </span>
                  )}
                </div>
              </div>
              <div className="grid gap-4 text-sm text-gray-600 orders-responsive-grid">
                <div>
                  <p className="font-semibold text-primary">Total</p>
                  <p>₹{order.totalAmount}</p>
                </div>
                <div>
                  <p className="font-semibold text-primary">Date</p>
                  <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="font-semibold text-primary">Payment</p>
                  <p>{getPaymentMethodLabel(order.paymentMethod)}</p>
                </div>
                <div>
                  <p className="font-semibold text-primary">Items</p>
                  <p>{order.items.length}</p>
                </div>
              </div>
              <p className="mt-3 text-sm font-bold" style={{ color: '#2563eb' }}>
                Click to view details →
              </p>
            </div>
            
            <div className="mt-4 pt-4 d-flex gap-2" style={{ borderTop: '1px solid #e5e7eb' }}>
              {order.status === 'pending' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancelOrder(order._id);
                  }}
                  disabled={cancellingId === order._id}
                  className="btn"
                  style={{
                    flexGrow: 1,
                    padding: '0.5rem 1rem',
                    fontWeight: '600',
                    backgroundColor: cancellingId === order._id ? '#d1d5db' : '#dc2626',
                    color: cancellingId === order._id ? '#4b5563' : 'white',
                    cursor: cancellingId === order._id ? 'not-allowed' : 'pointer'
                  }}
                >
                  {cancellingId === order._id ? 'Cancelling...' : '✕ Cancel Order'}
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleReorder(order._id);
                }}
                disabled={reorderingId === order._id}
                className="btn"
                style={{
                  flexGrow: 1,
                  padding: '0.5rem 1rem',
                  fontWeight: '600',
                  backgroundColor: reorderingId === order._id ? '#d1d5db' : '#16a34a',
                  color: reorderingId === order._id ? '#4b5563' : 'white',
                  cursor: reorderingId === order._id ? 'not-allowed' : 'pointer'
                }}
              >
                {reorderingId === order._id ? 'Adding to Cart...' : '🔄 Reorder All Items'}
              </button>
              {order.status === 'delivered' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadBill(order);
                  }}
                  disabled={!order.billId || downloadingBillId === order.billId}
                  className="btn"
                  style={{
                    flexGrow: 1,
                    padding: '0.5rem 1rem',
                    fontWeight: '600',
                    backgroundColor: (!order.billId || downloadingBillId === order.billId) ? '#d1d5db' : '#4f46e5',
                    color: (!order.billId || downloadingBillId === order.billId) ? '#4b5563' : 'white',
                    cursor: (!order.billId || downloadingBillId === order.billId) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {!order.billId
                    ? 'Bill Pending'
                    : downloadingBillId === order.billId
                    ? 'Downloading...'
                    : '⬇ Download Bill'}
                </button>
              )}
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
