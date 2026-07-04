# Persona AI — Chat with Hitesh Choudhary & Piyush Garg

An AI-powered chat app that simulates conversations with two of India's most
loved tech educators — **Hitesh Choudhary** and **Piyush Garg**. The assistant
replies in each person's voice, teaching style, and personality, and you can
switch between them instantly.

> Built with Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui, Vercel AI
> Elements, and the Vercel AI SDK v7 (OpenAI). Runs on **Bun**.

- **Live demo:** <https://persona-pink.vercel.app/>
- **Repository:** <https://github.com/Pratik4230/Persona>

---

## ✨ Features

- 🎭 **Two authentic personas** — Hitesh Choudhary (chai aur code, warm Hinglish)
  and Piyush Garg (confident, architecture-first).
- 🔁 **One-tap persona switching** — a segmented switcher in the header; each
  persona has its own greeting, accent color, expertise tags, and starter prompts.
- 🌊 **Real-time streaming** — token-by-token responses via the Vercel AI SDK.
- 💾 **Saved chat history** — every conversation is persisted locally and grouped
  by recency in a **sessions sidebar** (desktop rail + mobile drawer). Switch,
  rename, and delete chats; refresh and pick up right where you left off.
- 💬 **Message actions** — copy any reply, or regenerate the last one.
- 💅 **Premium UX** — shadcn/ui + AI Elements, framer-motion animations,
  persona-accented theming, light/dark mode, markdown & code rendering,
  auto-scroll, typing indicator, stop & retry, and toasts.
- ⌨️ **Keyboard shortcut** — `⌘/Ctrl + Shift + O` starts a new chat.
- 🧠 **Context-aware** — recent conversation history is sent with each request so
  replies stay coherent and on-persona.
- 🧩 **Data-driven** — every persona lives in a single source of truth
  (`src/lib/personas.ts`); adding a new one is a few lines.
- 🛡️ **Abuse-safe** — a server-enforced **25 messages/day** limit (checked before
  the model runs, so over-limit requests cost zero tokens) plus a per-message size
  cap, with a live "N left today" counter. No database required.

## 🧱 Tech Stack

| Layer            | Choice                                              |
| ---------------- | --------------------------------------------------- |
| Runtime / PM     | [Bun](https://bun.sh) 1.2+                           |
| Framework        | [Next.js 16](https://nextjs.org) (App Router)       |
| Language         | TypeScript (strict)                                 |
| Styling          | Tailwind CSS v4                                      |
| Components       | [shadcn/ui](https://ui.shadcn.com)                  |
| Chat UI          | [Vercel AI Elements](https://ai-sdk.dev/elements)   |
| LLM SDK          | [Vercel AI SDK v7](https://ai-sdk.dev) (`ai`)       |
| Model provider   | OpenAI (`@ai-sdk/openai`)                           |
| Data / caching   | [TanStack Query v5](https://tanstack.com/query) (session store) |
| Notifications    | [sonner](https://sonner.emilkowal.ski)              |
| Animation        | [motion](https://motion.dev) (framer-motion)        |
| Theming          | `next-themes`                                       |

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh) `>= 1.2` (`curl -fsSL https://bun.sh/install | bash`)
- An **OpenAI API key** — <https://platform.openai.com/api-keys>

### 1. Install dependencies

```bash
bun install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your key:

```env
OPENAI_API_KEY=sk-your-key-here
# Optional: override the default model (defaults to gpt-5.4-nano)
# CHAT_MODEL=gpt-5.4-nano
```

### 3. Run the dev server

```bash
bun run dev
```

Open <http://localhost:3000>, pick a persona, and start chatting.

### 4. Production build

```bash
bun run build
bun run start
```

## 📜 Scripts

| Command          | Description                          |
| ---------------- | ------------------------------------ |
| `bun run dev`    | Start the dev server (Turbopack)     |
| `bun run build`  | Production build                     |
| `bun run start`  | Serve the production build           |
| `bun run lint`   | Lint with ESLint (flat config)       |

## 🗂️ Project Structure

```
src/
├── app/
│   ├── api/chat/route.ts     # Streaming chat endpoint (AI SDK v7 + OpenAI)
│   ├── layout.tsx            # Root layout, fonts, providers
│   ├── page.tsx              # Renders <Chat />
│   └── globals.css           # Tailwind v4 + shadcn tokens
├── components/
│   ├── ai-elements/          # Vercel AI Elements (conversation, message, …)
│   ├── ui/                   # shadcn/ui primitives
│   ├── chat.tsx              # Main chat experience (useChat + sessions + AI Elements)
│   ├── chat-sidebar.tsx      # Saved-sessions sidebar (rail + mobile drawer)
│   ├── persona-switcher.tsx  # Header persona segmented control
│   ├── providers.tsx         # QueryClient + theme + toaster
│   ├── theme-provider.tsx    # next-themes wrapper
│   └── theme-toggle.tsx      # Light/dark toggle
├── hooks/
│   └── use-chat-sessions.ts  # TanStack Query hooks over the session store
└── lib/
    ├── chat-store.ts         # localStorage session store (index + records)
    ├── personas.ts           # SINGLE SOURCE OF TRUTH: persona data + prompts
    └── utils.ts              # cn()
```

## 🧠 How it works

1. The UI (`src/components/chat.tsx`) uses the AI SDK's `useChat` hook with a
   `DefaultChatTransport` that posts to `/api/chat`, including the selected
   `persona` id in every request body.
2. The route handler (`src/app/api/chat/route.ts`) looks up the persona, injects
   its system prompt as `instructions`, trims history for context management,
   and streams the model's response back with `streamText`.
3. Responses stream token-by-token and render as markdown (via AI Elements'
   `MessageResponse`, powered by Streamdown).
4. When a turn completes, the conversation is saved to a **localStorage session
   store** (`src/lib/chat-store.ts`). **TanStack Query** hooks
   (`src/hooks/use-chat-sessions.ts`) expose a reactive, cached list that powers
   the sidebar; mutations invalidate the cache so everything stays in sync. On
   load, the last active session is rehydrated into `useChat`.

## 📚 Documentation

All project documentation lives in a single file,
[`docs/DOCUMENTATION.md`](./docs/DOCUMENTATION.md):

- How the persona data was collected and prepared
- Prompt engineering strategy
- Context management approach (including persistence and daily limits)
- Sample conversations demonstrating both personas

## ☁️ Deploy on Vercel

1. Push this repo to GitHub.
2. Import it into [Vercel](https://vercel.com/new).
3. Add the `OPENAI_API_KEY` environment variable (and optionally `CHAT_MODEL`).
4. Deploy. Vercel auto-detects Next.js — no extra config needed.

> Tip: You can swap OpenAI for [Vercel AI Gateway](https://vercel.com/ai-gateway)
> by setting `AI_GATEWAY_API_KEY` and using a gateway model string — the AI SDK
> supports both with a one-line change in `route.ts`.

## ⚠️ Disclaimer

This is an educational/demo project. The personas are AI recreations built from
publicly available content and are **not** affiliated with, endorsed by, or
operated by Hitesh Choudhary or Piyush Garg. Responses are AI-generated and may
be inaccurate.

## 📄 License

MIT — see below. Persona likenesses and names belong to their respective owners.
