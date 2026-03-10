import axios from 'axios';

const API_URL = 'http://localhost:5000/api/admin';

// Get all accounts summary
const getAllAccounts = async () => {
  try {
    const response = await axios.get(`${API_URL}/accounts`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get product accounting statement (ledger)
const getProductLedger = async (productId) => {
  try {
    const response = await axios.get(`${API_URL}/accounts/${productId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add transaction to product ledger
const addTransaction = async (productId, transactionData) => {
  try {
    const response = await axios.post(`${API_URL}/accounts/${productId}/transaction`, transactionData, {
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

// Get ledger history with filters
const getLedgerHistory = async (productId, filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.transactionType) params.append('transactionType', filters.transactionType);
    
    const response = await axios.get(
      `${API_URL}/accounts/${productId}/history?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get ledger entries across all products
const getAllLedger = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.transactionType) params.append('transactionType', filters.transactionType);
    if (filters.productId) params.append('productId', filters.productId);

    const response = await axios.get(`${API_URL}/accounts/ledger/all?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update ledger entry
const updateLedgerEntry = async (entryId, updateData) => {
  try {
    const response = await axios.put(`${API_URL}/accounts/entry/${entryId}`, updateData, {
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

// Delete ledger entry
const deleteLedgerEntry = async (entryId) => {
  try {
    const response = await axios.delete(`${API_URL}/accounts/entry/${entryId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get balance sheet/accounting summary
const getBalanceSheet = async () => {
  try {
    const response = await axios.get(`${API_URL}/accounts/summary/balance-sheet`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const accountingService = {
  getAllAccounts,
  getProductLedger,
  addTransaction,
  getLedgerHistory,
  getAllLedger,
  updateLedgerEntry,
  deleteLedgerEntry,
  getBalanceSheet,
};

export default accountingService;
