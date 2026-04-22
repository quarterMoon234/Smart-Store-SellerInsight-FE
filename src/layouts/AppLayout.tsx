import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useSeller } from '../store/SellerContext';
import { useAuth } from '../store/AuthContext';
import {
  LayoutDashboard,
  UploadCloud,
  Activity,
  Settings,
  Lightbulb,
  Key,
  PieChart,
  User,
  LogOut,
} from 'lucide-react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import bgFlowImage from '../assets/commerce_flow_bg.png';
import { apiClient } from '../api/client';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const sellerNavItems = [
  { path: '/seller/setup', label: 'Account Status', icon: Settings },
  { path: '/seller/credentials', label: 'Credentials', icon: Key },
  { path: '/seller/import', label: 'Import CSV', icon: UploadCloud },
  { path: '/seller/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/seller/insights', label: 'Insights', icon: Lightbulb },
];

const adminNavItems = [
  { path: '/admin/pipeline', label: 'Pipeline Runs', icon: Activity },
];

export const AppLayout: React.FC = () => {
  const { sellerId, seller, setSellerId, setSeller } = useSeller();
  const { username, setAuth, clearAuth } = useAuth();
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    
    const role = authForm.username.includes('admin') ? 'ADMIN' : 'SELLER';
    
    // AuthContext's setAuth immediately saves to localStorage, which apiClient uses
    setAuth({
      username: authForm.username,
      password: authForm.password,
      role
    });

    if (role === 'SELLER') {
      try {
        const { data, error } = await apiClient.GET('/api/v1/sellers/me');
        if (data?.data) {
          setSellerId(data.data.id);
          setSeller(data.data);
        } else {
          setSellerId(null);
          setSeller(null);
        }
      } catch (err) {
        console.error('Failed to fetch seller me', err);
        setSellerId(null);
        setSeller(null);
      }
    }
    
    setIsAuthenticating(false);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    clearAuth();
    setSellerId(null);
    setSeller(null);
  };

  const setDemoAuth = (role: 'ADMIN' | 'SELLER') => {
    if (role === 'ADMIN') {
      setAuthForm({ username: 'admin', password: 'admin-1234' });
    } else {
      setAuthForm({ username: 'seller-demo', password: 'seller-demo-1234' });
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-teal-600/50 bg-gradient-to-b from-teal-700 via-teal-800 to-teal-900 flex flex-col shadow-lg z-20 shrink-0 text-teal-50">
        <div className="h-16 flex items-center px-6 border-b border-teal-600/50 bg-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-white font-extrabold text-lg tracking-wide">
            <PieChart className="w-6 h-6 text-teal-300" />
            <span>Seller Insight</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-8 overflow-y-auto">
          <div>
            <div className="text-xs text-teal-300/70 mb-2 font-bold uppercase tracking-wider px-3">General</div>
            <div className="space-y-1">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm font-semibold",
                    isActive ? "bg-teal-500 text-white shadow-md" : "text-teal-100 hover:bg-teal-600/50 hover:text-white"
                  )
                }
              >
                <Activity className="w-4 h-4" />
                Overview
              </NavLink>
            </div>
          </div>

          <div>
            <div className="text-xs text-teal-300/70 mb-2 font-bold uppercase tracking-wider px-3">Seller Workspace</div>
            <div className="space-y-1">
              {sellerNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm font-semibold",
                        isActive ? "bg-teal-500 text-white shadow-md" : "text-teal-100 hover:bg-teal-600/50 hover:text-white"
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
            <div className="text-xs text-teal-300/70 mb-2 font-bold uppercase tracking-wider px-3 flex items-center gap-1">
              Admin Console
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
                        "flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm font-semibold",
                        isActive ? "bg-teal-500 text-white shadow-md" : "text-teal-100 hover:bg-teal-600/50 hover:text-white"
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
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">
        {/* Subtle Global Background */}
        <div 
          className="absolute inset-0 opacity-[0.8] mix-blend-darken pointer-events-none z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgFlowImage})` }}
        />

        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-10 shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            {sellerId ? (
              <div className="flex items-center gap-3 text-sm text-slate-700 bg-white/80 px-4 py-2 rounded-full border border-teal-200/50 shadow-sm">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
                </span>
                <span className="font-bold text-teal-900">{seller?.sellerName || `Seller #${sellerId}`}</span>
                <span className="text-slate-300">|</span>
                <span className="font-mono text-slate-500 text-xs mt-0.5">{seller?.externalSellerId || 'N/A'}</span>
                <span className="text-slate-300">|</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-teal-50 text-teal-600 border border-teal-100">
                  {seller?.status || 'CONNECTED'}
                </span>
              </div>
            ) : username && !username.includes('admin') ? (
              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-full border border-amber-200 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                판매자 계정이 연결되지 않았습니다.
              </div>
            ) : (
              <div className="text-sm text-slate-400 italic">No Seller Context</div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {username ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{username}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowAuthModal(true)}
                className="text-sm font-medium text-teal-600 bg-teal-50 px-4 py-1.5 rounded-full border border-teal-200 hover:bg-teal-100 transition-colors"
              >
                API 인증 설정
              </button>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">API 인증 설정 (Basic Auth)</h2>
              <p className="text-sm text-slate-500 mt-1">API 요청에 사용할 자격 증명을 입력하세요.</p>
            </div>
            <form onSubmit={handleLogin} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                <input 
                  type="text" 
                  value={authForm.username}
                  onChange={e => setAuthForm({...authForm, username: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input 
                  type="password" 
                  value={authForm.password}
                  onChange={e => setAuthForm({...authForm, password: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                  required
                />
              </div>
              
              <div className="pt-2 flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setDemoAuth('ADMIN')}
                  className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded hover:bg-slate-200 transition-colors"
                >
                  Fill Admin
                </button>
                <button 
                  type="button" 
                  onClick={() => setDemoAuth('SELLER')}
                  className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded hover:bg-slate-200 transition-colors"
                >
                  Fill Seller
                </button>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowAuthModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isAuthenticating}
                  className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-md shadow hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
                >
                  {isAuthenticating ? '연결 중...' : '적용'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
