import React from 'react';

const MasonryGrid = ({ children, className = "" }) => {
  return (
    <div className={`columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4 ${className}`}>
      {children}
    </div>
  );
};

export default MasonryGrid;