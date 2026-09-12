// One search interface, two providers. Which one runs is decided by which key is set:
// SEARCH_PROVIDER=linkup|tavily overrides; otherwise LinkUp if LINKUP_API_KEY exists, else Tavily.
// Returns [{title, url, snippet}] or [] on any failure. Never throws: a missing link is not an error.
import { LinkupClient } from "linkup-sdk";

const RETAILERS_UK = [
  "amazon.co.uk", "johnlewis.com", "notonthehighstreet.com", "etsy.com", "libertylondon.com",
  "selfridges.com", "waterstones.com", "oliverbonas.com", "spacenk.com", "bloomandwild.com",
  "buyagift.co.uk", "virginexperiencedays.co.uk", "fortnumandmason.com", "marksandspencer.com",
  "argos.co.uk", "currys.co.uk", "anthropologie.com", "uncommongoods.com", "trouva.com", "wolfandbadger.com",
];

export function provider() {
  const forced = (process.env.SEARCH_PROVIDER || "").toLowerCase();
  if (forced === "linkup" || forced === "tavily") return process.env[forced === "linkup" ? "LINKUP_API_KEY" : "TAVILY_API_KEY"] ? forced : null;
  if (process.env.LINKUP_API_KEY) return "linkup";
  if (process.env.TAVILY_API_KEY) return "tavily";
  return null;
}

async function linkupSearch(query, { domains, max }) {
  const client = new LinkupClient({ apiKey: process.env.LINKUP_API_KEY });
  const r = await client.search({
    query, depth: "standard", outputType: "searchResults", maxResults: max,
    ...(domains && domains.length ? { includeDomains: domains } : {}),
  });
  return (r.results || []).filter((x) => x.type === "text").map((x) => ({ title: x.name, url: x.url, snippet: x.content }));
}

async function tavilySearch(query, { domains, max }) {
  const r = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${process.env.TAVILY_API_KEY}` },
    body: JSON.stringify({ query, search_depth: "basic", max_results: max, ...(domains && domains.length ? { include_domains: domains } : {}) }),
  });
  if (!r.ok) throw new Error(`tavily ${r.status}`);
  const j = await r.json();
  return (j.results || []).map((x) => ({ title: x.title, url: x.url, snippet: x.content }));
}

export async function search(query, { domains = null, max = 3, timeoutMs = 7000 } = {}) {
  const p = provider();
  if (!p) return [];
  const run = p === "linkup" ? linkupSearch : tavilySearch;
  const timer = new Promise((resolve) => setTimeout(() => resolve([]), timeoutMs));
  try { return await Promise.race([run(query, { domains, max }), timer]); }
  catch { return []; }
}

export function retailerDomains(country) {
  // UK retailers by default; for other countries, let the search engine range freely.
  return !country || /united kingdom|^uk$|england|scotland|wales/i.test(country) ? RETAILERS_UK : null;
}
