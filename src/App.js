import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import ProductListing from './components/ProductListing';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import ShoppingLists from './pages/ShoppingLists';
import Wishlist from './pages/Wishlist';
import Policies from './pages/Policies';
import AboutUs from './pages/AboutUs';
import ProductFinanceTracking from './pages/ProductFinanceTracking';


import PaymentComplete from './pages/PaymentComplete';


function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/product-finance-tracking" element={<ProductFinanceTracking />} />
            <Route path="/products" element={<ProductListing />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/payment-complete" element={<PaymentComplete />} />
            <Route path="/shopping-lists" element={<ShoppingLists />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/policies" element={<Policies />} />
            <Route path="/about" element={<AboutUs />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
