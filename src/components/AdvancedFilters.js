import React, { useState } from 'react';

const AdvancedFilters = ({ onChange, products }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    searchText: '',
    category: '',
    statusFilter: '',
    profitMin: '',
    profitMax: '',
    expiryDaysMin: '',
    expiryDaysMax: '',
    stockLevelMin: '',
    stockLevelMax: '',
    selectedProducts: [],
    sortBy: 'newest'
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      searchText: '',
      category: '',
      statusFilter: '',
      profitMin: '',
      profitMax: '',
      expiryDaysMin: '',
      expiryDaysMax: '',
      stockLevelMin: '',
      stockLevelMax: '',
      selectedProducts: [],
      sortBy: 'newest'
    };
    setFilters(resetFilters);
    onChange(resetFilters);
  };

  const categories = [
    'Rice & Grains',
    'Flours',
    'Pulses & Dals',
    'Spices & Masalas',
    'Cooking Essentials',
    'Dairy Products',
    'Eggs & Bakery',
    'Fruits (Daily Use)',
    'Vegetables (Daily Use)',
    'Snacks & Biscuits',
    'Instant & Packed Foods',
    'Beverages',
    'Personal Care',
    'Cleaning & Household',
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">🔎 Search & Filter</h3>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold text-sm"
        >
          {showAdvanced ? '▼ Hide Filters' : '▶ Advanced Filters'}
        </button>
      </div>

      {/* Basic Search */}
      <div className="mb-4">
        <input
          type="text"
          name="searchText"
          placeholder="Search by product name or SKU..."
          value={filters.searchText}
          onChange={handleFilterChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
        />
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t pt-6 space-y-4">
          {/* Row 1: Category and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                name="statusFilter"
                value={filters.statusFilter}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="about_to_expire">About to Expire (7 days)</option>
                <option value="expired">Expired</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="low_stock">Low Stock</option>
              </select>
            </div>
          </div>

          {/* Row 2: Profit Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Profit Range Min (₹)</label>
              <input
                type="number"
                name="profitMin"
                placeholder="Min profit"
                value={filters.profitMin}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Profit Range Max (₹)</label>
              <input
                type="number"
                name="profitMax"
                placeholder="Max profit"
                value={filters.profitMax}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
          </div>

          {/* Row 3: Expiry Days */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Days Until Expiry Min</label>
              <input
                type="number"
                name="expiryDaysMin"
                placeholder="Min days"
                value={filters.expiryDaysMin}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Days Until Expiry Max</label>
              <input
                type="number"
                name="expiryDaysMax"
                placeholder="Max days"
                value={filters.expiryDaysMax}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
          </div>

          {/* Row 4: Stock Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Level Min (units)</label>
              <input
                type="number"
                name="stockLevelMin"
                placeholder="Min stock"
                value={filters.stockLevelMin}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Level Max (units)</label>
              <input
                type="number"
                name="stockLevelMax"
                placeholder="Max stock"
                value={filters.stockLevelMax}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
            <select
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="profit_high">Highest Profit</option>
              <option value="profit_low">Lowest Profit</option>
              <option value="expiry_soon">Expiring Soon</option>
              <option value="stock_high">Most Stock</option>
              <option value="stock_low">Least Stock</option>
            </select>
          </div>

          {/* Reset Button */}
          <div className="flex gap-4">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              🔄 Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;
