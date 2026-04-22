import React, { useState } from 'react';
import { useSeller } from '../store/SellerContext';
import { useAuth } from '../store/AuthContext';
import { apiClient } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { Search, CheckCircle2, AlertCircle, Loader2, Info } from 'lucide-react';

export const Setup: React.FC = () => {
  const { sellerId, seller, setSellerId, setSeller } = useSeller();
  const { role } = useAuth();
  
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId) return;
    
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await apiClient.GET("/api/v1/sellers/{sellerId}", {
        params: { path: { sellerId: parseInt(searchId, 10) } }
      });

      if (error) {
        setError((error as any).message || "Seller not found");
      } else if (data?.data) {
        setSeller(data.data);
        setSellerId(data.data.id || null);
      }
    } catch (e: any) {
      setError(e.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Account Status" 
        description="현재 로그인된 API 계정과 연동된 판매자 컨텍스트 상태를 확인합니다."
      />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm font-medium">{error}</div>
        </div>
      )}

      {sellerId && seller ? (
        <div className="bg-white border border-teal-200 rounded-xl p-8 shadow-sm text-center">
          <CheckCircle2 className="w-16 h-16 text-teal-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">판매자 연결됨 (Seller Connected)</h2>
          <p className="text-slate-500 mb-6">현재 아래의 판매자로 컨텍스트가 설정되어 있습니다.</p>
          
          <div className="inline-flex flex-col items-center gap-1 px-8 py-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Internal ID: {seller.id}</span>
            <span className="text-xl font-bold text-slate-900">{seller.sellerName}</span>
            <span className="text-sm text-slate-500">Ext ID: {seller.externalSellerId}</span>
          </div>

          <div className="mt-8">
            <button 
              onClick={() => { setSellerId(null); setSearchId(''); }}
              className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors underline underline-offset-4"
            >
              연결 해제 및 다른 판매자 선택
            </button>
          </div>
        </div>
      ) : (
        <div className={`grid grid-cols-1 ${role === 'ADMIN' ? 'md:grid-cols-2' : 'max-w-xl mx-auto'} gap-8`}>
          {/* Lookup Existing (Admin Only) */}
          {role === 'ADMIN' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                <Search className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">기존 판매자 불러오기</h2>
            </div>
            
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Seller ID</label>
                <input
                  type="number"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder="e.g. 1"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading || !searchId}
                className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white py-2.5 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "판매자 불러오기"}
              </button>
            </form>
          </div>
          )}

          {/* Empty State for Seller (when not connected) */}
          {role !== 'ADMIN' && (
            <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm text-center">
              <Info className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-900 mb-2">연결된 판매자 없음</h2>
              <p className="text-slate-500 mb-6">
                현재 계정에 연동된 판매자가 없습니다. 우측 상단의 <strong>API 인증 설정</strong>을 통해 유효한 판매자 계정으로 로그인해 주세요.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
