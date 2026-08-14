import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, DashboardView } from './components/Sidebar';
import { OverviewView } from './components/OverviewView';
import { ContentQueueView } from './components/ContentQueueView';
import { ChannelsView } from './components/ChannelsView';
import { AnalyticsView } from './components/AnalyticsView';
import { SystemHealthView } from './components/SystemHealthView';
import { SetupView } from './components/SetupView';
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

const EMPTY_HEALTH: SystemHealthData = {
  cpu_pct: 0,
  memory_pct: 0,
  memory_used_gb: 0,
  memory_total_gb: 0,
  storage_pct: 0,
  storage_used_gb: 0,
  storage_total_gb: 0,
  redis_queue_lag: 0,
  active_workflows_running: 0,
  circuit_breaker: 'CLOSED',
  containers: [],
};

const EMPTY_ANALYTICS: AnalyticsOverview = {
  total_channels: 0,
  videos_published_this_week: 0,
  avg_view_count: 0,
  system_health_pct: 0,
  weekly_views_data: [],
  revenue_projections: [],
  cost_breakdown: [],
  vtr_distribution: [],
};

export default function App() {
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealthData>(EMPTY_HEALTH);
  const [models, setModels] = useState<AIModelConfig[]>([]);
  const [dlqTasks, setDlqTasks] = useState<DLQTask[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsOverview>(EMPTY_ANALYTICS);

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
        console.warn('Backend load failed:', err);
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
        showToast(`Video #${id} approved and queued for publication.`);
      }
    } catch (e) {
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
      } else if (data.error) {
        showToast(data.error);
      }
    } catch (e) {
      showToast('Could not reach the n8n planner.');
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
      showToast('Failed to add channel.');
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
      showToast('Failed to push generated short into the queue.');
    }
  };

  const pendingReviewCount = videos.filter(
    (v) => v.status === 'review' || v.stage === 'quality_check'
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-indigo-600 selection:text-white">

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700 font-medium text-sm flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-indigo-400"></span>
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
              <div className="bg-white border border-slate-200 rounded-xl p-6 text-center space-y-3 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900">AI Scripting & Prompt Engineering Lab</h2>
                <p className="text-sm text-slate-500 max-w-lg mx-auto">
                  Test Gemini script generation, viral hook scoring, and push production payloads directly into the n8n pipeline.
                </p>
                <button
                  onClick={() => setShowScriptLabModal(true)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-sm shadow cursor-pointer"
                >
                  Launch Interactive AI Script Generator
                </button>
              </div>
            </div>
          )}

          {currentView === 'setup' && (
            <SetupView />
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
