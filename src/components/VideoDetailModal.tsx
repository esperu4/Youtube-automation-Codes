import React, { useState } from 'react';
import {
  VideoItem,
  QualityBreakdown
} from '../types';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Tag,
  Zap,
  Play,
  Share2,
  AlertTriangle,
  RefreshCw,
  Layers
} from 'lucide-react';
import { Thumbnail } from './Thumbnail';

interface VideoDetailModalProps {
  video: VideoItem;
  onClose: () => void;
  onApprove: (id: number) => void;
  onReject: (id: number, reason?: string, targetComponent?: string) => void;
}

export const VideoDetailModal: React.FC<VideoDetailModalProps> = ({
  video,
  onClose,
  onApprove,
  onReject,
}) => {
  const [activeTab, setActiveTab] = useState<'script' | 'quality' | 'hook_ai'>('script');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectComponent, setRejectComponent] = useState('Hook');
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Hook AI Optimizer state
  const [isOptimizingHook, setIsOptimizingHook] = useState(false);
  const [optimizedHooks, setOptimizedHooks] = useState<any[] | null>(null);

  const handleOptimizeHook = async () => {
    setIsOptimizingHook(true);
    try {
      const res = await fetch('/api/gemini/optimize-hook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_hook: video.hook_text,
          niche: video.channel_name,
        }),
      });
      const data = await res.json();
      if (data.result?.optimized_hooks) {
        setOptimizedHooks(data.result.optimized_hooks);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsOptimizingHook(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-lg max-w-3xl w-full p-6 space-y-5 shadow-2xl my-8">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <Thumbnail
              src={video.thumbnail_path}
              alt={video.title}
              className="h-14 w-10 rounded-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                  {video.channel_name}
                </span>
                <span className="text-xs text-slate-500 font-semibold uppercase">{video.pipeline_type.replace('_', ' ')}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">{video.title}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 text-lg font-bold cursor-pointer p-1"
          >
            ✕
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveTab('script')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                activeTab === 'script' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Scene Script ({video.script_scenes?.length || 0} scenes)
            </button>
            <button
              onClick={() => setActiveTab('quality')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                activeTab === 'quality' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Quality Score ({video.quality_score.toFixed(1)}/100)
            </button>
            <button
              onClick={() => {
                setActiveTab('hook_ai');
                if (!optimizedHooks) handleOptimizeHook();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === 'hook_ai' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              <span>AI Hook Lab</span>
            </button>
          </div>

          <div className="text-xs font-mono text-slate-500">
            Duration: <span className="text-slate-900 font-bold">{video.duration_seconds}s</span>
          </div>
        </div>

        {/* TAB 1: SCENE SCRIPT BREAKDOWN */}
        {activeTab === 'script' && (
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
            {/* Hook Highlight */}
            <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-200 space-y-1">
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                First 3-Second Opening Hook
              </span>
              <p className="text-xs text-slate-800 font-bold italic">
                "{video.hook_text}"
              </p>
            </div>

            {/* Scenes */}
            <div className="space-y-3">
              {video.script_scenes?.map((scene) => (
                <div key={scene.scene_number} className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span className="text-indigo-600 font-bold">Scene #{scene.scene_number}</span>
                    <span className="font-mono text-slate-600">{scene.timeframe}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Visual AI Prompt:</span>
                      <p className="text-slate-700 font-medium">{scene.visual_prompt}</p>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Narration (TTS):</span>
                      <p className="text-slate-900 font-semibold">{scene.narration}</p>
                    </div>
                  </div>

                  {scene.text_overlay && (
                    <div className="text-[10px] text-amber-800 font-mono bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                      Caption Overlay: <strong>{scene.text_overlay}</strong>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: QUALITY BREAKDOWN (PDF Chapter 11.2) */}
        {activeTab === 'quality' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Hook Strength (30% Weight)</span>
                <div className="text-lg font-bold text-emerald-600 font-mono">
                  {video.quality_breakdown.hook_strength} / 100
                </div>
                <div className="w-full bg-slate-200 rounded-lg h-1.5 overflow-hidden">
                  <div className="bg-emerald-600 h-1.5 rounded-lg" style={{ width: `${video.quality_breakdown.hook_strength}%` }}></div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Narrative Coherence (25% Weight)</span>
                <div className="text-lg font-bold text-indigo-600 font-mono">
                  {video.quality_breakdown.narrative_coherence} / 100
                </div>
                <div className="w-full bg-slate-200 rounded-lg h-1.5 overflow-hidden">
                  <div className="bg-indigo-600 h-1.5 rounded-lg" style={{ width: `${video.quality_breakdown.narrative_coherence}%` }}></div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Visual Quality (20% Weight)</span>
                <div className="text-lg font-bold text-blue-600 font-mono">
                  {video.quality_breakdown.visual_quality} / 100
                </div>
                <div className="w-full bg-slate-200 rounded-lg h-1.5 overflow-hidden">
                  <div className="bg-blue-600 h-1.5 rounded-lg" style={{ width: `${video.quality_breakdown.visual_quality}%` }}></div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Audio & SEO (25% Combined)</span>
                <div className="text-lg font-bold text-purple-600 font-mono">
                  {video.quality_breakdown.audio_quality} / 100
                </div>
                <div className="w-full bg-slate-200 rounded-lg h-1.5 overflow-hidden">
                  <div className="bg-purple-600 h-1.5 rounded-lg" style={{ width: `${video.quality_breakdown.audio_quality}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AI HOOK OPTIMIZER (Server Gemini Integration) */}
        {activeTab === 'hook_ai' && (
          <div className="space-y-4 text-xs">
            <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-lg text-slate-700">
              <span className="font-bold block text-sm text-indigo-900 mb-1">Gemini AI Hook Rewrite Engine</span>
              <span>Re-engineers opening hook line using psychological trigger formulas to exceed 85% VTR.</span>
            </div>

            {isOptimizingHook && (
              <div className="p-8 text-center text-indigo-600 font-bold flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Gemini is generating high-impact viral hooks...</span>
              </div>
            )}

            {optimizedHooks && (
              <div className="space-y-2">
                <div className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">Generated Alternative Hooks:</div>
                {optimizedHooks.map((h, i) => (
                  <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-amber-700">{h.trigger_type}</span>
                      <span className="text-emerald-700 font-mono font-bold">Predicted VTR: {h.predicted_vtr}%</span>
                    </div>
                    <p className="text-slate-900 font-bold italic">"{h.hook_line}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal Action Footer */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 font-medium">
            Status: <span className="text-slate-900 font-bold uppercase">{video.status}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRejectForm(!showRejectForm)}
              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold uppercase tracking-wider text-[10px] transition-colors cursor-pointer"
            >
              Reject & Regenerate
            </button>

            <button
              onClick={() => {
                onApprove(video.id);
                onClose();
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold uppercase tracking-wider text-[10px] shadow flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Approve for YouTube Publish</span>
            </button>
          </div>
        </div>

        {/* Reject Form Dropdown */}
        {showRejectForm && (
          <div className="bg-slate-50 border border-rose-200 p-3 rounded-lg space-y-2 text-xs">
            <span className="font-bold text-rose-700 uppercase text-[10px]">Targeted Regeneration Options:</span>
            <div className="flex items-center gap-2">
              <select
                value={rejectComponent}
                onChange={(e) => setRejectComponent(e.target.value)}
                className="bg-white border border-slate-200 text-slate-800 px-3 py-1.5 rounded-lg focus:outline-none cursor-pointer text-xs font-semibold"
              >
                <option value="Hook">Opening Hook (First 3s)</option>
                <option value="Voiceover">Voiceover TTS Audio</option>
                <option value="Visual Assets">Visual Asset Prompts</option>
                <option value="Full Video">Entire Video Assembly</option>
              </select>

              <input
                type="text"
                placeholder="Reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="flex-1 bg-white border border-slate-200 text-slate-900 px-3 py-1.5 rounded-lg focus:outline-none text-xs"
              />

              <button
                onClick={() => {
                  onReject(video.id, rejectReason, rejectComponent);
                  onClose();
                }}
                className="px-3 py-1.5 bg-rose-600 text-white rounded-lg font-bold uppercase text-[10px] tracking-wider cursor-pointer"
              >
                Submit Rejection
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
