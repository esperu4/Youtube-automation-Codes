import React from 'react';
import {
  Play,
  Activity,
  PlusCircle,
  Zap,
  Server,
  RefreshCw,
  Layers
} from 'lucide-react';
import { SystemHealthData, Channel } from '../types';

interface HeaderProps {
  systemHealth: SystemHealthData;
  channels: Channel[];
  onTriggerPlanner: () => void;
  onOpenScriptLab: () => void;
  onOpenAddChannel: () => void;
  isTriggering: boolean;
  selectedChannelId: number | 'all';
  onSelectChannel: (id: number | 'all') => void;
}

export const Header: React.FC<HeaderProps> = ({
  systemHealth,
  channels,
  onTriggerPlanner,
  onOpenScriptLab,
  onOpenAddChannel,
  isTriggering,
  selectedChannelId,
  onSelectChannel,
}) => {
  const hasTelemetry =
    systemHealth.memory_total_gb > 0 || systemHealth.cpu_pct > 0 || channels.length > 0;

  return (
    <header className="bg-white border-b border-slate-200 text-slate-800 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Brand & System Status */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
            <Play className="h-4 w-4 text-white fill-white ml-0.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-slate-900">
                SHORTS ENGINE
              </h1>
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
                n8n v1.45
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Autonomous Video Production System
            </p>
          </div>
        </div>

        {/* Channel Filter & Realtime Telemetry Badges */}
        <div className="hidden md:flex items-center gap-4 bg-slate-50 py-1.5 px-3 border border-slate-200 rounded-lg text-sm">
          {/* Channel Selector */}
          <div className="flex items-center gap-2 pr-3 border-r border-slate-200">
            <Layers className="h-4 w-4 text-slate-400" />
            <select
              value={selectedChannelId}
              onChange={(e) => onSelectChannel(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-white text-slate-800">All Channels ({channels.length})</option>
              {channels.map((c) => (
                <option key={c.id} value={c.id} className="bg-white text-slate-800">
                  {c.name} ({c.niche})
                </option>
              ))}
            </select>
          </div>

          {/* System Health Telemetry */}
          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="flex items-center gap-1.5" title="VPS vCPU Load">
              <Activity className="h-4 w-4 text-indigo-600" />
              <span className="text-slate-700 font-semibold">
                {hasTelemetry ? `${systemHealth.cpu_pct}%` : '--'}
              </span>
            </div>
            <div className="flex items-center gap-1.5" title="RAM Usage">
              <Server className="h-4 w-4 text-blue-600" />
              <span className="text-slate-700 font-semibold">
                {hasTelemetry
                  ? `${systemHealth.memory_used_gb}/${systemHealth.memory_total_gb}GB`
                  : '--'}
              </span>
            </div>
            <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-600 font-bold text-[10px] uppercase tracking-wider">
                {channels.length > 0 ? `${channels.length} active` : 'Idle'}
              </span>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          {/* AI Script Lab */}
          <button
            onClick={onOpenScriptLab}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors cursor-pointer"
          >
            <Zap className="h-4 w-4 text-amber-300 fill-amber-300" />
            <span className="hidden sm:inline">AI Short Lab</span>
          </button>

          {/* Trigger Daily Content Planner WF-01 */}
          <button
            onClick={onTriggerPlanner}
            disabled={isTriggering}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-colors disabled:opacity-50 cursor-pointer"
            title="Triggers n8n Workflow WF-01 to generate daily short tasks"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-indigo-600 ${isTriggering ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Trigger n8n Planner</span>
          </button>

          {/* Add Channel */}
          <button
            onClick={onOpenAddChannel}
            className="p-2 sm:px-3 sm:py-2 text-xs font-bold rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-colors cursor-pointer"
            title="Add new channel"
          >
            <PlusCircle className="h-4 w-4 text-slate-600 sm:hidden" />
            <span className="hidden sm:inline">+ Channel</span>
          </button>
        </div>

      </div>
    </header>
  );
};