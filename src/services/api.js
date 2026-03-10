import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (email, password) =>
    axiosInstance.post('/auth/login', { email, password }),
  register: (name, email, password, phone) =>
    axiosInstance.post('/auth/register', { name, email, password, phone }),
  registerAdmin: (name, email, password, phone) =>
    axiosInstance.post('/auth/register-admin', { name, email, password, phone }),
  getCurrentUser: () =>
    axiosInstance.get('/auth/me'),
};

export const productService = {
  getProducts: (category = '', search = '', sortBy = '') =>
    axiosInstance.get('/products', {
      params: { category, search, sortBy },
    }),
  getProductById: (id) =>
    axiosInstance.get(`/products/${id}`),
  getDailyDeals: () =>
    axiosInstance.get('/products/deals/today'),
};

export const cartService = {
  getCart: () =>
    axiosInstance.get('/cart'),
  addToCart: (productId, quantity) =>
    axiosInstance.post('/cart/add', { productId, quantity }),
  removeFromCart: (productId) =>
    axiosInstance.delete(`/cart/remove/${productId}`),
  clearCart: () =>
    axiosInstance.delete('/cart/clear'),
};

export const orderService = {
  createOrder: (shippingAddress, paymentMethod, notes) =>
    axiosInstance.post('/orders/create', { shippingAddress, paymentMethod, notes }),
  getUserOrders: () =>
    axiosInstance.get('/orders'),
  getOrderById: (id) =>
    axiosInstance.get(`/orders/${id}`),
  reorder: (orderId) =>
    axiosInstance.post(`/orders/reorder/${orderId}`),
  cancelOrder: (orderId) =>
    axiosInstance.post(`/orders/cancel/${orderId}`),
  getReminders: () =>
    axiosInstance.get('/orders/reminders/check'),
  submitFeedback: (orderId, rating, comment) =>
    axiosInstance.post(`/orders/${orderId}/feedback`, { rating, comment }),
  submitProductFeedback: (orderId, productId, rating, comment) =>
    axiosInstance.post(`/orders/${orderId}/product-feedback/${productId}`, { rating, comment }),
};

export const paymentService = {
  createRazorpayOrder: (orderId) =>
    axiosInstance.post('/payments/razorpay/create-order', { orderId }),
  verifyRazorpayPayment: (payload) =>
    axiosInstance.post('/payments/razorpay/verify', payload),
};

export const adminService = {
  // Product management
  createProduct: (productData) =>
    axiosInstance.post('/admin/products', productData),
  updateProduct: (id, productData) =>
    axiosInstance.put(`/admin/products/${id}`, productData),
  updateInventory: (id, stock) =>
    axiosInstance.patch(`/admin/products/${id}/inventory`, { stock }),
  deleteProduct: (id) =>
    axiosInstance.delete(`/admin/products/${id}`),
  toggleOrganic: (id) =>
    axiosInstance.patch(`/admin/products/${id}/organic`),
  toggleLocal: (id) =>
    axiosInstance.patch(`/admin/products/${id}/local`),
  toggleFresh: (id) =>
    axiosInstance.patch(`/admin/products/${id}/fresh`),
  
  // Daily deals management
  setDailyDeal: (productId) =>
    axiosInstance.post(`/admin/daily-deals/${productId}`),
  getDailyDeals: () =>
    axiosInstance.get('/admin/daily-deals'),
  
  // Order management
  getAllOrders: () =>
    axiosInstance.get('/admin/orders'),
  getOrderDetails: (id) =>
    axiosInstance.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, status, paymentStatus, trackingNumber, adminNotes) =>
    axiosInstance.put(`/admin/orders/${id}`, { status, paymentStatus, trackingNumber, adminNotes }),
  
  // User management
  getUsers: () =>
    axiosInstance.get('/admin/users'),
};

export const shoppingListService = {
  getAllLists: () =>
    axiosInstance.get('/shopping-lists'),
  getListById: (listId) =>
    axiosInstance.get(`/shopping-lists/${listId}`),
  addListToCart: (listId, selectedProducts = []) =>
    axiosInstance.post(`/shopping-lists/${listId}/add-to-cart`, { selectedProducts }),
};

export const adminShoppingListService = {
  getAllLists: () =>
    axiosInstance.get('/admin/shopping-lists'),
  getListById: (id) =>
    axiosInstance.get(`/admin/shopping-lists/${id}`),
  createList: (listData) =>
    axiosInstance.post('/admin/shopping-lists', listData),
  updateList: (id, listData) =>
    axiosInstance.put(`/admin/shopping-lists/${id}`, listData),
  deleteList: (id) =>
    axiosInstance.delete(`/admin/shopping-lists/${id}`),
  addProduct: (id, productId) =>
    axiosInstance.post(`/admin/shopping-lists/${id}/products/${productId}`),
  removeProduct: (id, productId) =>
    axiosInstance.delete(`/admin/shopping-lists/${id}/products/${productId}`),
  toggleActive: (id) =>
    axiosInstance.patch(`/admin/shopping-lists/${id}/toggle-active`),
};

export const wishlistService = {
  getWishlist: () =>
    axiosInstance.get('/wishlist'),
  addToWishlist: (productId) =>
    axiosInstance.post(`/wishlist/add/${productId}`),
  removeFromWishlist: (productId) =>
    axiosInstance.delete(`/wishlist/remove/${productId}`),
  checkInWishlist: (productId) =>
    axiosInstance.get(`/wishlist/check/${productId}`),
  clearWishlist: () =>
    axiosInstance.delete('/wishlist/clear'),
};

export default axiosInstance;
