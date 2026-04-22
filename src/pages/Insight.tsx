import React, { useState, useEffect } from 'react';
import { useSeller } from '../store/SellerContext';
import { apiClient } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { Badge } from '../components/Badge';
import { Lightbulb, AlertCircle, Loader2, Calendar, Search, ArrowRight, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

export const Insight: React.FC = () => {
  const { sellerId } = useSeller();
  const [targetDate, setTargetDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [insights, setInsights] = useState<any[]>([]);
  const [selectedInsightId, setSelectedInsightId] = useState<number | null>(null);
  const [selectedInsightDetail, setSelectedInsightDetail] = useState<any>(null);

  const fetchInsights = async () => {
    if (!sellerId || !targetDate) return;
    setLoading(true);
    setError(null);
    setInsights([]);
    setSelectedInsightId(null);
    setSelectedInsightDetail(null);
    try {
      const { data, error } = await apiClient.GET("/api/v1/sellers/{sellerId}/insights", {
        params: { path: { sellerId }, query: { date: targetDate } }
      });
      if (error) {
        setError((error as any).message || "Failed to fetch insights");
      } else if (data?.data?.insights) {
        setInsights(data.data.insights);
      }
    } catch (e: any) {
      setError(e.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  const fetchInsightDetail = async (insightId: number) => {
    if (!sellerId) return;
    setDetailLoading(true);
    setSelectedInsightId(insightId);
    setSelectedInsightDetail(null);
    try {
      const { data, error } = await apiClient.GET("/api/v1/sellers/{sellerId}/insights/{insightId}", {
        params: { path: { sellerId, insightId } }
      });
      if (!error && data?.data) {
        setSelectedInsightDetail(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    if (sellerId) {
      fetchInsights();
    }
  }, [sellerId, targetDate]);

  if (!sellerId) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <PageHeader title="Seller Insights" description="특정 날짜에 생성된 인사이트와 추천 액션을 조회합니다." />
        <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-lg flex items-center gap-2 font-medium">
          <AlertCircle className="w-5 h-5" />
          <span>Seller가 선택되지 않았습니다. Setup 화면에서 Seller를 먼저 생성해주세요.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-in fade-in duration-500">
      <div className="shrink-0 mb-6">
        <PageHeader 
          title="Seller Insights" 
          description="데이터 기반으로 분석된 문제 상황과 이를 해결하기 위한 추천 액션입니다."
          action={
            <div className="flex items-center gap-2">
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <button 
                onClick={fetchInsights}
                className="p-2 bg-slate-800 hover:bg-slate-900 text-white rounded-md shadow-sm transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Left: List */}
        <div className="md:col-span-1 bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              인사이트 목록
            </h2>
            <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full font-bold">
              {insights.length}
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-slate-50/50">
            {loading ? (
              <div className="flex items-center justify-center py-8 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : error ? (
              <div className="p-4 text-red-600 text-sm text-center font-medium bg-red-50 rounded">{error}</div>
            ) : insights.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm font-medium">
                해당 날짜에 발견된 인사이트가 없습니다.
              </div>
            ) : (
              insights.map((insight) => (
                <button
                  key={insight.insightId || insight.id}
                  onClick={() => fetchInsightDetail(insight.insightId || insight.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedInsightId === (insight.insightId || insight.id) 
                      ? 'bg-teal-50 border-teal-200 shadow-sm ring-1 ring-teal-500/20' 
                      : 'bg-white border-transparent hover:border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <Badge status={insight.severity} />
                    <span className="text-[10px] text-slate-400 font-mono">{insight.insightType || insight.type}</span>
                  </div>
                  <h3 className={`font-bold text-sm truncate ${
                    selectedInsightId === (insight.insightId || insight.id) ? 'text-teal-900' : 'text-slate-800'
                  }`}>
                    {insight.title || insight.type}
                  </h3>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: Details */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
          {detailLoading ? (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
               <Loader2 className="w-8 h-8 mb-4 animate-spin text-teal-600" />
             </div>
          ) : selectedInsightDetail ? (
            <div className="flex-1 overflow-y-auto">
              <div className="p-8 border-b border-slate-200 bg-white">
                <div className="flex items-center gap-3 mb-4">
                  <Badge status={selectedInsightDetail.severity} />
                  <span className="text-sm text-slate-500 font-medium font-mono bg-slate-100 px-2 py-0.5 rounded">
                    {selectedInsightDetail.insightType || selectedInsightDetail.type}
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-3">
                  {selectedInsightDetail.title || selectedInsightDetail.type}
                </h2>
                <p className="text-slate-600 text-lg leading-relaxed">{selectedInsightDetail.summary}</p>
              </div>

              {/* Recommendations */}
              {selectedInsightDetail.recommendations && selectedInsightDetail.recommendations.length > 0 && (
                <div className="p-8 border-b border-slate-200 bg-teal-50/30">
                  <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    추천 액션 (Recommended Actions)
                  </h3>
                  <div className="space-y-4">
                    {selectedInsightDetail.recommendations.map((rec: any, idx: number) => (
                      <div key={idx} className="p-4 bg-white border border-teal-200 rounded-lg shadow-sm flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 mb-1">{rec.actionTitle}</h4>
                          <p className="text-sm text-slate-600 mb-2">{rec.actionMessage}</p>
                          <div className="text-xs text-slate-400 font-mono">Action Code: {rec.actionCode}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Evidence */}
              {selectedInsightDetail.evidenceJson && (
                <div className="p-8 bg-slate-50">
                  <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    근거 데이터 (Evidence Data)
                  </h3>
                  <div className="bg-slate-900 rounded-lg p-4 shadow-inner overflow-x-auto">
                    <pre className="text-xs text-slate-300 font-mono">
                      {JSON.stringify(JSON.parse(selectedInsightDetail.evidenceJson), null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
              <Lightbulb className="w-12 h-12 mb-4 text-slate-200" />
              <p className="font-medium text-slate-500">좌측 목록에서 인사이트를 선택하여 상세 내용과 추천 액션을 확인하세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
