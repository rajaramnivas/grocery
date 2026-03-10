import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/api';

const GroceryReminder = ({ className = '' }) => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (token && !dismissed) {
      fetchReminders();
    }
  }, [token, dismissed]);

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const response = await orderService.getReminders();
      if (response.data.shouldRemind && response.data.reminders.length > 0) {
        setReminders(response.data.reminders);
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setReminders([]);
  };

  if (loading || dismissed || reminders.length === 0) {
    return null;
  }

  // Show only the most urgent reminder
  const primaryReminder = reminders[0];

  return (
    <div className={`bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-300 rounded-lg p-4 mb-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="text-3xl">{primaryReminder.emoji}</div>
          <div className="flex-1">
            <h3 className="font-bold text-orange-900 text-lg">Time to Restock!</h3>
            <p className="text-orange-800 text-sm mt-1">{primaryReminder.message}</p>
            {reminders.length > 1 && (
              <p className="text-xs text-orange-700 mt-2 italic">
                +{reminders.length - 1} more item{reminders.length > 2 ? 's' : ''} to reorder
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="ml-2 text-orange-600 hover:text-orange-800 font-bold text-xl flex-shrink-0"
          aria-label="Dismiss reminder"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default GroceryReminder;
