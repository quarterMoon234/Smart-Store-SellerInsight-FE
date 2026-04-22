import React, { useState, useEffect } from 'react';
import { useSeller } from '../store/SellerContext';
import { apiClient } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { Key, ShieldCheck, AlertCircle, Loader2, Save, RefreshCw } from 'lucide-react';
import type { components } from '../api/v1';

type CredentialResponse = components['schemas']['SellerCredentialResponse'];

export const Credentials: React.FC = () => {
  const { sellerId } = useSeller();
  
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const [credential, setCredential] = useState<CredentialResponse | null>(null);
  
  const [form, setForm] = useState({
    clientId: '',
    clientSecret: ''
  });

  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    if (sellerId) {
      fetchCredential();
    }
  }, [sellerId]);

  const fetchCredential = async () => {
    if (!sellerId) return;
    setLoading(true);
    try {
      const { data, error } = await apiClient.GET("/api/v1/sellers/{sellerId}/credentials", {
        params: { path: { sellerId } }
      });
      if (!error && data?.data) {
        setCredential(data.data);
        setForm({ clientId: data.data.clientId || '', clientSecret: '' });
      } else {
        setCredential(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerId) return;
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    setTestResult(null);

    try {
      const { data, error } = await apiClient.PUT("/api/v1/sellers/{sellerId}/credentials", {
        params: { path: { sellerId } },
        body: form
      });

      if (error) {
        setError((error as any).message || "Failed to save credentials");
      } else if (data?.data) {
        setSuccessMsg("Credentials saved successfully.");
        setCredential(data.data);
        setForm(prev => ({ ...prev, clientSecret: '' })); // clear secret after save
      }
    } catch (e: any) {
      setError(e.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleTestToken = async () => {
    if (!sellerId) return;
    setTesting(true);
    setError(null);
    setSuccessMsg(null);
    setTestResult(null);

    try {
      const { data, error } = await apiClient.POST("/api/v1/sellers/{sellerId}/auth/token", {
        params: { path: { sellerId } }
      });

      if (error) {
        setTestResult({ success: false, error: (error as any).message || "Token issue failed", details: error });
      } else {
        setTestResult({ success: true, data: data?.data });
      }
    } catch (e: any) {
      setTestResult({ success: false, error: e.message || "Network error" });
    } finally {
      setTesting(false);
    }
  };

  if (!sellerId) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <PageHeader title="API Credentials" description="네이버 커머스 연동을 위한 자격 증명 설정입니다." />
        <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-lg flex items-center gap-2 font-medium">
          <AlertCircle className="w-5 h-5" />
          <span>Seller Context가 없습니다. 먼저 Setup에서 Seller를 선택해주세요.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="API Credentials" 
        description="네이버 커머스 연동을 위한 Client ID와 Client Secret을 설정하고 토큰 발급을 테스트합니다." 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Settings Form */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
              <Key className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">자격 증명 설정 (Credential Settings)</h2>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm font-medium">{error}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-lg flex items-start gap-3 text-teal-700">
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm font-medium">{successMsg}</div>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Client ID</label>
              <input
                type="text"
                value={form.clientId}
                onChange={(e) => setForm({...form, clientId: e.target.value})}
                placeholder="네이버 커머스 Client ID를 입력하세요"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 font-mono text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Client Secret</label>
              <input
                type="password"
                value={form.clientSecret}
                onChange={(e) => setForm({...form, clientSecret: e.target.value})}
                placeholder={credential?.clientSecretMasked ? "(기존 값을 유지하려면 비워두세요)" : "네이버 커머스 Client Secret을 입력하세요"}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-900 font-mono text-sm"
                required={!credential?.clientSecretMasked}
              />
              {credential?.clientSecretMasked && (
                <p className="text-xs text-slate-500 mt-2 font-medium">
                  현재 Secret: <code className="bg-slate-100 px-1 rounded">{credential.clientSecretMasked}</code>
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white py-2 px-5 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                설정 저장
              </button>
            </div>
          </form>
        </div>

        {/* Test Connection */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-violet-50 rounded-lg text-violet-600">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">연동 테스트 (Connection Test)</h2>
          </div>

          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            저장된 연동 정보를 사용하여 실제로 액세스 토큰 발급이 가능한지 테스트합니다.
            올바른 Client ID와 Secret이 저장되어 있어야 합니다.
          </p>

          <button
            onClick={handleTestToken}
            disabled={testing || !credential}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white py-2.5 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          >
            {testing ? <Loader2 className="w-5 h-5 animate-spin" /> : "액세스 토큰 발급"}
          </button>

          {testResult && (
            <div className={`flex-1 rounded-lg border p-4 ${testResult.success ? 'bg-teal-50 border-teal-200' : 'bg-red-50 border-red-200'}`}>
              <h3 className={`font-bold text-sm mb-3 ${testResult.success ? 'text-teal-800' : 'text-red-800'}`}>
                {testResult.success ? '토큰 발급 성공' : '토큰 발급 실패'}
              </h3>
              
              <div className="bg-white border border-slate-200 rounded p-3 overflow-x-auto text-xs font-mono text-slate-700">
                <pre>
                  {JSON.stringify(testResult.success ? testResult.data : testResult.error, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
