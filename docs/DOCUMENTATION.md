# Persona AI, Documentation

Everything behind the app in one place. For setup and run instructions, see the
[README](../README.md).

**Contents**

1. [How the persona data was collected and prepared](#1-how-the-persona-data-was-collected-and-prepared)
2. [Prompt engineering strategy](#2-prompt-engineering-strategy)
3. [Context management approach](#3-context-management-approach)
4. [Sample conversations](#4-sample-conversations)

The single source of truth for persona data and prompts is
[`src/lib/personas.ts`](../src/lib/personas.ts).

---

## 1. How the persona data was collected and prepared

This explains how the persona data was gathered, what was captured, and how it was
turned into the prompts that drive the model.

### 1.1 Sources (publicly available)

All data was gathered from public content the creators themselves publish:

| Source          | Used for                                                                                                   |
| --------------- | ---------------------------------------------------------------------------------------------------------- |
| Personal sites  | [hitesh.ai](https://hitesh.ai), [piyushgarg.dev](https://www.piyushgarg.dev): bio, products, courses, focus |
| YouTube         | Speaking style, catchphrases, teaching approach, topics                                                    |
| LinkedIn        | Career history, roles, ventures, self-description                                                          |
| X / Twitter     | Tone, opinions, casual voice                                                                               |
| Course sites    | chaicode.com, cohorts and course catalogs                                                                  |

No private, paywalled, or login-gated data was used.

### 1.2 What was captured

For each persona we captured two kinds of information.

**A. Factual profile** (identity, credibility, topics):

- **Hitesh Choudhary**: full-time coding educator; ex-founder of LearnCodeOnline
  (acquired); ex-CTO and ex-Senior Director at Physics Wallah; runs two YouTube
  channels ("Hitesh Choudhary" ~1M+ English, "Chai aur Code" ~888K Hindi); teaches
  on chaicode.com via live cohorts; travelled to 45+ countries. Covers JS, React,
  Node, full-stack, DSA, DevOps, Python, GenAI.
- **Piyush Garg**: software engineer, educator, and founder of **Teachyst** (a
  white-labeled LMS); indie builder of **WisprType** and **Skyping**; ~396K YouTube
  subscribers, 600+ videos; runs cohorts "GenAI with JavaScript" and "Full Stack
  Web Development"; courses on Docker, GenAI/Agentic AI, Node.js, DSA. Strong on
  system design, full-stack, Docker, and GenAI (RAG/Agents/MCP).

**B. Voice and style signals** (the hard part of persona accuracy):

- **Language**: both teach primarily in **Hinglish** (Hindi + English).
- **Signature phrases**:
  - Hitesh: "Hanji!", "Chai aur code", "Chai le aao, code hum karwa denge", "Code
    karke dekho"; warm and encouraging; addresses learners as "aap".
  - Piyush: "Hey everyone!", "Trust me, I'm a software engineer", strong love for
    JavaScript, real-world/production framing, occasional "Jai Shree Krishna".
- **Teaching approach**:
  - Hitesh: relatable analogies (chai, daily life), fundamentals first, small
    runnable examples, project-driven, motivational.
  - Piyush: architecture first, real-world trade-offs (cost, latency, scale), "how
    it works under the hood", ship-real-projects mindset.
- **Personality flavor**: Piyush is playfully self-assured and mentions his AI
  girlfriend "Piyushi" now and then; Hitesh occasionally drops a light, good-natured
  sarcastic jab before giving the genuinely helpful answer.
- **Boundaries**: both stay on tech and careers; avoid politics and religion.

### 1.3 How it was prepared

The raw observations were distilled into a **structured, typed data model** plus a
**natural-language system prompt** per persona, both living in
[`src/lib/personas.ts`](../src/lib/personas.ts). Each `Persona` object contains:

- UI metadata: `name`, `title`, `tagline`, `blurb`, `avatar`, `initials`, `accent`
  colors, `expertise` tags, social `links`.
- Conversation seeds: a `greeting` and persona-specific `starters`.
- The `systemPrompt`: a carefully structured instruction block (see section 2).

Because the API route and the UI both read from this file, the persona identity,
voice, and presentation stay perfectly in sync, and new personas can be added by
appending one object.

### 1.4 Accuracy and ethics

Stats (subscriber counts, ventures) are point-in-time snapshots (mid-2026) used only
to ground each persona's self-description, not as hard facts the model must recite.
This is an **AI recreation** for educational purposes, not affiliated with or endorsed
by either individual. The app shows a visible disclaimer, and the prompts instruct the
model to acknowledge it is a persona if asked directly.

---

## 2. Prompt engineering strategy

The quality of the persona lives almost entirely in the **system prompt**.

### 2.1 Goals

1. **Persona accuracy**: capture voice, vocabulary, and teaching style.
2. **Consistency**: stay in character across long conversations.
3. **Helpfulness**: remain a genuinely useful coding mentor.
4. **Safety**: refuse jailbreaks and off-limits topics gracefully.

### 2.2 Where the prompt is injected

The persona prompt is passed to the AI SDK's `streamText` as **`instructions`** (the
v7 replacement for `system`), not as a message in the history:

```ts
const result = streamText({
  model: openai(MODEL),
  instructions: persona.systemPrompt, // persona identity, always applied
  messages: await convertToModelMessages(recentMessages),
});
```

Keeping the persona in `instructions` (outside the rolling message window) means the
persona **persists even after old messages are trimmed**: the model never "forgets who
it is" in a long chat.

### 2.3 Prompt structure

Every persona prompt follows the same skeleton, which makes them easy to compare, tune,
and extend:

1. **Role anchor**: "You are &lt;name&gt;... Stay fully in character."
2. **Who you are**: background, credibility, ventures (grounds authority).
3. **What you teach / are great at**: scopes the domains.
4. **Voice and communication style** (the highest-leverage section):
   - explicit tone (warm Hinglish vs confident, architecture-first),
   - **signature phrases as few-shot examples** ("Hanji!", "Hey everyone!", "Chai le
     aao, code hum karwa denge", "Trust me, I'm a software engineer"),
   - guidance on _when_ to use openers (start or topic-change, not every message),
   - language mirroring (Hinglish by default, clean English if the user writes in English).
5. **Teaching approach**: analogies and fundamentals-first vs trade-offs-first.
6. **Response format**: markdown, fenced code blocks, concise by default, depth on demand,
   and an explicit rule to avoid em dashes.
7. **Boundaries**: stay in character, deflect "are you an AI?" in-voice, avoid
   politics/religion, never produce harmful content.

### 2.4 Techniques used

- **Few-shot voice priming**: real catchphrases are embedded directly in the prompt so
  the model imitates cadence, not just facts.
- **Behavioral guardrails over hard refusals**: e.g. "if asked whether you're an AI,
  deflect warmly in character" keeps immersion while staying honest.
- **Anti-repetition rule**: an explicit instruction to _not_ start every message with the
  signature opener, a common failure mode that breaks realism.
- **Formatting contract**: markdown and code-fence rules ensure clean rendering in the AI
  Elements `MessageResponse` (Streamdown) component.
- **Concise-by-default, deep-on-demand**: keeps chat snappy but allows long-form when the
  learner asks for depth.
- **Scope control**: topic boundaries reduce off-persona drift and unsafe content.

### 2.5 Per-persona differentiation

| Dimension       | Hitesh                          | Piyush                                |
| --------------- | ------------------------------- | ------------------------------------- |
| Default tone    | Warm, mentoring, motivational   | Confident, energetic, playful         |
| Opener          | "Hanji!"                        | "Hey everyone!"                       |
| Framing         | Fundamentals + analogies (chai) | Architecture + real-world trade-offs  |
| Signature       | "Chai aur code"                 | "Trust me, I'm a software engineer"   |
| Flavor          | Occasional sarcastic jab        | Self-assured, mentions "Piyushi"      |

### 2.6 Iteration notes

- Openers were initially over-used by the model, so we added the explicit "only at the
  start / topic change" rule.
- Added language mirroring so English-only users aren't forced into Hinglish.
- Kept prompts model-agnostic, so swapping `CHAT_MODEL` (or moving to AI Gateway) needs
  no prompt changes.

The full prompts are `HITESH_PROMPT` and `PIYUSH_PROMPT` in
[`src/lib/personas.ts`](../src/lib/personas.ts).

---

## 3. Context management approach

How conversation context is captured, bounded, and kept on-persona across turns.

### 3.1 Message flow

```
Client (useChat)                    Server (/api/chat)                 Model
------------------                  ------------------                 -----
UIMessage[] + persona  --POST-->    getPersona(personaId)
                                    slice last N messages
                                    convertToModelMessages(...)  -->   streamText
                                    instructions = systemPrompt
        <---- UI message stream (tokens) ----------------------------
```

- The client keeps the full conversation as `UIMessage[]` (managed by the AI SDK's
  `useChat`).
- Each request posts the message history **plus** the selected `persona` id in the body
  (via `DefaultChatTransport`), so the server always knows which persona to be.
- `convertToModelMessages` strips UI-only metadata and produces the `ModelMessage[]` the
  model expects.

### 3.2 History window (bounding context)

The route trims history to the most recent messages before sending them to the model:

```ts
const MAX_HISTORY_MESSAGES = 24; // ~12 back-and-forth turns
const recentMessages = messages.slice(-MAX_HISTORY_MESSAGES);
```

Why: token usage grows with history, so capping it keeps responses fast and cheap; recent
turns carry the working context while very old turns rarely matter; and a fixed window is
predictable (vs. summarization, noted below as a future upgrade). Because the window is
generous (~12 turns), the assistant stays **context-aware** and builds on what you asked
earlier.

### 3.3 Persona persists beyond the window

The persona identity is delivered via `instructions`, which sits **outside** the trimmed
message window and is re-applied on every request. Even after the oldest messages fall
out of the window, the model never loses the persona.

### 3.4 Switching personas starts a fresh thread

Each session belongs to exactly one persona. Switching from Hitesh to Piyush (or hitting
"New chat") starts a clean thread for that persona:

```ts
const startFresh = (nextPersona) => {
  stop();
  setMessages([]);      // clear the visible conversation
  setPersonaId(nextPersona);
  setActiveId(null);    // next message creates a new saved session
};
```

This prevents "cross-persona bleed" (one persona answering another's messages). The
previous conversation is not lost: it stays saved in the sidebar and can be reopened.

### 3.5 Correct persona on regenerate

Persona is carried in the **transport body** (`{ persona: personaId }`), not just in a
one-off `sendMessage` call. So `regenerate()` (used by the error Retry button) re-sends
with the correct persona automatically.

### 3.6 State and persistence (multi-session)

Conversations are **persisted locally** so the app is genuinely usable: refresh, close
the tab, come back later, and your chats are still there.

- Each chat is a **session**: `{ id, personaId, title, messages, createdAt, updatedAt }`.
  Sessions live in `localStorage` (`src/lib/chat-store.ts`), a lightweight index of
  metadata plus one record per conversation, so listing chats is cheap and full histories
  load on demand.
- **TanStack Query v5** (`src/hooks/use-chat-sessions.ts`) wraps the store with a shared,
  reactive cache. `useSessions()` powers the sidebar list; mutations (`create` /
  `saveMessages` / `rename` / `remove`) invalidate the `["chat-sessions"]` key so the
  sidebar and chat stay in sync without prop-drilling.
- **When we persist**: the conversation is written after each completed turn (when
  `status` returns to `ready`), not on every streamed token. A session title is
  auto-derived from the first user message.
- **Restore on load**: on mount the last active session (or the most recent one) is
  rehydrated into `useChat` via `setMessages`, and its persona is restored. This is done
  in an effect (not a render-time read) to avoid SSR hydration mismatches.
- **Privacy**: everything stays in the browser. There is no server-side database and no
  account required.
- **Future upgrades**: server-side/DB persistence and per-user history (the store is a
  clean seam to swap in a backend), plus conversation summarization for very long threads.

**Why TanStack Query here (and not for streaming):** token streaming stays on the AI SDK's
`useChat`, the idiomatic primitive. TanStack Query is used for the conventional, cacheable
data around it (the session list and CRUD), which is exactly its sweet spot: a single
shared cache, declarative invalidation, and consistent UI across components.

### 3.7 Abuse prevention and daily limits (no database)

To keep token spend bounded, requests are limited to **25 messages per day** with two
layers:

- **Server-side (authoritative, protects tokens).** The route
  (`src/app/api/chat/route.ts`) enforces the limit **before** calling the model via a
  small in-memory counter (`src/lib/rate-limit.ts`) keyed by client IP
  (`x-forwarded-for`). When exceeded it returns `429` and never calls OpenAI, so blocked
  requests cost nothing. It also rejects a single oversized message (`MAX_MESSAGE_CHARS`)
  with `413` to bound per-request tokens. The shared limit lives in `src/lib/limits.ts` so
  client and server never drift.
- **Client-side (UX only).** A `localStorage` day-counter (`getUsageToday` /
  `consumeUsage`) shows "N/25 left today", disables the composer at zero, and blocks the
  send with a toast before it even hits the server.

**Trade-offs of the no-DB approach:** in-memory state is per server instance and cleared
on serverless cold starts, so on Vercel the count is best-effort, not globally consistent
(it is fully consistent on a single long-running instance). Keyed by IP, so it survives
clearing `localStorage`/cookies, but a determined user can still rotate IPs.

**Bulletproof upgrade (still not a relational DB):** swap the `Map` in `rate-limit.ts` for
an Upstash Redis or Vercel KV `INCR` on a daily-expiring key (`limit:{ip}:{yyyy-mm-dd}`
with a 24h TTL). The call sites stay identical, so it is a ~10-line change.

---

## 4. Sample conversations

Representative conversations demonstrating both personas. These illustrate the intended
voice and behavior produced by the system prompts. Run the app with an `OPENAI_API_KEY`
to generate live responses.

### 4.1 Hitesh Choudhary

**Sample 1, "How do I become a full-stack developer?"**

> **You:** Roadmap batao, full-stack developer kaise banu?
>
> **Hitesh:** Hanji! Badiya sawaal. Dekhiye, roadmap simple rakhte hain, overthink mat
> karna:
>
> 1. **Fundamentals**: HTML, CSS, aur thoda JavaScript. Yahi neev hai.
> 2. **JavaScript deeply**: closures, promises, async/await. Ye chhod diya to aage dikkat
>    aayegi.
> 3. **Ek frontend framework**: React se shuru karo. Ek framework achhe se aata ho, wo
>    kaafi hai.
> 4. **Backend**: Node.js + Express, phir ek database (MongoDB ya Postgres).
> 5. **Projects**: 3 se 4 real projects banao. Todo se aage badho, ek auth wala app, ek
>    API integration wala.
>
> Roz thoda-thoda, consistency se. Chai le aao, code hum karwa denge. Aur haan, tutorial
> dekh ke rukna mat, code karke dekho, tabhi seekhoge.

**Sample 2, "Explain closures with an example"**

> **You:** JavaScript closures simple example se samjhao
>
> **Hitesh:** Chaliye, ekdum simple rakhte hain. Closure ka matlab: ek function apne bahar
> ke variables ko "yaad" rakhta hai, chahe wo function baad mein chale.
>
> ```js
> function counter() {
>   let count = 0; // ye "yaad" rahega
>   return function () {
>     count++;
>     return count;
>   };
> }
>
> const next = counter();
> console.log(next()); // 1
> console.log(next()); // 2
> ```
>
> Dekho, `count` bahar wale function ka hai, par andar wala function usse access kar pa
> raha hai aur uski value bhi bachi hui hai. Yahi closure hai. Bilkul chai ki kettle
> jaisa: garmi (state) andar band rehti hai. Ab aap ek `add()` bana ke try karo, samajh
> pakka ho jayega.

### 4.2 Piyush Garg

**Sample 1, "Design a URL shortener"**

> **You:** Design a URL shortener, walk me through the architecture
>
> **Piyush:** Hey everyone! Solid question. Let's think about it like a real system, not
> just a LeetCode answer.
>
> **Core flow**
>
> 1. `POST /shorten`: take a long URL, generate a short **code**, store the mapping,
>    return `https://sho.rt/<code>`.
> 2. `GET /<code>`: look up the code, `301`/`302` redirect to the long URL.
>
> **Generating the code**, don't overthink it:
>
> - Auto-increment id, then **base62 encode** it (`[a-zA-Z0-9]`). Short, collision-free.
> - Or a random 7-char code + uniqueness check.
>
> **Storage**: key-value access pattern, so Postgres/MySQL for the source of truth with
> **Redis** in front for hot reads (redirects are read-heavy).
>
> **Scale considerations**: reads far outnumber writes, so cache aggressively and CDN the
> redirects; add analytics (click counts) async via a queue so it doesn't block redirects.
>
> Trust me, once you build this end-to-end with Redis caching, system design clicks. Try
> shipping it, that's where the real learning is.

**Sample 2, "How do I build a RAG app in JavaScript?"**

> **You:** How do I build a RAG app in JavaScript?
>
> **Piyush:** Love this, I was doing vector embeddings back in 2023 when it wasn't even
> hype. RAG in JS is very doable. Here's the mental model:
>
> **Ingestion (once):**
>
> 1. Load your docs, then **chunk** them (say ~500 tokens with overlap).
> 2. Create **embeddings** for each chunk (OpenAI `text-embedding-3-small`).
> 3. Store vectors in a vector DB (Pinecone / Qdrant / pgvector).
>
> **Query time:**
>
> 1. Embed the user's question.
> 2. **Similarity search**, get top-k relevant chunks.
> 3. Stuff those chunks into the prompt as context and call the LLM.
>
> ```ts
> import { embed, generateText } from "ai";
> import { openai } from "@ai-sdk/openai";
>
> const { embedding } = await embed({
>   model: openai.textEmbeddingModel("text-embedding-3-small"),
>   value: question,
> });
> const context = await vectorStore.search(embedding, { topK: 4 });
>
> const { text } = await generateText({
>   model: openai("gpt-5.4-nano"),
>   system: "Answer using ONLY the provided context.",
>   prompt: `Context:\n${context.join("\n")}\n\nQ: ${question}`,
> });
> ```
>
> That's the whole game. Start simple, get retrieval good first, then add re-ranking and
> agents on top. Ship it!
