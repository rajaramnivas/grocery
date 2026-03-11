import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService, paymentService } from '../services/api';
import { useNavigate } from 'react-router-dom';

import BudgetTracker from '../components/BudgetTracker';

const Cart = () => {
  const { cart, addToCart, removeFromCart, clearCart } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [orderNotes, setOrderNotes] = useState('');
  const [orderNotesError, setOrderNotesError] = useState('');
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const validateOrderNotes = (value) => {
    const trimmedValue = value.trim();
    const allowedShortForms = new Set(['kg', 'g', 'gm', 'ml', 'l', 'cod', 'upi']);

    if (!trimmedValue) {
      return '';
    }

    if (trimmedValue.length > 500) {
      return 'Special instructions are invalid. Maximum 500 characters allowed.';
    }

    if (!/^[a-zA-Z0-9\s.,!?\-'"()/:&]*$/.test(trimmedValue)) {
      return 'Special instructions are invalid. Use only letters, numbers, spaces, and basic punctuation.';
    }

    const words = trimmedValue
      .split(/\s+/)
      .map((word) => word.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, ''))
      .filter(Boolean);

    const invalidWords = words.filter((word) => {
      if (/^\d+$/.test(word)) {
        return false;
      }

      const loweredWord = word.toLowerCase();

      if (allowedShortForms.has(loweredWord)) {
        return false;
      }

      if (loweredWord.length <= 2) {
        return false;
      }

      const hasVowel = /[aeiouy]/i.test(loweredWord);
      const hasLongConsonantCluster = /[^aeiouy]{5,}/i.test(loweredWord);
      const hasRepeatedCharacterSpam = /(.)\1{3,}/i.test(loweredWord);

      return !hasVowel || hasLongConsonantCluster || hasRepeatedCharacterSpam;
    });

    if (invalidWords.length > 0) {
      const uniqueInvalidWords = [...new Set(invalidWords)].slice(0, 3);
      return `Invalid word(s): ${uniqueInvalidWords.join(', ')}. Please enter valid words only.`;
    }

    return '';
  };

  const handleRemove = async (productId) => {
    if (token) {
      await removeFromCart(productId);
    }
  };

  const handleQuantityChange = async (productId, currentQuantity, delta) => {
    if (!token) {
      alert('Please login to update your cart');
      navigate('/login');
      return;
    }

    if (delta === -1 && currentQuantity === 1) {
      await removeFromCart(productId);
      return;
    }

    await addToCart(productId, delta);
  };

  const handleCheckout = async () => {
    if (!token) {
      alert('Please login to place an order');
      navigate('/login');
      return;
    }
    setShowCheckout(true);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    const notesValidationError = validateOrderNotes(orderNotes);
    if (notesValidationError) {
      setOrderNotesError(notesValidationError);
      alert(notesValidationError);
      return;
    }

    setLoading(true);
    try {
      const response = await orderService.createOrder(shippingAddress, paymentMethod, orderNotes);
      const createdOrder = response.data;

      // For UPI payments, trigger Razorpay checkout flow
      if (paymentMethod === 'upi') {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          alert('Failed to load Razorpay. Please try again or choose another payment method.');
          return;
        }

        const { data: paymentData } = await paymentService.createRazorpayOrder(createdOrder._id);

        const options = {
          key: paymentData.razorpayKeyId,
          amount: paymentData.amount,
          currency: paymentData.currency,
          name: 'Grocery Store',
          description: `Order ${createdOrder.orderId || createdOrder._id.slice(-8)}`,
          order_id: paymentData.razorpayOrderId,
          handler: async function (response) {
            try {
              await paymentService.verifyRazorpayPayment({
                orderId: createdOrder._id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              });
              alert('Payment successful! Your order has been placed.');
              clearCart();
              navigate('/payment-complete', { state: { orderId: createdOrder._id } });
            } catch (verifyError) {
              console.error('Payment verification failed:', verifyError);
              alert(
                verifyError.response?.data?.message ||
                  'Payment verification failed. Please check your order status in My Orders.'
              );
            }
          },
          prefill: {
            name: '',
            email: '',
            contact: '',
          },
          theme: {
            color: '#16a34a',
          },
        };

        const razorpayObject = new window.Razorpay(options);
        razorpayObject.open();
      } else {
        alert('Order placed successfully!');
        clearCart();
        navigate('/payment-complete', { state: { orderId: createdOrder._id } });
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="p-6 mx-auto" style={{ maxWidth: '56rem' }}>
        <h2 className="text-3xl font-bold text-primary mb-2 text-center">Your Cart is Empty</h2>
        <p className="text-gray-600 text-center">Add some products to your cart</p>
        <BudgetTracker totalAmount={0} />
      </div>
    );
  }

  if (showCheckout) {
    return (
      <div className="p-6 mx-auto" style={{ maxWidth: '42rem' }}>
        <h2 className="text-3xl font-bold text-primary mb-6">Checkout</h2>
        <form onSubmit={handlePlaceOrder}>
          <div className="bg-light p-6 rounded-lg mb-6">
            <h3 className="text-xl font-bold text-primary mb-4">Shipping Address</h3>
            <div className="mb-4">
              <label className="input-label">Street Address</label>
              <input
                type="text"
                required
                value={shippingAddress.street}
                onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                className="input-field"
              />
            </div>
            <div className="mb-4">
              <label className="input-label">City</label>
              <input
                type="text"
                required
                value={shippingAddress.city}
                onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                className="input-field"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="input-label">State</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="input-label">ZIP Code</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.zipCode}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          <div className="bg-light p-6 rounded-lg mb-6">
            <h3 className="text-xl font-bold text-primary mb-4">Special Instructions for Shopkeeper</h3>
            <p className="text-sm text-gray-500 mb-3">Add any special requests for your order (e.g., "Small onions", "Less ripe fruits", "Extra packaging")</p>
            <textarea
              value={orderNotes}
              onChange={(e) => {
                const value = e.target.value;
                setOrderNotes(value);
                setOrderNotesError(validateOrderNotes(value));
              }}
              placeholder="Enter your special instructions here..."
              className="input-field w-100"
              style={{ height: '6rem', resize: 'none' }}
              maxLength={500}
            />
            {orderNotesError && (
              <p className="text-danger text-sm mt-1 font-semibold">{orderNotesError}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">{orderNotes.length}/500 characters</p>
          </div>

          <div className="bg-light p-6 rounded-lg mb-6">
            <h3 className="text-xl font-bold text-primary mb-4">Payment Method</h3>
            <div className="d-flex flex-column gap-3">
              <label className="d-flex align-center p-2 rounded" style={{ cursor: 'pointer', backgroundColor: 'var(--color-surface)' }}>
                <input
                  type="radio"
                  value="cash_on_delivery"
                  checked={paymentMethod === 'cash_on_delivery'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <span>Cash on Delivery (COD)</span>
              </label>
              <label className="d-flex align-center p-2 rounded" style={{ cursor: 'pointer', backgroundColor: 'var(--color-surface)' }}>
                <input
                  type="radio"
                  value="upi"
                  checked={paymentMethod === 'upi'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <span>Online Payment (Razorpay)</span>
              </label>
            </div>
          </div>

          <BudgetTracker totalAmount={cart.totalPrice || 0} />

          <div className="bg-light p-6 rounded-lg mb-6">
            <p className="font-bold mb-2">Order Summary</p>
            <p className="mb-2">Items: {cart.totalItems}</p>
            <p className="text-2xl font-bold text-primary">Total: ₹{cart.totalPrice}</p>
          </div>

          <div className="d-flex gap-4">
            <button
              type="button"
              onClick={() => setShowCheckout(false)}
              className="btn flex-1"
              style={{ padding: '0.75rem 1.5rem', backgroundColor: '#9ca3af', color: 'white' }}
            >
              Back to Cart
            </button>
            <button
              type="submit"
              disabled={loading || !!orderNotesError}
              className="btn btn-primary flex-1"
              style={{ padding: '0.75rem 1.5rem', opacity: loading || !!orderNotesError ? 0.5 : 1, cursor: loading || !!orderNotesError ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-6 mx-auto" style={{ maxWidth: '56rem' }}>
      <h2 className="text-3xl font-bold text-primary mb-6">Shopping Cart</h2>

      <BudgetTracker totalAmount={cart.totalPrice || 0} />

      <div className="d-flex flex-column gap-4 mb-6">
        {cart.items.map((item) => (
          <div
            key={item.productId && item.productId._id ? item.productId._id : item.productId}
            className="card d-flex justify-between align-center"
          >
            <div>
              <h4 className="font-bold text-primary text-lg">{item.productId && item.productId.name ? item.productId.name : 'Product'}</h4>
              <p className="text-gray-600 text-sm mb-2">
                Price per unit: <span className="font-semibold text-success">₹{item.price}</span>
              </p>
              <div className="d-flex align-center gap-2 mb-2">
                <span className="text-sm text-gray-600 mr-2">Quantity:</span>
                <button
                  type="button"
                  onClick={() =>
                    handleQuantityChange(
                      item.productId && item.productId._id ? item.productId._id : item.productId,
                      item.quantity,
                      -1
                    )
                  }
                  className="btn btn-light"
                  style={{ minWidth: '2.25rem', padding: '0.3rem 0.5rem' }}
                >
                  -
                </button>
                <span className="font-semibold text-md" style={{ minWidth: '2rem', textAlign: 'center' }}>
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleQuantityChange(
                      item.productId && item.productId._id ? item.productId._id : item.productId,
                      item.quantity,
                      1
                    )
                  }
                  className="btn btn-primary"
                  style={{ minWidth: '2.25rem', padding: '0.3rem 0.5rem' }}
                >
                  +
                </button>
              </div>
              <p className="text-md text-gray-700">
                Line total: <span className="font-bold text-primary">₹{(item.price * item.quantity).toFixed(2)}</span>
              </p>
            </div>
            <button
              onClick={() => handleRemove(item.productId && item.productId._id ? item.productId._id : item.productId)}
              className="btn btn-danger"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="bg-light p-6 rounded-lg text-xl font-bold text-primary mb-6">
        Total: ₹{cart.totalPrice || 0}
      </div>

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="btn btn-primary w-100"
        style={{ padding: '0.75rem', fontSize: '1.125rem', opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
      >
        {loading ? 'Processing...' : 'Proceed to Checkout'}
      </button>
    </div>
  );
};

export default Cart;
