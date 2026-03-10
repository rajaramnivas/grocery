import React, { useState, useEffect } from 'react';

const BudgetTracker = ({ totalAmount = 0 }) => {
  const [budget, setBudget] = useState(() => {
    // Load budget from localStorage if exists
    const saved = localStorage.getItem('userBudget');
    return saved ? parseFloat(saved) : null;
  });
  const [showBudgetInput, setShowBudgetInput] = useState(!budget);
  const [tempBudget, setTempBudget] = useState(budget || '');

  // Save budget to localStorage whenever it changes
  useEffect(() => {
    if (budget) {
      localStorage.setItem('userBudget', budget);
    }
  }, [budget]);

  const handleSetBudget = (e) => {
    e.preventDefault();
    if (tempBudget && !isNaN(tempBudget) && parseFloat(tempBudget) > 0) {
      setBudget(parseFloat(tempBudget));
      setShowBudgetInput(false);
    } else {
      alert('Please enter a valid budget amount');
    }
  };

  const handleClearBudget = () => {
    setBudget(null);
    localStorage.removeItem('userBudget');
    setShowBudgetInput(true);
    setTempBudget('');
  };

  const isBudgetExceeded = budget && totalAmount > budget;
  const remainingBudget = budget ? Math.max(0, budget - totalAmount) : null;
  const percentageUsed = budget ? Math.min(100, (totalAmount / budget) * 100) : 0;

  return (
    <div className={`rounded-lg p-4 mb-4 transition-all ${
      isBudgetExceeded
        ? 'bg-red-50 border-2 border-red-400'
        : budget
        ? 'bg-blue-50 border-2 border-blue-300'
        : 'bg-gray-50 border-2 border-gray-300'
    }`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg text-primary">💰 Budget Tracker</h3>
        {budget && (
          <button
            onClick={handleClearBudget}
            className="text-xs text-gray-600 hover:text-red-600 font-semibold underline"
          >
            Clear Budget
          </button>
        )}
      </div>

      {showBudgetInput ? (
        <form onSubmit={handleSetBudget} className="space-y-3">
          <p className="text-sm text-gray-700">Set your shopping budget to track spending</p>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Enter budget amount (₹)"
              value={tempBudget}
              onChange={(e) => setTempBudget(e.target.value)}
              className="input-field flex-1"
              min="0"
              step="10"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition-colors"
            >
              Set Budget
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          {/* Budget Summary */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-gray-600">Budget</p>
              <p className="font-bold text-primary text-lg">₹{budget?.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Spent</p>
              <p className={`font-bold text-lg ${isBudgetExceeded ? 'text-red-600' : 'text-green-600'}`}>
                ₹{totalAmount.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Remaining</p>
              <p className={`font-bold text-lg ${remainingBudget > 0 ? 'text-success' : 'text-danger'}`}>
                ₹{remainingBudget?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all ${
                percentageUsed > 100
                  ? 'bg-red-600'
                  : percentageUsed > 80
                  ? 'bg-orange-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(percentageUsed, 100)}%` }}
            />
          </div>

          {/* Status Message */}
          {isBudgetExceeded ? (
            <div className="bg-red-100 border border-red-400 rounded p-3">
              <p className="text-red-800 font-bold text-sm">
                ⚠️ Budget Exceeded!
              </p>
              <p className="text-red-700 text-xs mt-1">
                You are spending ₹{(totalAmount - budget).toFixed(2)} over your budget. Please remove items to stay within budget.
              </p>
            </div>
          ) : remainingBudget !== null && remainingBudget < 100 && remainingBudget > 0 ? (
            <div className="bg-orange-100 border border-orange-400 rounded p-3">
              <p className="text-orange-800 font-bold text-sm">
                ⚡ Approaching Budget Limit
              </p>
              <p className="text-orange-700 text-xs mt-1">
                Only ₹{remainingBudget.toFixed(2)} remaining. {percentageUsed.toFixed(0)}% of budget used.
              </p>
            </div>
          ) : remainingBudget !== null && remainingBudget >= 100 ? (
            <div className="bg-green-100 border border-green-400 rounded p-3">
              <p className="text-green-800 font-bold text-sm">
                ✓ Within Budget
              </p>
              <p className="text-green-700 text-xs mt-1">
                You have ₹{remainingBudget.toFixed(2)} left. {percentageUsed.toFixed(0)}% of budget used.
              </p>
            </div>
          ) : null}

          {/* Edit Budget Button */}
          <button
            onClick={() => {
              setShowBudgetInput(true);
              setTempBudget(budget);
            }}
            className="w-full px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors font-semibold"
          >
            Edit Budget
          </button>
        </div>
      )}
    </div>
  );
};

export default BudgetTracker;
