import React, { useState, useEffect } from 'react';
import { useSeller } from '../store/SellerContext';
import { apiClient } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { AlertCircle, Loader2, DollarSign, ShoppingCart, Lightbulb, Box, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

export const Dashboard: React.FC = () => {
  const { sellerId } = useSeller();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [metricTrend, setMetricTrend] = useState<any[]>([]);

  const fetchDashboard = async () => {
    if (!sellerId) return;
    setLoading(true);
    setError(null);
    try {
      const dashRes = await apiClient.GET("/api/v1/sellers/{sellerId}/dashboard", {
        params: { 
          path: { sellerId },
          query: { metricDays: 7, insightLimit: 5 }
        }
      });

      if ((dashRes as any).error) throw new Error((dashRes as any).error.message || "Failed to fetch dashboard");
      
      const dashData = dashRes.data?.data;
      setDashboardData(dashData);
      
      if (dashData?.metricTrend) {
         const sortedMetrics = [...dashData.metricTrend].sort((a, b) => 
           new Date(a.metricDate!).getTime() - new Date(b.metricDate!).getTime()
         );
         setMetricTrend(sortedMetrics);
      } else {
         setMetricTrend([]);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [sellerId]);

  if (!sellerId) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <PageHeader title="Seller Dashboard" description="판매자 지표와 최근 인사이트 요약입니다." />
        <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-lg flex items-center gap-2 font-medium">
          <AlertCircle className="w-5 h-5" />
          <span>Seller가 선택되지 않았습니다. Setup 화면에서 Seller를 먼저 생성해주세요.</span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
        <span className="font-medium">Loading metrics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <PageHeader title="Seller Dashboard" />
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-2 font-medium">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const latestMetric = dashboardData?.latestMetric || {};
  const recentInsights = dashboardData?.recentInsights || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-start justify-between">
        <PageHeader 
          title="Seller Dashboard" 
          description={`${dashboardData?.sellerName || sellerId} 판매자의 최신 요약 데이터입니다 (기준일: ${dashboardData?.latestMetricDate || 'N/A'})`}
        />
        <button 
          onClick={fetchDashboard}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          새로고침
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="총 주문 수" 
          value={latestMetric.orderCount?.toLocaleString() || 0} 
          icon={ShoppingCart} 
        />
        <StatCard 
          title="총 매출액" 
          value={`₩${latestMetric.salesAmount?.toLocaleString() || 0}`} 
          icon={DollarSign} 
        />
        <StatCard 
          title="품절 상품 수" 
          value={latestMetric.soldOutProductCount?.toLocaleString() || 0} 
          icon={Box} 
          className={latestMetric.soldOutProductCount > 0 ? 'border-amber-300 bg-amber-50' : ''}
        />
        <StatCard 
          title="장기 미판매 상품" 
          value={latestMetric.staleProductCount?.toLocaleString() || 0} 
          icon={AlertCircle} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6">최근 {dashboardData?.metricTrendDays || 7}일 지표 추이 (Metrics Trend)</h2>
          {metricTrend.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-center px-4">
              <p className="font-medium mb-1">아직 집계된 일별 지표가 없습니다.</p>
              <p className="text-sm">Admin Console에서 이전 날짜와 대상 날짜 파이프라인을 실행해 주세요.</p>
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metricTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="metricDate" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="salesAmount" name="Sales (₩)" stroke="#0f766e" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line yAxisId="right" type="monotone" dataKey="orderCount" name="Orders" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              최근 인사이트 (Recent Insights)
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3">
            {recentInsights.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm font-medium py-10">
                발견된 인사이트가 없습니다.
              </div>
            ) : (
              recentInsights.map((insight: any) => (
                <div key={insight.insightId || insight.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      insight.severity === 'HIGH' ? 'bg-red-100 text-red-700' :
                      insight.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {insight.severity}
                    </span>
                    <span className="text-[10px] text-slate-500">{insight.metricDate}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 truncate" title={insight.title || insight.type}>
                    {insight.title || insight.type}
                  </h3>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
