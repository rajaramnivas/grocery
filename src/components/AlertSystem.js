import React from 'react';

const AlertSystem = ({ finances }) => {
  const getAlerts = () => {
    const alerts = [];

    finances.forEach(finance => {
      const daysUntilExpiry = getDaysUntilExpiry(finance.expiryDate);
      const stockRemaining = finance.quantity - (finance.quantitySold || 0);

      // Alert: Expiring in 3 days or less
      if (daysUntilExpiry <= 3 && daysUntilExpiry > 0) {
        alerts.push({
          id: `${finance._id}-expiry-critical`,
          type: 'critical',
          icon: '⚠️',
          title: 'Critical: Expiring Very Soon',
          message: `${finance.productId.name} expires in ${daysUntilExpiry} day(s)`,
          product: finance.productId.name,
          date: finance.expiryDate
        });
      }

      // Alert: Expiring in 7 days or less
      if (daysUntilExpiry > 3 && daysUntilExpiry <= 7) {
        alerts.push({
          id: `${finance._id}-expiry-warning`,
          type: 'warning',
          icon: '🟡',
          title: 'Warning: Expiring Soon',
          message: `${finance.productId.name} expires in ${daysUntilExpiry} days`,
          product: finance.productId.name,
          date: finance.expiryDate
        });
      }

      // Alert: Already expired
      if (daysUntilExpiry < 0) {
        alerts.push({
          id: `${finance._id}-expired`,
          type: 'danger',
          icon: '❌',
          title: 'Alert: Expired Product',
          message: `${finance.productId.name} expired ${Math.abs(daysUntilExpiry)} day(s) ago`,
          product: finance.productId.name,
          date: finance.expiryDate
        });
      }

      // Alert: Out of stock
      if (stockRemaining <= 0) {
        alerts.push({
          id: `${finance._id}-out-of-stock`,
          type: 'danger',
          icon: '📭',
          title: 'Out of Stock',
          message: `${finance.productId.name} is out of stock`,
          product: finance.productId.name
        });
      }

      // Alert: Low stock (less than 10% remaining)
      const lowStockThreshold = Math.ceil(finance.quantity * 0.1);
      if (stockRemaining > 0 && stockRemaining <= lowStockThreshold) {
        alerts.push({
          id: `${finance._id}-low-stock`,
          type: 'warning',
          icon: '📉',
          title: 'Low Stock Warning',
          message: `${finance.productId.name} has only ${stockRemaining} units left (${Math.round((stockRemaining / finance.quantity) * 100)}%)`,
          product: finance.productId.name,
          remaining: stockRemaining,
          total: finance.quantity
        });
      }

      // Alert: Dead stock (not sold in 30 days)
      const daysSinceBuying = getDaysSincePurchase(finance.buyingDate);
      if (daysSinceBuying > 30 && finance.quantitySold === 0) {
        alerts.push({
          id: `${finance._id}-dead-stock`,
          type: 'info',
          icon: '💤',
          title: 'Dead Stock Alert',
          message: `${finance.productId.name} hasn't sold in ${daysSinceBuying} days (${finance.quantity} units unsold)`,
          product: finance.productId.name,
          days: daysSinceBuying
        });
      }
    });

    return alerts.sort((a, b) => {
      const priority = { critical: 0, danger: 1, warning: 2, info: 3 };
      return priority[a.type] - priority[b.type];
    });
  };

  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDaysSincePurchase = (buyingDate) => {
    const today = new Date();
    const bought = new Date(buyingDate);
    const diffTime = today - bought;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const alerts = getAlerts();

  const getAlertStyles = (type) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50 border-l-4 border-red-600';
      case 'danger':
        return 'bg-red-50 border-l-4 border-red-500';
      case 'warning':
        return 'bg-yellow-50 border-l-4 border-yellow-500';
      case 'info':
        return 'bg-blue-50 border-l-4 border-blue-500';
      default:
        return 'bg-gray-50 border-l-4 border-gray-400';
    }
  };

  const getAlertTextStyles = (type) => {
    switch (type) {
      case 'critical':
        return 'text-red-800';
      case 'danger':
        return 'text-red-700';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-lg mb-6">
        <p className="text-green-800 font-semibold">✅ All Clear! No active alerts.</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">🔔 Active Alerts ({alerts.length})</h2>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-lg shadow-sm ${getAlertStyles(alert.type)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className={`font-bold ${getAlertTextStyles(alert.type)}`}>
                  {alert.icon} {alert.title}
                </p>
                <p className={`text-sm mt-1 ${getAlertTextStyles(alert.type)}`}>
                  {alert.message}
                </p>
                {alert.remaining && (
                  <div className="mt-2 w-full bg-gray-300 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full"
                      style={{
                        width: `${(alert.remaining / alert.total) * 100}%`
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertSystem;
