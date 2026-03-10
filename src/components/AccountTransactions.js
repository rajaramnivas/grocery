import React, { useState, useEffect } from 'react';
import accountLedgerService from '../services/accountLedgerService';

const AccountTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [trialBalance, setTrialBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [view, setView] = useState('transactions'); // transactions or trial-balance
  const [filterAccount, setFilterAccount] = useState('');
  const [filterType, setFilterType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showNewEntryForm, setShowNewEntryForm] = useState(false);
  const [formData, setFormData] = useState({
    transactionType: 'expense',
    description: '',
    amount: '',
    account: 'expense',
    referenceNumber: '',
    notes: '',
  });

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const filters = {
        account: filterAccount,
        transactionType: filterType,
        startDate,
        endDate,
        limit: 100,
      };
      const response = await accountLedgerService.getAllEntries(filters);
      setTransactions(response.data.entries);
      setMessage(null);
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Error fetching transactions: ${error.response?.data?.message || error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTrialBalance = async () => {
    setLoading(true);
    try {
      const response = await accountLedgerService.getTrialBalance();
      setTrialBalance(response.data);
      setMessage(null);
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Error fetching trial balance: ${error.response?.data?.message || error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'transactions') {
      fetchTransactions();
    } else {
      fetchTrialBalance();
    }
  }, [view, filterAccount, filterType, startDate, endDate]);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    try {
      await accountLedgerService.createEntry({
        ...formData,
        amount: parseFloat(formData.amount),
      });
      setFormData({
        transactionType: 'expense',
        description: '',
        amount: '',
        account: 'expense',
        referenceNumber: '',
        notes: '',
      });
      setShowNewEntryForm(false);
      setMessage({ type: 'success', text: 'Transaction added successfully' });
      fetchTransactions();
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Error adding transaction: ${error.response?.data?.message || error.message}`,
      });
    }
  };

  const transactionTypes = ['sale', 'purchase', 'payment', 'refund', 'adjustment', 'expense'];
  const accountTypes = ['revenue', 'accounts_receivable', 'cash', 'inventory', 'expense'];

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Account Transactions</h2>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <button
            onClick={() => setView('transactions')}
            className={`px-4 py-2 rounded-lg transition ${
              view === 'transactions'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setView('trial-balance')}
            className={`px-4 py-2 rounded-lg transition ${
              view === 'trial-balance'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Trial Balance
          </button>
          {view === 'transactions' && (
            <button
              onClick={() => setShowNewEntryForm(!showNewEntryForm)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              + New Entry
            </button>
          )}
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'error'
              ? 'bg-red-50 text-red-800'
              : 'bg-green-50 text-green-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {view === 'transactions' ? (
        <>
          {showNewEntryForm && (
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Add New Transaction</h3>
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Transaction Type
                    </label>
                    <select
                      value={formData.transactionType}
                      onChange={(e) =>
                        setFormData({ ...formData, transactionType: e.target.value })
                      }
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {transactionTypes.map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Account
                    </label>
                    <select
                      value={formData.account}
                      onChange={(e) =>
                        setFormData({ ...formData, account: e.target.value })
                      }
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {accountTypes.map((account) => (
                        <option key={account} value={account}>
                          {account.charAt(0).toUpperCase() +
                            account.slice(1).replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                      required
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Reference Number
                    </label>
                    <input
                      type="text"
                      value={formData.referenceNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, referenceNumber: e.target.value })
                      }
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows="2"
                  ></textarea>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Add Transaction
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewEntryForm(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white p-4 rounded-lg shadow space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Filter by Account
                </label>
                <select
                  value={filterAccount}
                  onChange={(e) => setFilterAccount(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Accounts</option>
                  {accountTypes.map((account) => (
                    <option key={account} value={account}>
                      {account.charAt(0).toUpperCase() +
                        account.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Filter by Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Types</option>
                  {transactionTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto shadow rounded-lg">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Transaction ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Account
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Debit
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Credit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((txn) => (
                    <tr key={txn._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {txn.transactionId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {txn.description}
                        {txn.referenceNumber && (
                          <div className="text-xs text-gray-500">Ref: {txn.referenceNumber}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                        {txn.transactionType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                        {txn.account.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                        {txn.debit > 0 ? `$${txn.debit.toFixed(2)}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                        {txn.credit > 0 ? `$${txn.credit.toFixed(2)}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(txn.transactionDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading trial balance...</p>
            </div>
          ) : trialBalance ? (
            <div className="space-y-4">
              <div className="overflow-x-auto shadow rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Account
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Debit
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Credit
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {trialBalance.accounts.map((acc) => (
                      <tr key={acc.account} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 capitalize">
                          {acc.account.replace('_', ' ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          ${acc.debit.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          ${acc.credit.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                          ${acc.balance.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Total Balance</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Debit</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${trialBalance.total.debit.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Credit</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${trialBalance.total.credit.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Difference</p>
                    <p
                      className={`text-2xl font-bold ${
                        trialBalance.total.difference === 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      ${trialBalance.total.difference.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

export default AccountTransactions;
