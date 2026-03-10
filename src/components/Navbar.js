import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import MaterialIcon from './MaterialIcon';

const Navbar = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="app-navbar text-white p-4 d-flex justify-between align-center flex-wrap gap-4">
      <div 
        className="text-xl font-bold align-center gap-2 app-navbar-brand"
        style={{ cursor: 'pointer', display: 'flex' }}
        onClick={() => navigate('/')}
      >
        <MaterialIcon name="local_grocery_store" size={28} /> Grocery Store
      </div>

      <div className="d-flex gap-4 align-center flex-wrap">
        <button
          onClick={() => navigate('/products')}
          className="text-white text-sm font-medium d-flex align-center gap-1 app-navbar-link"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Products
        </button>

        <button
          onClick={() => navigate('/shopping-lists')}
          className="text-white text-sm font-medium d-flex align-center gap-1 app-navbar-link"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <MaterialIcon name="list_alt" size={18} /> Shopping Lists
        </button>

        <button
          onClick={() => navigate('/wishlist')}
          className="text-white text-sm font-medium d-flex align-center gap-1 app-navbar-link"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <MaterialIcon name="favorite" size={18} /> Wishlist
        </button>

        {token ? (
          <>
            {user?.role === 'admin' && (
              <>
                <span className="text-secondary font-bold text-xs p-2 rounded-md" style={{ backgroundColor: '#ca8a04' }}>👑 ADMIN</span>
                <button
                  onClick={() => navigate('/admin-dashboard')}
                  className="text-secondary font-bold text-sm d-flex align-center gap-1 app-navbar-link"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <MaterialIcon name="dashboard" size={18} /> Dashboard
                </button>
              </>
            )}
            {user?.role === 'user' && (
              <>
                <button
                  onClick={() => navigate('/cart')}
                  className="text-white text-sm font-medium d-flex align-center gap-1"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <MaterialIcon name="shopping_cart" size={18} /> Cart
                </button>
                <button
                  onClick={() => navigate('/orders')}
                  className="text-white text-sm font-medium app-navbar-link"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Orders
                </button>
              </>
            )}
            <span className="text-xs">Welcome, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="btn btn-danger text-xs d-flex align-center gap-1"
            >
              <MaterialIcon name="logout" size={18} /> Logout
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate('/login')}
              className="btn text-xs d-flex align-center gap-1"
              style={{ backgroundColor: 'rgba(15,23,42,0.15)', color: '#e5e7eb', borderColor: 'rgba(148,163,184,0.8)' }}
            >
              <MaterialIcon name="login" size={18} /> Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="btn btn-primary text-xs"
            >
              Register
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
