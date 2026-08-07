import React, { useState } from 'react';
import {
  Kanban,
  List,
  Sparkles,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
  Play,
  Zap,
  Tag,
  ChevronRight,
  SlidersHorizontal,
  ChevronLeft
} from 'lucide-react';
import { VideoItem, VideoStage, QualityBreakdown } from '../types';

interface ContentQueueViewProps {
  videos: VideoItem[];
  onSelectVideo: (video: VideoItem) => void;
  onApproveVideo: (id: number) => void;
  onRejectVideo: (id: number) => void;
  onMoveStage: (id: number, newStage: VideoStage) => void;
  onOpenScriptLab: () => void;
}

const STAGES: { id: VideoStage; title: string; color: string }[] = [
  { id: 'research', title: '1. Research', color: 'border-slate-700 bg-slate-900/60' },
  { id: 'scripting', title: '2. Scripting', color: 'border-indigo-800 bg-indigo-950/20' },
  { id: 'asset_gen', title: '3. Asset Gen', color: 'border-blue-800 bg-blue-950/20' },
  { id: 'composition', title: '4. Composition', color: 'border-purple-800 bg-purple-950/20' },
  { id: 'quality_check', title: '5. Quality Check', color: 'border-amber-800 bg-amber-950/20' },
  { id: 'scheduled', title: '6. Scheduled', color: 'border-emerald-800 bg-emerald-950/20' },
  { id: 'published', title: '7. Published', color: 'border-teal-800 bg-teal-950/20' }
];

export const ContentQueueView: React.FC<ContentQueueViewProps> = ({
  videos,
  onSelectVideo,
  onApproveVideo,
  onRejectVideo,
  onMoveStage,
  onOpenScriptLab,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [filterPipeline, setFilterPipeline] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredVideos = videos.filter((v) => {
    if (filterPipeline !== 'all' && v.pipeline_type !== filterPipeline) return false;
    if (filterStatus !== 'all' && v.status !== filterStatus) return false;
    if (searchQuery.trim() && !v.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      
      {/* Header Controls */}
      <div className="bg-white border border-slate-200 rounded-none p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Kanban className="h-4 w-4 text-indigo-600" />
            Content Queue & Kanban Pipeline
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage video tasks across the 7 production stages from research to publication
          </p>
        </div>

        {/* Filter Controls & Toggle */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search shorts title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 px-3 py-1.5 rounded-none focus:outline-none focus:border-indigo-600 w-40 sm:w-48 text-xs font-medium"
          />

          {/* Pipeline Filter */}
          <select
            value={filterPipeline}
            onChange={(e) => setFilterPipeline(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 px-3 py-1.5 rounded-none focus:outline-none focus:border-indigo-600 text-xs font-semibold cursor-pointer"
          >
            <option value="all">All Pipelines</option>
            <option value="from_scratch">From Scratch</option>
            <option value="longform_conversion">Long-Form to Short</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 px-3 py-1.5 rounded-none focus:outline-none focus:border-indigo-600 text-xs font-semibold cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="review">Review Needed</option>
            <option value="approved">Approved</option>
            <option value="published">Published</option>
            <option value="failed">Failed / Flagged</option>
          </select>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-none p-0.5">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-2.5 py-1 rounded-none text-xs font-bold transition-colors cursor-pointer ${
                viewMode === 'kanban' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 rounded-none text-xs font-bold transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            onClick={onOpenScriptLab}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-none font-bold uppercase tracking-wider text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Zap className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
            <span>+ AI Short</span>
          </button>
        </div>
      </div>

      {/* KANBAN VIEW */}
      {viewMode === 'kanban' ? (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-[1400px]">
            {STAGES.map((stage) => {
              const stageVideos = filteredVideos.filter((v) => v.stage === stage.id);
              return (
                <div
                  key={stage.id}
                  className="flex-1 rounded-none border border-slate-200 bg-slate-50 p-3 flex flex-col space-y-3 min-h-[500px] border-t-2 border-t-indigo-600"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">{stage.title}</span>
                    <span className="px-2 py-0.5 text-[10px] bg-white border border-slate-200 rounded-none text-slate-700 font-mono font-bold">
                      {stageVideos.length}
                    </span>
                  </div>

                  {/* Cards Container */}
                  <div className="flex-1 space-y-3">
                    {stageVideos.map((video) => (
                      <div
                        key={video.id}
                        className="bg-white border border-slate-200 rounded-none p-3 hover:border-indigo-600 transition-colors shadow-sm space-y-2 group"
                      >
                        {/* Thumbnail & Title */}
                        <div className="flex items-start gap-2.5">
                          <img
                            src={video.thumbnail_path}
                            alt={video.title}
                            className="h-14 w-10 object-cover rounded-none border border-slate-200 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4
                              onClick={() => onSelectVideo(video)}
                              className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 cursor-pointer line-clamp-2 leading-snug"
                            >
                              {video.title}
                            </h4>
                            <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 font-semibold">
                              <span className="truncate">{video.channel_name}</span>
                              <span>•</span>
                              <span>{video.duration_seconds}s</span>
                            </div>
                          </div>
                        </div>

                        {/* Hook Excerpt */}
                        <div className="bg-slate-50 p-2 rounded-none border border-slate-200 text-[11px] text-slate-600 italic line-clamp-2">
                          "{video.hook_text}"
                        </div>

                        {/* Badges & Scores */}
                        <div className="flex items-center justify-between text-[10px] pt-1">
                          <span
                            className={`px-1.5 py-0.5 rounded-none font-bold uppercase tracking-wider border ${
                              video.pipeline_type === 'from_scratch'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : 'bg-cyan-50 text-cyan-700 border-cyan-200'
                            }`}
                          >
                            {video.pipeline_type === 'from_scratch' ? 'From Scratch' : 'Long to Short'}
                          </span>

                          <div className="flex items-center gap-1 font-mono">
                            <span className="text-slate-400">Score:</span>
                            <span
                              className={`font-bold ${
                                video.quality_score >= 85
                                  ? 'text-emerald-600'
                                  : video.quality_score >= 70
                                  ? 'text-amber-600'
                                  : 'text-rose-600'
                              }`}
                            >
                              {video.quality_score.toFixed(0)}
                            </span>
                          </div>
                        </div>

                        {/* Stage Control Buttons */}
                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-1 text-[10px]">
                          <button
                            onClick={() => onSelectVideo(video)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-none font-bold uppercase tracking-wider cursor-pointer transition-colors"
                          >
                            Inspect
                          </button>

                          <div className="flex items-center gap-1">
                            {stage.id === 'quality_check' && (
                              <button
                                onClick={() => onApproveVideo(video.id)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-none font-bold uppercase tracking-wider cursor-pointer transition-colors"
                                title="Approve for publication"
                              >
                                Approve
                              </button>
                            )}

                            {/* Move Stage Next */}
                            {stage.id !== 'published' && (
                              <button
                                onClick={() => {
                                  const stageIdx = STAGES.findIndex((s) => s.id === stage.id);
                                  if (stageIdx < STAGES.length - 1) {
                                    onMoveStage(video.id, STAGES[stageIdx + 1].id);
                                  }
                                }}
                                className="px-1.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-none cursor-pointer transition-colors"
                                title="Advance to next stage"
                              >
                                <ChevronRight className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    ))}

                    {stageVideos.length === 0 && (
                      <div className="h-32 border border-dashed border-slate-300 rounded-none flex items-center justify-center text-slate-400 text-xs font-semibold">
                        No tasks in stage
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-white border border-slate-200 rounded-none p-4 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="text-[10px] uppercase tracking-widest font-bold bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Video Title</th>
                <th className="py-3 px-3">Channel</th>
                <th className="py-3 px-3">Pipeline</th>
                <th className="py-3 px-3">Stage</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Quality Score</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVideos.map((video) => (
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
                          className="font-bold text-slate-900 hover:text-indigo-600 cursor-pointer line-clamp-1"
                        >
                          {video.title}
                        </div>
                        <div className="text-[11px] text-slate-500 italic line-clamp-1">
                          "{video.hook_text}"
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3 font-semibold text-slate-800">{video.channel_name}</td>

                  <td className="py-3 px-3">
                    <span className="capitalize text-[11px] font-bold text-indigo-600">
                      {video.pipeline_type.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <span className="capitalize text-[11px] font-semibold text-slate-700">
                      {video.stage.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider ${
                        video.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : video.status === 'approved'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : video.status === 'review'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : video.status === 'failed'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {video.status}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-mono font-bold text-emerald-600">
                    {video.quality_score.toFixed(1)} / 100
                  </td>

                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onSelectVideo(video)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-none text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Inspect
                      </button>
                      {video.status === 'review' && (
                        <button
                          onClick={() => onApproveVideo(video.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-none text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                        >
                          Approve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
