import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { Badge } from '../components/Badge';
import { Activity, Database, AlertTriangle, Play, RefreshCw, XCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

export const Pipeline: React.FC = () => {
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [bootstrapLoading, setBootstrapLoading] = useState(false);
  const [bootstrapResult, setBootstrapResult] = useState<any>(null);
  const [scenario, setScenario] = useState<'default' | 'large'>('large');

  const [runDate, setRunDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [runningPipeline, setRunningPipeline] = useState(false);
  const [runResult, setRunResult] = useState<any>(null);

  const [lockDate, setLockDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [unlocking, setUnlocking] = useState(false);

  const [selectedRunId, setSelectedRunId] = useState<number | null>(null);
  const [runDetail, setRunDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchRuns = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await apiClient.GET("/api/v1/admin/pipelines/daily/runs");
      if (error) {
        setError((error as any).message || "Failed to fetch runs");
      } else if (data?.data) {
        setRuns(data.data);
      }
    } catch (e: any) {
      setError(e.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  const handleBootstrap = async () => {
    if (!window.confirm("WARNING: 이 작업은 기존의 모든 데이터를 삭제하고 초기화합니다. 진행하시겠습니까?")) return;
    
    setBootstrapLoading(true);
    setBootstrapResult(null);
    try {
      const { data, error } = await apiClient.POST("/api/v1/admin/sample-data/bootstrap", {
        params: { query: { scenario } }
      });
      if (error) {
        setBootstrapResult({ success: false, error: (error as any).message });
      } else {
        setBootstrapResult({ success: true, data: data?.data });
        if (data?.data?.previousMetricDate) {
          setRunDate(data.data.previousMetricDate);
        }
      }
    } catch (e: any) {
      setBootstrapResult({ success: false, error: e.message });
    } finally {
      setBootstrapLoading(false);
    }
  };

  const handleRunPipeline = async () => {
    setRunningPipeline(true);
    setRunResult(null);
    try {
      const { data, error } = await apiClient.POST("/api/v1/admin/pipelines/daily", {
        params: { query: { date: runDate } }
      });
      if (error) {
        setRunResult({ success: false, error: (error as any).message });
      } else {
        setRunResult({ success: true, data: data?.data });
        fetchRuns();
      }
    } catch (e: any) {
      setRunResult({ success: false, error: e.message });
    } finally {
      setRunningPipeline(false);
    }
  };

  const handleReleaseLock = async () => {
    if (!window.confirm(`${lockDate}의 파이프라인 락을 강제로 해제하시겠습니까? 데이터 정합성 문제가 발생할 수 있습니다.`)) return;
    setUnlocking(true);
    try {
      const { error } = await apiClient.DELETE("/api/v1/admin/pipelines/daily/locks/{metricDate}", {
        params: { path: { metricDate: lockDate } }
      });
      if (error) {
        alert("Failed to release lock: " + ((error as any).message || "Unknown"));
      } else {
        alert("Lock released successfully.");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setUnlocking(false);
    }
  };

  const fetchRunDetail = async (runId: number) => {
    setSelectedRunId(runId);
    setDetailLoading(true);
    setRunDetail(null);
    try {
      const { data, error } = await apiClient.GET("/api/v1/admin/pipelines/daily/runs/{runId}", {
        params: { path: { runId } }
      });
      if (data?.data) {
        setRunDetail(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Admin Pipeline Console" 
        description="시스템 전반의 파이프라인 실행, 모니터링 및 데모용 데이터를 관리하는 운영 콘솔입니다." 
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bootstrap Data */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
              <Database className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Sample Data Bootstrap</h2>
          </div>
          <div className="mb-6 space-y-3">
            <label className={`block p-3 border rounded-lg cursor-pointer transition-colors ${scenario === 'default' ? 'bg-slate-50 border-teal-500 ring-1 ring-teal-500' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <input type="radio" name="scenario" value="default" checked={scenario === 'default'} onChange={() => setScenario('default')} className="text-teal-600 focus:ring-teal-500" />
                <span className="font-bold text-slate-900">default</span>
              </div>
              <p className="text-sm text-slate-500 pl-6">판매자 2명, 상품 5개, 주문 14건. 빠른 기능 확인용.</p>
            </label>

            <label className={`block p-3 border rounded-lg cursor-pointer transition-colors ${scenario === 'large' ? 'bg-rose-50 border-rose-500 ring-1 ring-rose-500' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <input type="radio" name="scenario" value="large" checked={scenario === 'large'} onChange={() => setScenario('large')} className="text-rose-600 focus:ring-rose-500" />
                <span className="font-bold text-slate-900">large</span>
                <span className="text-xs font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">WARNING</span>
              </div>
              <p className="text-sm text-slate-500 pl-6">판매자 30명, 상품 600개, 주문 4,800건. 기존 데이터를 초기화하며 시간이 소요됩니다. 전체 파이프라인/Grafana/성능 확인용.</p>
            </label>
          </div>

          <button 
            onClick={handleBootstrap}
            disabled={bootstrapLoading}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white py-2.5 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {bootstrapLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />}
            초기화 및 샘플 데이터 생성
          </button>

          {bootstrapResult && (
            <div className={`mt-4 p-4 rounded-lg border text-sm ${bootstrapResult.success ? 'bg-teal-50 border-teal-200 text-teal-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
              {bootstrapResult.success ? (
                <>
                  <div className="font-bold flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4" /> Bootstrap Successful
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-teal-700">
                    <li>Scenario: <strong>{bootstrapResult.data.scenario}</strong></li>
                    <li>Previous Date: <strong>{bootstrapResult.data.previousMetricDate}</strong></li>
                    <li>Target Date: <strong>{bootstrapResult.data.targetMetricDate}</strong></li>
                    <li>Sellers Created: {bootstrapResult.data.sellerCount}</li>
                    <li>Products Created: {bootstrapResult.data.productCount}</li>
                    <li>Orders Generated: {bootstrapResult.data.orderCount}</li>
                    <li>Order Items Generated: {bootstrapResult.data.orderItemCount}</li>
                  </ul>
                  {bootstrapResult.data.sellers && bootstrapResult.data.sellers.length > 0 && (
                    <div className="mt-3 p-3 bg-teal-100/50 rounded border border-teal-200 text-teal-900">
                      <div className="text-xs font-bold mb-1 uppercase tracking-wider text-teal-700">First Seller Created</div>
                      <div className="font-semibold">{bootstrapResult.data.sellers[0].sellerName}</div>
                      <div className="text-xs text-teal-700">ID: {bootstrapResult.data.sellers[0].sellerId} | Ext: {bootstrapResult.data.sellers[0].externalSellerId}</div>
                    </div>
                  )}
                </>
              ) : (
                <div className="font-bold flex items-center gap-2">
                  <XCircle className="w-4 h-4" /> {bootstrapResult.error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Run Pipeline */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
              <Play className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Run Daily Pipeline</h2>
          </div>
          <p className="text-sm text-slate-500 mb-6">
            특정 날짜를 기준으로 전체 판매자의 주문 데이터를 집계하고 인사이트를 생성합니다.
          </p>

          <div className="flex gap-3 mb-4">
            <input 
              type="date" 
              value={runDate}
              onChange={e => setRunDate(e.target.value)}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            />
            <button 
              onClick={handleRunPipeline}
              disabled={runningPipeline}
              className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white py-2 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {runningPipeline ? <RefreshCw className="w-5 h-5 animate-spin" /> : "파이프라인 실행"}
            </button>
          </div>

          {runResult && (
            <div className={`mt-2 p-4 rounded-lg border text-sm ${runResult.success ? 'bg-teal-50 border-teal-200 text-teal-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
              {runResult.success ? (
                <>
                  <div className="font-bold flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4" /> Pipeline Triggered
                  </div>
                  <div className="text-teal-700">Run ID: {runResult.data.runId} | Status: {runResult.data.status}</div>
                </>
              ) : (
                <div className="font-bold flex items-center gap-2">
                  <XCircle className="w-4 h-4" /> {runResult.error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline History */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3">
               <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                 <Activity className="w-5 h-5" />
               </div>
               <h2 className="text-lg font-bold text-slate-900">실행 이력 (Execution History)</h2>
             </div>
             <button 
               onClick={fetchRuns}
               disabled={loading}
               className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
             >
               <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
             </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-xs border-y border-slate-200">
                <tr>
                  <th className="px-4 py-3">Run ID</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Sellers (Success/Fail)</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {runs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400 font-medium">No execution history found</td>
                  </tr>
                ) : (
                  runs.map(run => (
                    <tr 
                      key={run.id} 
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${selectedRunId === run.id ? 'bg-teal-50/30' : ''}`}
                      onClick={() => fetchRunDetail(run.id)}
                    >
                      <td className="px-4 py-3 font-mono font-medium text-slate-900">#{run.id}</td>
                      <td className="px-4 py-3 text-slate-600 font-medium">{run.metricDate}</td>
                      <td className="px-4 py-3"><Badge status={run.status} /></td>
                      <td className="px-4 py-3 text-slate-600">
                        {run.processedSellerCount} / {run.failedSellerCount > 0 ? <span className="text-red-600 font-bold">{run.failedSellerCount}</span> : '0'}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{(run.durationMs / 1000).toFixed(1)}s</td>
                      <td className="px-4 py-3 text-right">
                        <ChevronRight className={`w-4 h-4 inline-block ${selectedRunId === run.id ? 'text-teal-600' : 'text-slate-300'}`} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right side: Detail & Danger Zone */}
        <div className="lg:col-span-1 space-y-6">
          {/* Run Detail */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col min-h-[300px]">
             <h2 className="text-lg font-bold text-slate-900 mb-4">실행 상세 (Run Detail)</h2>
             
             {detailLoading ? (
               <div className="flex-1 flex items-center justify-center">
                 <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
               </div>
             ) : runDetail ? (
               <div className="space-y-4 text-sm">
                 <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                   <div className="flex justify-between">
                     <span className="text-slate-500 font-medium">Insights Generated:</span>
                     <span className="font-bold text-slate-900">{runDetail.run?.generatedInsightCount}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-slate-500 font-medium">Triggered By:</span>
                     <span className="font-medium text-slate-900">{runDetail.run?.triggerType}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-slate-500 font-medium">Total Sellers:</span>
                     <span className="font-medium text-slate-900">{runDetail.run?.totalSellerCount}</span>
                   </div>
                 </div>

                 {runDetail.items && runDetail.items.length > 0 && (
                   <div>
                     <h3 className="font-bold text-slate-900 mb-2">항목 로그 (Item Logs)</h3>
                     <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                       {runDetail.items.map((item: any) => (
                         <div key={item.id} className={`p-2.5 rounded border text-xs ${item.status === 'SUCCESS' ? 'bg-white border-slate-200' : 'bg-red-50 border-red-200'}`}>
                           <div className="flex justify-between mb-1">
                             <span className="font-mono font-bold text-slate-700">Seller: {item.sellerId}</span>
                             <Badge status={item.status} className="!text-[9px] !px-1.5 !py-0" />
                           </div>
                           {item.errorMessage && (
                             <div className="text-red-600 mt-1">{item.errorMessage}</div>
                           )}
                           <div className="text-slate-400 mt-1 flex justify-between">
                             <span>Insights: {item.generatedInsightCount}</span>
                             <span>{item.durationMs}ms</span>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
               </div>
             ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                 <p className="font-medium">내역을 클릭하여 상세 정보를 확인하세요.</p>
               </div>
             )}
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm">
             <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg text-red-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-red-900">Danger Zone</h2>
            </div>
            <p className="text-xs text-red-700 mb-4 font-medium">
              파이프라인 실행 중 오류로 인해 남겨진 Lock을 강제로 해제합니다.
            </p>
            <div className="flex gap-2">
               <input 
                type="date" 
                value={lockDate}
                onChange={e => setLockDate(e.target.value)}
                className="w-full px-3 py-2 border border-red-200 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 font-medium text-sm bg-white"
               />
               <button 
                 onClick={handleReleaseLock}
                 disabled={unlocking}
                 className="whitespace-nowrap px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-bold text-sm disabled:opacity-50"
               >
                 {unlocking ? "Wait..." : "Lock 해제"}
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
