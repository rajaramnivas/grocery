import React from 'react';

const ProductTags = ({ stock, isFreshToday, size = 'medium' }) => {
  const isLowStock = stock > 0 && stock <= 10;
  
  // Size configurations
  const sizes = {
    small: {
      fontSize: '0.75rem',
      padding: '0.25rem 0.5rem',
      gap: '0.25rem',
    },
    medium: {
      fontSize: '0.875rem',
      padding: '0.25rem 0.75rem',
      gap: '0.5rem',
    },
    large: {
      fontSize: '1rem',
      padding: '0.5rem 1rem',
      gap: '0.75rem',
    },
  };

  const sizeConfig = sizes[size] || sizes.medium;

  if (!isLowStock && !isFreshToday) {
    return null;
  }

  return (
    <div className="d-flex flex-wrap" style={{ gap: sizeConfig.gap }}>
      {isLowStock && (
        <span 
          style={{
            ...sizeConfig,
            backgroundColor: '#ffedd5',
            color: '#c2410c',
            fontWeight: 'bold',
            borderRadius: '9999px',
            border: '1px solid #fdba74',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
          title="Limited stock available"
        >
          <span>⚠️</span>
          <span>Low Stock</span>
        </span>
      )}
      
      {isFreshToday && (
        <span 
          style={{
            ...sizeConfig,
            backgroundColor: '#dcfce7',
            color: '#15803d',
            fontWeight: 'bold',
            borderRadius: '9999px',
            border: '1px solid #4ade80',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}
          title="Fresh product arrived today"
        >
          <span>✨</span>
          <span>Fresh Today</span>
        </span>
      )}
    </div>
  );
};

export default ProductTags;
