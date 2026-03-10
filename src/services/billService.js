import api from './api';

const billService = {
  // Generate bill for an order
  generateBill: (orderId, notes = '') => {
    return api.post(`/bills/generate/${orderId}`, { notes });
  },

  // Get all bills
  getAllBills: () => {
    return api.get('/bills');
  },

  // Get single bill
  getBill: (billId) => {
    return api.get(`/bills/${billId}`);
  },

  // Get bills for customer
  getCustomerBills: (userId) => {
    return api.get(`/bills/customer/${userId}`);
  },

  // Update bill status
  updateBillStatus: (billId, status) => {
    return api.put(`/bills/${billId}/status`, { status });
  },

  // Download bill
  downloadBill: (billId) => {
    return api.get(`/bills/download/${billId}`, {
      responseType: 'blob',
    });
  },
};

export default billService;
