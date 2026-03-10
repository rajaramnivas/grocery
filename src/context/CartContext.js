import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const getCart = async (token) => {
    setLoading(true);
    try {
      const response = await fetch('/api/cart', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      setCart(data);
      return data;
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity, token) => {
    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity }),
      });
      const data = await response.json();
      setCart(data);
      return data;
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = async (productId, token) => {
    try {
      const response = await fetch(`/api/cart/remove/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      setCart(data);
      return data;
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const clearCart = async (token) => {
    try {
      await fetch('/api/cart/clear', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setCart(null);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const fetchCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    return await getCart(token);
  };

  return (
    <CartContext.Provider value={{ cart, loading, getCart, addToCart, removeFromCart, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
