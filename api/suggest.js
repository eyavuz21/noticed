// Vercel serverless function: the page posts a prompt and the JSON shape it expects,
// this returns Claude's answer as parsed JSON. The API key never leaves the server.
import Anthropic from "@anthropic-ai/sdk";
import { search, provider, retailerDomains } from "./_search.js";

const MAX_PROMPT_CHARS = 20000;

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    // Readiness probe used by the page to decide whether to enable the buttons.
    return res.status(200).json({ ok: true, configured: Boolean(process.env.ANTHROPIC_API_KEY), search: provider() });
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: "not_configured", message: "ANTHROPIC_API_KEY is not set on this deployment." });
  }

  const { prompt, schema, enrich, mode, area, country } = req.body || {};
  if (typeof prompt !== "string" || !prompt.trim() || prompt.length > MAX_PROMPT_CHARS) {
    return res.status(400).json({ error: "bad_request", message: "prompt must be a non-empty string." });
  }
  if (!schema || typeof schema !== "object") {
    return res.status(400).json({ error: "bad_request", message: "schema is required." });
  }

  const client = new Anthropic();
  try {
    const response = await client.beta.messages.create({
      model: "claude-opus-5",
      max_tokens: 4096, // deliberately short: six ideas or three messages, never more
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium", format: { type: "json_schema", schema } },
      messages: [{ role: "user", content: prompt }],
    });

    if (response.stop_reason === "refusal") {
      return res.status(502).json({ error: "refusal", message: "The model declined this request." });
    }
    const text = response.content.filter((b) => b.type === "text").map((b) => b.text).join("");
    let parsed;
    try { parsed = JSON.parse(text); }
    catch { return res.status(502).json({ error: "bad_json", message: "The model returned something that was not JSON." }); }

    // Attach real links. Online: a product page from a retailer. In person: the shop's page, plus a maps link the page builds itself.
    if (enrich && Array.isArray(parsed.ideas) && provider()) {
      parsed.ideas = await Promise.all(parsed.ideas.slice(0, 8).map(async (idea) => {
        if (idea.source === "stock" && idea.link) return { ...idea, url: idea.link, url_title: "From your stock" };
        let q, domains;
        if (mode === "instore") {
          q = `${idea.where || idea.title} ${area || ""} opening hours`.trim(); domains = null;
        } else {
          // If the model named a site, search that site; if it named a shop, put the shop in the query; otherwise bias to known retailers.
          const site = (idea.where || "").match(/([a-z0-9-]+\.(?:co\.uk|com|org\.uk|org|net|io|shop))/i);
          const shop = (idea.where || "").split(/[(,;]| or | via /i)[0].trim();
          if (site) { q = `${idea.title}`; domains = [site[1].toLowerCase()]; }
          else if (shop && shop.length < 40) { q = `${idea.title} ${shop}`; domains = null; }
          else { q = `${idea.title} buy${country && !/united kingdom/i.test(country) ? " " + country : " UK"}`; domains = retailerDomains(country); }
        }
        let hits = await search(q, { domains, max: 3 });
        if (!hits.length && mode !== "instore") hits = await search(`${idea.title} buy UK`, { domains: retailerDomains(country), max: 3 });
        const best = hits[0];
        return best ? { ...idea, url: best.url, url_title: best.title, url_snippet: (best.snippet || "").slice(0, 200) } : idea;
      }));
      parsed.search = provider();
    }
    return res.status(200).json(parsed);
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: "rate_limited", message: "Too many requests just now. Try again in a minute." });
    }
    if (err instanceof Anthropic.AuthenticationError) {
      return res.status(500).json({ error: "auth", message: "The API key on this deployment was rejected." });
    }
    if (err instanceof Anthropic.APIConnectionError) {
      return res.status(502).json({ error: "connection", message: "Could not reach the model." });
    }
    if (err instanceof Anthropic.APIError) {
      return res.status(502).json({ error: "upstream", message: `Upstream error ${err.status}.` });
    }
    return res.status(500).json({ error: "unknown", message: "Something went wrong." });
  }
}
