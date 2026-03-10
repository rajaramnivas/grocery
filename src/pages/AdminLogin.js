import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      // Check if user is admin
      if (data.user.role !== 'admin') {
        setError('Admin access required. Please use admin credentials.');
        return;
      }

      if (data.token) {
        // Save token and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/admin-dashboard');
      }
    } catch (err) {
      setError('Login error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-8 border-2 border-red-900 rounded-lg shadow-lg bg-red-50">
      <h2 className="text-center text-3xl font-bold text-red-900 mb-2">
        🔐 Admin Login
      </h2>
      <p className="text-center text-gray-600 text-sm mb-6">
        Secure access for administrators only
      </p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block font-bold text-red-900 mb-2">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-900 focus:ring-1 focus:ring-red-900 transition-colors"
            placeholder="admin@example.com"
          />
        </div>

        <div className="mb-6">
          <label className="block font-bold text-red-900 mb-2">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-900 focus:ring-1 focus:ring-red-900 transition-colors"
            placeholder="Your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-danger w-full"
        >
          {loading ? 'Logging in...' : 'Admin Login'}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-gray-300 text-center">
        <p className="text-gray-600 mb-2">New admin?</p>
        <a
          href="/admin-register"
          className="text-red-900 font-bold hover:underline"
        >
          Register here
        </a>
      </div>

      <div className="mt-4 text-center">
        <p className="text-gray-600 mb-2">Regular user?</p>
        <a
          href="/login"
          className="text-blue-600 font-bold hover:underline"
        >
          User Login
        </a>
      </div>

      <div className="mt-6 p-4 bg-gray-200 rounded-lg text-xs text-gray-700">
        <strong>ℹ️ Admin Features:</strong>
        <ul className="mt-2 ml-5 list-disc">
          <li>Add & manage products</li>
          <li>Update prices & inventory</li>
          <li>Manage product ratings</li>
          <li>View all orders</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminLogin;
