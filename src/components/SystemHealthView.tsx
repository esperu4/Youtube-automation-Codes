import React, { useState } from 'react';
import {
  Cpu,
  Server,
  Activity,
  AlertCircle,
  RefreshCw,
  Sliders,
  CheckCircle2,
  XCircle,
  Zap,
  ShieldAlert,
  Database,
  Layers,
  Check,
  AlertTriangle
} from 'lucide-react';
import { SystemHealthData, AIModelConfig, DLQTask } from '../types';

interface SystemHealthViewProps {
  health: SystemHealthData;
  models: AIModelConfig[];
  dlqTasks: DLQTask[];
  onRetryDlqTask: (id: string) => void;
  onUpdateModel: (id: string, updates: Partial<AIModelConfig>) => void;
}

export const SystemHealthView: React.FC<SystemHealthViewProps> = ({
  health,
  models,
  dlqTasks,
  onRetryDlqTask,
  onUpdateModel,
}) => {
  const [activeTab, setActiveTab] = useState<'containers' | 'ai_models' | 'dlq'>('containers');

  return (
    <div className="space-y-6">
      
      {/* Header Controls */}
      <div className="bg-white border border-slate-200 rounded-none p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="h-5 w-5 text-indigo-600" />
            System Observability & AI Model Routing
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Docker Compose container stack, multi-provider model routing, and Dead Letter Queue (DLQ) processing
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-none border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('containers')}
            className={`px-3 py-1.5 rounded-none text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === 'containers' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Container Stack ({health.containers.length})
          </button>
          <button
            onClick={() => setActiveTab('ai_models')}
            className={`px-3 py-1.5 rounded-none text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === 'ai_models' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            AI Models & Fallbacks ({models.filter((m) => m.is_active).length})
          </button>
          <button
            onClick={() => setActiveTab('dlq')}
            className={`px-3 py-1.5 rounded-none text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === 'dlq' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dead Letter Queue ({dlqTasks.length})
          </button>
        </div>
      </div>

      {/* TAB 1: Containers Inventory */}
      {activeTab === 'containers' && (
        <div className="space-y-6">
          
          {/* Top Status Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-none p-4 flex items-center justify-between shadow-sm">
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Circuit Breaker Status</div>
                <div className="text-lg font-bold text-emerald-600 mt-0.5 font-mono">
                  {health.circuit_breaker} (Normal)
                </div>
              </div>
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>

            <div className="bg-white border border-slate-200 rounded-none p-4 flex items-center justify-between shadow-sm">
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active n8n Workflows</div>
                <div className="text-lg font-bold text-indigo-600 mt-0.5 font-mono">
                  {health.active_workflows_running} Running
                </div>
              </div>
              <Layers className="h-6 w-6 text-indigo-600" />
            </div>

            <div className="bg-white border border-slate-200 rounded-none p-4 flex items-center justify-between shadow-sm">
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Redis Stream Consumer Lag</div>
                <div className="text-lg font-bold text-amber-600 mt-0.5 font-mono">
                  {health.redis_queue_lag} msgs
                </div>
              </div>
              <Activity className="h-6 w-6 text-amber-600" />
            </div>
          </div>

          {/* Docker Container Table */}
          <div className="bg-white border border-slate-200 rounded-none p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Server className="h-4 w-4 text-indigo-600" />
                  Docker Compose Container Stack Inventory (PDF Chapter 2.3)
                </h3>
                <p className="text-xs text-slate-500">9 Core services running on single VPS instance</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="text-[10px] uppercase tracking-widest font-bold bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Container Name</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Docker Image</th>
                    <th className="py-2.5 px-3">vCPU %</th>
                    <th className="py-2.5 px-3">RAM</th>
                    <th className="py-2.5 px-3">Uptime</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {health.containers.map((container, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-bold font-sans text-slate-900">{container.name}</td>
                      <td className="py-3 px-3 font-sans font-semibold text-slate-700">{container.role}</td>
                      <td className="py-3 px-3 text-slate-500">{container.image}</td>
                      <td className="py-3 px-3 font-bold text-indigo-600">{container.cpu_pct}%</td>
                      <td className="py-3 px-3 font-bold text-blue-600">{container.memory_mb} MB</td>
                      <td className="py-3 px-3 text-slate-500">{container.uptime}</td>
                      <td className="py-3 px-3 text-right">
                        <span className="px-2 py-0.5 rounded-none text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase font-sans">
                          {container.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: AI Multi-Model Strategy (PDF Chapter 9) */}
      {activeTab === 'ai_models' && (
        <div className="bg-white border border-slate-200 rounded-none p-5 space-y-4 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
              Multi-Model AI Routing & Provider Comparison Matrix (PDF Chapter 9.2)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Intelligent fallback chains and cost optimization across OpenAI, Gemini, Claude, DeepSeek, Qwen & Llama
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="text-[10px] uppercase tracking-widest font-bold bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Provider & Model</th>
                  <th className="py-2.5 px-3">Quality Rating</th>
                  <th className="py-2.5 px-3">Cost / 1K Tokens</th>
                  <th className="py-2.5 px-3">Latency</th>
                  <th className="py-2.5 px-3">Primary Best Use Case</th>
                  <th className="py-2.5 px-3">Priority Rank</th>
                  <th className="py-2.5 px-3 text-right">Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {models.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{m.model}</div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold">{m.provider}</div>
                    </td>

                    <td className="py-3 px-3 font-bold text-emerald-600">{m.quality}</td>

                    <td className="py-3 px-3 font-mono font-bold text-slate-800">
                      ${m.cost_per_1k_input} / ${m.cost_per_1k_output}
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-500 font-bold">{m.latency}</td>

                    <td className="py-3 px-3 text-slate-700 font-medium max-w-xs">{m.best_use_case}</td>

                    <td className="py-3 px-3 font-bold text-indigo-600">#{m.priority}</td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onUpdateModel(m.id, { is_active: !m.is_active })}
                        className={`px-2.5 py-1 rounded-none text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                          m.is_active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {m.is_active ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Dead Letter Queue (DLQ) */}
      {activeTab === 'dlq' && (
        <div className="bg-white border border-slate-200 rounded-none p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                Dead Letter Queue (DLQ) & Failure Recovery (PDF Chapter 17.2)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tasks that exhausted max retry attempts in n8n error handler WF-15
              </p>
            </div>
            <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-none text-xs font-mono font-bold">
              {dlqTasks.length} Failed Task(s)
            </span>
          </div>

          <div className="space-y-3">
            {dlqTasks.map((dlq) => (
              <div
                key={dlq.id}
                className="bg-slate-50 border border-rose-200 rounded-none p-4 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{dlq.task_name}</span>
                    <span className="px-2 py-0.5 rounded-none bg-white border border-slate-200 text-slate-700 font-mono text-[10px] font-bold">
                      {dlq.workflow_id}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">{dlq.created_at}</span>
                </div>

                <div className="text-rose-700 font-mono bg-rose-50/50 p-2.5 rounded-none border border-rose-200 text-[11px] font-semibold">
                  {dlq.error_message}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px]">
                  <div className="flex items-center gap-3 text-slate-500 font-medium">
                    <span>Channel: <strong className="text-slate-800 font-bold">{dlq.channel_name}</strong></span>
                    <span>Category: <strong className="text-amber-700 font-bold">{dlq.failure_category}</strong></span>
                    <span>Retries: <strong className="text-slate-800 font-mono font-bold">{dlq.retry_count}/{dlq.max_retries}</strong></span>
                  </div>

                  <button
                    onClick={() => onRetryDlqTask(dlq.id)}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-none text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RefreshCw className="h-3 w-3" /> Re-Queue Task
                  </button>
                </div>
              </div>
            ))}

            {dlqTasks.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-300 rounded-none font-semibold">
                Dead Letter Queue is empty. All n8n workflows running cleanly!
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
