/**
 * Verified persona-owned URLs injected into the system prompt.
 * The model should use these directly — no search needed for common topics.
 */
export const HITESH_CANONICAL_LINKS = `
## Verified links (use these directly in markdown)

When the topic matches, recommend from this list first. Copy the exact URL.

**JavaScript / JS basics**
- [Chai aur Javascript — full beginner playlist](https://www.youtube.com/playlist?list=PLu71SKxNbfoBuX3f4EOACle2y-tRC5Q37)
- [Javascript in 1 shot in Hindi (9h)](https://www.youtube.com/watch?v=sscX432bMZo)
- [JavaScript series code on GitHub](https://github.com/hiteshchoudhary/js-hindi-youtube)

**React**
- [Chai aur React — playlist with projects](https://www.youtube.com/playlist?list=PLu71SKxNbfoDqgPchmvIsL4hTnJIrtige)

**Node.js / backend**
- [Chai aur Backend — Node.js series (GitHub + videos)](https://github.com/hiteshchoudhary/chai-backend)

**Next.js**
- [Next.js tutorials for beginners — playlist](https://www.youtube.com/playlist?list=PL0Zuz27SZ-6Pk-QJIdGd1tGZEzy9RTgtj)
- [Next.js full-stack project (Next 15) — playlist](https://www.youtube.com/playlist?list=PL0Zuz27SZ-6PCLz7VMP2QQdeKa83rshe5)

**Channels & courses**
- [Chai aur Code YouTube (Hindi)](https://www.youtube.com/@chaiaurcode)
- [Hitesh Choudhary YouTube (English)](https://www.youtube.com/@HiteshCodeLab)
- [chaicode.com — live cohorts](https://chaicode.com)
- [hiteshchoudhary.com — courses & Udemy hub](https://hiteshchoudhary.com)
`.trim();

export const PIYUSH_CANONICAL_LINKS = `
## Verified links (use these directly in markdown)

**JavaScript / GenAI**
- [Building AI Agent from Scratch (Node.js)](https://www.youtube.com/watch?v=vUYnRGotTbo)
- [AI Agents — LangGraph, LangChain (JavaScript)](https://www.youtube.com/watch?v=_XMwQ5X3llA)

**System design / full-stack**
- [I built Vercel in 2 Hours](https://www.youtube.com/watch?v=0A_JpLYG7hM)
- [Top AWS Services — System Design](https://www.youtube.com/watch?v=3WZzmiAkYBQ)

**Docker**
- [Docker course on pro.piyushgarg.dev](https://pro.piyushgarg.dev/learn/docker)

**Channels & courses**
- [Piyush Garg YouTube](https://www.youtube.com/@piyushgargdev)
- [piyushgarg.dev — cohorts](https://www.piyushgarg.dev)
- [pro.piyushgarg.dev — paid courses](https://pro.piyushgarg.dev)
`.trim();
