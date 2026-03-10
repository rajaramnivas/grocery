import React from 'react';

const EcoFriendlyBadge = ({ isOrganic, isLocal, size = 'medium' }) => {
  const sizes = {
    small: { fontSize: '0.75rem', padding: '0.125rem 0.5rem' },
    medium: { fontSize: '0.875rem', padding: '0.25rem 0.75rem' },
    large: { fontSize: '1rem', padding: '0.5rem 1rem' }
  };

  const currentSize = sizes[size] || sizes.medium;

  if (!isOrganic && !isLocal) {
    return null;
  }

  return (
    <div className="d-flex flex-wrap gap-2">
      {isOrganic && (
        <span
          title="This product is organic"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            borderRadius: '9999px',
            fontWeight: 'bold',
            backgroundColor: '#dcfce7',
            color: '#166534',
            border: '1px solid #4ade80',
            ...currentSize
          }}
        >
          <span>🌿</span>
          <span>Organic</span>
        </span>
      )}
      {isLocal && (
        <span
          title="This is a local product"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            borderRadius: '9999px',
            fontWeight: 'bold',
            backgroundColor: '#dbeafe',
            color: '#1e40af',
            border: '1px solid #60a5fa',
            ...currentSize
          }}
        >
          <span>📍</span>
          <span>Local</span>
        </span>
      )}
    </div>
  );
};

export default EcoFriendlyBadge;
