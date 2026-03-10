import api from './api';

const accountLedgerService = {
  // Create ledger entry
  createEntry: (data) => {
    return api.post('/account-ledger', data);
  },

  // Get all ledger entries with filters
  getAllEntries: (filters) => {
    return api.get('/account-ledger', { params: filters });
  },

  // Get entries for specific account
  getAccountEntries: (account, startDate = '', endDate = '') => {
    return api.get(`/account-ledger/account/${account}`, {
      params: { startDate, endDate },
    });
  },

  // Get single entry
  getEntry: (entryId) => {
    return api.get(`/account-ledger/${entryId}`);
  },

  // Update entry status
  updateEntry: (entryId, data) => {
    return api.put(`/account-ledger/${entryId}`, data);
  },

  // Get trial balance
  getTrialBalance: () => {
    return api.get('/account-ledger/summary/trial-balance');
  },

  // Get account summary
  getAccountSummary: (account) => {
    return api.get(`/account-ledger/summary/${account}`);
  },
};

export default accountLedgerService;
