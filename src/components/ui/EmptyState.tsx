// src/components/ui/EmptyState.tsx
import React from 'react';

export const EmptyState: React.FC<{ title?: string; subtitle?: string }> = ({ title = 'Nothing here', subtitle }) => {
  return (
    <div className="py-12 text-center text-gray-500">
      <div className="text-xl font-semibold mb-2">{title}</div>
      {subtitle ? <div className="text-sm">{subtitle}</div> : null}
    </div>
  );
};
