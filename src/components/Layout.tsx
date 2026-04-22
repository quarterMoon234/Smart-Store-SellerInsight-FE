import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useSeller } from '../store/SellerContext';
import { 
  LayoutDashboard, 
  UploadCloud, 
  Activity, 
  Settings,
  Lightbulb
} from 'lucide-react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const sellerNavItems = [
  { path: '/', label: 'Setup', icon: Settings },
  { path: '/import', label: 'Import CSV', icon: UploadCloud },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/insights', label: 'Insights', icon: Lightbulb },
];

const adminNavItems = [
  { path: '/pipeline', label: 'Pipeline Runs', icon: Activity },
];

export const Layout: React.FC = () => {
  const { sellerId } = useSeller();

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 bg-white flex flex-col shadow-sm z-20">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center gap-2 text-violet-600 font-bold text-lg tracking-wide">
            <Activity className="w-6 h-6" />
            <span>Seller Insight</span>
          </div>
        </div>
        
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wider">Current Context</div>
          {sellerId ? (
            <div className="flex items-center gap-2 text-sm text-violet-700 bg-violet-50 px-3 py-2 rounded-md border border-violet-100">
              <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></span>
              Seller ID: <strong>{sellerId}</strong>
            </div>
          ) : (
            <div className="text-sm text-gray-400 italic px-1">
              No Seller Selected
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          <div>
            <div className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider px-1">Seller Console</div>
            <div className="space-y-1">
              {sellerNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium",
                        isActive 
                          ? "bg-violet-600 text-white shadow-md shadow-violet-200" 
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                      )
                    }
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider px-1 flex items-center gap-1">
              Operations <span className="bg-red-50 text-red-600 text-[10px] px-1.5 py-0.5 rounded border border-red-100 ml-1">Admin</span>
            </div>
            <div className="space-y-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium",
                        isActive 
                          ? "bg-red-600 text-white shadow-md shadow-red-200" 
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                      )
                    }
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>
        </nav>
        
        <div className="p-4 border-t border-gray-100 text-xs text-gray-400 text-center font-medium">
          Demo Frontend v1.0
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50">
        <header className="h-16 flex items-center px-8 border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
          <h1 className="text-xl font-bold text-gray-800">
            {/* Title could be dynamic based on route, but for simplicity we rely on page headers */}
          </h1>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">
             <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};
