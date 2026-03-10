import React, { createContext, useContext, useState } from 'react';
import { cartService } from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const getCart = async () => {
    setLoading(true);
    try {
      const response = await cartService.getCart();
      setCart(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity) => {
    try {
      const response = await cartService.addToCart(productId, quantity);
      setCart(response.data);
      return response.data;
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await cartService.removeFromCart(productId);
      setCart(response.data);
      return response.data;
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
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
