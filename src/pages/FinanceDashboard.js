import React, { useState, useEffect } from 'react';
import financeService from '../services/financeService';

/**
 * Finance Dashboard Component
 * Displays financial overview, summary, and transactions for admin
 */
const FinanceDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('all');
  const [customDates, setCustomDates] = useState({ startDate: '', endDate: '' });
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    category: 'Others',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchFinancialData();
  }, [dateFilter, customDates]);

  const fetchFinancialData = async () => {
    setLoading(true);
    try {
      const filters = getDateFilters();
      
      // Fetch summary and transactions in parallel
      const [summaryRes, transactionsRes] = await Promise.all([
        financeService.getFinancialSummary(filters),
        financeService.getTransactions(filters),
      ]);

      setSummary(summaryRes.data.summary);
      setExpenseBreakdown(summaryRes.data.expenseBreakdown || []);
      setTransactions(transactionsRes.data.transactions || []);
    } catch (error) {
      console.error('Error fetching financial data:', error);
      setMessage({ type: 'error', text: 'Failed to load financial data' });
    } finally {
      setLoading(false);
    }
  };

  const getDateFilters = () => {
    const now = new Date();
    const filters = {};

    switch (dateFilter) {
      case 'today':
        filters.startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
        filters.endDate = new Date(now.setHours(23, 59, 59, 999)).toISOString();
        break;
      case 'week':
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        filters.startDate = weekAgo.toISOString();
        break;
      case 'month':
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        filters.startDate = monthAgo.toISOString();
        break;
      case 'custom':
        if (customDates.startDate) filters.startDate = new Date(customDates.startDate).toISOString();
        if (customDates.endDate) filters.endDate = new Date(customDates.endDate).toISOString();
        break;
      default:
        // 'all' - no date filters
        break;
    }

    return filters;
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();

    if (!expenseForm.amount || parseFloat(expenseForm.amount) <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }

    try {
      await financeService.addExpense({
        category: expenseForm.category,
        amount: parseFloat(expenseForm.amount),
        description: expenseForm.description,
        date: expenseForm.date,
      });

      setMessage({ type: 'success', text: 'Expense added successfully!' });
      setShowAddExpense(false);
      setExpenseForm({
        category: 'Others',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
      fetchFinancialData();

      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to add expense' 
      });
    }
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-center text-lg text-gray-600">Loading financial data...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-primary">Finance Dashboard</h2>
        <button
          onClick={() => setShowAddExpense(!showAddExpense)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          {showAddExpense ? 'Cancel' : '+ Add Expense'}
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mb-4 p-4 rounded-lg font-semibold ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-300' 
            : 'bg-red-100 text-red-800 border border-red-300'
        }`}>
          {message.text}
        </div>
      )}

      {/* Add Expense Form */}
      {showAddExpense && (
        <div className="mb-6 p-6 bg-white rounded-lg border-2 border-blue-300">
          <h3 className="text-xl font-bold text-primary mb-4">Add Expense</h3>
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="Inventory">Inventory</option>
                  <option value="Salary">Salary</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Transport">Transport</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Others">Others</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  className="input-field"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="input-field"
                  placeholder="Optional description"
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Add Expense
            </button>
          </form>
        </div>
      )}

      {/* Date Filter */}
      <div className="mb-6 p-4 bg-white rounded-lg border border-gray-300">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Time Period
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          {dateFilter === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customDates.startDate}
                  onChange={(e) => setCustomDates({ ...customDates, startDate: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={customDates.endDate}
                  onChange={(e) => setCustomDates({ ...customDates, endDate: e.target.value })}
                  className="input-field"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="card bg-green-50 border-2 border-green-300">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-green-700">
            {formatCurrency(summary?.totalIncome || 0)}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            {summary?.incomeTransactions || 0} transactions
          </p>
        </div>

        <div className="card bg-red-50 border-2 border-red-300">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Expenses</h3>
          <p className="text-3xl font-bold text-red-700">
            {formatCurrency(summary?.totalExpenses || 0)}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            {summary?.expenseTransactions || 0} transactions
          </p>
        </div>

        <div className={`card border-2 ${
          (summary?.netProfit || 0) >= 0 
            ? 'bg-blue-50 border-blue-300' 
            : 'bg-orange-50 border-orange-300'
        }`}>
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Net Profit</h3>
          <p className={`text-3xl font-bold ${
            (summary?.netProfit || 0) >= 0 ? 'text-blue-700' : 'text-orange-700'
          }`}>
            {formatCurrency(summary?.netProfit || 0)}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            {((summary?.netProfit || 0) / (summary?.totalIncome || 1) * 100).toFixed(1)}% margin
          </p>
        </div>

        <div className="card bg-purple-50 border-2 border-purple-300">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Orders</h3>
          <p className="text-3xl font-bold text-purple-700">
            {summary?.totalOrders || 0}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Avg: {formatCurrency((summary?.totalIncome || 0) / (summary?.totalOrders || 1))}
          </p>
        </div>
      </div>

      {/* Expense Breakdown */}
      {expenseBreakdown.length > 0 && (
        <div className="mb-6 p-6 bg-white rounded-lg border border-gray-300">
          <h3 className="text-xl font-bold text-primary mb-4">Expense Breakdown by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {expenseBreakdown.map((item) => (
              <div key={item._id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-semibold text-gray-600">{item._id}</p>
                <p className="text-lg font-bold text-primary">{formatCurrency(item.total)}</p>
                <p className="text-xs text-gray-500">{item.count} transactions</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg border border-gray-300 p-6">
        <h3 className="text-xl font-bold text-primary mb-4">
          Recent Transactions ({transactions.length})
        </h3>
        {transactions.length === 0 ? (
          <p className="text-center text-gray-600 py-8">No transactions found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category/Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.transactionType === 'income' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.transactionType.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {transaction.transactionType === 'income' 
                        ? transaction.orderId?.orderId || 'N/A'
                        : transaction.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {transaction.description || '-'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${
                      transaction.transactionType === 'income' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {transaction.transactionType === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinanceDashboard;
