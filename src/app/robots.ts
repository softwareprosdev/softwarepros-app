import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Private or pointless to crawl, for every agent:
 *
 * - `/admin`  — Basic-auth only, and already `noindex` in its metadata.
 * - `/api`    — no HTML to index.
 * - `/summary/{id}` and `/discovery/{id}` — capability URLs. The ids are the
 *   only thing protecting a visitor's conversation, so they must never end up
 *   in an index or a training set.
 * - `/discovery` — mints a fresh session row on every GET, so a crawler
 *   hitting it repeatedly would write junk rows and learn nothing.
 */
const DISALLOW = ["/admin", "/api/", "/discovery", "/summary/"];

/**
 * Agents named explicitly rather than left to the `*` rule.
 *
 * A wildcard rule covers all of these, but naming them is not redundant:
 * several of these crawlers only apply the most specific matching group, and
 * an explicit `Allow` is what distinguishes "we have not thought about AI
 * crawlers" from "we want to be cited". Retrieval agents (the ones that fetch
 * a page because a user asked a question) are the ones that matter for
 * generative search, and they are all allowed here.
 */
const AGENTS = [
  // Search
  "Googlebot",
  "Googlebot-Image",
  "Bingbot",
  "DuckDuckBot",
  // Google generative surfaces (AI Overviews / AI Mode)
  "Google-Extended",
  // OpenAI: training, search index, and live user-triggered retrieval
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  // Anthropic
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "anthropic-ai",
  // Perplexity
  "PerplexityBot",
  "Perplexity-User",
  // Others
  "Applebot",
  "Applebot-Extended",
  "meta-externalagent",
  "Amazonbot",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...AGENTS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: DISALLOW,
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
