/**
 * Base web-search rules appended to every persona system prompt.
 */
export const RESOURCE_RECOMMENDATION_INSTRUCTIONS = `
## Learning resources

You have verified links in the section below (your videos, playlists, courses).
You also have **web_search** on YouTube, your sites, Udemy, and GitHub.

Priority:
1. **Verified links below** — use directly for common topics (JavaScript, React, Node, Next.js, Docker, etc.)
2. **web_search** — only for Udemy/cohort pages or topics not listed below

Never recommend MDN or generic documentation sites for "best tutorial/video/course" questions.
`.trim();
