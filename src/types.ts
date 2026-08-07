export type PipelineType = 'from_scratch' | 'longform_conversion';

export type VideoStage =
  | 'research'
  | 'scripting'
  | 'asset_gen'
  | 'composition'
  | 'quality_check'
  | 'scheduled'
  | 'published';

export type VideoStatus = 'draft' | 'review' | 'approved' | 'published' | 'failed';

export interface QualityBreakdown {
  hook_strength: number; // weight 30%, min 60
  narrative_coherence: number; // weight 25%, min 55
  visual_quality: number; // weight 20%, min 50
  audio_quality: number; // weight 15%, min 65
  seo_optimization: number; // weight 10%, min 50
}

export interface ScriptScene {
  scene_number: number;
  timeframe: string; // e.g. "0:00 - 0:03"
  visual_prompt: string;
  narration: string;
  text_overlay: string;
  audio_effect?: string;
}

export interface VideoItem {
  id: number;
  channel_id: number;
  channel_name: string;
  content_task_id: number;
  title: string;
  description: string;
  tags: string[];
  pipeline_type: PipelineType;
  status: VideoStatus;
  stage: VideoStage;
  quality_score: number; // 0-100
  quality_breakdown: QualityBreakdown;
  duration_seconds: number;
  youtube_video_id?: string;
  storage_path: string;
  thumbnail_path: string;
  hook_text: string;
  voiceover_tone: string;
  created_at: string;
  published_at?: string;
  views?: number;
  likes?: number;
  vtr?: number; // View-through rate %
  script_scenes?: ScriptScene[];
  rejection_reason?: string;
}

export interface Channel {
  id: number;
  name: string;
  niche: string;
  target_audience: string;
  language: string;
  ai_model_config_id: string;
  schedule_cron: string;
  max_daily_uploads: number;
  youtube_channel_id: string;
  status: 'active' | 'paused' | 'archived';
  subscribers: number;
  total_views: number;
  avg_vtr: number;
  created_at: string;
  daily_budget_usd: number;
  current_daily_spend_usd: number;
}

export interface ContainerStatus {
  name: string;
  role: string;
  image: string;
  status: 'running' | 'degraded' | 'stopped';
  cpu_pct: number;
  memory_mb: number;
  uptime: string;
}

export interface SystemHealthData {
  cpu_pct: number; // VPS vCPU load
  memory_pct: number; // RAM usage
  memory_used_gb: number;
  memory_total_gb: number;
  storage_pct: number;
  storage_used_gb: number;
  storage_total_gb: number;
  redis_queue_lag: number; // msgs
  active_workflows_running: number;
  circuit_breaker: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  containers: ContainerStatus[];
}

export interface AIModelConfig {
  id: string;
  provider: string;
  model: string;
  quality: string;
  cost_per_1k_input: number;
  cost_per_1k_output: number;
  latency: string;
  best_use_case: string;
  priority: number;
  assigned_tasks: string[];
  is_active: boolean;
}

export interface DLQTask {
  id: string;
  workflow_id: string;
  task_name: string;
  channel_id: number;
  channel_name: string;
  error_message: string;
  failure_category: 'Transient' | 'Content' | 'Infrastructure' | 'Cascading';
  retry_count: number;
  max_retries: number;
  created_at: string;
  payload: Record<string, any>;
}

export interface CostBreakdownItem {
  category: string;
  amount_usd: number;
  percentage: number;
  color: string;
}

export interface AnalyticsOverview {
  total_channels: number;
  videos_published_this_week: number;
  avg_view_count: number;
  system_health_pct: number;
  weekly_views_data: { day: string; views: number; published: number }[];
  revenue_projections: { month: string; conservative: number; expected: number; aggressive: number }[];
  cost_breakdown: CostBreakdownItem[];
  vtr_distribution: { range: string; count: number }[];
}
