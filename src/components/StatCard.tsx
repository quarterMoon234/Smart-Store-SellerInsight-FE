import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  subValue?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, subValue, className = '' }) => {
  return (
    <div className={`bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-slate-500">{title}</span>
        {Icon && <Icon className="w-5 h-5 text-teal-600" />}
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        {subValue && (
          <div className="mt-1 text-xs text-slate-500 font-medium">{subValue}</div>
        )}
      </div>
    </div>
  );
};
