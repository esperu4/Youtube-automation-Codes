# 🎬 YouTube Shorts Autonomous Production Dashboard

> **A "control tower" for an army of AI robots that research, script, voice, render, review and publish YouTube Shorts — all on autopilot, with a human approval checkpoint.**

This repository contains the **dashboard** (web app + backend API) that sits on top of an **n8n automation engine**. The n8n engine does the heavy lifting; the dashboard is where you *watch, manage, approve, and steer* the whole factory.

---

## 🧭 Table of Contents

- [The Simple Story](#-the-simple-story)
- [How It Works (The Big Picture)](#-how-it-works-the-big-picture)
- [System Architecture](#-system-architecture)
- [The n8n Workflow Engine](#-the-n8n-workflow-engine)
- [🗺️ Where We Are Right Now (Build Status)](#-where-we-are-right-now-build-status)
- [What's Done vs. What's Next](#-whats-done-vs-whats-next)
- [📡 REST API Reference](#-rest-api-reference)
- [💻 Running the Dashboard Locally](#-running-the-dashboard-locally)
- [📂 Project Structure](#-project-structure)
- [🔑 Credentials You Must Create](#-credentials-you-must-create)
- [🧩 Key Features & UI Modules](#-key-features--ui-modules)
- [🛣️ Roadmap](#️-roadmap)
- [📄 License](#-license)

---

## 🌟 The Simple Story

Imagine a factory that makes **YouTube Shorts** (45-second vertical videos) all day, every day, with almost no human in the loop.

The factory has **stations** (we call them *workflows* or *WF*):

1. A **researcher** finds trending topics.
2. An **AI scriptwriter** (Google Gemini) turns a topic into a full script with scenes, voiceover text, and image prompts.
3. A **voice actor** (TTS) reads the narration out loud.
4. A **graphic artist** (ComfyUI) draws the visuals.
5. A **video editor** (FFmpeg) stitches visuals + voice + captions into a finished `.mp4`.
6. A **quality inspector** (Gemini again) scores the result from 0–100. **Below 80 → back to the drawing board.**
7. A **publisher** (YouTube API) uploads approved videos automatically.

Every station is an **n8n workflow**. The dashboard in this repo is the **control room**: it shows the live factory floor, lets you approve/reject videos, watch system health, and manage many channels at once.

> **In short:** *Dashboard = where you look and click. n8n = where the robots actually work.*

---

## 🔄 How It Works (The Big Picture)

```
 YOU OPEN THE DASHBOARD
        │
        ▼
 ┌────────────────────────────────────────────┐
 │          DASHBOARD (this repo)             │
 │  • watch the queue   • approve/reject      │
 │  • manage channels   • trigger the planner │
 └──────────────┬─────────────────────────────┘
                │ fires a webhook (or a manual click)
                ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                   n8n AUTOMATION ENGINE                     │
 │                                                              │
 │  WF-01 Planner ─▶ WF-02 Script ─▶ WF-03 TTS ─▶ WF-04 ComfyUI │
 │                                              │              │
 │  WF-05 FFmpeg ◀──────────────────────────────┘              │
 │      │                                                     │
 │      ▼                                                     │
 │  WF-08 Quality Score ───▶ ≥ 80? ──YES──▶ WF-10 Publish     │
 │                              │            │                │
 │                              NO           ▼                │
 │                              │        YouTube Shorts       │
 │                              ▼                             │
 │                        rework / DLQ (WF-15)                │
 └──────────────────────────────────────────────────────────────┘
```

The whole thing is **one idea**: *"produce a Short from a topic, grade it, publish it only if it's good."*

---

## 🏗️ System Architecture

### Full production stack (target)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Production Docker Stack                          │
│                                                                         │
│   ┌────────────┐   ┌────────────┐   ┌──────────────┐                    │
│   │  Postgres  │   │   Redis    │   │    MinIO S3  │                    │
│   │  (records) │   │ (queue/lag)│   │ (video/audio)│                    │
│   └────────────┘   └────────────┘   └──────────────┘                    │
│                                                                         │
│   ┌────────────┐   ┌────────────┐   ┌──────────────┐                    │
│   │   n8n      │◀─▶│  ComfyUI   │   │ Whisper TTS  │                    │
│   │  (15 WFs)  │   │  (images)  │   │  (voice)     │                    │
│   └────────────┘   └────────────┘   └──────────────┘                    │
│                                                                         │
│   ┌────────────────────────────┐   ┌──────────────────────────────────┐ │
│   │      Express Dashboard     │──▶│      YouTube Shorts API          │ │
│   │  (this repo, port 3000)    │   │  (final upload, WF-10)           │ │
│   └────────────────────────────┘   └──────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### Tech stack in this repo

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19 · TypeScript · Tailwind CSS v4 · Lucide icons · Motion |
| **Backend** | Express.js (Node) · `@google/genai` (Gemini SDK) · Vite middleware |
| **Build** | esbuild + tsx (dev) · Vite (frontend bundle) |
| **Automation** | n8n (external engine, driven via REST webhooks) |

---

## 🤖 The n8n Workflow Engine

The dashboard is *nothing* without the n8n engine. Each workflow is a self-contained HTTP endpoint (a webhook) plus its internal logic nodes.

### Pipeline diagram

```
         WF-01                         WF-02
  ┌──────────────────┐        ┌──────────────────────┐
  │ Daily Planner    │  ───▶  │ Gemini Scripting     │
  │ & Trend Research │        │ Engine (WF-02)       │
  └──────────────────┘        └──────────┬───────────┘
                                        │ script + scenes
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
        ┌───────────────┐    ┌──────────────────┐  ┌─────────────────┐
        │ WF-03         │    │ WF-04            │  │ (meta/state)    │
        │ TTS Audio     │    │ ComfyUI Assets   │  │                 │
        └───────┬───────┘    └──────────────────┘  └─────────────────┘
                └───────────────┬──────────────────┘
                                ▼
                     ┌────────────────────┐
                     │ WF-05 FFmpeg       │  audio + images ─▶ video
                     └─────────┬──────────┘
                               ▼
                     ┌────────────────────┐
                     │ WF-08 Quality Check│  score ≥ 80 ?
                     └───┬────────────┬───┘
                      YES│            │NO
                         ▼            ▼
              ┌────────────────┐  ┌─────────────────────┐
              │ WF-10 Publish  │  │ rework / WF-15 DLQ  │
              └────────────────┘  └─────────────────────┘
```

### Workflow summary table

| ID | Name | What it does | Status |
| :--- | :--- | :--- | :--- |
| **WF-01** | Daily Planner & Trend Research | Researches trending topics per niche, schedules daily content tasks | ✅ **LIVE** |
| **WF-02** | Gemini Scripting Engine | Calls Gemini to generate multi-scene scripts + visual prompts | 🔶 Built · needs key |
| **WF-03** | TTS Audio Synthesizer | Converts narration into voiceover audio | ✅ **LIVE** |
| **WF-04** | ComfyUI Asset Generator | Generates vertical 9:16 visuals (submit → wait → poll → download) | ✅ **LIVE** |
| **WF-05** | FFmpeg Video Assembler | Merges visuals + voiceover + captions into `.mp4` | ✅ **LIVE** |
| **WF-08** | Automated Quality Checker | Scores quality 0–100 (Hook 30 · Narrative 25 · Visual 20 · Audio 15 · SEO 10) | 🔶 Built · needs key |
| **WF-10** | YouTube Shorts Publisher | Uploads approved videos with SEO metadata | 🔶 Built · needs key |
| **WF-15** | Dead Letter Queue Handler | Catches failed executions, logs error category, waits for re-queue | ✅ **LIVE** |

> **Legend:** ✅ LIVE = published & webhook callable · 🔶 Built = created + validated, waiting on a credential.

---

## 🗺️ Where We Are Right Now (Build Status)

> **Last updated:** 8 August 2026 — this section is the single source of truth for project progress.

### Overall progress

```
Pipeline build ████████████████████████░░░░░░░░░░░  ~70% done
                                  │
                                  └─ remaining: credentials + wiring the dashboard to n8n
```

### What is already running on the n8n instance

All **8 workflows** are created and validated on the live n8n instance
(`https://surgery-squishy-persecute.ngrok-free.dev`, n8n MCP Server v1.1.0).
**5 are published (active)**, **3 are blocked on credentials**.

| # | Workflow | Node count | Webhook | Active? |
| :-: | :--- | :-: | :--- | :-: |
| 1 | WF-01 Daily Planner & Trend Research | 5 | `POST /webhook/wf-01` | ✅ **YES** |
| 2 | WF-02 Gemini Scripting Engine | 5 | `POST /webhook/wf-02` | ❌ needs Gemini key |
| 3 | WF-03 TTS Audio Synthesizer | 5 | `POST /webhook/wf-03` | ✅ **YES** |
| 4 | WF-04 ComfyUI Asset Generator | 10 | `POST /webhook/wf-04` | ✅ **YES** |
| 5 | WF-05 FFmpeg Video Assembler | 5 | `POST /webhook/wf-05` | ✅ **YES** |
| 8 | WF-08 Automated Quality Checker | 5 | `POST /webhook/wf-08` | ❌ needs Gemini key |
| 10 | WF-10 YouTube Shorts Publisher | 5 | `POST /webhook/wf-10` | ❌ needs YouTube OAuth |
| 15 | WF-15 Dead Letter Queue Handler | 3 | (error trigger) | ✅ **YES** |

### Verified live tests ✅

| Workflow | Test | Result |
| :--- | :--- | :--- |
| WF-01 | Live `curl POST /webhook/wf-01` | ✅ returned 2 content plans, respected `max_daily_uploads: 2` |
| WF-01 | Scheduled-cron execution (pinned) | ✅ all 4 nodes succeeded |
| WF-02 | Full-graph pinned test (fake Gemini output) | ✅ script JSON parsed into structured scenes, metadata preserved |

### Known blockers ⚠️

1. **No credentials exist yet** on the n8n instance (`list_credentials` → 0).
   - WF-02 & WF-08 need a **Google Gemini API** credential.
   - WF-10 needs a **YouTube OAuth2** credential.
   - Until these exist, those three workflows cannot be **published** or **tested live** (n8n rejects them at pre-execution credential check).
2. **Dashboard → n8n wiring is still fake.** In `server.ts`, the `/api/n8n/trigger-planner` route only creates an in-memory video and returns a pretend message. It does **not yet** call the real `POST /webhook/wf-01` endpoint.
3. **WF-15 is standalone.** It is published but **not linked** as an error workflow to any other workflow (deliberate — error handling is opt-in).

### What's next (priority order)

```
[1] Create Google Gemini API credential in n8n  ── unlocks WF-02 + WF-08
[2] Create YouTube OAuth2 credential in n8n      ── unlocks WF-10
[3] Publish WF-02, WF-08, WF-10 after creds      ── all 8 workflows live
[4] Point server.ts /api/n8n/* routes at real
    n8n webhooks (wf-01 … wf-10)                 ── dashboard drives the real engine
[5] (Optional) Link WF-15 as shared error workflow
[6] npm run lint + full live end-to-end test
```

---

## ✅ What's Done vs. What's Next

| Area | Done | Not yet |
| :--- | :--- | :--- |
| **Dashboard UI** | Modern React 19 UI, all views (Overview, Channels, Queue, Health, Analytics), all mock data removed | — |
| **Backend API** | Full REST API for channels / videos / DLQ / analytics / models / Gemini script + hook | Replace fake n8n trigger with real webhook call |
| **n8n engine** | 8 of 15 workflows created + validated; 5 published & tested | Remaining workflows (06/07/09/11/12/13/14), credentials, DLQ linking |
| **Integration** | Dashboard API is defined; n8n webhooks are live | `server.ts` → real n8n webhooks wiring |

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/channels` | List all channel configurations |
| **POST** | `/api/channels` | Create a new channel pipeline config |
| **PUT** | `/api/channels/:id` | Update channel budget, schedule, or settings |
| **GET** | `/api/videos` | List video tasks (filter by `channel_id`, `stage`, `status`) |
| **POST** | `/api/videos` | Manually queue a new video item |
| **POST** | `/api/videos/:id/approve` | Approve video for YouTube publishing (→ WF-10) |
| **POST** | `/api/videos/:id/reject` | Reject video + queue targeted component regeneration |
| **PUT** | `/api/videos/:id/move-stage` | Advance or revert pipeline stage |
| **GET** | `/api/system/health` | Host CPU/RAM + stack health snapshot |
| **GET** | `/api/system/dlq` | List failed tasks in Dead Letter Queue |
| **POST** | `/api/system/dlq/:id/retry` | Re-queue failed DLQ task |
| **GET** | `/api/analytics/performance` | Analytics metrics & chart time series |
| **GET** | `/api/models` | Multi-model routing configs & cost matrices |
| **PUT** | `/api/models/:id` | Toggle model active state or priority |
| **POST** | `/api/n8n/trigger-planner` | Trigger n8n WF-01 planner *(currently simulated — wiring to real webhook pending)* |
| **POST** | `/api/gemini/generate-script` | Server-side Gemini script generation |
| **POST** | `/api/gemini/optimize-hook` | Server-side Gemini viral hook re-writer |

---

## 💻 Running the Dashboard Locally

### Prerequisites

- Node.js 20+
- npm

### Environment configuration

Create a `.env` file (or use `.env.example`):

```env
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

### Install & run

```bash
# 1. Install dependencies
npm install

# 2. Dev server (Express + Vite middleware)
npm run dev

# 3. Open the dashboard
#    http://localhost:3000
```

### Build & production start

```bash
npm run build     # bundles frontend + backend
npm start         # runs dist/server.cjs
```

### Type-check (lint)

```bash
npm run lint      # tsc --noEmit
```

---

## 📂 Project Structure

```
├── .env.example              # Environment variable specs
├── metadata.json             # Application metadata & capabilities
├── package.json              # Scripts & dependencies
├── server.ts                 # Express backend, REST API & Gemini routes
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite configuration
└── src/
    ├── App.tsx               # Main app container & tab router
    ├── main.tsx              # React DOM entry point
    ├── index.css             # Global Tailwind styles
    ├── types.ts              # Global TypeScript interfaces & enums
    └── components/
        ├── Header.tsx              # System status header & quick actions
        ├── Sidebar.tsx             # Main navigation
        ├── OverviewView.tsx        # KPIs & stage summary
        ├── ChannelsView.tsx        # Channel fleet management & budgets
        ├── ContentQueueView.tsx    # Kanban board & video filters
        ├── SystemHealthView.tsx    # Host health, models & DLQ
        ├── AnalyticsView.tsx       # Channel metrics & charts
        ├── VideoDetailModal.tsx    # Video review & quality breakdown
        ├── ScriptLabModal.tsx      # Gemini script generation
        └── Thumbnail.tsx           # Reusable video thumbnail
```

---

## 🔑 Credentials You Must Create

| Service | Used by | Where |
| :--- | :--- | :--- |
| **Google Gemini API** | WF-02, WF-08 (+ dashboard `/api/gemini/*`) | n8n UI → Credentials → Google Gemini API |
| **YouTube OAuth2** | WF-10 | n8n UI → Credentials → YouTube OAuth2 API |

> These must be created in the **n8n UI** (the MCP automation layer cannot mint credentials). Until then the affected workflows stay in draft.

---

## 🧩 Key Features & UI Modules

1. **Overview Dashboard** — active channels, queued/published counts, avg quality score, host CPU/RAM.
2. **Channels (`ChannelsView`)** — per-channel niche, audience, daily upload caps, USD budget, CRON schedule, subscriber/view/VTR metrics.
3. **Kanban Queue (`ContentQueueView`)** — drag videos across stages: *Research → Scripting → Voiceover & Assets → Video Render → Quality Review → Scheduled / Published*. Built-in **human approval modal** (approve, or reject a specific component like the hook).
4. **Script Lab (`ScriptLabModal`)** — Gemini generates full scripts with hooks, scene breakdowns, visual prompts & TTS narration.
5. **System Health (`SystemHealthView`)** — host metrics, model routing matrix, DLQ with one-click retry.
6. **Analytics (`AnalyticsView`)** — views, subscriber growth, VTR distribution, time-of-day heatmaps, cost vs. quality.

---

## 🛣️ Roadmap

- [x] Dashboard UI modernized & mock data removed
- [x] Full REST API backend (channels, videos, DLQ, analytics, Gemini)
- [x] 8 of 15 n8n workflows created & validated; 5 published & tested live
- [ ] Google Gemini + YouTube OAuth credentials in n8n
- [ ] Publish WF-02 / WF-08 / WF-10
- [ ] Wire `server.ts` n8n routes to real webhooks
- [ ] Link WF-15 as shared error handler
- [ ] Remaining 7 workflows (WF-06/07/09/11/12/13/14)
- [ ] End-to-end production test: topic → published Short

---

## 📄 License

This project is licensed under the **MIT License**.
