import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, DashboardView } from './components/Sidebar';
import { OverviewView } from './components/OverviewView';
import { ContentQueueView } from './components/ContentQueueView';
import { ChannelsView } from './components/ChannelsView';
import { AnalyticsView } from './components/AnalyticsView';
import { SystemHealthView } from './components/SystemHealthView';
import { VideoDetailModal } from './components/VideoDetailModal';
import { ScriptLabModal } from './components/ScriptLabModal';

import {
  Channel,
  VideoItem,
  SystemHealthData,
  AIModelConfig,
  DLQTask,
  AnalyticsOverview,
  VideoStage
} from './types';
import {
  INITIAL_CHANNELS,
  INITIAL_VIDEOS,
  INITIAL_SYSTEM_HEALTH,
  INITIAL_AI_MODELS,
  INITIAL_DLQ_TASKS,
  ANALYTICS_DATA
} from './data/mockData';

export default function App() {
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [channels, setChannels] = useState<Channel[]>(INITIAL_CHANNELS);
  const [videos, setVideos] = useState<VideoItem[]>(INITIAL_VIDEOS);
  const [systemHealth, setSystemHealth] = useState<SystemHealthData>(INITIAL_SYSTEM_HEALTH);
  const [models, setModels] = useState<AIModelConfig[]>(INITIAL_AI_MODELS);
  const [dlqTasks, setDlqTasks] = useState<DLQTask[]>(INITIAL_DLQ_TASKS);
  const [analytics, setAnalytics] = useState<AnalyticsOverview>(ANALYTICS_DATA);

  const [selectedChannelFilter, setSelectedChannelFilter] = useState<number | 'all'>('all');
  const [selectedVideoModal, setSelectedVideoModal] = useState<VideoItem | null>(null);
  const [showScriptLabModal, setShowScriptLabModal] = useState(false);
  const [isTriggeringPlanner, setIsTriggeringPlanner] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Show Toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch initial API data from Express backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [chRes, vidRes, healthRes, dlqRes, modRes, anaRes] = await Promise.all([
          fetch('/api/channels'),
          fetch('/api/videos'),
          fetch('/api/system/health'),
          fetch('/api/system/dlq'),
          fetch('/api/models'),
          fetch('/api/analytics/performance'),
        ]);

        if (chRes.ok) setChannels(await chRes.json());
        if (vidRes.ok) setVideos(await vidRes.json());
        if (healthRes.ok) setSystemHealth(await healthRes.json());
        if (dlqRes.ok) setDlqTasks(await dlqRes.json());
        if (modRes.ok) setModels(await modRes.json());
        if (anaRes.ok) setAnalytics(await anaRes.json());
      } catch (err) {
        console.warn('Backend load fallback to static mock:', err);
      }
    };

    fetchData();

    // Auto-refresh telemetry every 15s
    const interval = setInterval(async () => {
      try {
        const healthRes = await fetch('/api/system/health');
        if (healthRes.ok) setSystemHealth(await healthRes.json());
      } catch (e) {}
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Filtered videos according to channel filter
  const displayedVideos = selectedChannelFilter === 'all'
    ? videos
    : videos.filter((v) => v.channel_id === selectedChannelFilter);

  // Approve Video Handler
  const handleApproveVideo = async (id: number) => {
    try {
      const res = await fetch(`/api/videos/${id}/approve`, { method: 'POST' });
      const data = await res.json();
      if (data.success && data.video) {
        setVideos((prev) => prev.map((v) => (v.id === id ? data.video : v)));
        showToast(`Video #${id} approved! Queued in n8n Publisher WF-10.`);
      }
    } catch (e) {
      // Local fallback
      setVideos((prev) =>
        prev.map((v) =>
          v.id === id
            ? { ...v, status: 'approved', stage: 'scheduled' as VideoStage }
            : v
        )
      );
      showToast(`Video #${id} approved for scheduled publication.`);
    }
  };

  // Reject Video Handler
  const handleRejectVideo = async (id: number, reason?: string, targetComponent?: string) => {
    try {
      const res = await fetch(`/api/videos/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, target_component: targetComponent }),
      });
      const data = await res.json();
      if (data.success && data.video) {
        setVideos((prev) => prev.map((v) => (v.id === id ? data.video : v)));
        showToast(data.message || `Rejection logged for #${id}.`);
        // Refresh DLQ
        const dlqRes = await fetch('/api/system/dlq');
        if (dlqRes.ok) setDlqTasks(await dlqRes.json());
      }
    } catch (e) {
      setVideos((prev) =>
        prev.map((v) => (v.id === id ? { ...v, status: 'failed' } : v))
      );
      showToast(`Video #${id} rejected and sent for targeted regeneration.`);
    }
  };

  // Move Stage Handler
  const handleMoveStage = async (id: number, newStage: VideoStage) => {
    try {
      const res = await fetch(`/api/videos/${id}/move-stage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_stage: newStage }),
      });
      const data = await res.json();
      if (data.success && data.video) {
        setVideos((prev) => prev.map((v) => (v.id === id ? data.video : v)));
        showToast(`Task #${id} moved to "${newStage.replace('_', ' ')}" stage.`);
      }
    } catch (e) {
      setVideos((prev) =>
        prev.map((v) => (v.id === id ? { ...v, stage: newStage } : v))
      );
      showToast(`Moved #${id} to "${newStage}".`);
    }
  };

  // Trigger Daily Planner WF-01
  const handleTriggerPlanner = async (channelId?: number) => {
    setIsTriggeringPlanner(true);
    try {
      const targetId = channelId || (selectedChannelFilter === 'all' ? channels[0]?.id : selectedChannelFilter);
      const res = await fetch('/api/n8n/trigger-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel_id: targetId }),
      });
      const data = await res.json();
      if (data.success && data.video) {
        setVideos((prev) => [data.video, ...prev]);
        showToast(data.message);
      }
    } catch (e) {
      showToast('n8n Daily Planner WF-01 triggered!');
    } finally {
      setIsTriggeringPlanner(false);
    }
  };

  // Add Channel Handler
  const handleAddChannel = async (channelData: Partial<Channel>) => {
    try {
      const res = await fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(channelData),
      });
      const data = await res.json();
      if (data.success && data.channel) {
        setChannels((prev) => [data.channel, ...prev]);
        showToast(`Channel "${data.channel.name}" provisioned successfully!`);
      }
    } catch (e) {
      const newCh: Channel = {
        id: Date.now(),
        name: channelData.name || 'New Channel',
        niche: channelData.niche || 'Technology',
        target_audience: channelData.target_audience || 'General Audience',
        language: 'en',
        ai_model_config_id: channelData.ai_model_config_id || 'gemini-3.6-flash',
        schedule_cron: channelData.schedule_cron || '0 9,18 * * *',
        max_daily_uploads: channelData.max_daily_uploads || 2,
        youtube_channel_id: `UC_${Date.now()}`,
        status: 'active',
        subscribers: 0,
        total_views: 0,
        avg_vtr: 65.0,
        created_at: new Date().toISOString().split('T')[0],
        daily_budget_usd: channelData.daily_budget_usd || 1.5,
        current_daily_spend_usd: 0.0,
      };
      setChannels((prev) => [newCh, ...prev]);
      showToast(`Channel "${newCh.name}" added.`);
    }
  };

  // Update Channel Handler
  const handleUpdateChannel = async (id: number, updates: Partial<Channel>) => {
    try {
      const res = await fetch(`/api/channels/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success && data.channel) {
        setChannels((prev) => prev.map((c) => (c.id === id ? data.channel : c)));
        showToast(`Channel #${id} updated.`);
      }
    } catch (e) {
      setChannels((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
      showToast(`Channel #${id} updated.`);
    }
  };

  // Retry DLQ Task
  const handleRetryDlq = async (dlqId: string) => {
    try {
      const res = await fetch(`/api/system/dlq/${dlqId}/retry`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setDlqTasks((prev) => prev.filter((d) => d.id !== dlqId));
        showToast(`Task ${dlqId} re-queued into Redis Stream.`);
      }
    } catch (e) {
      setDlqTasks((prev) => prev.filter((d) => d.id !== dlqId));
      showToast(`Re-queued DLQ Task ${dlqId}.`);
    }
  };

  // Update AI Model
  const handleUpdateModel = async (modelId: string, updates: Partial<AIModelConfig>) => {
    try {
      const res = await fetch(`/api/models/${modelId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success && data.model) {
        setModels((prev) => prev.map((m) => (m.id === modelId ? data.model : m)));
        showToast(`AI Model ${modelId} updated.`);
      }
    } catch (e) {
      setModels((prev) => prev.map((m) => (m.id === modelId ? { ...m, ...updates } : m)));
    }
  };

  // Add Generated Video from Script Lab
  const handleAddGeneratedVideo = async (payload: any) => {
    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.video) {
        setVideos((prev) => [data.video, ...prev]);
        showToast(`Short "${data.video.title}" pushed into Content Queue!`);
      }
    } catch (e) {
      const localVid: VideoItem = {
        id: Date.now(),
        channel_id: payload.channel_id || 1,
        channel_name: channels.find((c) => c.id === payload.channel_id)?.name || 'TechPulse Shorts',
        content_task_id: Math.floor(Math.random() * 900) + 100,
        title: payload.title,
        description: payload.description,
        tags: payload.tags,
        pipeline_type: 'from_scratch',
        status: 'draft',
        stage: 'scripting',
        quality_score: payload.quality_score || 90.0,
        quality_breakdown: payload.quality_breakdown,
        duration_seconds: payload.duration_seconds,
        storage_path: `/minio/videos/lab_${Date.now()}.mp4`,
        thumbnail_path: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
        hook_text: payload.hook_text,
        voiceover_tone: payload.voiceover_tone,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        script_scenes: payload.script_scenes,
      };
      setVideos((prev) => [localVid, ...prev]);
      showToast(`Generated Short pushed to Queue.`);
    }
  };

  const pendingReviewCount = videos.filter(
    (v) => v.status === 'review' || v.stage === 'quality_check'
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-indigo-600 selection:text-white">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-indigo-600 text-white px-5 py-3 rounded-none shadow-xl border border-indigo-500 font-semibold text-xs flex items-center gap-2 uppercase tracking-wider">
          <span>⚡</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Header */}
      <Header
        systemHealth={systemHealth}
        channels={channels}
        onTriggerPlanner={() => handleTriggerPlanner()}
        onOpenScriptLab={() => setShowScriptLabModal(true)}
        onOpenAddChannel={() => setCurrentView('channels')}
        isTriggering={isTriggeringPlanner}
        selectedChannelId={selectedChannelFilter}
        onSelectChannel={setSelectedChannelFilter}
      />

      {/* Main Body Layout */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          onSelectView={setCurrentView}
          pendingReviewCount={pendingReviewCount}
          dlqErrorCount={dlqTasks.length}
        />

        {/* Content View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          
          {currentView === 'overview' && (
            <OverviewView
              channels={channels}
              videos={displayedVideos}
              systemHealth={systemHealth}
              analytics={analytics}
              onSelectVideo={(video) => setSelectedVideoModal(video)}
              onApproveVideo={handleApproveVideo}
              onRejectVideo={handleRejectVideo}
              onNavigateToQueue={() => setCurrentView('queue')}
            />
          )}

          {currentView === 'queue' && (
            <ContentQueueView
              videos={displayedVideos}
              onSelectVideo={(video) => setSelectedVideoModal(video)}
              onApproveVideo={handleApproveVideo}
              onRejectVideo={handleRejectVideo}
              onMoveStage={handleMoveStage}
              onOpenScriptLab={() => setShowScriptLabModal(true)}
            />
          )}

          {currentView === 'channels' && (
            <ChannelsView
              channels={channels}
              onAddChannel={handleAddChannel}
              onUpdateChannel={handleUpdateChannel}
              onTriggerPlannerForChannel={(id) => handleTriggerPlanner(id)}
              isTriggering={isTriggeringPlanner}
            />
          )}

          {currentView === 'analytics' && (
            <AnalyticsView analytics={analytics} channels={channels} />
          )}

          {currentView === 'system' && (
            <SystemHealthView
              health={systemHealth}
              models={models}
              dlqTasks={dlqTasks}
              onRetryDlqTask={handleRetryDlq}
              onUpdateModel={handleUpdateModel}
            />
          )}

          {currentView === 'script_lab' && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center space-y-3">
                <h2 className="text-lg font-bold text-white">AI Scripting & Prompt Engineering Lab</h2>
                <p className="text-xs text-slate-400 max-w-lg mx-auto">
                  Test Gemini 3.6 Flash / Pro script generation, viral hook scoring, and push production payloads directly into the n8n pipeline.
                </p>
                <button
                  onClick={() => setShowScriptLabModal(true)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow cursor-pointer"
                >
                  Launch Interactive AI Script Generator
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Video Detail Inspector Modal */}
      {selectedVideoModal && (
        <VideoDetailModal
          video={selectedVideoModal}
          onClose={() => setSelectedVideoModal(null)}
          onApprove={handleApproveVideo}
          onReject={handleRejectVideo}
        />
      )}

      {/* Script Lab Modal */}
      {showScriptLabModal && (
        <ScriptLabModal
          channels={channels}
          onClose={() => setShowScriptLabModal(false)}
          onAddGeneratedVideo={handleAddGeneratedVideo}
        />
      )}

    </div>
  );
}
