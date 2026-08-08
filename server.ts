import express from "express";
import os from "os";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

import { Channel, VideoItem, DLQTask, AIModelConfig, AnalyticsOverview, ContainerStatus, SystemHealthData } from "./src/types.ts";

let channelsStore: Channel[] = [];
let videosStore: VideoItem[] = [];
let dlqStore: DLQTask[] = [];
let modelsStore: AIModelConfig[] = [];

function buildHealth(): SystemHealthData {
  const totalMem = os.totalmem() / (1024 ** 3);
  const freeMem = os.freemem() / (1024 ** 3);
  const usedMem = totalMem - freeMem;
  const cpus = os.cpus().length;
  const load1 = os.loadavg()[0];
  const cpuPct = Math.min(100, Math.round((load1 / cpus) * 100));

  const containers: ContainerStatus[] = [];

  return {
    cpu_pct: cpuPct,
    memory_pct: Math.min(100, Math.round((usedMem / totalMem) * 100)),
    memory_used_gb: Number(usedMem.toFixed(2)),
    memory_total_gb: Number(totalMem.toFixed(2)),
    storage_pct: 0,
    storage_used_gb: 0,
    storage_total_gb: 0,
    redis_queue_lag: 0,
    active_workflows_running: 0,
    circuit_breaker: "CLOSED",
    containers,
  };
}

function buildAnalytics(): AnalyticsOverview {
  const published = videosStore.filter((v) => v.status === "published" && v.views != null);
  const avgViewCount = published.length
    ? Math.round(published.reduce((sum, v) => sum + (v.views || 0), 0) / published.length)
    : 0;

  return {
    total_channels: channelsStore.length,
    videos_published_this_week: videosStore.filter((v) => v.status === "published").length,
    avg_view_count: avgViewCount,
    system_health_pct: 0,
    weekly_views_data: [],
    revenue_projections: [],
    cost_breakdown: [],
    vtr_distribution: [],
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Initialize Gemini AI SDK
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey || "dummy-key",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  // REST API Routes

  // 1. Channels API
  app.get("/api/channels", (req, res) => {
    res.json(channelsStore);
  });

  app.post("/api/channels", (req, res) => {
    const newChannel: Channel = {
      id: Date.now(),
      name: req.body.name || "New Channel",
      niche: req.body.niche || "General Tech",
      target_audience: req.body.target_audience || "General Audience 18-35",
      language: req.body.language || "en",
      ai_model_config_id: req.body.ai_model_config_id || "gemini-3.6-flash",
      schedule_cron: req.body.schedule_cron || "0 9,18 * * *",
      max_daily_uploads: Number(req.body.max_daily_uploads) || 2,
      youtube_channel_id: req.body.youtube_channel_id || `UC_channel_${Date.now().toString().slice(-4)}`,
      status: "active",
      subscribers: 0,
      total_views: 0,
      avg_vtr: 0,
      created_at: new Date().toISOString().split("T")[0],
      daily_budget_usd: Number(req.body.daily_budget_usd) || 1.5,
      current_daily_spend_usd: 0.0,
    };
    channelsStore.unshift(newChannel);
    res.json({ success: true, channel: newChannel });
  });

  app.put("/api/channels/:id", (req, res) => {
    const id = Number(req.params.id);
    const index = channelsStore.findIndex((c) => c.id === id);
    if (index !== -1) {
      channelsStore[index] = { ...channelsStore[index], ...req.body };
      res.json({ success: true, channel: channelsStore[index] });
    } else {
      res.status(404).json({ error: "Channel not found" });
    }
  });

  // 2. Videos API
  app.get("/api/videos", (req, res) => {
    const { channel_id, stage, status } = req.query;
    let result = [...videosStore];
    if (channel_id && channel_id !== "all") {
      result = result.filter((v) => v.channel_id === Number(channel_id));
    }
    if (stage && stage !== "all") {
      result = result.filter((v) => v.stage === stage);
    }
    if (status && status !== "all") {
      result = result.filter((v) => v.status === status);
    }
    res.json(result);
  });

  app.post("/api/videos", (req, res) => {
    const channel = channelsStore.find((c) => c.id === Number(req.body.channel_id));
    if (!channel) {
      return res.status(400).json({ error: "A valid channel must be selected." });
    }
    const newVideo: VideoItem = {
      id: Date.now(),
      channel_id: channel.id,
      channel_name: channel.name,
      content_task_id: Math.floor(Math.random() * 900) + 100,
      title: req.body.title || "Untitled AI Short",
      description: req.body.description || "Generated YouTube Short content.",
      tags: req.body.tags || ["Shorts", "AI"],
      pipeline_type: req.body.pipeline_type || "from_scratch",
      status: "draft",
      stage: req.body.stage || "research",
      quality_score: req.body.quality_score || 0,
      quality_breakdown: req.body.quality_breakdown || {
        hook_strength: 0,
        narrative_coherence: 0,
        visual_quality: 0,
        audio_quality: 0,
        seo_optimization: 0,
      },
      duration_seconds: req.body.duration_seconds || 45,
      storage_path: `/minio/videos/short_${Date.now()}.mp4`,
      thumbnail_path: req.body.thumbnail_path || "",
      hook_text: req.body.hook_text || "",
      voiceover_tone: req.body.voiceover_tone || "Energetic",
      created_at: new Date().toISOString().replace("T", " ").substring(0, 19),
      script_scenes: req.body.script_scenes || [],
    };
    videosStore.unshift(newVideo);
    res.json({ success: true, video: newVideo });
  });

  app.post("/api/videos/:id/approve", (req, res) => {
    const id = Number(req.params.id);
    const video = videosStore.find((v) => v.id === id);
    if (video) {
      video.status = "approved";
      video.stage = "scheduled";
      video.published_at = new Date(Date.now() + 3600000 * 4).toISOString().replace("T", " ").substring(0, 19);
      res.json({ success: true, video, message: "Video approved and queued in n8n Publisher WF-10" });
    } else {
      res.status(404).json({ error: "Video not found" });
    }
  });

  app.post("/api/videos/:id/reject", (req, res) => {
    const id = Number(req.params.id);
    const { reason, target_component } = req.body;
    const video = videosStore.find((v) => v.id === id);
    if (video) {
      video.status = "failed";
      video.rejection_reason = reason || "Manual review rejected video.";
      dlqStore.unshift({
        id: `dlq_${Date.now()}`,
        workflow_id: "WF-08-quality-checker",
        task_name: `Regenerate ${target_component || "Hook"}`,
        channel_id: video.channel_id,
        channel_name: video.channel_name,
        error_message: `Rejected: ${video.rejection_reason}`,
        failure_category: "Content",
        retry_count: 1,
        max_retries: 2,
        created_at: new Date().toISOString().replace("T", " ").substring(0, 19),
        payload: { video_id: video.id, target_component },
      });
      res.json({ success: true, video, message: `Rejection registered. Targeted regeneration queued for ${target_component || "hook"}.` });
    } else {
      res.status(404).json({ error: "Video not found" });
    }
  });

  app.put("/api/videos/:id/move-stage", (req, res) => {
    const id = Number(req.params.id);
    const { new_stage } = req.body;
    const video = videosStore.find((v) => v.id === id);
    if (video) {
      video.stage = new_stage;
      if (new_stage === "published") {
        video.status = "published";
        video.published_at = new Date().toISOString().replace("T", " ").substring(0, 19);
        video.youtube_video_id = `yt_${Date.now().toString().slice(-6)}`;
      }
      res.json({ success: true, video });
    } else {
      res.status(404).json({ error: "Video not found" });
    }
  });

  // 3. System & Analytics API
  app.get("/api/system/health", (req, res) => {
    res.json(buildHealth());
  });

  app.get("/api/system/dlq", (req, res) => {
    res.json(dlqStore);
  });

  app.post("/api/system/dlq/:id/retry", (req, res) => {
    const id = req.params.id;
    dlqStore = dlqStore.filter((d) => d.id !== id);
    res.json({ success: true, message: `Task ${id} re-queued into Redis Stream for n8n processing.` });
  });

  app.get("/api/analytics/performance", (req, res) => {
    res.json(buildAnalytics());
  });

  app.get("/api/models", (req, res) => {
    res.json(modelsStore);
  });

  app.put("/api/models/:id", (req, res) => {
    const id = req.params.id;
    const modelIndex = modelsStore.findIndex((m) => m.id === id);
    if (modelIndex !== -1) {
      modelsStore[modelIndex] = { ...modelsStore[modelIndex], ...req.body };
      res.json({ success: true, model: modelsStore[modelIndex] });
    } else {
      res.status(404).json({ error: "Model not found" });
    }
  });

  // 4. n8n Daily Content Planner Manual Trigger (WF-01)
  app.post("/api/n8n/trigger-planner", (req, res) => {
    const { channel_id } = req.body;
    const targetChannel = channelsStore.find((c) => c.id === Number(channel_id)) || channelsStore[0];
    if (!targetChannel) {
      return res.status(400).json({ error: "No channel configured yet. Add a channel first." });
    }

    const newShort: VideoItem = {
      id: Date.now(),
      channel_id: targetChannel.id,
      channel_name: targetChannel.name,
      content_task_id: Math.floor(Math.random() * 900) + 100,
      title: `New Short for ${targetChannel.name}`,
      description: `Auto-generated YouTube Short for ${targetChannel.name}.`,
      tags: [targetChannel.niche, "Shorts", "Trending"],
      pipeline_type: "from_scratch",
      status: "draft",
      stage: "research",
      quality_score: 0,
      quality_breakdown: { hook_strength: 0, narrative_coherence: 0, visual_quality: 0, audio_quality: 0, seo_optimization: 0 },
      duration_seconds: 45,
      storage_path: `/minio/videos/auto_${Date.now()}.mp4`,
      thumbnail_path: "",
      hook_text: "",
      voiceover_tone: "Enthusiastic",
      created_at: new Date().toISOString().replace("T", " ").substring(0, 19),
    };

    videosStore.unshift(newShort);
    res.json({
      success: true,
      message: `WF-01 Daily Content Planner triggered for channel "${targetChannel.name}". Created video task #${newShort.id}.`,
      video: newShort,
    });
  });

  // 5. Server-side Gemini API Features
  app.post("/api/gemini/generate-script", async (req, res) => {
    try {
      const { topic, channel_niche, target_tone, target_duration } = req.body;

      if (!topic) {
        return res.status(400).json({ error: "Topic is required" });
      }

      const prompt = `You are an expert YouTube Shorts scriptwriter and viral content engineer.
Topic: "${topic}"
Niche: "${channel_niche || "General"}"
Target Tone: "${target_tone || "Energetic & Catchy"}"
Target Duration: ${target_duration || 45} seconds.

Generate a publish-ready YouTube Short specification in JSON format with:
1. title: High CTR YouTube Shorts Title (with emoji and max 60 chars)
2. hook_text: Viral first 3-second opening line (designed for max VTR)
3. description: SEO-optimized video description with 3 hashtags
4. tags: Array of 5 relevant tags
5. voiceover_tone: Tone recommendation for TTS engine
6. estimated_quality_score: Calculated quality score (0-100) based on hook strength and narrative arc
7. script_scenes: Array of 4-5 scenes, each with:
   - scene_number (number)
   - timeframe (e.g., "0:00 - 0:03")
   - visual_prompt (detailed image/video generation prompt for AI asset generator)
   - narration (exact voiceover text)
   - text_overlay (bold caption overlay text)

Ensure output is valid JSON matching this structure.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              hook_text: { type: Type.STRING },
              description: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              voiceover_tone: { type: Type.STRING },
              estimated_quality_score: { type: Type.NUMBER },
              script_scenes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    scene_number: { type: Type.INTEGER },
                    timeframe: { type: Type.STRING },
                    visual_prompt: { type: Type.STRING },
                    narration: { type: Type.STRING },
                    text_overlay: { type: Type.STRING },
                  },
                },
              },
            },
          },
        },
      });

      const parsedData = JSON.parse(response.text || "{}");
      res.json({ success: true, script: parsedData });
    } catch (err: any) {
      console.error("Gemini Script Generation Error:", err);
      res.status(503).json({
        error: "Gemini generation failed. Ensure GEMINI_API_KEY is configured and the model is available.",
      });
    }
  });

  app.post("/api/gemini/optimize-hook", async (req, res) => {
    try {
      const { current_hook, niche } = req.body;
      const prompt = `You are a viral YouTube Shorts hook optimizer.
Analyze this current opening hook line: "${current_hook}" for niche "${niche || "General"}".
Rewrite it into 3 alternative high-impact hooks designed to achieve 85%+ View-Through Rate (VTR).
Return JSON with:
- hook_analysis: Brief explanation of current hook weaknesses
- optimized_hooks: Array of 3 improved hook strings with target psychological trigger (Curiosity, Urgency, Fear Of Missing Out).`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hook_analysis: { type: Type.STRING },
              optimized_hooks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    hook_line: { type: Type.STRING },
                    trigger_type: { type: Type.STRING },
                    predicted_vtr: { type: Type.NUMBER },
                  },
                },
              },
            },
          },
        },
      });

      const parsedData = JSON.parse(response.text || "{}");
      res.json({ success: true, result: parsedData });
    } catch (err: any) {
      console.error("Gemini Hook Optimization Error:", err);
      res.status(503).json({
        error: "Gemini generation failed. Ensure GEMINI_API_KEY is configured and the model is available.",
      });
    }
  });

  // Vite middleware for dev or static serving for prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Autonomous Shorts Dashboard server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
