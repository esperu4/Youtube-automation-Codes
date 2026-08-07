import React, { useState } from 'react';
import {
  Tv2,
  PlusCircle,
  Play,
  Pause,
  RefreshCw,
  Cpu,
  Clock,
  DollarSign,
  Users,
  Eye,
  Sliders,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { Channel } from '../types';

interface ChannelsViewProps {
  channels: Channel[];
  onAddChannel: (channel: Partial<Channel>) => void;
  onUpdateChannel: (id: number, updates: Partial<Channel>) => void;
  onTriggerPlannerForChannel: (channelId: number) => void;
  isTriggering: boolean;
}

export const ChannelsView: React.FC<ChannelsViewProps> = ({
  channels,
  onAddChannel,
  onUpdateChannel,
  onTriggerPlannerForChannel,
  isTriggering,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);

  // Form states for add modal
  const [name, setName] = useState('');
  const [niche, setNiche] = useState('AI & Technology');
  const [audience, setAudience] = useState('Tech enthusiasts 18-35');
  const [modelConfig, setModelConfig] = useState('gemini-3.6-flash');
  const [dailyUploads, setDailyUploads] = useState(3);
  const [cron, setCron] = useState('0 9,15,21 * * *');
  const [budgetUsd, setBudgetUsd] = useState(1.5);

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddChannel({
      name,
      niche,
      target_audience: audience,
      ai_model_config_id: modelConfig,
      max_daily_uploads: dailyUploads,
      schedule_cron: cron,
      daily_budget_usd: budgetUsd,
    });
    setName('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-none p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Tv2 className="h-5 w-5 text-indigo-600" />
            Channel Portfolio Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure niches, AI model preferences, publication schedules, and daily upload caps
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-none text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow transition-colors cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add New Channel</span>
        </button>
      </div>

      {/* Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {channels.map((channel) => {
          const isActive = channel.status === 'active';
          return (
            <div
              key={channel.id}
              className="bg-white border border-slate-200 rounded-none p-5 space-y-4 shadow-sm hover:border-indigo-600 transition-colors flex flex-col justify-between"
            >
              <div>
                {/* Channel Header & Status Toggle */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      {channel.name}
                    </h3>
                    <span className="text-xs text-indigo-600 font-bold uppercase tracking-wider">{channel.niche}</span>
                  </div>

                  <button
                    onClick={() =>
                      onUpdateChannel(channel.id, {
                        status: isActive ? 'paused' : 'active',
                      })
                    }
                    className={`px-2.5 py-1 rounded-none text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer border ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {isActive ? (
                      <>
                        <Play className="h-3 w-3 fill-emerald-600" /> Active
                      </>
                    ) : (
                      <>
                        <Pause className="h-3 w-3 fill-amber-600" /> Paused
                      </>
                    )}
                  </button>
                </div>

                {/* Target Audience & Stats */}
                <div className="mt-3 space-y-3 text-xs">
                  <p className="text-slate-500 text-[11px] line-clamp-2">
                    <span className="font-bold text-slate-700 uppercase tracking-wider">Audience:</span> {channel.target_audience}
                  </p>

                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-none border border-slate-200 text-[11px]">
                    <div>
                      <div className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Subs</div>
                      <div className="font-bold text-slate-900 font-mono">
                        {(channel.subscribers / 1000).toFixed(1)}k
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Views</div>
                      <div className="font-bold text-slate-900 font-mono">
                        {(channel.total_views / 1000000).toFixed(2)}M
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">VTR</div>
                      <div className="font-bold text-emerald-600 font-mono">{channel.avg_vtr}%</div>
                    </div>
                  </div>

                  {/* Model & Cron Config */}
                  <div className="space-y-1.5 pt-1 text-[11px]">
                    <div className="flex justify-between text-slate-500">
                      <span className="flex items-center gap-1 font-semibold">
                        <Cpu className="h-3.5 w-3.5 text-indigo-600" /> AI Engine:
                      </span>
                      <span className="font-bold text-slate-800 uppercase">{channel.ai_model_config_id}</span>
                    </div>

                    <div className="flex justify-between text-slate-500">
                      <span className="flex items-center gap-1 font-semibold">
                        <Clock className="h-3.5 w-3.5 text-blue-600" /> Cron Schedule:
                      </span>
                      <span className="font-mono font-bold text-slate-700">{channel.schedule_cron}</span>
                    </div>

                    <div className="flex justify-between text-slate-500">
                      <span className="flex items-center gap-1 font-semibold">
                        <DollarSign className="h-3.5 w-3.5 text-emerald-600" /> Daily Spend:
                      </span>
                      <span className="font-mono font-bold text-emerald-600">
                        ${channel.current_daily_spend_usd.toFixed(2)} / ${channel.daily_budget_usd.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2 text-xs">
                <button
                  onClick={() => onTriggerPlannerForChannel(channel.id)}
                  disabled={isTriggering}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-none font-bold uppercase tracking-wider text-[10px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Zap className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
                  <span>Run WF-01 Planner</span>
                </button>

                <button
                  onClick={() => setEditingChannel(channel)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-none font-bold cursor-pointer transition-colors"
                >
                  <Sliders className="h-3.5 w-3.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* ADD CHANNEL MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-none max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Tv2 className="h-5 w-5 text-indigo-600" />
                Provision New Content Channel
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitAdd} className="space-y-4 text-xs text-slate-700">
              <div>
                <label className="block font-bold uppercase tracking-wider text-[10px] mb-1 text-slate-500">Channel Display Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Quantum AI Insights"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-none px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[10px] mb-1 text-slate-500">Content Niche</label>
                  <input
                    type="text"
                    required
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-none px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[10px] mb-1 text-slate-500">Preferred AI Model</label>
                  <select
                    value={modelConfig}
                    onChange={(e) => setModelConfig(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-none px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-indigo-600 cursor-pointer"
                  >
                    <option value="gemini-3.6-flash">Gemini 3.6 Flash (Fast & Cost-Effective)</option>
                    <option value="gpt-4o">GPT-4o (High Quality Scripting)</option>
                    <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Emotional Nuance)</option>
                    <option value="deepseek-v3">DeepSeek V3 (Budget Bulk)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-[10px] mb-1 text-slate-500">Target Audience Description</label>
                <textarea
                  rows={2}
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-none px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[10px] mb-1 text-slate-500">Daily Uploads</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={dailyUploads}
                    onChange={(e) => setDailyUploads(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-none px-3 py-2 text-slate-900 font-bold font-mono focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[10px] mb-1 text-slate-500">Schedule Cron</label>
                  <input
                    type="text"
                    value={cron}
                    onChange={(e) => setCron(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-none px-3 py-2 text-slate-900 font-mono text-[11px] focus:outline-none focus:border-indigo-600 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[10px] mb-1 text-slate-500">Daily Budget ($)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={budgetUsd}
                    onChange={(e) => setBudgetUsd(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-none px-3 py-2 text-slate-900 font-bold font-mono focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-none text-[11px] font-bold uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-none text-[11px] font-bold uppercase tracking-wider cursor-pointer shadow"
                >
                  Provision Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CHANNEL MODAL */}
      {editingChannel && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                Edit Channel Settings: {editingChannel.name}
              </h3>
              <button
                onClick={() => setEditingChannel(null)}
                className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div>
                <label className="block font-medium mb-1 text-slate-200">Channel Name</label>
                <input
                  type="text"
                  value={editingChannel.name}
                  onChange={(e) => setEditingChannel({ ...editingChannel, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium mb-1 text-slate-200">Cron Schedule Expression</label>
                <input
                  type="text"
                  value={editingChannel.schedule_cron}
                  onChange={(e) => setEditingChannel({ ...editingChannel, schedule_cron: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1 text-slate-200">Daily Upload Cap</label>
                  <input
                    type="number"
                    value={editingChannel.max_daily_uploads}
                    onChange={(e) => setEditingChannel({ ...editingChannel, max_daily_uploads: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-slate-200">Daily API Budget ($)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingChannel.daily_budget_usd}
                    onChange={(e) => setEditingChannel({ ...editingChannel, daily_budget_usd: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingChannel(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateChannel(editingChannel.id, editingChannel);
                    setEditingChannel(null);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold cursor-pointer shadow"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
