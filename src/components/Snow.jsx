import React, { memo } from 'react';
import './Snow.css';

const Snow = memo(() => {
  return (
    <div className="snow-container">
      {[...Array(50)].map((_, index) => (
        <div key={index} className="snow" />
      ))}
      <div className="gradient-overlay" />
    </div>
  );
});

Snow.displayName = 'Snow';

export default Snow; 