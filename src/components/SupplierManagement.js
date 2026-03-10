import React, { useState } from 'react';

const SupplierManagement = ({ finances }) => {
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [sortSupplierBy, setSortSupplierBy] = useState('orders');

  const calculateSupplierMetrics = () => {
    const suppliers = {};

    finances.forEach(finance => {
      const supplier = finance.supplier || 'Not Specified';
      
      if (!suppliers[supplier]) {
        suppliers[supplier] = {
          name: supplier,
          totalOrders: 0,
          totalUnits: 0,
          totalCost: 0,
          totalRevenue: 0,
          products: [],
          qualityScore: 0, // Based on profit margin
          deliveryReliability: 95, // Percentage
          averageCostPerUnit: 0
        };
      }

      const cost = finance.costPrice * finance.quantity;
      const revenue = finance.sellingPrice * (finance.quantitySold || 0);
      const margin = revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0;

      suppliers[supplier].totalOrders++;
      suppliers[supplier].totalUnits += finance.quantity;
      suppliers[supplier].totalCost += cost;
      suppliers[supplier].totalRevenue += revenue;
      suppliers[supplier].qualityScore = (suppliers[supplier].qualityScore + margin) / suppliers[supplier].totalOrders;
      suppliers[supplier].products.push({
        name: finance.productId.name,
        cost: finance.costPrice,
        quantity:finance.quantity,
        margin: margin
      });
    });

    // Calculate average cost per unit
    Object.keys(suppliers).forEach(s => {
      suppliers[s].averageCostPerUnit = suppliers[s].totalCost / Math.max(suppliers[s].totalUnits, 1);
    });

    return suppliers;
  };

  const supplierMetrics = calculateSupplierMetrics();
  const supplierList = Object.values(supplierMetrics);

  const sortSuppliers = (list) => {
    const sorted = [...list];
    switch (sortSupplierBy) {
      case 'orders':
        return sorted.sort((a, b) => b.totalOrders - a.totalOrders);
      case 'cost':
        return sorted.sort((a, b) => b.totalCost - a.totalCost);
      case 'quality':
        return sorted.sort((a, b) => b.qualityScore - a.qualityScore);
      case 'units':
        return sorted.sort((a, b) => b.totalUnits - a.totalUnits);
      default:
        return sorted;
    }
  };

  const sortedSuppliers = sortSuppliers(supplierList);
  const totalSuppliers = supplierList.length;
  const totalSupplied = supplierList.reduce((sum, s) => sum + s.totalCost, 0);

  const getQualityBadge = (score) => {
    if (score >= 25) return { bg: 'bg-green-50', text: 'text-green-800', label: 'Excellent' };
    if (score >= 15) return { bg: 'bg-yellow-50', text: 'text-yellow-800', label: 'Good' };
    return { bg: 'bg-red-50', text: 'text-red-800', label: 'Needs Review' };
  };

  if (supplierList.length === 0) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 rounded-lg mb-6">
        <p className="text-yellow-800 font-semibold">
          ℹ️ No supplier data available. Add suppliers to product records to enable supplier tracking.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🤝 Supplier Management & Analysis</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-600">
          <p className="text-xs font-semibold text-gray-600 uppercase">Total Suppliers</p>
          <p className="text-3xl font-bold text-blue-800 mt-2">{totalSuppliers}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-600">
          <p className="text-xs font-semibold text-gray-600 uppercase">Total Spend</p>
          <p className="text-3xl font-bold text-green-800 mt-2">₹{totalSupplied.toFixed(0)}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-600">
          <p className="text-xs font-semibold text-gray-600 uppercase">Avg Quality Score</p>
          <p className="text-3xl font-bold text-purple-800 mt-2">
            {(supplierList.reduce((sum, s) => sum + s.qualityScore, 0) / supplierList.length).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Supplier Listing */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">Supplier Performance</h3>
          <select
            value={sortSupplierBy}
            onChange={(e) => setSortSupplierBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="orders">Sort by Orders</option>
            <option value="cost">Sort by Total Cost</option>
            <option value="quality">Sort by Quality</option>
            <option value="units">Sort by Units Supplied</option>
          </select>
        </div>

        <div className="space-y-3">
          {sortedSuppliers.map((supplier, idx) => {
            const qualityBadge = getQualityBadge(supplier.qualityScore);
            const isSelected = selectedSupplier === supplier.name;
            const spendPercentage = (supplier.totalCost / totalSupplied) * 100;

            return (
              <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Supplier Header */}
                <button
                  onClick={() => setSelectedSupplier(isSelected ? null : supplier.name)}
                  className="w-full p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 text-left flex-1">
                    <span className="text-2xl">
                      {isSelected ? '▼' : '▶'}
                    </span>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800 text-lg">{supplier.name}</p>
                      <p className="text-sm text-gray-600">
                        {supplier.totalOrders} order{supplier.totalOrders !== 1 ? 's' : ''} • {supplier.totalUnits} units
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-bold text-gray-800">₹{supplier.totalCost.toFixed(0)}</p>
                      <p className="text-xs text-gray-600">{spendPercentage.toFixed(1)}% of total</p>
                    </div>
                    <div className={`px-4 py-2 rounded-lg font-bold ${qualityBadge.bg} ${qualityBadge.text}`}>
                      {qualityBadge.label}
                      <br />
                      <span className="text-sm">{supplier.qualityScore.toFixed(1)}%</span>
                    </div>
                  </div>
                </button>

                {/* Supplier Details */}
                {isSelected && (
                  <div className="border-t border-gray-200 bg-gray-50 p-6">
                    {/* Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <p className="text-xs font-semibold text-gray-600 uppercase">Avg Cost/Unit</p>
                        <p className="text-xl font-bold text-gray-800 mt-2">
                          ₹{supplier.averageCostPerUnit.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <p className="text-xs font-semibold text-gray-600 uppercase">Delivery Reliability</p>
                        <p className="text-xl font-bold text-green-800 mt-2">{supplier.deliveryReliability}%</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <p className="text-xs font-semibold text-gray-600 uppercase">Profit Margin</p>
                        <p className="text-xl font-bold text-blue-800 mt-2">{supplier.qualityScore.toFixed(1)}%</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <p className="text-xs font-semibold text-gray-600 uppercase">Total Revenue</p>
                        <p className="text-xl font-bold text-purple-800 mt-2">₹{supplier.totalRevenue.toFixed(0)}</p>
                      </div>
                    </div>

                    {/* Products Table */}
                    <div className="mb-4">
                      <h4 className="font-bold text-gray-800 mb-3">Products Supplied</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-white border-b-2 border-gray-300">
                              <th className="p-2 text-left font-semibold text-gray-800">Product</th>
                              <th className="p-2 text-center font-semibold text-gray-800">Cost/Unit (₹)</th>
                              <th className="p-2 text-center font-semibold text-gray-800">Quantity</th>
                              <th className="p-2 text-center font-semibold text-gray-800">Total Cost (₹)</th>
                              <th className="p-2 text-center font-semibold text-gray-800">Margin %</th>
                            </tr>
                          </thead>
                          <tbody>
                            {supplier.products.map((product, pidx) => (
                              <tr key={pidx} className="border-b border-gray-200 hover:bg-white">
                                <td className="p-2 text-gray-800">{product.name}</td>
                                <td className="p-2 text-center text-gray-700">₹{product.cost.toFixed(2)}</td>
                                <td className="p-2 text-center text-gray-700">{product.quantity}</td>
                                <td className="p-2 text-center font-semibold text-gray-800">
                                  ₹{(product.cost * product.quantity).toFixed(0)}
                                </td>
                                <td className="p-2 text-center">
                                  <span className={`font-semibold ${product.margin > 20 ? 'text-green-800' : product.margin > 10 ? 'text-yellow-800' : 'text-red-800'}`}>
                                    {product.margin.toFixed(1)}%
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Performance Summary */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="font-bold text-gray-800 mb-2">Performance Summary</p>
                      <ul className="text-sm space-y-1 text-gray-700">
                        <li>✓ Supplied {supplier.totalUnits} units over {supplier.totalOrders} order(s)</li>
                        <li>✓ Average unit cost: ₹{supplier.averageCostPerUnit.toFixed(2)}</li>
                        <li>✓ Quality score based on product profit margins: {supplier.qualityScore.toFixed(1)}%</li>
                        <li>✓ Estimated delivery reliability: {supplier.deliveryReliability}%</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Supplier Comparison Chart */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Supplier Spend Distribution</h3>
        <div className="space-y-3">
          {sortedSuppliers.slice(0, 10).map((supplier, idx) => {
            const percentage = (supplier.totalCost / totalSupplied) * 100;
            return (
              <div key={idx}>
                <div className="flex justify-between items-center mb-1">
                  <p className="font-semibold text-gray-800 text-sm">{supplier.name}</p>
                  <p className="text-sm font-bold text-gray-700">₹{supplier.totalCost.toFixed(0)} ({percentage.toFixed(1)}%)</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SupplierManagement;
