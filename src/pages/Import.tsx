import React, { useState } from 'react';
import { useSeller } from '../store/SellerContext';
import { apiClient } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { Badge } from '../components/Badge';
import { UploadCloud, File, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

export const Import: React.FC = () => {
  const { sellerId } = useSeller();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [jobId, setJobId] = useState<number | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const [jobStats, setJobStats] = useState<{ total: number; success: number; failed: number } | null>(null);
  const [checking, setChecking] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!sellerId) {
      setError("Seller ID가 필요합니다. Setup 탭에서 먼저 생성해주세요.");
      return;
    }
    if (!file) {
      setError("업로드할 파일을 선택해주세요.");
      return;
    }

    setLoading(true);
    setError(null);
    setJobId(null);
    setJobStatus(null);
    setJobStats(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
      
      const res = await fetch(`${API_BASE_URL}/api/v1/sellers/${sellerId}/import-jobs/orders/csv`, {
        method: "POST",
        body: formData,
        // Fetch manually bypassing OpenAPI client because of multipart/form-data complexity in some versions
        headers: (() => {
          const stored = localStorage.getItem('sellerinsight_auth');
          if (stored) {
            try {
              const auth = JSON.parse(stored);
              if (auth.username && auth.password) {
                return { 'Authorization': `Basic ${btoa(`${auth.username}:${auth.password}`)}` };
              }
            } catch (e) {}
          }
          return {};
        })()
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || data.message || "Failed to upload file");
      }

      if (data?.data?.id) {
        setJobId(data.data.id);
        setJobStatus(data.data.status);
      }
    } catch (e: any) {
      setError(e.message || "Upload error");
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    if (!sellerId || !jobId) return;
    setChecking(true);
    try {
      const { data, error } = await apiClient.GET("/api/v1/sellers/{sellerId}/import-jobs/{importJobId}", {
        params: { path: { sellerId, importJobId: jobId } }
      });

      if (error) {
        setError((error as any).message || "Failed to fetch status");
      } else if (data?.data) {
        setJobStatus(data.data.status || null);
        if (data.data.totalRowCount !== undefined) {
           setJobStats({
             total: data.data.totalRowCount || 0,
             success: data.data.successRowCount || 0,
             failed: data.data.failedRowCount || 0
           });
        }
      }
    } catch (e: any) {
      setError(e.message || "Network error");
    } finally {
      setChecking(false);
    }
  };

  if (!sellerId) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <PageHeader title="Data Import" description="판매자 데이터를 CSV로 수동 적재합니다." />
        <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-lg flex items-center gap-2 font-medium">
          <AlertCircle className="w-5 h-5" />
          <span>Seller가 선택되지 않았습니다. Setup 화면에서 Seller를 먼저 생성해주세요.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Data Import" 
        description="판매자의 주문 데이터를 CSV 형태로 업로드합니다. 백엔드에서 정규화 및 적재를 비동기로 수행합니다." 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
              <UploadCloud className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">CSV 업로드 (Upload CSV)</h2>
          </div>
          
          <div className="space-y-4">
            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              file ? 'border-teal-500 bg-teal-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
            }`}>
              <input
                type="file"
                id="file-upload"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
                disabled={loading}
              />
              <label 
                htmlFor="file-upload"
                className={`cursor-pointer flex flex-col items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <File className={`w-8 h-8 mb-2 ${file ? 'text-teal-500' : 'text-slate-400'}`} />
                {file ? (
                  <span className="text-teal-700 font-bold">{file.name}</span>
                ) : (
                  <>
                    <span className="text-slate-700 font-semibold">클릭하여 CSV 파일 선택</span>
                    <span className="text-slate-500 text-sm">docs/orders-insight-test.csv 권장</span>
                  </>
                )}
              </label>
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white py-2.5 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "데이터 업로드"}
            </button>
            
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700 text-sm font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {jobId && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col">
             <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">작업 추적 (Import Job Tracking)</h2>
              <button 
                onClick={checkStatus} 
                disabled={checking}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
                새로고침
              </button>
            </div>
            
            <div className="space-y-4 flex-1">
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Job ID</span>
                <span className="font-mono text-slate-900 font-bold">{jobId}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Status</span>
                <Badge status={jobStatus || 'UNKNOWN'} />
              </div>
              
              {jobStats && (
                <div className="grid grid-cols-3 gap-4 mt-6">
                   <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center shadow-sm">
                     <div className="text-xs text-slate-500 mb-1 font-semibold uppercase">Total</div>
                     <div className="text-2xl font-black text-slate-800">{jobStats.total.toLocaleString()}</div>
                   </div>
                   <div className="bg-teal-50 p-4 rounded-xl border border-teal-200 text-center shadow-sm">
                     <div className="text-xs text-teal-600 mb-1 font-semibold uppercase">Success</div>
                     <div className="text-2xl font-black text-teal-700">{jobStats.success.toLocaleString()}</div>
                   </div>
                   <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-center shadow-sm">
                     <div className="text-xs text-red-600 mb-1 font-semibold uppercase">Failed</div>
                     <div className="text-2xl font-black text-red-700">{jobStats.failed.toLocaleString()}</div>
                   </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
