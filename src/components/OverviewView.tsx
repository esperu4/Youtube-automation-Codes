import React, { useState } from 'react';
import {
  Tv2,
  Video,
  Eye,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Play,
  Cpu,
  Server,
  HardDrive
} from 'lucide-react';
import { Channel, VideoItem, SystemHealthData, AnalyticsOverview } from '../types';

interface OverviewViewProps {
  channels: Channel[];
  videos: VideoItem[];
  systemHealth: SystemHealthData;
  analytics: AnalyticsOverview;
  onSelectVideo: (video: VideoItem) => void;
  onApproveVideo: (id: number) => void;
  onRejectVideo: (id: number) => void;
  onNavigateToQueue: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  channels,
  videos,
  systemHealth,
  analytics,
  onSelectVideo,
  onApproveVideo,
  onRejectVideo,
  onNavigateToQueue,
}) => {
  const [activePipelineTab, setActivePipelineTab] = useState<'all' | 'from_scratch' | 'longform_conversion'>('all');

  const totalChannels = channels.length;
  const activeChannels = channels.filter((c) => c.status === 'active').length;
  const publishedThisWeek = analytics.videos_published_this_week;
  const pendingReview = videos.filter((v) => v.status === 'review' || v.stage === 'quality_check');

  const filteredVideos = videos.filter((v) => {
    if (activePipelineTab === 'all') return true;
    return v.pipeline_type === activePipelineTab;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Channels */}
        <div className="bg-white border border-slate-200 rounded-none p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-widest font-bold text-slate-400">Managed Channels</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-none">
              <Tv2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-light tracking-tight text-slate-900 font-mono">
              {activeChannels} <span className="text-xs font-normal text-slate-400">/ {totalChannels} active</span>
            </div>
            <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-bold uppercase tracking-wider">
              <span>Capacity for 100+ channels on VPS</span>
            </div>
          </div>
        </div>

        {/* Card 2: Videos Published This Week */}
        <div className="bg-white border border-slate-200 rounded-none p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-widest font-bold text-slate-400">Published This Week</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-none">
              <Video className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-light tracking-tight text-slate-900 font-mono">
              {publishedThisWeek} <span className="text-xs font-normal text-slate-400">Shorts</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-semibold">
              <Clock className="h-3 w-3 text-indigo-600" />
              <span>Avg ~3 Shorts / channel / day</span>
            </div>
          </div>
        </div>

        {/* Card 3: Avg View Count / VTR */}
        <div className="bg-white border border-slate-200 rounded-none p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-widest font-bold text-slate-400">Avg Views per Short</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-none">
              <Eye className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-light tracking-tight text-slate-900 font-mono">
              {(analytics.avg_view_count / 1000).toFixed(1)}k
            </div>
            <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-bold uppercase tracking-wider">
              <span>71.4% Avg VTR Rate</span>
            </div>
          </div>
        </div>

        {/* Card 4: System Health % */}
        <div className="bg-white border border-slate-200 rounded-none p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-widest font-bold text-slate-400">System Health</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-none">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-light tracking-tight text-slate-900 font-mono">
              {analytics.system_health_pct}%
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-semibold">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>9 Docker Services Active</span>
            </div>
          </div>
        </div>

      </div>

      {/* 2. Production Pipelines Flow Visualizer Panel */}
      <div className="bg-white border border-slate-200 rounded-none p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              Autonomous Production Pipelines Status
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live progression of tasks across the 18+ n8n workflows
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
            <button
              onClick={() => setActivePipelineTab('all')}
              className={`px-3 py-1.5 rounded-none font-bold transition-colors cursor-pointer ${
                activePipelineTab === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Pipelines
            </button>
            <button
              onClick={() => setActivePipelineTab('from_scratch')}
              className={`px-3 py-1.5 rounded-none font-bold transition-colors cursor-pointer ${
                activePipelineTab === 'from_scratch'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Pipeline 1: From-Scratch
            </button>
            <button
              onClick={() => setActivePipelineTab('longform_conversion')}
              className={`px-3 py-1.5 rounded-none font-bold transition-colors cursor-pointer ${
                activePipelineTab === 'longform_conversion'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Pipeline 2: Long-Form to Short
            </button>
          </div>
        </div>

        {/* Visual Workflow Steps (Pipeline 1 & 2) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1">
          
          {/* Phase 1 */}
          <div className="bg-slate-50 border border-slate-200 border-t-2 border-t-indigo-600 p-4 rounded-none space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-indigo-700 uppercase tracking-wider text-[11px]">Phase 1: Ideation</span>
              <span className="px-1.5 py-0.5 rounded-none text-[10px] bg-white border border-slate-200 text-slate-600 font-mono font-bold">
                WF-01 - WF-02
              </span>
            </div>
            <div className="text-xs text-slate-900 font-bold">Trend Analysis & Topic Selection</div>
            <p className="text-[11px] text-slate-500">YouTube Trending, Twitter/X & Reddit keyword research</p>
            <div className="text-[10px] text-slate-600 pt-2 border-t border-slate-200 flex items-center justify-between font-mono">
              <span>Active in queue:</span>
              <span className="font-bold text-indigo-600">{videos.filter(v => v.stage === 'research').length} tasks</span>
            </div>
          </div>

          {/* Phase 2 */}
          <div className="bg-slate-50 border border-slate-200 border-t-2 border-t-blue-600 p-4 rounded-none space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-blue-700 uppercase tracking-wider text-[11px]">Phase 2: Asset Gen</span>
              <span className="px-1.5 py-0.5 rounded-none text-[10px] bg-white border border-slate-200 text-slate-600 font-mono font-bold">
                WF-03 - WF-06
              </span>
            </div>
            <div className="text-xs text-slate-900 font-bold">Scripting, TTS & Visual Assets</div>
            <p className="text-[11px] text-slate-500">Multi-model LLM scripting, ElevenLabs TTS & image gen</p>
            <div className="text-[10px] text-slate-600 pt-2 border-t border-slate-200 flex items-center justify-between font-mono">
              <span>Active in queue:</span>
              <span className="font-bold text-blue-600">{videos.filter(v => v.stage === 'scripting' || v.stage === 'asset_gen').length} tasks</span>
            </div>
          </div>

          {/* Phase 3 */}
          <div className="bg-slate-50 border border-slate-200 border-t-2 border-t-purple-600 p-4 rounded-none space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-purple-700 uppercase tracking-wider text-[11px]">Phase 3: Composition</span>
              <span className="px-1.5 py-0.5 rounded-none text-[10px] bg-white border border-slate-200 text-slate-600 font-mono font-bold">
                WF-07 Composer
              </span>
            </div>
            <div className="text-xs text-slate-900 font-bold">FFmpeg Rendering & Subtitles</div>
            <p className="text-[11px] text-slate-500">1080x1920 9:16 vertical video assembly & audio ducking</p>
            <div className="text-[10px] text-slate-600 pt-2 border-t border-slate-200 flex items-center justify-between font-mono">
              <span>Active in queue:</span>
              <span className="font-bold text-purple-600">{videos.filter(v => v.stage === 'composition').length} tasks</span>
            </div>
          </div>

          {/* Phase 4 */}
          <div className="bg-slate-50 border border-slate-200 border-t-2 border-t-emerald-600 p-4 rounded-none space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-700 uppercase tracking-wider text-[11px]">Phase 4: Publishing</span>
              <span className="px-1.5 py-0.5 rounded-none text-[10px] bg-white border border-slate-200 text-slate-600 font-mono font-bold">
                WF-08 - WF-10
              </span>
            </div>
            <div className="text-xs text-slate-900 font-bold">Quality Gate & Upload</div>
            <p className="text-[11px] text-slate-500">Hook analysis check, SEO metadata & scheduled post</p>
            <div className="text-[10px] text-slate-600 pt-2 border-t border-slate-200 flex items-center justify-between font-mono">
              <span>Ready / Published:</span>
              <span className="font-bold text-emerald-600">{videos.filter(v => v.stage === 'quality_check' || v.stage === 'scheduled' || v.stage === 'published').length} tasks</span>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Middle Grid: Recent Videos Table + System Telemetry Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Column (2/3): Recent Videos Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-none p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Video Pipeline Queue</h3>
              <p className="text-xs text-slate-500">Review status, quality scores, and publish approvals</p>
            </div>
            <button
              onClick={onNavigateToQueue}
              className="text-[11px] uppercase tracking-wider font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Kanban ({videos.length})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Videos Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="text-[10px] uppercase tracking-widest font-bold bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Video Title & Channel</th>
                  <th className="py-3 px-3">Pipeline</th>
                  <th className="py-3 px-3">Stage</th>
                  <th className="py-3 px-3">Quality Score</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVideos.slice(0, 6).map((video) => {
                  const isReview = video.status === 'review' || video.stage === 'quality_check';
                  return (
                    <tr key={video.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={video.thumbnail_path}
                            alt={video.title}
                            className="h-10 w-8 rounded-none object-cover shrink-0 border border-slate-200"
                          />
                          <div>
                            <div
                              onClick={() => onSelectVideo(video)}
                              className="font-bold text-slate-900 hover:text-indigo-600 cursor-pointer line-clamp-1 max-w-xs"
                            >
                              {video.title}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>{video.channel_name}</span>
                              <span>•</span>
                              <span>{video.duration_seconds}s</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider border ${
                            video.pipeline_type === 'from_scratch'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : 'bg-cyan-50 text-cyan-700 border-cyan-200'
                          }`}
                        >
                          {video.pipeline_type === 'from_scratch' ? 'From Scratch' : 'Long to Short'}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="capitalize font-semibold text-slate-700 text-[11px]">
                          {video.stage.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span
                            className={`font-bold ${
                              video.quality_score >= 85
                                ? 'text-emerald-600'
                                : video.quality_score >= 70
                                ? 'text-amber-600'
                                : 'text-rose-600'
                            }`}
                          >
                            {video.quality_score.toFixed(1)}
                          </span>
                          <span className="text-[10px] text-slate-400">/100</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isReview ? (
                            <>
                              <button
                                onClick={() => onApproveVideo(video.id)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-none text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => onRejectVideo(video.id)}
                                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-none text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => onSelectVideo(video)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-none text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              Inspect
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Column (1/3): VPS Hardware & Service Monitor Widget (Dark Contrast Block) */}
        <div className="bg-slate-900 text-white border border-slate-800 rounded-none p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Server className="h-4 w-4 text-indigo-400" />
                  VPS Infrastructure
                </h3>
                <p className="text-[11px] text-slate-400">Single VPS Deployment (Docker Compose)</p>
              </div>
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-none font-mono">
                Healthy
              </span>
            </div>

            {/* Resource Gauges */}
            <div className="space-y-4 mt-4">
              
              {/* CPU Gauge */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400 flex items-center gap-1 uppercase tracking-wider text-[10px]">
                    <Cpu className="h-3.5 w-3.5 text-indigo-400" />
                    vCPU Usage (4 Cores)
                  </span>
                  <span className="text-white font-mono">{systemHealth.cpu_pct}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-none h-2 overflow-hidden border border-slate-800">
                  <div
                    className="bg-indigo-500 h-2 rounded-none transition-all duration-500"
                    style={{ width: `${systemHealth.cpu_pct}%` }}
                  ></div>
                </div>
              </div>

              {/* Memory Gauge */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400 flex items-center gap-1 uppercase tracking-wider text-[10px]">
                    <Server className="h-3.5 w-3.5 text-blue-400" />
                    RAM Usage
                  </span>
                  <span className="text-white font-mono">
                    {systemHealth.memory_used_gb} GB / {systemHealth.memory_total_gb} GB
                  </span>
                </div>
                <div className="w-full bg-slate-950 rounded-none h-2 overflow-hidden border border-slate-800">
                  <div
                    className="bg-blue-500 h-2 rounded-none transition-all duration-500"
                    style={{ width: `${systemHealth.memory_pct}%` }}
                  ></div>
                </div>
              </div>

              {/* Storage Gauge */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400 flex items-center gap-1 uppercase tracking-wider text-[10px]">
                    <HardDrive className="h-3.5 w-3.5 text-purple-400" />
                    NVMe Storage (MinIO)
                  </span>
                  <span className="text-white font-mono">
                    {systemHealth.storage_used_gb} GB / {systemHealth.storage_total_gb} GB
                  </span>
                </div>
                <div className="w-full bg-slate-950 rounded-none h-2 overflow-hidden border border-slate-800">
                  <div
                    className="bg-purple-500 h-2 rounded-none transition-all duration-500"
                    style={{ width: `${systemHealth.storage_pct}%` }}
                  ></div>
                </div>
              </div>

            </div>
          </div>

          {/* Services Mini Status List */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Container Stack Status
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-slate-950 rounded-none border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300 font-semibold text-[11px]">n8n Engine</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              </div>
              <div className="p-2 bg-slate-950 rounded-none border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300 font-semibold text-[11px]">PostgreSQL 16</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              </div>
              <div className="p-2 bg-slate-950 rounded-none border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300 font-semibold text-[11px]">Redis Streams</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              </div>
              <div className="p-2 bg-slate-950 rounded-none border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300 font-semibold text-[11px]">MinIO S3</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
