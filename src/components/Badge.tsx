import React from 'react';

type BadgeStatus = 'SUCCESS' | 'FAILED' | 'RUNNING' | 'PARTIAL_SUCCESS' | 'PENDING' | 'PROCESSING' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';

interface BadgeProps {
  status: BadgeStatus | string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  let colorClass = 'bg-slate-100 text-slate-600 border-slate-200';

  switch (status) {
    case 'SUCCESS':
    case 'COMPLETED':
      colorClass = 'bg-teal-50 text-teal-700 border-teal-200';
      break;
    case 'FAILED':
    case 'HIGH':
      colorClass = 'bg-red-50 text-red-700 border-red-200';
      break;
    case 'RUNNING':
    case 'PROCESSING':
    case 'MEDIUM':
      colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
      break;
    case 'PARTIAL_SUCCESS':
      colorClass = 'bg-yellow-50 text-yellow-700 border-yellow-200';
      break;
    case 'LOW':
      colorClass = 'bg-blue-50 text-blue-700 border-blue-200';
      break;
    case 'PENDING':
      colorClass = 'bg-slate-50 text-slate-600 border-slate-200';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClass} ${className}`}>
      {status}
    </span>
  );
};
