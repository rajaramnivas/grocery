import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import MaterialIcon from '../components/MaterialIcon';

const PaymentComplete = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = location.state?.orderId;
  const shortOrderId = orderId ? orderId.slice(-8) : '';

  useEffect(() => {
    // If user accesses this page directly without an order ID in state, redirect home
    if (!orderId) {
      navigate('/');
    }
    // Scroll to top
    window.scrollTo(0, 0);
  }, [orderId, navigate]);

  if (!orderId) {
    return null;
  }

  return (
    <div className="d-flex flex-column align-center justify-center p-6 mt-10" style={{ minHeight: '60vh' }}>
      <div className="bg-white p-10 text-center" style={{ borderRadius: '1rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', maxWidth: '32rem', width: '100%', borderTop: '8px solid var(--color-success)' }}>
        <div className="d-flex justify-center mb-6" style={{ color: 'var(--color-success)', animation: 'bounce 1s infinite' }}>
          <MaterialIcon name="check_circle" size={80} filled />
        </div>
        
        <h1 className="text-4xl font-bold mb-4" style={{ color: '#1f2937' }}>Payment Complete!</h1>
        <p className="text-xl text-gray-600 mb-2">
          Your order has been placed successfully.
        </p>
        <p className="font-semibold py-2 px-4 mb-8" style={{ color: '#374151', backgroundColor: '#f3f4f6', borderRadius: '0.5rem', display: 'inline-block' }}>
          Order ID: <span className="text-primary tracking-widest uppercase" style={{ letterSpacing: '0.1em' }}>#{shortOrderId}</span>
        </p>
        
        <div className="d-flex justify-center gap-4 flex-wrap">
          <Link 
            to="/orders" 
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.5rem', fontWeight: 'bold', fontSize: '1.125rem' }}
          >
            View Order History
          </Link>
          <Link 
            to="/products"
            className="btn"
            style={{ padding: '0.75rem 1.5rem', fontWeight: 'bold', fontSize: '1.125rem', color: 'var(--color-primary)', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentComplete;
