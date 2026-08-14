import React, { useEffect, useState } from 'react';
import {
  Settings,
  KeyRound,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Link2,
  ExternalLink,
  Eye,
  EyeOff,
  Server,
  ShieldCheck
} from 'lucide-react';
import { SetupStatus } from '../types';

export const SetupView: React.FC = () => {
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [geminiKey, setGeminiKey] = useState('');
  const [n8nBaseUrl, setN8nBaseUrl] = useState('');
  const [n8nApiKey, setN8nApiKey] = useState('');
  const [ytClientId, setYtClientId] = useState('');
  const [ytClientSecret, setYtClientSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [provisioning, setProvisioning] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/setup');
      if (res.ok) {
        const data: SetupStatus = await res.json();
        setStatus(data);
        if (data.config.n8nBaseUrl) setN8nBaseUrl(data.config.n8nBaseUrl);
      }
    } catch (e) {
      showToast('Could not reach backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveGemini = async () => {
    if (!geminiKey.trim()) return showToast('Enter a Gemini API key.');
    setSaving('gemini');
    try {
      const res = await fetch('/api/setup/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: geminiKey }),
      });
      const data = await res.json();
      showToast(data.message || (data.error || 'Saved.'));
      setGeminiKey('');
      await load();
    } catch (e) {
      showToast('Failed to save Gemini key.');
    } finally {
      setSaving(null);
    }
  };

  const saveN8n = async () => {
    if (!n8nBaseUrl.trim()) return showToast('Enter the n8n base URL.');
    setSaving('n8n');
    try {
      const res = await fetch('/api/setup/n8n', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base_url: n8nBaseUrl, api_key: n8nApiKey }),
      });
      const data = await res.json();
      showToast(data.connected ? 'n8n connected — credentials listed.' : data.error || 'n8n URL saved.');
      setN8nApiKey('');
      await load();
    } catch (e) {
      showToast('Failed to save n8n connection.');
    } finally {
      setSaving(null);
    }
  };

  const saveYouTube = async () => {
    if (!ytClientId.trim() || !ytClientSecret.trim()) return showToast('Enter both Client ID and Secret.');
    setSaving('youtube');
    try {
      const res = await fetch('/api/setup/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: ytClientId, client_secret: ytClientSecret }),
      });
      const data = await res.json();
      showToast(data.message || data.error || 'Saved.');
      setYtClientId('');
      setYtClientSecret('');
      await load();
    } catch (e) {
      showToast('Failed to save YouTube credentials.');
    } finally {
      setSaving(null);
    }
  };

  const provision = async (type: string) => {
    setProvisioning(type);
    try {
      const res = await fetch('/api/setup/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      showToast(data.message || data.error || 'Provisioning completed.');
      await load();
    } catch (e) {
      showToast('Provisioning failed.');
    } finally {
      setProvisioning(null);
    }
  };

  const n8nWorkflowUrl = status?.config.n8nBaseUrl
    ? `${status.config.n8nBaseUrl}/workflow/7oAToOHlGUWQbF29`
    : null;
  const n8nCredentialsUrl = status?.config.n8nBaseUrl
    ? `${status.config.n8nBaseUrl}/credentials`
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Settings className="h-5 w-5 text-indigo-600" />
          Setup & Credentials
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Add every credential the Shorts Factory needs to run — mirrored from the n8n template flow. Missing credentials block the orchestrator from running.
        </p>
      </div>

      {/* Requirements checklist */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-slate-400" /> Required Credentials
          </h3>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {loading && !status ? (
          <p className="text-sm text-slate-400 py-6 text-center">Loading setup status…</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {(status?.requirements || []).map((req) => (
              <div
                key={req.id}
                className={`border rounded-xl p-4 flex flex-col gap-2 ${
                  req.configured ? 'border-emerald-300 bg-emerald-50/60' : 'border-rose-300 bg-rose-50/60'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-bold text-slate-900 text-sm">{req.name}</div>
                  {req.configured ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Configured
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                      <XCircle className="h-3.5 w-3.5" /> Missing
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600">{req.description}</p>
                <div className="text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-600">Used by:</span>{' '}
                  {req.requiredBy.join(', ')}
                </div>
                {req.detail && (
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {req.detail}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* n8n connection status */}
        <div className="mt-5 border-t border-slate-100 pt-4 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-slate-400" />
            <span className="font-semibold text-slate-700">n8n instance:</span>
            <span className="text-slate-600">{status?.config.n8nBaseUrl || 'not configured'}</span>
          </div>
          <span
            className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              status?.n8n.reachable
                ? 'bg-emerald-100 text-emerald-700'
                : status?.n8n.reachable === false
                ? 'bg-rose-100 text-rose-700'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            <Server className="h-3 w-3" />
            {status?.n8n.connected
              ? 'Connected'
              : status?.n8n.reachable
              ? 'Reachable (no API key)'
              : status?.n8n.reachable === false
              ? 'Unreachable'
              : 'Not checked'}
          </span>
          {status?.n8n.error && <span className="text-rose-600">{status.n8n.error}</span>}
        </div>
      </div>

      {/* Gemini */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-indigo-500" /> 1 · Google Gemini API key
        </h3>
        <p className="text-xs text-slate-500 mt-1 mb-3">
          The orchestrator's WF-02 / WF-08 Gemini nodes and the AI Script Lab all use this key. Get one at{' '}
          <a className="text-indigo-600 underline" href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">
            Google AI Studio
          </a>
          .
        </p>
        <div className="flex gap-2 flex-wrap">
          <input
            type={showSecret ? 'text' : 'password'}
            value={geminiKey}
            onChange={(e) => setGeminiKey(e.target.value)}
            placeholder="Paste Gemini API key"
            className="flex-1 min-w-[220px] px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => setShowSecret((s) => !s)}
            className="p-2 rounded-lg border border-slate-300 text-slate-500 hover:bg-slate-50 cursor-pointer"
            title="Toggle visibility"
          >
            {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <button
            onClick={saveGemini}
            disabled={saving === 'gemini'}
            className="px-4 py-2 text-sm font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 cursor-pointer"
          >
            {saving === 'gemini' ? 'Saving…' : 'Save key'}
          </button>
        </div>
        {status?.n8n.connected && (
          <button
            onClick={() => provision('googleGeminiApi')}
            disabled={provisioning !== null}
            className="mt-3 px-4 py-2 text-sm font-bold rounded-lg bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-50 cursor-pointer"
          >
            {provisioning === 'googleGeminiApi' ? 'Provisioning…' : 'Provision this key into n8n'}
          </button>
        )}
      </div>

      {/* YouTube OAuth2 */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-red-500" /> 2 · YouTube OAuth2 (WF-10 publish)
        </h3>
        <p className="text-xs text-slate-500 mt-1 mb-3">
          Create a Google Cloud OAuth2 credential (Web application) with the YouTube Data API v3 enabled, then add both
          values below. See{' '}
          <a
            className="text-indigo-600 underline"
            href="https://docs.n8n.io/integrations/builtin/credentials/google/oauth-single-service/"
            target="_blank"
            rel="noreferrer"
          >
            n8n's Google OAuth setup guide
          </a>
          .
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            type="text"
            value={ytClientId}
            onChange={(e) => setYtClientId(e.target.value)}
            placeholder="Client ID (…apps.googleusercontent.com)"
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type={showSecret ? 'text' : 'password'}
            value={ytClientSecret}
            onChange={(e) => setYtClientSecret(e.target.value)}
            placeholder="Client Secret"
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="mt-3 flex gap-2 flex-wrap">
          <button
            onClick={saveYouTube}
            disabled={saving === 'youtube'}
            className="px-4 py-2 text-sm font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 cursor-pointer"
          >
            {saving === 'youtube' ? 'Saving…' : 'Save credentials'}
          </button>
          {status?.n8n.connected && (
            <button
              onClick={() => provision('youTubeOAuth2Api')}
              disabled={provisioning !== null}
              className="px-4 py-2 text-sm font-bold rounded-lg bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-50 cursor-pointer"
            >
              {provisioning === 'youTubeOAuth2Api' ? 'Provisioning…' : 'Create in n8n (then Connect in UI)'}
            </button>
          )}
        </div>
        <div className="mt-3 text-[11px] text-slate-500">
          Tip: after provisioning, open the credential in n8n and click the green <b>Connect account</b> button —
          OAuth consent must finish in the n8n UI.
        </div>
      </div>

      {/* n8n connection */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Server className="h-4 w-4 text-slate-500" /> 3 · n8n connection (optional auto-provision)
        </h3>
        <p className="text-xs text-slate-500 mt-1 mb-3">
          Paste a public API key from n8n <i>Settings → n8n API</i> so the dashboard can detect and create credentials
          for you. Without a key you can still save the base URL and finish credentials manually in the n8n UI.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            type="text"
            value={n8nBaseUrl}
            onChange={(e) => setN8nBaseUrl(e.target.value)}
            placeholder="https://your-n8n.example.com"
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type={showSecret ? 'text' : 'password'}
            value={n8nApiKey}
            onChange={(e) => setN8nApiKey(e.target.value)}
            placeholder="n8n API key (X-N8N-API-KEY)"
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="mt-3">
          <button
            onClick={saveN8n}
            disabled={saving === 'n8n'}
            className="px-4 py-2 text-sm font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 cursor-pointer"
          >
            {saving === 'n8n' ? 'Saving…' : 'Save & test connection'}
          </button>
        </div>
        {status && status.n8n.credentials.length > 0 && (
          <div className="mt-4">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Credentials detected in n8n
            </div>
            <ul className="space-y-1">
              {status.n8n.credentials.map((c) => (
                <li key={c.id} className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    {c.name}
                  </span>
                  <span className="text-slate-400 font-mono">{c.type}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Deep links */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Or open in n8n</h3>
        <div className="flex flex-wrap gap-3">
          {n8nCredentialsUrl && (
            <a
              href={n8nCredentialsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-800"
            >
              <ExternalLink className="h-4 w-4" /> n8n Credentials
            </a>
          )}
          {n8nWorkflowUrl && (
            <a
              href={n8nWorkflowUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-800"
            >
              <ExternalLink className="h-4 w-4" /> Shorts Factory orchestrator
            </a>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700 font-medium text-sm flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-indigo-400"></span>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
};