import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useSeller } from '../store/SellerContext';
import { PageHeader } from '../components/PageHeader';
import { Badge } from '../components/Badge';
import { Activity, Server, ArrowRight, Zap, Database, UploadCloud, LayoutDashboard } from 'lucide-react';
import type { components } from '../api/v1';
import bgImage from '../assets/ecommerce_bg.png';

type HealthStatus = components['schemas']['HealthCheckResponse'];

export const Overview: React.FC = () => {
  const navigate = useNavigate();
  const { sellerId } = useSeller();
  
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const { data } = await apiClient.GET('/api/v1/health');
        if (data?.data) {
          setHealth(data.data);
        }
      } catch (e) {
        console.error('Health check failed', e);
      } finally {
        setLoading(false);
      }
    };
    fetchHealth();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Banner with Generated Image */}
      <div className="relative overflow-hidden rounded-2xl bg-white p-8 md:p-12 shadow-sm border border-slate-200">
        <div 
          className="absolute inset-0 opacity-[0.15] mix-blend-multiply bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-teal-50/95 via-white/80 to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <Badge status="OPERATIONS CONSOLE" className="mb-4 !bg-teal-100 !text-teal-700 border-teal-200" />
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-slate-900">
            Seller Insight Overview
          </h1>
          <p className="text-slate-600 text-lg leading-relaxed max-w-xl font-medium">
            시스템 전반의 상태를 확인하고 파이프라인 관리를 비롯한 주요 액션을 빠르게 실행할 수 있는 데이터 기반의 통합 관리 콘솔입니다.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* System Health */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Server className="w-5 h-5 text-slate-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">시스템 상태 (System Health)</h2>
          </div>
          
          {loading ? (
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-500">API 서버</span>
                <Badge status={health?.status === 'UP' ? 'SUCCESS' : 'FAILED'} />
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-500">데이터베이스</span>
                <span className="text-sm font-bold text-slate-700">{health?.database || '알 수 없음'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-slate-500">활성 프로필</span>
                <span className="text-sm font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded">
                  {health?.activeProfiles?.join(', ') || '없음'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Current Context */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-teal-50 rounded-lg">
              <Activity className="w-5 h-5 text-teal-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">현재 접속 상태</h2>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-sm text-slate-500 font-semibold mb-1">선택된 판매자 ID</div>
              {sellerId ? (
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-slate-900">{sellerId}</span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400 italic">없음</span>
                  <button 
                    onClick={() => navigate('/seller/setup')}
                    className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                  >
                    판매자 선택 &rarr;
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-violet-50 rounded-lg">
              <Zap className="w-5 h-5 text-violet-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">빠른 실행</h2>
          </div>
          
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/seller/import')}
              className="w-full flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <UploadCloud className="w-4 h-4 text-slate-400 group-hover:text-violet-600 transition-colors" />
                <span className="text-sm font-semibold text-slate-700">CSV 파일 Import</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
            <button 
              onClick={() => navigate('/seller/dashboard')}
              className="w-full flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
                <span className="text-sm font-semibold text-slate-700">대시보드 보기</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Data Flow Diagram (Conceptual) */}
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-6">데이터 처리 흐름 (Data Processing Flow)</h2>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1 bg-slate-50 border border-slate-200 p-4 rounded-lg text-center w-full">
            <div className="font-bold text-slate-800 mb-1">1. 데이터 수집</div>
            <div className="text-xs text-slate-500">CSV 업로드 또는 네이버 연동</div>
          </div>
          <ArrowRight className="w-6 h-6 text-slate-300 hidden md:block" />
          <div className="flex-1 bg-slate-50 border border-slate-200 p-4 rounded-lg text-center w-full">
            <div className="font-bold text-slate-800 mb-1">2. 데이터 정규화</div>
            <div className="text-xs text-slate-500">주문 내역 표준화 변환</div>
          </div>
          <ArrowRight className="w-6 h-6 text-slate-300 hidden md:block" />
          <div className="flex-1 bg-slate-50 border border-slate-200 p-4 rounded-lg text-center w-full">
            <div className="font-bold text-slate-800 mb-1">3. 지표 집계</div>
            <div className="text-xs text-slate-500">일별/기간별 판매 지표 계산</div>
          </div>
          <ArrowRight className="w-6 h-6 text-slate-300 hidden md:block" />
          <div className="flex-1 bg-slate-50 border border-slate-200 p-4 rounded-lg text-center w-full">
            <div className="font-bold text-slate-800 mb-1">4. 인사이트 도출</div>
            <div className="text-xs text-slate-500">규칙 기반 문제 분석 및 액션 추천</div>
          </div>
        </div>
      </div>
    </div>
  );
};
