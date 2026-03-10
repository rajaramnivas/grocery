import React from 'react';

const DetailedMetrics = ({ finances }) => {
  const calculateMetrics = () => {
    if (finances.length === 0) {
      return null;
    }

    let totalRevenue = 0;
    let totalCost = 0;
    let totalQuantityPurchased = 0;
    let totalQuantitySold = 0;
    let totalProfit = 0;
    let productCount = finances.length;
    let topProfitMargin = 0;
    let lowestProfitMargin = 100;
    let totalDaysHeld = 0;

    finances.forEach(finance => {
      const revenue = finance.sellingPrice * (finance.quantitySold || 0);
      const cost = finance.costPrice * finance.quantity;
      const profit = revenue - cost;
      const paymentMargin = revenue > 0 ? ((profit / revenue) * 100) : 0;

      totalRevenue += revenue;
      totalCost += cost;
      totalQuantityPurchased += finance.quantity;
      totalQuantitySold += finance.quantitySold || 0;
      totalProfit += profit;

      topProfitMargin = Math.max(topProfitMargin, paymentMargin);
      lowestProfitMargin = Math.min(lowestProfitMargin, paymentMargin);

      // Calculate days held
      const daysBought = Math.floor((new Date() - new Date(finance.buyingDate)) / (1000 * 60 * 60 * 24));
      totalDaysHeld += daysBought;
    });

    const grossMargin = totalCost > 0 ? ((totalRevenue - totalCost) / totalRevenue * 100) : 0;
    const netMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100) : 0;
    const roi = totalCost > 0 ? ((totalProfit / totalCost) * 100) : 0;
    const turnoverRatio = totalQuantityPurchased > 0 ? (totalQuantitySold / totalQuantityPurchased) : 0;
    const avgHoldingDays = productCount > 0 ? Math.round(totalDaysHeld / productCount) : 0;
    const revenuePerProduct = productCount > 0 ? totalRevenue / productCount : 0;
    const profitPerProduct = productCount > 0 ? totalProfit / productCount : 0;

    return {
      totalRevenue,
      totalCost,
      totalProfit,
      grossMargin,
      netMargin,
      roi,
      turnoverRatio,
      topProfitMargin,
      lowestProfitMargin,
      avgHoldingDays,
      revenuePerProduct,
      profitPerProduct,
      totalQuantityPurchased,
      totalQuantitySold,
      productCount
    };
  };

  const metrics = calculateMetrics();

  if (!metrics) {
    return null;
  }

  const MetricCard = ({ label, value, unit = '', bgColor = 'bg-blue-50', textColor = 'text-blue-800' }) => (
    <div className={`${bgColor} rounded-lg p-4 border-l-4 ${textColor.replace('text-', 'border-')}`}>
      <p className="text-xs font-semibold text-gray-600 uppercase">{label}</p>
      <p className={`text-2xl font-bold ${textColor} mt-2`}>
        {typeof value === 'number' ? value.toFixed(2) : value}
        <span className="text-sm ml-1">{unit}</span>
      </p>
    </div>
  );

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Detailed Financial Metrics</h2>

      {/* Revenue & Profit Metrics */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-700 mb-4">💰 Revenue & Profit</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Revenue"
            value={metrics.totalRevenue}
            unit="₹"
            bgColor="bg-green-50"
            textColor="text-green-800"
          />
          <MetricCard
            label="Total Cost"
            value={metrics.totalCost}
            unit="₹"
            bgColor="bg-red-50"
            textColor="text-red-800"
          />
          <MetricCard
            label="Total Profit"
            value={metrics.totalProfit}
            unit="₹"
            bgColor="bg-emerald-50"
            textColor="text-emerald-800"
          />
          <MetricCard
            label="Avg Profit Per Product"
            value={metrics.profitPerProduct}
            unit="₹"
            bgColor="bg-purple-50"
            textColor="text-purple-800"
          />
        </div>
      </div>

      {/* Margin & Profitability Metrics */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-700 mb-4">📈 Profitability Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Gross Margin"
            value={metrics.grossMargin}
            unit="%"
            bgColor="bg-blue-50"
            textColor="text-blue-800"
          />
          <MetricCard
            label="Net Margin"
            value={metrics.netMargin}
            unit="%"
            bgColor="bg-indigo-50"
            textColor="text-indigo-800"
          />
          <MetricCard
            label="Return on Investment (ROI)"
            value={metrics.roi}
            unit="%"
            bgColor="bg-yellow-50"
            textColor="text-yellow-800"
          />
          <MetricCard
            label="Profit Margin Range"
            value={`${metrics.lowestProfitMargin.toFixed(1)}% - ${metrics.topProfitMargin.toFixed(1)}%`}
            bgColor="bg-orange-50"
            textColor="text-orange-800"
          />
        </div>
      </div>

      {/* Inventory & Turnover Metrics */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-700 mb-4">📦 Inventory & Sales Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Inventory Turnover Ratio"
            value={metrics.turnoverRatio}
            unit="x"
            bgColor="bg-cyan-50"
            textColor="text-cyan-800"
          />
          <MetricCard
            label="Avg Holding Days"
            value={metrics.avgHoldingDays}
            unit="days"
            bgColor="bg-pink-50"
            textColor="text-pink-800"
          />
          <MetricCard
            label="Total Quantity Purchased"
            value={metrics.totalQuantityPurchased}
            unit="units"
            bgColor="bg-teal-50"
            textColor="text-teal-800"
          />
          <MetricCard
            label="Total Quantity Sold"
            value={metrics.totalQuantitySold}
            unit="units"
            bgColor="bg-rose-50"
            textColor="text-rose-800"
          />
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-700 mb-4">📐 Summary Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            label="Total Products Tracked"
            value={metrics.productCount}
            bgColor="bg-gray-50"
            textColor="text-gray-800"
          />
          <MetricCard
            label="Avg Revenue Per Product"
            value={metrics.revenuePerProduct}
            unit="₹"
            bgColor="bg-lime-50"
            textColor="text-lime-800"
          />
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border-l-4 border-purple-800">
            <p className="text-xs font-semibold text-gray-600 uppercase">Overall Health Score</p>
            <div className="mt-2">
              <div className="text-3xl font-bold text-purple-800">
                {(metrics.roi > 50 ? 'A+' : metrics.roi > 30 ? 'A' : metrics.roi > 10 ? 'B' : 'C')}
              </div>
              <p className="text-xs text-purple-700 mt-1">
                Based on ROI: {metrics.roi.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
        <h3 className="text-lg font-bold text-blue-800 mb-4">💡 Business Insights</h3>
        <ul className="space-y-2 text-sm text-blue-900">
          <li>
            ✓ <strong>Inventory Turnover:</strong> {metrics.turnoverRatio > 0.5 ? 'Good - Products are selling well' : 'Needs Improvement - Consider promotions'}
          </li>
          <li>
            ✓ <strong>Profitability:</strong> {metrics.netMargin > 20 ? 'Excellent - Strong profit margins' : metrics.netMargin > 10 ? 'Good - Healthy profitability' : 'At Risk - Review pricing strategy'}
          </li>
          <li>
            ✓ <strong>Average Holding Period:</strong> {metrics.avgHoldingDays} days per product
          </li>
          <li>
            ✓ <strong>Best Performing Category:</strong> Profit margin ranges from {metrics.lowestProfitMargin.toFixed(1)}% to {metrics.topProfitMargin.toFixed(1)}%
          </li>
          <li>
            ✓ <strong>Revenue Distribution:</strong> Average ₹{metrics.revenuePerProduct.toFixed(2)} revenue per product
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DetailedMetrics;
