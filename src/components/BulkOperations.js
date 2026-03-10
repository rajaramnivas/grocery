import React, { useState } from 'react';

const BulkOperations = ({ selectedProducts, finances, onBulkUpdate }) => {
  const [showBulkPanel, setShowBulkPanel] = useState(false);
  const [bulkOperation, setBulkOperation] = useState('price_update');
  const [operationData, setOperationData] = useState({
    priceAdjustment: '',
    adjustmentType: 'percentage', // percentage or fixed
    newStatus: 'active',
    notes: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  if (selectedProducts.length === 0) {
    return null;
  }

  const handleBulkOperationApply = async () => {
    const selectedFinances = finances.filter(f =>
      selectedProducts.includes(f._id)
    );

    if (selectedFinances.length === 0) {
      alert('Please select products first');
      return;
    }

    setIsProcessing(true);

    try {
      switch (bulkOperation) {
        case 'price_update':
          await handlePriceUpdate(selectedFinances);
          break;
        case 'status_update':
          await handleStatusUpdate(selectedFinances);
          break;
        case 'quantity_update':
          await handleQuantityUpdate(selectedFinances);
          break;
        default:
          break;
      }

      alert(`Bulk operation completed for ${selectedFinances.length} product(s)`);
      if (onBulkUpdate) {
        onBulkUpdate();
      }
    } catch (error) {
      alert('Error performing bulk operation: ' + error.message);
    } finally {
      setIsProcessing(false);
      setOperationData({
        priceAdjustment: '',
        adjustmentType: 'percentage',
        newStatus: 'active',
        notes: ''
      });
    }
  };

  const handlePriceUpdate = async (selectedFinances) => {
    if (!operationData.priceAdjustment) {
      alert('Please enter price adjustment amount');
      return;
    }

    // This is a mock implementation - in production, you'd call your API
    console.log('Bulk price update:', {
      products: selectedFinances.map(f => f.productId.name),
      adjustment: operationData.priceAdjustment,
      type: operationData.adjustmentType
    });
  };

  const handleStatusUpdate = async (selectedFinances) => {
    console.log('Bulk status update:', {
      products: selectedFinances.map(f => f.productId.name),
      newStatus: operationData.newStatus
    });
  };

  const handleQuantityUpdate = async (selectedFinances) => {
    console.log('Bulk quantity update:', {
      products: selectedFinances.map(f => f.productId.name),
      notes: operationData.notes
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Floating Button */}
      <button
        onClick={() => setShowBulkPanel(!showBulkPanel)}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg font-bold text-2xl transition-all"
      >
        ⚙️
      </button>

      {/* Panel */}
      {showBulkPanel && (
        <div className="absolute bottom-20 right-0 bg-white rounded-lg shadow-2xl p-6 w-80 border-2 border-blue-600">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              📦 Bulk Operations ({selectedProducts.length})
            </h3>
            <button
              onClick={() => setShowBulkPanel(false)}
              className="text-gray-500 hover:text-gray-800 font-bold"
            >
              ✕
            </button>
          </div>

          {/* Operation Selection */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Operation
            </label>
            <select
              value={bulkOperation}
              onChange={(e) => setBulkOperation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="price_update">📈 Update Prices</option>
              <option value="status_update">🏷️ Update Status</option>
              <option value="quantity_update">📦 Update Quantities</option>
            </select>
          </div>

          {/* Price Update */}
          {bulkOperation === 'price_update' && (
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Adjustment Type
                </label>
                <select
                  value={operationData.adjustmentType}
                  onChange={(e) =>
                    setOperationData({
                      ...operationData,
                      adjustmentType: e.target.value
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="percentage">By Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {operationData.adjustmentType === 'percentage'
                    ? 'Percentage Change (+/-)'
                    : 'Amount Change (₹)'}
                </label>
                <input
                  type="number"
                  value={operationData.priceAdjustment}
                  onChange={(e) =>
                    setOperationData({
                      ...operationData,
                      priceAdjustment: e.target.value
                    })
                  }
                  placeholder="e.g., 10 or -5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          )}

          {/* Status Update */}
          {bulkOperation === 'status_update' && (
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Status
              </label>
              <select
                value={operationData.newStatus}
                onChange={(e) =>
                  setOperationData({
                    ...operationData,
                    newStatus: e.target.value
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="active">Active</option>
                <option value="archived">Archived</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>
          )}

          {/* Quantity Update */}
          {bulkOperation === 'quantity_update' && (
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={operationData.notes}
                onChange={(e) =>
                  setOperationData({
                    ...operationData,
                    notes: e.target.value
                  })
                }
                placeholder="Add notes..."
                maxLength="200"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleBulkOperationApply}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50"
            >
              {isProcessing ? '⏳ Applying...' : '✓ Apply'}
            </button>
            <button
              onClick={() => setShowBulkPanel(false)}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
            >
              Cancel
            </button>
          </div>

          {/* Selected Products List */}
          <div className="mt-4 border-t pt-4 max-h-32 overflow-y-auto">
            <p className="text-sm font-semibold text-gray-700 mb-2">Selected:</p>
            <ul className="text-xs space-y-1">
              {finances
                .filter(f => selectedProducts.includes(f._id))
                .slice(0, 5)
                .map(f => (
                  <li key={f._id} className="text-gray-600 truncate">
                    • {f.productId.name}
                  </li>
                ))}
              {selectedProducts.length > 5 && (
                <li className="text-gray-600 font-semibold">
                  ... and {selectedProducts.length - 5} more
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkOperations;
