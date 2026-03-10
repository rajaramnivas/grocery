import React from 'react';

// Simple wrapper around Google Material Symbols
// Usage: <MaterialIcon name="shopping_cart" className="text-xl" />
const MaterialIcon = ({ name, className = '', filled = false, size = 24 }) => {
  const style = {
    fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
    fontSize: size,
  };

  return (
    <span className={`material-symbols-outlined ${className}`} style={style}>
      {name}
    </span>
  );
};

export default MaterialIcon;
