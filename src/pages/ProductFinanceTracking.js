import React, { useState, useEffect, useCallback } from 'react';
import financeService from '../services/financeService';
import { productService } from '../services/api';
import ProfitTrendChart from '../components/ProfitTrendChart';
import TopPerformersChart from '../components/TopPerformersChart';
import CategoryBreakdownChart from '../components/CategoryBreakdownChart';
import AlertSystem from '../components/AlertSystem';
import AdvancedFilters from '../components/AdvancedFilters';
import BulkOperations from '../components/BulkOperations';
import DetailedMetrics from '../components/DetailedMetrics';
import StockHistory from '../components/StockHistory';
import SupplierManagement from '../components/SupplierManagement';
import Forecasting from '../components/Forecasting';

const getDaysUntilExpiry = (expiryDate) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const applyAdvancedFilters = (financesData, filters) => {
  if (!filters) return financesData;

  let result = financesData;

  // Text search
  if (filters.searchText) {
    const searchLower = filters.searchText.toLowerCase();
    result = result.filter(f =>
      f.productId.name.toLowerCase().includes(searchLower) ||
      (f.productId.sku && f.productId.sku.toLowerCase().includes(searchLower))
    );
  }

  // Category filter
  if (filters.category) {
    result = result.filter(f => f.productId.category === filters.category);
  }

  // Status filter
  if (filters.statusFilter) {
    result = result.filter(f => {
      const daysToExpiry = getDaysUntilExpiry(f.expiryDate);
      const stockRemaining = f.quantity - (f.quantitySold || 0);

      switch (filters.statusFilter) {
        case 'active':
          return daysToExpiry > 7 && stockRemaining > 0;
        case 'about_to_expire':
          return daysToExpiry > 0 && daysToExpiry <= 7;
        case 'expired':
          return daysToExpiry < 0;
        case 'out_of_stock':
          return stockRemaining <= 0;
        case 'low_stock':
          return stockRemaining > 0 && stockRemaining <= Math.ceil(f.quantity * 0.1);
        default:
          return true;
      }
    });
  }

  // Profit range
  if (filters.profitMin || filters.profitMax) {
    result = result.filter(f => {
      const totalProfit = (f.sellingPrice - f.costPrice) * (f.quantitySold || 0);
      const minOk = !filters.profitMin || totalProfit >= parseFloat(filters.profitMin);
      const maxOk = !filters.profitMax || totalProfit <= parseFloat(filters.profitMax);
      return minOk && maxOk;
    });
  }

  // Expiry days range
  if (filters.expiryDaysMin || filters.expiryDaysMax) {
    result = result.filter(f => {
      const days = getDaysUntilExpiry(f.expiryDate);
      const minOk = !filters.expiryDaysMin || days >= parseFloat(filters.expiryDaysMin);
      const maxOk = !filters.expiryDaysMax || days <= parseFloat(filters.expiryDaysMax);
      return minOk && maxOk;
    });
  }

  // Stock level range
  if (filters.stockLevelMin || filters.stockLevelMax) {
    result = result.filter(f => {
      const stockRemaining = f.quantity - (f.quantitySold || 0);
      const minOk = !filters.stockLevelMin || stockRemaining >= parseFloat(filters.stockLevelMin);
      const maxOk = !filters.stockLevelMax || stockRemaining <= parseFloat(filters.stockLevelMax);
      return minOk && maxOk;
    });
  }

  // Sorting
  if (filters.sortBy) {
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return new Date(b.buyingDate) - new Date(a.buyingDate);
        case 'oldest':
          return new Date(a.buyingDate) - new Date(b.buyingDate);
        case 'profit_high':
          return ((b.sellingPrice - b.costPrice) * (b.quantitySold || 0)) - ((a.sellingPrice - a.costPrice) * (a.quantitySold || 0));
        case 'profit_low':
          return ((a.sellingPrice - a.costPrice) * (a.quantitySold || 0)) - ((b.sellingPrice - b.costPrice) * (b.quantitySold || 0));
        case 'expiry_soon':
          return getDaysUntilExpiry(a.expiryDate) - getDaysUntilExpiry(b.expiryDate);
        case 'stock_high':
          return (b.quantity - (b.quantitySold || 0)) - (a.quantity - (a.quantitySold || 0));
        case 'stock_low':
          return (a.quantity - (a.quantitySold || 0)) - (b.quantity - (b.quantitySold || 0));
        default:
          return 0;
      }
    });
  }

  return result;
};

const ProductFinanceTracking = () => {
  const [finances, setFinances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingFinance, setEditingFinance] = useState(null);
  const [summary, setSummary] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showCharts, setShowCharts] = useState(true);
  const [advancedFilters, setAdvancedFilters] = useState(null);
  const [filteredFinances, setFilteredFinances] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showStockHistory, setShowStockHistory] = useState(false);

  const [financeForm, setFinanceForm] = useState({
    productId: '',
    costPrice: '',
    sellingPrice: '',
    buyingDate: '',
    expiryDate: '',
    quantity: '',
    supplier: '',
    batchNumber: '',
    notes: '',
  });

  const [products, setProducts] = useState([]);

  const fetchFinances = useCallback(async () => {
    try {
      setLoading(true);
      const data = await financeService.getProductFinances(filterStatus, sortBy);
      setFinances(data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error loading product finances' });
    } finally {
      setLoading(false);
    }
  }, [filterStatus, sortBy]);

  const fetchSummary = useCallback(async () => {
    try {
      const data = await financeService.getFinancialSummary();
      setSummary(data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await productService.getProducts();
      const data = response.data;
      setProducts(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }, []);

  useEffect(() => {
    fetchFinances();
    fetchSummary();
    fetchProducts();
  }, [fetchFinances, fetchSummary, fetchProducts]);

  const handleAddFinance = () => {
    setEditingFinance(null);
    setFinanceForm({
      productId: '',
      costPrice: '',
      sellingPrice: '',
      buyingDate: '',
      expiryDate: '',
      quantity: '',
      supplier: '',
      batchNumber: '',
      notes: '',
    });
    setShowModal(true);
  };

  const handleEditFinance = (finance) => {
    setEditingFinance(finance);
    setFinanceForm({
      productId: finance.productId._id,
      costPrice: finance.costPrice,
      sellingPrice: finance.sellingPrice,
      buyingDate: finance.buyingDate.split('T')[0],
      expiryDate: finance.expiryDate.split('T')[0],
      quantity: finance.quantity,
      supplier: finance.supplier || '',
      batchNumber: finance.batchNumber || '',
      notes: finance.notes || '',
    });
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFinanceForm({
      ...financeForm,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFinance) {
        await financeService.updateProductFinance(editingFinance._id, financeForm);
        setMessage({ type: 'success', text: 'Product finance record updated successfully' });
      } else {
        await financeService.createProductFinance(financeForm);
        setMessage({ type: 'success', text: 'Product finance record created successfully' });
      }
      setShowModal(false);
      fetchFinances();
      fetchSummary();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error saving product finance record' });
    }
  };

  const handleUpdateQuantitySold = async (id, newQuantity) => {
    try {
      const newQty = prompt('Enter quantity sold:', newQuantity);
      if (newQty !== null) {
        await financeService.updateQuantitySold(id, parseInt(newQty));
        setMessage({ type: 'success', text: 'Quantity sold updated successfully' });
        fetchFinances();
        fetchSummary();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error updating quantity sold' });
    }
  };

  const handleDeleteFinance = async (id, productName) => {
    if (window.confirm(`Are you sure you want to delete the finance record for "${productName}"?`)) {
      try {
        await financeService.deleteProductFinance(id);
        setMessage({ type: 'success', text: 'Product finance record deleted successfully' });
        fetchFinances();
        fetchSummary();
      } catch (error) {
        setMessage({ type: 'error', text: 'Error deleting product finance record' });
      }
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredFinances.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredFinances.map(f => f._id));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expiring':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'out_of_stock':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  useEffect(() => {
    const filtered = applyAdvancedFilters(finances, advancedFilters);
    setFilteredFinances(filtered);
  }, [finances, advancedFilters]);

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-green-600">💰 Product Financial Tracking</h1>
          <button
            onClick={handleAddFinance}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            + Add Finance Record
          </button>
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

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-600">
              <p className="text-gray-600 text-sm font-semibold">Total Profit</p>
              <p className="text-3xl font-bold text-green-600">₹{summary.totalProfit.toFixed(2)}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-600">
              <p className="text-gray-600 text-sm font-semibold">Total Cost</p>
              <p className="text-3xl font-bold text-blue-600">₹{summary.totalCost.toFixed(2)}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-600">
              <p className="text-gray-600 text-sm font-semibold">Avg Profit Margin</p>
              <p className="text-3xl font-bold text-purple-600">{summary.averageProfitMargin}%</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-600">
              <p className="text-gray-600 text-sm font-semibold">Expiring Soon</p>
              <p className="text-3xl font-bold text-yellow-600">{summary.expiringProducts}</p>
            </div>
          </div>
        )}

        {/* Alert System */}
        {finances.length > 0 && <AlertSystem finances={finances} />}

        {/* Detailed Metrics */}
        {finances.length > 0 && <DetailedMetrics finances={finances} />}

        {/* Advanced Filters */}
        <AdvancedFilters onChange={setAdvancedFilters} products={products} />

        {/* Filters (Backward compatibility) */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Status (Legacy)</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By (Legacy)</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                >
                  <option value="newest">Newest First</option>
                  <option value="profit">Highest Profit</option>
                  <option value="expiry">Expiry Date</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => setShowCharts(!showCharts)}
              className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              {showCharts ? '📊 Hide Charts' : '📊 Show Charts'}
            </button>
          </div>
        </div>

        {/* Charts Section */}
        {showCharts && filteredFinances.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📈 Financial Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <ProfitTrendChart finances={filteredFinances} />
              <CategoryBreakdownChart finances={filteredFinances} />
            </div>
            <div className="mb-6">
              <TopPerformersChart finances={filteredFinances} />
            </div>
          </div>
        )}

        {/* Stock History Section */}
        {finances.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setShowStockHistory(!showStockHistory)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold mb-4"
            >
              {showStockHistory ? '▼ Hide Stock History' : '▶ Show Stock History'}
            </button>
            {showStockHistory && <StockHistory finances={finances} />}
          </div>
        )}

        {/* Supplier Management Section */}
        {finances.length > 0 && <SupplierManagement finances={finances} />}

        {/* Forecasting & Reorder Recommendations */}
        {finances.length > 0 && <Forecasting finances={finances} />}

        {/* Table */}
        {loading ? (
          <p className="text-gray-600 text-center py-8">Loading product finances...</p>
        ) : filteredFinances.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No product finance records found</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow-md">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                  <th className="p-4 text-left font-bold">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === filteredFinances.length && filteredFinances.length > 0}
                      onChange={handleSelectAll}
                      className="w-5 h-5 cursor-pointer"
                    />
                  </th>
                  <th className="p-4 text-left font-bold">Product</th>
                  <th className="p-4 text-left font-bold">Cost Price</th>
                  <th className="p-4 text-left font-bold">Selling Price</th>
                  <th className="p-4 text-left font-bold">Profit/Unit</th>
                  <th className="p-4 text-left font-bold">Qty Purchased</th>
                  <th className="p-4 text-left font-bold">Qty Sold</th>
                  <th className="p-4 text-left font-bold">Total Profit</th>
                  <th className="p-4 text-left font-bold">Expiry Date</th>
                  <th className="p-4 text-left font-bold">Status</th>
                  <th className="p-4 text-left font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFinances.map((finance) => {
                  const daysUntilExpiry = getDaysUntilExpiry(finance.expiryDate);
                  return (
                    <tr key={finance._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(finance._id)}
                          onChange={() => handleSelectProduct(finance._id)}
                          className="w-5 h-5 cursor-pointer"
                        />
                      </td>
                      <td className="p-4 font-semibold">{finance.productId.name}</td>
                      <td className="p-4">₹{finance.costPrice.toFixed(2)}</td>
                      <td className="p-4">₹{finance.sellingPrice.toFixed(2)}</td>
                      <td className="p-4 font-bold text-green-600">₹{finance.profitPerUnit.toFixed(2)}</td>
                      <td className="p-4">{finance.quantity}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleUpdateQuantitySold(finance._id, finance.quantitySold)}
                          className="text-blue-600 hover:underline font-semibold"
                        >
                          {finance.quantitySold}
                        </button>
                      </td>
                      <td className="p-4 font-bold text-green-700">₹{finance.totalProfit.toFixed(2)}</td>
                      <td className="p-4">
                        <div className="text-sm">
                          <p>{new Date(finance.expiryDate).toLocaleDateString()}</p>
                          <p className={`text-xs font-semibold ${daysUntilExpiry < 0 ? 'text-red-600' : daysUntilExpiry < 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {daysUntilExpiry < 0 ? 'EXPIRED' : daysUntilExpiry === 0 ? 'TODAY' : daysUntilExpiry < 1 ? 'TOMORROW' : `${daysUntilExpiry} days`}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(finance.status)}`}>
                          {finance.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditFinance(finance)}
                            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteFinance(finance._id, finance.productId.name)}
                            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-screen overflow-y-auto">
              <h2 className="text-2xl font-bold text-primary mb-6">
                {editingFinance ? 'Edit Finance Record' : 'Add Finance Record'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Product Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Product *</label>
                  <select
                    name="productId"
                    value={financeForm.productId}
                    onChange={handleFormChange}
                    required
                    disabled={editingFinance !== null}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select a product</option>
                    {products.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cost Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cost Price (₹) *</label>
                  <input
                    type="number"
                    name="costPrice"
                    value={financeForm.costPrice}
                    onChange={handleFormChange}
                    step="0.01"
                    min="0"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Selling Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Selling Price (₹) *</label>
                  <input
                    type="number"
                    name="sellingPrice"
                    value={financeForm.sellingPrice}
                    onChange={handleFormChange}
                    step="0.01"
                    min="0"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Buying Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Buying Date *</label>
                  <input
                    type="date"
                    name="buyingDate"
                    value={financeForm.buyingDate}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry Date *</label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={financeForm.expiryDate}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity Purchased *</label>
                  <input
                    type="number"
                    name="quantity"
                    value={financeForm.quantity}
                    onChange={handleFormChange}
                    min="1"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Supplier */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Supplier</label>
                  <input
                    type="text"
                    name="supplier"
                    value={financeForm.supplier}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Batch Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Batch Number</label>
                  <input
                    type="text"
                    name="batchNumber"
                    value={financeForm.batchNumber}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                  <textarea
                    name="notes"
                    value={financeForm.notes}
                    onChange={handleFormChange}
                    rows="3"
                    maxLength="500"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-4 mt-6">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    {editingFinance ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bulk Operations Floating Button */}
        {selectedProducts.length > 0 && (
          <BulkOperations
            selectedProducts={selectedProducts}
            finances={filteredFinances}
            onBulkUpdate={() => {
              fetchFinances();
              setSelectedProducts([]);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ProductFinanceTracking;
