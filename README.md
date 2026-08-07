# 🎬 YouTube Shorts Autonomous Production Dashboard

An enterprise-grade **Content Management & Observability Dashboard** for orchestrating autonomous **n8n YouTube Shorts production pipelines**, multi-provider AI model routing, quality scoring, Dead Letter Queue (DLQ) error recovery, and channel performance analytics.

---

## 🌟 Overview

The **YouTube Shorts Autonomous Production Dashboard** provides a centralized control tower for managing multi-channel automated video creation pipelines. Built for high-frequency video generation networks, this platform bridges human oversight with fully automated n8n workflows, generative AI scriptwriting (via Google Gemini 3.6 Flash), video rendering, and YouTube publishing.

### Key Capabilities
- 📺 **Multi-Channel Fleet Management**: Configure niches, daily upload caps, budget limits, target audiences, and AI model preferences per YouTube channel.
- 📋 **Kanban Content Queue & Stage Pipeline**: Monitor video production progression across 6 automated stages from initial trend research to publication.
- 🤖 **Gemini AI Scripting & Viral Hook Lab**: Harness server-side Gemini 3.6 Flash to generate full multi-scene scripts, visual prompts, TTS narration, and psychological hook optimizations.
- 📊 **Granular Quality Scoring System**: Comprehensive 5-factor quality audit evaluating Hook Strength (30%), Narrative Coherence (25%), Visual Quality (20%), Audio Quality (15%), and SEO Optimization (10%).
- 🛡️ **System Observability & Docker Stack Control**: Live health monitoring for all 9 core microservices (Postgres, Redis, n8n, MinIO S3, ComfyUI, Whisper TTS, FFmpeg, Express Dashboard).
- ⚡ **Multi-Model AI Routing Matrix**: Configure provider priorities, fallback chains, latencies, and token costs across OpenAI, Gemini, Claude, DeepSeek, Qwen, and Llama models.
- 🔄 **Dead Letter Queue (DLQ) & Error Handler**: Intercept failed tasks from n8n `WF-15`, inspect stack traces, and re-queue tasks back into Redis streams with one click.
- 📈 **Performance Analytics Suite**: Deep insights into view counts, subscriber conversion rates, VTR (View-Through Rate) benchmarks, time-of-day heatmaps, and budget allocation.

---

## 🏗️ System Architecture & Workflow Pipeline

The platform controls a multi-service containerized infrastructure with **15 core n8n workflows** handling the autonomous video production pipeline:

```
                  ┌─────────────────────────────────────────┐
                  │   YouTube Shorts Dashboard (Express)    │
                  └────────────────────┬────────────────────┘
                                       │ (REST API / Manual Triggers)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          n8n Workflow Engine Stack                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  WF-01: Daily Planner & Trend Research  ──────►  WF-02: Gemini Scripting    │
│                                                            │                │
│  WF-05: FFmpeg Assembly ◄────── WF-04: ComfyUI ◄────── WF-03: TTS Audio     │
│           │                                                                 │
│           ▼                                                                 │
│  WF-08: Quality Scorer ──────► [Quality Score ≥ 80?]                        │
│                                    │               │                        │
│                                 (YES)             (NO)                      │
│                                    │               │                        │
│                                    ▼               ▼                        │
│                            WF-10: Publisher   WF-15: Dead Letter Queue (DLQ) │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Core Workflow Summary

| Workflow ID | Name | Role & Functionality |
| :--- | :--- | :--- |
| **WF-01** | Daily Content Planner | Researches trending topics per niche & schedules daily tasks |
| **WF-02** | Gemini AI Scripting Engine | Calls Gemini API to generate multi-scene scripts & visual prompts |
| **WF-03** | TTS Audio Synthesizer | Converts narration scripts into voiceover audio using ElevenLabs/Whisper |
| **WF-04** | ComfyUI Asset Generator | Generates vertical 9:16 background visuals & AI animations |
| **WF-05** | FFmpeg Video Assembler | Merges visual assets, voiceover audio, and animated caption overlays |
| **WF-08** | Automated Quality Checker | Evaluates video quality score (0-100) and VTR likelihood |
| **WF-10** | YouTube Shorts API Publisher | Automatically uploads approved videos to YouTube with SEO metadata |
| **WF-15** | Dead Letter Queue Handler | Catches failed executions, logs error categories, and waits for re-queue |

---

## 🚀 Key Features & UI Modules

### 1. Overview Dashboard
- High-level KPIs: Active Channels, Queued Videos, Published Count, Average Quality Score, System CPU/RAM utilization.
- Fast-action controls: Direct script generation trigger, manual daily planner execution, and quick channel switching.

### 2. Multi-Channel Fleet Management (`ChannelsView`)
- View and manage individual channel settings, including target audience demographics, daily upload limits, and daily USD budget caps.
- Monitor channel performance metrics (subscribers, total views, average View-Through Rate).
- Create new channel configurations with custom CRON schedules.

### 3. Kanban Content Pipeline (`ContentQueueView`)
- Filter content queue by Channel, Pipeline Stage, and Status.
- Interactive drag/select move across 6 pipeline stages:
  1. `Research` - Niche topic discovery
  2. `Scripting` - AI script and scene creation
  3. `Voiceover & Assets` - TTS synthesis and ComfyUI generation
  4. `Video Render` - FFmpeg stitching and captioning
  5. `Quality Review` - Automated quality scoring & human approval
  6. `Scheduled / Published` - Queued for YouTube API publication
- **Human-in-the-Loop Review Modal (`VideoDetailModal`)**: Inspect scene breakdown, visual AI prompts, audio narration, and quality score breakdowns. Approve videos for publish or reject with targeted component regeneration options.

### 4. Gemini AI Scripting & Viral Hook Lab (`ScriptLabModal`)
- Server-side integration with **Google Gemini 3.6 Flash**.
- Generates publication-ready YouTube Shorts scripts with structured JSON output containing titles, first 3-second hooks, scene breakdowns, visual prompts, and TTS narration.
- **Hook Optimization Engine**: Rewrites low-performing hooks using psychological trigger formulas (Curiosity Gap, Urgency, Pain Points, FOMO) predicting 85%+ VTR.

### 5. System Observability & AI Routing (`SystemHealthView`)
- **Docker Compose Stack Inventory**: Real-time observability for all 9 container services with CPU %, memory consumption, uptime, and service status.
- **Circuit Breaker & Redis Consumer Lag**: Monitor Redis stream lag and circuit breaker status.
- **Multi-Model AI Router Matrix**: Toggle active status, prioritize models, and compare cost per 1k tokens, latency, and quality benchmarks across Gemini, OpenAI, Claude, DeepSeek, Qwen, and Llama.
- **Dead Letter Queue (DLQ)**: View failed tasks, error messages, and retry count. Single-click re-queueing back into n8n execution streams.

### 6. Channel Analytics & VTR Insights (`AnalyticsView`)
- Visual performance charts tracking monthly view volume and subscriber growth.
- VTR performance distribution across hook categories.
- Time-of-day publication heatmaps for optimal engagement window identification.
- AI model cost vs. quality performance analysis.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**:
  - React 19 (Functional components, custom state hooks)
  - TypeScript (Strict typing for all entities)
  - Tailwind CSS v4 (Clean, enterprise light mode design system)
  - Lucide React (Icons)
  - Motion / Framer Motion (Fluid modal transitions & list animations)

- **Backend / API**:
  - Express.js (Custom REST API server running on Node.js)
  - `@google/genai` (Official Google Gemini SDK for Gemini 3.6 Flash)
  - `esbuild` & `tsx` (TypeScript bundling and dev execution)
  - Vite (Vite middleware integration)

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/channels` | List all channel configurations |
| **POST** | `/api/channels` | Create a new channel pipeline config |
| **PUT** | `/api/channels/:id` | Update channel budget, schedule, or settings |
| **GET** | `/api/videos` | List video tasks with filtering by `channel_id`, `stage`, and `status` |
| **POST** | `/api/videos` | Manually queue a new video item |
| **POST** | `/api/videos/:id/approve` | Approve video task for YouTube publishing (WF-10) |
| **POST** | `/api/videos/:id/reject` | Reject video & queue targeted component regeneration |
| **PUT** | `/api/videos/:id/move-stage` | Advance or revert video pipeline stage |
| **GET** | `/api/system/health` | Get container stack metrics, circuit breaker status, and Redis lag |
| **GET** | `/api/system/dlq` | List failed tasks in Dead Letter Queue |
| **POST** | `/api/system/dlq/:id/retry` | Re-queue failed DLQ task back into n8n stream |
| **GET** | `/api/analytics/performance` | Retrieve analytics metrics & chart time series |
| **GET** | `/api/models` | List multi-model routing configs & cost matrices |
| **PUT** | `/api/models/:id` | Toggle model active state or priority |
| **POST** | `/api/n8n/trigger-planner` | Manually trigger n8n WF-01 Daily Content Planner |
| **POST** | `/api/gemini/generate-script` | Server-side Gemini 3.6 Flash script generation |
| **POST** | `/api/gemini/optimize-hook` | Server-side Gemini 3.6 Flash viral hook re-writer |

---

## 💻 Getting Started & Local Development

### Prerequisites
- Node.js 20+
- npm or bun

### Environment Configuration
Create or modify `.env` (or refer to `.env.example`):
```env
# Server Port (Hardcoded to 3000 in AI Studio environment)
PORT=3000

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Node Environment
NODE_ENV=development
```

### Installation
1. Install project dependencies:
   ```bash
   npm install
   ```

2. Start the development server (Express + Vite middleware):
   ```bash
   npm run dev
   ```

3. Open your browser at `http://localhost:3000`.

### Build & Production Start
1. Compile the applet and backend bundle:
   ```bash
   npm run build
   ```
2. Launch the standalone CommonJS server:
   ```bash
   npm start
   ```

---

## 📂 Project Structure

```
├── .env.example              # Environment variable specifications
├── metadata.json             # Application metadata and capabilities
├── package.json              # Project scripts and dependencies
├── server.ts                 # Express backend server & Gemini API routes
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite configuration
└── src/
    ├── App.tsx               # Main application view container & tab router
    ├── main.tsx              # React DOM entry point
    ├── index.css             # Global Tailwind CSS imports
    ├── types.ts              # Global TypeScript interfaces & enums
    ├── data/
    │   └── mockData.ts       # Initial channels, videos, health metrics & models
    └── components/
        ├── Header.tsx        # System status header & quick actions
        ├── Sidebar.tsx       # Main navigation drawer
        ├── OverviewView.tsx  # KPI overview & stage summary
        ├── ChannelsView.tsx  # Channel fleet management & budgets
        ├── ContentQueueView.tsx # Kanban stage board & video filters
        ├── SystemHealthView.tsx # Docker containers, AI models & DLQ
        ├── AnalyticsView.tsx # Channel metrics & performance graphs
        ├── VideoDetailModal.tsx # Video review, quality breakdown & hook AI
        └── ScriptLabModal.tsx  # Gemini script generation interface
```

---

## 📄 License

This project is licensed under the MIT License.
