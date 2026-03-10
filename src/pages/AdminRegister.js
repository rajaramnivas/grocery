import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const storedUser = useMemo(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }, []);

  const activeUser = user || storedUser;
  const isAdmin = activeUser?.role === 'admin';
  const authToken = token || localStorage.getItem('token');

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

    if (!isAdmin || !authToken) {
      setError('Admin access required. Please login as an admin to add a new admin.');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.registerAdmin(
        formData.name,
        formData.email,
        formData.password,
        formData.phone
      );
      const data = response.data;

      if (data.token) {
        // Save token and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-white rounded-lg shadow-lg border border-gray-300">
      <h2 className="text-center text-3xl font-bold text-primary mb-8">
        Admin Registration
      </h2>

      {!isAdmin && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg mb-6">
          You need to be logged in as an existing admin to create another admin. Please login first.
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-bold text-primary mb-2">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="input-field"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block font-bold text-primary mb-2">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="input-field"
            placeholder="admin@example.com"
          />
        </div>

        <div>
          <label className="block font-bold text-primary mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="input-field"
            placeholder="1234567890"
          />
        </div>

        <div>
          <label className="block font-bold text-primary mb-2">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="6"
            className="input-field"
            placeholder="At least 6 characters"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !isAdmin}
          className="btn btn-danger w-full mt-6"
        >
          {loading ? 'Registering...' : 'Register as Admin'}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-gray-300 text-center">
        <p className="text-gray-600 mb-2">Not an admin?</p>
        <a
          href="/register"
          className="text-blue-600 font-bold hover:underline"
        >
          Register as Regular User
        </a>
      </div>

      <div className="mt-4 text-center">
        <p className="text-gray-600 mb-2">Already have an account?</p>
        <a
          href="/login"
          className="text-blue-600 font-bold hover:underline"
        >
          Login here
        </a>
      </div>
    </div>
  );
};

export default AdminRegister;
