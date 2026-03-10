import React, { useState, useEffect } from 'react';
import accountingService from '../services/accountingService';

const AccountMaintenance = () => {
  const [view, setView] = useState('accounts'); // accounts or all-ledger
  const [accounts, setAccounts] = useState([]);
  const [allLedger, setAllLedger] = useState([]);
  const [balanceSheet, setBalanceSheet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchAllAccounts();
    fetchBalanceSheet();
  }, []);

  const fetchAllAccounts = async () => {
    try {
      setLoading(true);
      const data = await accountingService.getAllAccounts();
      setAccounts(data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error loading accounts' });
    } finally {
      setLoading(false);
    }
  };

  const fetchBalanceSheet = async () => {
    try {
      const data = await accountingService.getBalanceSheet();
      setBalanceSheet(data);
    } catch (error) {
      console.error('Error fetching balance sheet:', error);
    }
  };

  const fetchAllLedger = async () => {
    try {
      setLoading(true);
      const data = await accountingService.getAllLedger();
      setAllLedger(data.entries || []);
      setView('all-ledger');
    } catch (error) {
      setMessage({ type: 'error', text: 'Error loading all products ledger' });
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'opening_stock':
        return '📦';
      case 'purchase':
        return '🛒';
      case 'sale':
        return '💳';
      case 'damage':
        return '⚠️';
      case 'adjustment':
        return '🔧';
      case 'return':
        return '↩️';
      default:
        return '📝';
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'opening_stock':
        return 'bg-blue-50';
      case 'purchase':
        return 'bg-orange-50';
      case 'sale':
        return 'bg-green-50';
      case 'damage':
        return 'bg-red-50';
      case 'adjustment':
        return 'bg-yellow-50';
      case 'return':
        return 'bg-purple-50';
      default:
        return 'bg-gray-50';
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-emerald-600 mb-2">📊 Accounts Maintenance</h1>
          <p className="text-gray-600">Product-wise ledger and accounting system</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg font-semibold ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Balance Sheet Summary */}
        {balanceSheet && view === 'accounts' && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-600">
              <p className="text-gray-600 text-sm font-semibold">Total Cost</p>
              <p className="text-3xl font-bold text-blue-600">₹{parseFloat(balanceSheet.totalCost).toFixed(2)}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-600">
              <p className="text-gray-600 text-sm font-semibold">Total Sales</p>
              <p className="text-3xl font-bold text-green-600">₹{parseFloat(balanceSheet.totalSaleValue).toFixed(2)}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-emerald-600">
              <p className="text-gray-600 text-sm font-semibold">Net Profit</p>
              <p className={`text-3xl font-bold ${parseFloat(balanceSheet.netProfit) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                ₹{parseFloat(balanceSheet.netProfit).toFixed(2)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-600">
              <p className="text-gray-600 text-sm font-semibold">Profit Margin</p>
              <p className="text-3xl font-bold text-purple-600">{balanceSheet.profitMargin}%</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-600">
              <p className="text-gray-600 text-sm font-semibold">Transactions</p>
              <p className="text-3xl font-bold text-yellow-600">{balanceSheet.totalTransactions}</p>
            </div>
          </div>
        )}

        {/* View Switcher */}
        {view === 'all-ledger' && (
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setView('accounts')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                view === 'accounts'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              📊 Back to Accounts
            </button>
          </div>
        )}

        {/* Accounts List View */}
        {view === 'accounts' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={fetchAllLedger}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
              >
                View All Products Ledger
              </button>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-emerald-600 to-green-600 text-white">
                  <th className="p-4 text-left font-bold">Product</th>
                  <th className="p-4 text-left font-bold">Category</th>
                  <th className="p-4 text-right font-bold">Opening</th>
                  <th className="p-4 text-right font-bold">Purchased</th>
                  <th className="p-4 text-right font-bold">Sold</th>
                  <th className="p-4 text-right font-bold">Closing</th>
                  <th className="p-4 text-right font-bold">Total Cost</th>
                  <th className="p-4 text-right font-bold">Total Sales</th>
                  <th className="p-4 text-right font-bold">Profit</th>
                  <th className="p-4 text-center font-bold">Ledger</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.productId} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-4 font-semibold">{account.productName}</td>
                    <td className="p-4 text-sm text-gray-600">{account.category}</td>
                    <td className="p-4 text-right font-semibold">{account.openingQuantity}</td>
                    <td className="p-4 text-right text-orange-600 font-semibold">+{account.totalPurchased}</td>
                    <td className="p-4 text-right text-red-600 font-semibold">-{account.totalSold}</td>
                    <td className="p-4 text-right bg-blue-50 font-bold text-blue-700">{account.closingQuantity}</td>
                    <td className="p-4 text-right">₹{account.totalCost.toFixed(2)}</td>
                    <td className="p-4 text-right text-green-600 font-semibold">₹{account.totalSaleValue.toFixed(2)}</td>
                    <td className={`p-4 text-right font-bold ${account.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{account.netProfit.toFixed(2)}
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-sm text-gray-600">Included in all ledger</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {accounts.length === 0 && (
              <div className="p-8 text-center text-gray-600">
                No accounts found. Add some transactions to get started.
              </div>
            )}
            </div>
          </div>
        )}

        {/* All Products Ledger View */}
        {view === 'all-ledger' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-800">📚 All Products Ledger</h3>
              <button
                onClick={fetchAllLedger}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Refresh
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-4 text-left font-bold text-gray-700">Date</th>
                    <th className="p-4 text-left font-bold text-gray-700">Product</th>
                    <th className="p-4 text-left font-bold text-gray-700">Category</th>
                    <th className="p-4 text-left font-bold text-gray-700">Type</th>
                    <th className="p-4 text-right font-bold text-gray-700">Qty</th>
                    <th className="p-4 text-right font-bold text-gray-700">Unit Price</th>
                    <th className="p-4 text-right font-bold text-gray-700">Amount</th>
                    <th className="p-4 text-left font-bold text-gray-700">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {allLedger.map((entry) => (
                    <tr key={entry._id} className={`border-b border-gray-200 ${getTransactionColor(entry.transactionType)}`}>
                      <td className="p-4 text-sm font-semibold">
                        {new Date(entry.transactionDate).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-sm font-semibold">{entry.productName}</td>
                      <td className="p-4 text-sm text-gray-600">{entry.productCategory}</td>
                      <td className="p-4">
                        <span className="text-xl">{getTransactionIcon(entry.transactionType)}</span>
                        <span className="text-sm font-semibold ml-2 capitalize">
                          {entry.transactionType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-right font-semibold">{entry.quantity}</td>
                      <td className="p-4 text-right">₹{entry.unitPrice.toFixed(2)}</td>
                      <td className="p-4 text-right font-bold">₹{entry.amount.toFixed(2)}</td>
                      <td className="p-4 text-sm text-gray-600">{entry.reference || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {allLedger.length === 0 && (
              <div className="p-8 text-center text-gray-600">
                No ledger entries found.
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default AccountMaintenance;
