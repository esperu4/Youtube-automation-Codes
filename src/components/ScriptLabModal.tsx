import React, { useState } from 'react';
import { Sparkles, RefreshCw, Zap, CheckCircle2, Play, PlusCircle } from 'lucide-react';
import { Channel } from '../types';

interface ScriptLabModalProps {
  channels: Channel[];
  onClose: () => void;
  onAddGeneratedVideo: (videoPayload: any) => void;
}

export const ScriptLabModal: React.FC<ScriptLabModalProps> = ({
  channels,
  onClose,
  onAddGeneratedVideo,
}) => {
  const [topic, setTopic] = useState('Quantum Computing Breakthrough');
  const [selectedChannelId, setSelectedChannelId] = useState<number>(channels[0]?.id || 1);
  const [targetTone, setTargetTone] = useState('Energetic & Catchy');
  const [duration, setDuration] = useState(45);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any | null>(null);

  const targetChannel = channels.find((c) => c.id === selectedChannelId) || channels[0];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setIsGenerating(true);
    setGeneratedResult(null);

    try {
      const res = await fetch('/api/gemini/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          channel_niche: targetChannel?.niche || 'Technology',
          target_tone: targetTone,
          target_duration: duration,
        }),
      });

      const data = await res.json();
      if (data.script) {
        setGeneratedResult(data.script);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePushToQueue = () => {
    if (!generatedResult) return;
    onAddGeneratedVideo({
      channel_id: targetChannel.id,
      title: generatedResult.title || topic,
      description: generatedResult.description || 'AI Generated Short',
      tags: generatedResult.tags || ['Shorts', 'AI'],
      pipeline_type: 'from_scratch',
      stage: 'scripting',
      quality_score: generatedResult.estimated_quality_score || 90.0,
      quality_breakdown: {
        hook_strength: 92,
        narrative_coherence: 88,
        visual_quality: 85,
        audio_quality: 90,
        seo_optimization: 88,
      },
      duration_seconds: duration,
      hook_text: generatedResult.hook_text || topic,
      voiceover_tone: generatedResult.voiceover_tone || targetTone,
      script_scenes: generatedResult.script_scenes || [],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-none max-w-2xl w-full p-6 space-y-5 shadow-2xl my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-none border border-indigo-200">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Gemini AI Short Scripting Lab
              </h3>
              <p className="text-xs text-slate-500">
                Generate production-ready YouTube Shorts scripts and push into the n8n pipeline
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 text-lg font-bold cursor-pointer p-1"
          >
            ✕
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleGenerate} className="space-y-4 text-xs text-slate-700">
          <div>
            <label className="block font-bold uppercase tracking-wider text-[10px] mb-1 text-slate-600">Video Topic or Angle</label>
            <input
              type="text"
              required
              placeholder="e.g. 5 Secret iPhone Settings You Need to Turn Off Right Now"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-none px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-600 text-xs font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold uppercase tracking-wider text-[10px] mb-1 text-slate-600">Assigned Channel</label>
              <select
                value={selectedChannelId}
                onChange={(e) => setSelectedChannelId(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-none px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-600 cursor-pointer text-xs font-medium"
              >
                {channels.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.niche})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-[10px] mb-1 text-slate-600">Voiceover Tone</label>
              <input
                type="text"
                value={targetTone}
                onChange={(e) => setTargetTone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-none px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-600 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-[10px] mb-1 text-slate-600">Duration (s)</label>
              <input
                type="number"
                min={15}
                max={60}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-none px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-600 text-xs font-mono font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase tracking-wider text-[11px] rounded-none flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Invoking Server Gemini AI...</span>
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 text-amber-300 fill-amber-300" />
                <span>Generate Production Payload</span>
              </>
            )}
          </button>
        </form>

        {/* Generated Script Preview */}
        {generatedResult && (
          <div className="bg-slate-50 border border-indigo-200 rounded-none p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-900 text-sm">{generatedResult.title}</span>
              <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded-none font-mono text-[10px]">
                Est Score: {generatedResult.estimated_quality_score}/100
              </span>
            </div>

            <div className="p-2.5 bg-indigo-50/70 rounded-none border border-indigo-200 italic text-slate-900 font-bold">
              Hook: "{generatedResult.hook_text}"
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500">Scene Breakdown:</span>
              {generatedResult.script_scenes?.map((scene: any, idx: number) => (
                <div key={idx} className="p-2 bg-white rounded-none border border-slate-200 space-y-1 text-[11px]">
                  <div className="text-indigo-600 font-bold">Scene #{scene.scene_number} ({scene.timeframe})</div>
                  <div className="text-slate-900 font-semibold">Narration: {scene.narration}</div>
                  <div className="text-slate-500 text-[10px] font-medium">Visual AI Prompt: {scene.visual_prompt}</div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handlePushToQueue}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-wider text-[10px] rounded-none flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Push Directly to Content Queue</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
