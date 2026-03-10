import React, { useState } from 'react';

const StockHistory = ({ finances }) => {
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [historyFilter, setHistoryFilter] = useState('all'); // all, added, sold, available

  const generateStockHistory = (finance) => {
    const history = [];
    const buyingDate = new Date(finance.buyingDate);
    const today = new Date();

    // Initial purchase
    history.push({
      date: buyingDate,
      type: 'purchase',
      quantity: finance.quantity,
      description: `Initial purchase of ${finance.quantity} units`,
      runningBalance: finance.quantity
    });

    // Sales (simulate daily sales if quantitySold exists)
    const soldQuantity = finance.quantitySold || 0;
    if (soldQuantity > 0) {
      const daysHeld = Math.floor((today - buyingDate) / (1000 * 60 * 60 * 24));
      const dailySale = Math.ceil(soldQuantity / Math.max(daysHeld, 1));
      
      let runningBalance = finance.quantity;
      for (let i = 1; i <= daysHeld && runningBalance > 0; i++) {
        const saleAmount = Math.min(dailySale, runningBalance);
        runningBalance -= saleAmount;
        
        const saleDate = new Date(buyingDate);
        saleDate.setDate(saleDate.getDate() + i);
        
        history.push({
          date: saleDate,
          type: 'sale',
          quantity: -saleAmount,
          description: `Sold ${saleAmount} units`,
          runningBalance: runningBalance
        });
      }
    }

    return history.sort((a, b) => b.date - a.date);
  };

  const getFilteredHistory = (history) => {
    switch (historyFilter) {
      case 'added':
        return history.filter(h => h.type === 'purchase');
      case 'sold':
        return history.filter(h => h.type === 'sale');
      case 'available':
        return history.filter(h => h.runningBalance > 0);
      default:
        return history;
    }
  };

  const stockCurrently = finances.map(f => ({
    productId: f._id,
    productName: f.productId.name,
    purchased: f.quantity,
    sold: f.quantitySold || 0,
    remaining: f.quantity - (f.quantitySold || 0),
    category: f.productId.category,
    buyingDate: new Date(f.buyingDate),
    lastUpdated: new Date()
  }));

  const totalPurchased = stockCurrently.reduce((sum, s) => sum + s.purchased, 0);
  const totalSold = stockCurrently.reduce((sum, s) => sum + s.sold, 0);
  const totalRemaining = stockCurrently.reduce((sum, s) => sum + s.remaining, 0);

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📦 Stock History & Tracking</h2>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-600">
          <p className="text-xs font-semibold text-gray-600 uppercase">Total Purchased</p>
          <p className="text-2xl font-bold text-blue-800 mt-2">{totalPurchased}</p>
          <p className="text-xs text-blue-700 mt-1">units</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-600">
          <p className="text-xs font-semibold text-gray-600 uppercase">Total Sold</p>
          <p className="text-2xl font-bold text-green-800 mt-2">{totalSold}</p>
          <p className="text-xs text-green-700 mt-1">units ({((totalSold / totalPurchased) * 100).toFixed(1)}% sell-through)</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-600">
          <p className="text-xs font-semibold text-gray-600 uppercase">Currently in Stock</p>
          <p className="text-2xl font-bold text-yellow-800 mt-2">{totalRemaining}</p>
          <p className="text-xs text-yellow-700 mt-1">units</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-600">
          <p className="text-xs font-semibold text-gray-600 uppercase">Products Tracked</p>
          <p className="text-2xl font-bold text-purple-800 mt-2">{stockCurrently.length}</p>
          <p className="text-xs text-purple-700 mt-1">items</p>
        </div>
      </div>

      {/* Stock Summary Table */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Current Stock Levels</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="p-3 text-left font-bold text-gray-800">Product Name</th>
                <th className="p-3 text-left font-bold text-gray-800">Category</th>
                <th className="p-3 text-center font-bold text-gray-800">Purchased</th>
                <th className="p-3 text-center font-bold text-gray-800">Sold</th>
                <th className="p-3 text-center font-bold text-gray-800">Remaining</th>
                <th className="p-3 text-center font-bold text-gray-800">Sell-Through %</th>
                <th className="p-3 text-center font-bold text-gray-800">Status</th>
              </tr>
            </thead>
            <tbody>
              {stockCurrently.map((stock, idx) => {
                const sellThrough = stock.purchased > 0 ? (stock.sold / stock.purchased) * 100 : 0;
                let statusBadge = 'bg-green-100 text-green-800';
                let statusText = 'In Stock';

                if (stock.remaining === 0) {
                  statusBadge = 'bg-red-100 text-red-800';
                  statusText = 'Out of Stock';
                } else if (stock.remaining <= Math.ceil(stock.purchased * 0.1)) {
                  statusBadge = 'bg-yellow-100 text-yellow-800';
                  statusText = 'Low Stock';
                }

                return (
                  <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-3 font-semibold text-gray-800">{stock.productName}</td>
                    <td className="p-3 text-gray-700">{stock.category}</td>
                    <td className="p-3 text-center text-blue-800 font-semibold">{stock.purchased}</td>
                    <td className="p-3 text-center text-green-800 font-semibold">{stock.sold}</td>
                    <td className="p-3 text-center font-semibold">
                      <span className={stock.remaining > 0 ? 'text-green-800' : 'text-red-800'}>
                        {stock.remaining}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${Math.min(sellThrough, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-700 w-10">{sellThrough.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadge}`}>
                        {statusText}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed History View */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">History Details by Product</h3>
          <select
            value={historyFilter}
            onChange={(e) => setHistoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">All Movements</option>
            <option value="added">Stock Added</option>
            <option value="sold">Stock Sold</option>
            <option value="available">Available Stock</option>
          </select>
        </div>

        <div className="space-y-3">
          {finances.map((finance, idx) => {
            const history = generateStockHistory(finance);
            const filteredHistory = getFilteredHistory(history);
            const isExpanded = expandedProduct === finance._id;

            return (
              <div key={finance._id} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() =>
                    setExpandedProduct(isExpanded ? null : finance._id)
                  }
                  className="w-full p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 text-left">
                    <span className="text-xl">
                      {isExpanded ? '▼' : '▶'}
                    </span>
                    <div>
                      <p className="font-bold text-gray-800">{finance.productId.name}</p>
                      <p className="text-sm text-gray-600">
                        {history.length} movement{history.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">
                      Balance: {finance.quantity - (finance.quantitySold || 0)} units
                    </p>
                    <p className="text-sm text-gray-600">
                      Updated: {new Date(finance.buyingDate).toLocaleDateString()}
                    </p>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50 p-4">
                    {filteredHistory.length === 0 ? (
                      <p className="text-gray-600 text-center py-4">No matching history</p>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {filteredHistory.map((entry, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg border-l-4 ${
                              entry.type === 'purchase'
                                ? 'bg-blue-50 border-blue-600'
                                : 'bg-green-50 border-green-600'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-gray-800">
                                  {entry.type === 'purchase' ? '📥' : '📤'} {entry.description}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  {entry.date.toLocaleDateString()} {entry.date.toLocaleTimeString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className={`font-bold text-lg ${
                                  entry.quantity > 0 ? 'text-blue-800' : 'text-green-800'
                                }`}>
                                  {entry.quantity > 0 ? '+' : ''}{entry.quantity}
                                </p>
                                <p className="text-xs text-gray-600">
                                  Running: {entry.runningBalance}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StockHistory;
