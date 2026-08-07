import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

import {
  INITIAL_CHANNELS,
  INITIAL_VIDEOS,
  INITIAL_SYSTEM_HEALTH,
  INITIAL_AI_MODELS,
  INITIAL_DLQ_TASKS,
  ANALYTICS_DATA
} from "./src/data/mockData.ts";
import { Channel, VideoItem, DLQTask } from "./src/types.ts";

let channelsStore: Channel[] = [...INITIAL_CHANNELS];
let videosStore: VideoItem[] = [...INITIAL_VIDEOS];
let dlqStore: DLQTask[] = [...INITIAL_DLQ_TASKS];
let modelsStore = [...INITIAL_AI_MODELS];

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
      avg_vtr: 65.0,
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
    const channel = channelsStore.find((c) => c.id === Number(req.body.channel_id)) || channelsStore[0];
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
      quality_score: req.body.quality_score || 85.0,
      quality_breakdown: req.body.quality_breakdown || {
        hook_strength: 85,
        narrative_coherence: 85,
        visual_quality: 85,
        audio_quality: 85,
        seo_optimization: 85,
      },
      duration_seconds: req.body.duration_seconds || 45,
      storage_path: `/minio/videos/short_${Date.now()}.mp4`,
      thumbnail_path: req.body.thumbnail_path || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
      hook_text: req.body.hook_text || "Stop scrolling right now!",
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
      // Create a DLQ entry or trigger partial regeneration
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
        video.views = Math.floor(Math.random() * 5000) + 1200;
        video.likes = Math.floor(video.views * 0.08);
        video.vtr = Number((Math.random() * 15 + 65).toFixed(1));
      }
      res.json({ success: true, video });
    } else {
      res.status(404).json({ error: "Video not found" });
    }
  });

  // 3. System & Analytics API
  app.get("/api/system/health", (req, res) => {
    // Dynamically perturb CPU and Memory slightly for live feel
    const jitter = (Math.random() - 0.5) * 2;
    const currentHealth = {
      ...INITIAL_SYSTEM_HEALTH,
      cpu_pct: Number((INITIAL_SYSTEM_HEALTH.cpu_pct + jitter).toFixed(1)),
      memory_pct: Number((INITIAL_SYSTEM_HEALTH.memory_pct + jitter * 0.5).toFixed(1)),
      redis_queue_lag: Math.max(0, Math.floor(INITIAL_SYSTEM_HEALTH.redis_queue_lag + jitter * 2)),
    };
    res.json(currentHealth);
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
    res.json(ANALYTICS_DATA);
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

    // Create 2 new video tasks for this channel
    const newShort1: VideoItem = {
      id: Date.now(),
      channel_id: targetChannel.id,
      channel_name: targetChannel.name,
      content_task_id: Math.floor(Math.random() * 900) + 100,
      title: `AI Trend Breakdown: ${targetChannel.niche} Update #${Math.floor(Math.random() * 50) + 1}`,
      description: `Auto-generated YouTube Short by n8n WF-01 Daily Planner for ${targetChannel.name}.`,
      tags: [targetChannel.niche, "Shorts", "Trending"],
      pipeline_type: "from_scratch",
      status: "draft",
      stage: "research",
      quality_score: 86.5,
      quality_breakdown: { hook_strength: 88, narrative_coherence: 85, visual_quality: 86, audio_quality: 87, seo_optimization: 86 },
      duration_seconds: 45,
      storage_path: `/minio/videos/auto_${Date.now()}.mp4`,
      thumbnail_path: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
      hook_text: "You will not believe what just happened in this industry!",
      voiceover_tone: "Enthusiastic",
      created_at: new Date().toISOString().replace("T", " ").substring(0, 19),
    };

    videosStore.unshift(newShort1);
    res.json({
      success: true,
      message: `WF-01 Daily Content Planner triggered for channel "${targetChannel.name}". Created video task #${newShort1.id}.`,
      video: newShort1,
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
      // Fallback mock payload if offline or missing key
      res.json({
        success: true,
        is_fallback: true,
        script: {
          title: `Viral Breakdown: ${req.body.topic || "AI Technology"} 🚀`,
          hook_text: `Stop scrolling right now if you want to master ${req.body.topic || "AI"} in 30 seconds!`,
          description: `Everything you need to know about ${req.body.topic || "tech breakthroughs"} in short format. #Shorts #Tech #Innovations`,
          tags: ["Shorts", "Tech", "Tutorial", "AI", "Trends"],
          voiceover_tone: "High Energy & Direct",
          estimated_quality_score: 91.5,
          script_scenes: [
            {
              scene_number: 1,
              timeframe: "0:00 - 0:03",
              visual_prompt: "Glowing neon cyberpunk city with futuristic data streams",
              narration: `Stop scrolling right now if you want to master ${req.body.topic || "AI"} in 30 seconds!`,
              text_overlay: "MUST WATCH 🚀",
            },
            {
              scene_number: 2,
              timeframe: "0:03 - 0:20",
              visual_prompt: "Sleek animated 3D graphical breakdown of modern software architecture",
              narration: "First, understanding the core mechanism allows you to bypass 90% of traditional friction.",
              text_overlay: "Step 1: Simplify 🧠",
            },
            {
              scene_number: 3,
              timeframe: "0:20 - 0:45",
              visual_prompt: "Futuristic digital dashboard displaying exponential curve graphs",
              narration: "Second, automate the pipeline to double your output with zero extra overhead.",
              text_overlay: "Step 2: Automate ⚡",
            },
          ],
        },
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
      res.json({
        success: true,
        is_fallback: true,
        result: {
          hook_analysis: "The original hook lacks direct confrontation and immediate stakes.",
          optimized_hooks: [
            { hook_line: `If you still do this in 2026, you are wasting 5 hours every single day!`, trigger_type: "Urgency & Pain Point", predicted_vtr: 92.4 },
            { hook_line: `Nobody is talking about this hidden trick, but it changes everything.`, trigger_type: "Curiosity Gap", predicted_vtr: 88.0 },
            { hook_line: `Stop doing this immediately unless you want to get left behind.`, trigger_type: "FOMO", predicted_vtr: 86.5 },
          ],
        },
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
