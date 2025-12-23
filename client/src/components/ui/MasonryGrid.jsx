import React from 'react';

const MasonryGrid = ({ children, className = "" }) => {
  return (
    // columns-1 (моб) -> columns-2 (планшет) -> columns-3 (ноут) -> columns-4 (великий екран)
    // gap-4 - відступи між колонками
    // space-y-4 - відступи між елементами по вертикалі
    <div className={`columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4 ${className}`}>
      {children}
    </div>
  );
};

export default MasonryGrid;