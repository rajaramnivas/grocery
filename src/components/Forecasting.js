import React, { useState } from 'react';

const Forecasting = ({ finances }) => {
  const [forecastDays, setForecastDays] = useState(30);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const generateForecasts = () => {
    const forecasts = [];

    finances.forEach(finance => {
      // Calculate daily sales rate
      const daysBought = Math.floor((new Date() - new Date(finance.buyingDate)) / (1000 * 60 * 60 * 24));
      const totalSold = finance.quantitySold || 0;
      const currentStock = finance.quantity - totalSold;
      const dailySalesRate = daysBought > 0 ? totalSold / daysBought : 0;

      // Forecast stock depletion
      const projectedDaysUntilStockOut = dailySalesRate > 0 ? Math.floor(currentStock / dailySalesRate) : 999;
      const willStockOutInForecastPeriod = projectedDaysUntilStockOut <= forecastDays;

      // Calculate recommended reorder quantity
      const recommendedReorderQty = Math.ceil(dailySalesRate * forecastDays * 1.2); // 20% buffer
      const safetyStock = Math.ceil(dailySalesRate * 7); // 1 week safety stock

      // Reorder point calculation
      const reorderPoint = safetyStock + (dailySalesRate * 5); // Lead time assumed 5 days

      // Forecast profit
      const profitPerUnit = finance.sellingPrice - finance.costPrice;
      const projectedRevenue = dailySalesRate * forecastDays * finance.sellingPrice;
      const projectedProfit = profitPerUnit * (dailySalesRate * forecastDays);

      // Seasonal adjustment (simple: assume peak is middle of month)
      const today = new Date();
      const dayOfMonth = today.getDate();
      let seasonalFactor = 1;
      if (dayOfMonth >= 8 && dayOfMonth <= 22) {
        seasonalFactor = 1.2; // 20% higher in mid-month
      } else if (dayOfMonth <= 5 || dayOfMonth >= 25) {
        seasonalFactor = 0.8; // 20% lower at beginning/end
      }

      // Adjusting forecast with seasonal factor
      const seasonallyAdjustedForecast = Math.ceil(recommendedReorderQty * seasonalFactor);

      forecasts.push({
        productId: finance._id,
        productName: finance.productId.name,
        category: finance.productId.category,
        currentStock: currentStock,
        dailySalesRate: dailySalesRate.toFixed(2),
        projectedDaysUntilStockOut: projectedDaysUntilStockOut,
        willStockOutSoon: willStockOutInForecastPeriod,
        recommendedReorderQty: recommendedReorderQty,
        safetyStock: safetyStock,
        reorderPoint: Math.ceil(reorderPoint),
        projectedRevenue: projectedRevenue,
        projectedProfit: projectedProfit,
        urgency: willStockOutInForecastPeriod ? 'high' : dailySalesRate > 2 ? 'medium' : 'low',
        seasonalFactor: seasonalFactor.toFixed(2),
        forecastAccuracy: 'Medium' // Based on available data
      });
    });

    return forecasts;
  };

  const forecasts = generateForecasts();
  
  const filteredForecasts = selectedCategory === 'all'
    ? forecasts
    : forecasts.filter(f => f.category === selectedCategory);

  const categories = [...new Set(finances.map(f => f.productId.category))];
  
  // Calculate aggregated forecasts
  const highUrgency = filteredForecasts.filter(f => f.urgency === 'high').length;
  const mediumUrgency = filteredForecasts.filter(f => f.urgency === 'medium').length;
  const totalProjectedRevenue = filteredForecasts.reduce((sum, f) => sum + f.projectedRevenue, 0);
  const totalProjectedProfit = filteredForecasts.reduce((sum, f) => sum + f.projectedProfit, 0);
  const totalRecommendedStockInvestment = filteredForecasts.reduce((sum, f) => sum + (f.recommendedReorderQty * f.productId?.costPrice || 0), 0);

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-50 border-red-600 text-red-800';
      case 'medium':
        return 'bg-yellow-50 border-yellow-600 text-yellow-800';
      default:
        return 'bg-green-50 border-green-600 text-green-800';
    }
  };

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'high':
        return { bg: 'bg-red-100', text: 'text-red-800', label: '⚠️ URGENT' };
      case 'medium':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '⚡ MEDIUM' };
      default:
        return { bg: 'bg-green-100', text: 'text-green-800', label: '✅ LOW' };
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🔮 Forecasting & Reorder Recommendations</h2>

      {/* Forecast Period & Category Selection */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Forecast Period (Days)</label>
            <input
              type="number"
              value={forecastDays}
              onChange={(e) => setForecastDays(parseInt(e.target.value) || 30)}
              min="1"
              max="365"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category Filter</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-600">
          <p className="text-xs font-semibold text-gray-600 uppercase">High Priority</p>
          <p className="text-3xl font-bold text-red-800 mt-2">{highUrgency}</p>
          <p className="text-xs text-red-700 mt-1">Items need reorder</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-600">
          <p className="text-xs font-semibold text-gray-600 uppercase">Medium Priority</p>
          <p className="text-3xl font-bold text-yellow-800 mt-2">{mediumUrgency}</p>
          <p className="text-xs text-yellow-700 mt-1">Monitor closely</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-600">
          <p className="text-xs font-semibold text-gray-600 uppercase">Projected Revenue</p>
          <p className="text-3xl font-bold text-blue-800 mt-2">₹{totalProjectedRevenue.toFixed(0)}</p>
          <p className="text-xs text-blue-700 mt-1">Next {forecastDays} days</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-600">
          <p className="text-xs font-semibold text-gray-600 uppercase">Projected Profit</p>
          <p className="text-3xl font-bold text-green-800 mt-2">₹{totalProjectedProfit.toFixed(0)}</p>
          <p className="text-xs text-green-700 mt-1">Next {forecastDays} days</p>
        </div>
      </div>

      {/* Reorder Recommendations */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📋 Reorder Recommendations</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredForecasts
            .sort((a, b) => {
              const urgencyOrder = { high: 0, medium: 1, low: 2 };
              return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
            })
            .map((forecast, idx) => {
              const urgencyBadge = getUrgencyBadge(forecast.urgency);
              return (
                <div key={forecast.productId} className={`p-4 rounded-lg border-l-4 ${getUrgencyColor(forecast.urgency)}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-bold text-lg">{forecast.productName}</p>
                      <p className="text-xs opacity-75 mt-1">{forecast.category}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full font-bold ${urgencyBadge.bg} ${urgencyBadge.text}`}>
                      {urgencyBadge.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div className="bg-white bg-opacity-50 rounded p-2">
                      <p className="text-xs font-semibold opacity-75">Current Stock</p>
                      <p className="text-lg font-bold">{Math.floor(forecast.currentStock)}</p>
                    </div>
                    <div className="bg-white bg-opacity-50 rounded p-2">
                      <p className="text-xs font-semibold opacity-75">Daily Sales</p>
                      <p className="text-lg font-bold">{forecast.dailySalesRate} units/day</p>
                    </div>
                    <div className="bg-white bg-opacity-50 rounded p-2">
                      <p className="text-xs font-semibold opacity-75">Days Until Stockout</p>
                      <p className="text-lg font-bold">{forecast.projectedDaysUntilStockOut}</p>
                    </div>
                    <div className="bg-white bg-opacity-50 rounded p-2">
                      <p className="text-xs font-semibold opacity-75">Seasonal Factor</p>
                      <p className="text-lg font-bold">{forecast.seasonalFactor}x</p>
                    </div>
                  </div>

                  <div className="bg-white bg-opacity-50 rounded p-3 mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-bold">📦 Recommended Reorder</p>
                      <p className="text-lg font-bold text-blue-800">{forecast.seasonallyAdjustedForecast} units</p>
                    </div>
                    <div className="flex justify-between items-center text-sm opacity-75">
                      <span>Reorder Point: {forecast.reorderPoint} units | Safety Stock: {forecast.safetyStock} units</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-1">
                      <p className="text-xs font-semibold opacity-75">Projected Revenue ({forecastDays}d)</p>
                      <p className="font-bold">₹{forecast.projectedRevenue.toFixed(0)}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold opacity-75">Projected Profit ({forecastDays}d)</p>
                      <p className="font-bold">₹{forecast.projectedProfit.toFixed(0)}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold opacity-75">Forecast Accuracy</p>
                      <p className="font-bold">{forecast.forecastAccuracy}</p>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Insights & Recommendations */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6 border-2 border-indigo-200">
        <h3 className="text-lg font-bold text-indigo-900 mb-4">💡 Smart Insights</h3>
        <ul className="space-y-3 text-sm text-indigo-900">
          <li>
            ✓ <strong>Highest Priority:</strong> {highUrgency > 0 
              ? `${highUrgency} product(s) require immediate reorder to avoid stockouts` 
              : 'All products have sufficient stock levels'}
          </li>
          <li>
            ✓ <strong>Forecast Period:</strong> Based on next {forecastDays} days with current sales velocity
          </li>
          <li>
            ✓ <strong>Seasonal Adjustment:</strong> Reorder quantities adjusted by seasonal factors (peak/low seasons)
          </li>
          <li>
            ✓ <strong>Financial Impact:</strong> Projected {forecastDays}-day revenue of ₹{totalProjectedRevenue.toFixed(0)}
          </li>
          <li>
            ✓ <strong>Recommendation:</strong> {highUrgency > 0 
              ? 'Prioritize reorders for high-urgency items first' 
              : 'Current inventory levels are healthy. Plan reorders based on seasonal factors'}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Forecasting;
