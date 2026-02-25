# HotBot Studios — Website

## Overview
Full-service digital agency website built as a single React component (3,400+ lines). Dark navy theme with animated grid background, glassmorphism, 3D tilt cards, and progressive blur effects.

## Pages (13 total)
| Route | Page | SEO Title |
|-------|------|-----------|
| `home` | Homepage | HotBot Studios \| Best Digital Marketing & AI Automation Services in UK |
| `ai-automation` | AI & Automation (Products + Services) | Best AI Automation Services in UK |
| `marketing-services` | Digital Marketing | Best Digital Marketing Services in UK |
| `software-development` | Content Production Studio | Best Content Production Studio Services in UK |
| `software-dev` | Software Development | Best Software Development Services in UK |
| `public-relations` | Public Relations | Best Public Relations Services in UK |
| `ui-ux-design` | UI/UX Design | Best UI/UX Design Services in UK |
| `consultancy` | Marketing Consulting | Best Marketing Consulting Services in UK |
| `about` | About | About HotBot Studios |
| `contact` | Contact | Contact HotBot Studios |
| `blogs` | Blog | Blog \| Digital Marketing Insights |
| `products` | → Redirects to AI Automation | AI Automation Products |
| `dashboard` | Leads CRM Dashboard | Leads Dashboard |

## AI Products (6)
1. **Heka** — AI Voice Assistant (Sarvam AI powered)
2. **Website Keyword Assistant** — SEO Intelligence Bot
3. **Telegram Keyword Assistant** — Community Monitoring Bot
4. **LinkedIn Post Assistant** — Content Automation
5. **Instagram Post Assistant** — Visual Content AI
6. **Mental Wellness Assistant** — Employee Wellbeing Bot

## Key Features
- **HotBot Chat + Voice Agent** — Bottom-right floating chatbot with text and voice modes
  - Chat mode: sends messages to n8n webhook
  - Voice mode: records audio via MediaRecorder, sends base64 to webhook for Sarvam AI
  - Webhook: `https://n8n.harshpreetbhasin.com/webhook-test/hotbotstudios.com`
- **Multi-step Form Modal** — 3-step lead capture (Contact → Service/Budget → Message)
- **Leads Dashboard** — CRM with status management (New/Contacted/Converted)
- **Progressive Blur** — Fixed top/bottom viewport overlays
- **Google Analytics** — G-5CNWV5X1KC integrated
- **Schema.org** — FAQ markup on all service pages, Organization schema
- **Dynamic Titles** — SEO-optimized per page
- **Animated Grid** — Scroll-aware dot grid background
- **14 Unique Infographics** — SVG illustrations per page

## Webhook Payload Formats

### Chat Mode
```json
{
  "message": "user text",
  "mode": "chat",
  "source": "hotbot-website",
  "history": [{ "role": "bot/user", "content": "..." }],
  "timestamp": "ISO string"
}
```

### Voice Mode
```json
{
  "audio": "<base64 encoded audio>",
  "audioFormat": "audio/webm",
  "mode": "voice",
  "source": "hotbot-voice",
  "history": [{ "role": "bot/user", "content": "..." }],
  "timestamp": "ISO string"
}
```

### Expected Response
```json
{
  "message": "Bot text response",
  "audio": "<optional base64 audio for voice playback>",
  "audioFormat": "audio/mp3"
}
```

## Deployment Options

### Option 1: Claude Artifact (Current)
The `.jsx` file renders directly in Claude's artifact viewer.

### Option 2: Vite + React
```bash
npm create vite@latest hotbot -- --template react
cd hotbot
# Replace src/App.jsx with hotbot-studios.jsx content
npm install
npm run dev
```

### Option 3: Next.js
```bash
npx create-next-app@latest hotbot
# Add "use client" at top of hotbot-studios.jsx
# Place in app/page.jsx
npm run dev
```

### Option 4: Static HTML
Use the included `index.html` with Babel standalone (dev only, not for production).

## Client Logos
The "Trusted by teams worldwide" section has 12 white placeholder boxes. Replace the `<div>` placeholder with `<img>` tags:
```jsx
<img src="/logos/badiani.png" alt="BADIANI" style={{ width: 44, height: "auto" }} />
```

## Tech Stack
- React 18 (hooks only, no class components)
- Tailwind CSS (utility classes)
- Inline styles for critical rendering (forms, chatbot, overlays)
- Web Speech API (SpeechRecognition fallback)
- MediaRecorder API (voice capture)
- Persistent storage API (leads database)

## File Structure
```
hotbot-studios.jsx  — Main React component (3,400+ lines)
index.html          — Standalone HTML wrapper with meta tags
README.md           — This file
```
