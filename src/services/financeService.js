import axios from 'axios';

const API_URL = 'http://localhost:5000/api/admin';

// Get all product financial records
const getProductFinances = async (status = null, sortBy = 'newest') => {
  try {
    let url = `${API_URL}/finances?sortBy=${sortBy}`;
    if (status) {
      url += `&status=${status}`;
    }
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get single product finance record
const getProductFinance = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/finances/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create new product finance record
const createProductFinance = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/finances`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update product finance record
const updateProductFinance = async (id, data) => {
  try {
    const response = await axios.put(`${API_URL}/finances/${id}`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update quantity sold
const updateQuantitySold = async (id, quantitySold) => {
  try {
    const response = await axios.patch(`${API_URL}/finances/${id}/sold`, { quantitySold }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete product finance record
const deleteProductFinance = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/finances/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get financial summary
const getFinancialSummary = async () => {
  try {
    const response = await axios.get(`${API_URL}/finances/summary/stats`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const financeService = {
  getProductFinances,
  getProductFinance,
  createProductFinance,
  updateProductFinance,
  updateQuantitySold,
  deleteProductFinance,
  getFinancialSummary,
};

export default financeService;
