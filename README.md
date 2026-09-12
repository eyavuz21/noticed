# Noticed

A private log of what you learn about the people you love, turned into gift ideas when an occasion comes round.

**Live site:** https://noticedapp.vercel.app
**Also on claude.ai:** https://claude.ai/code/artifact/80e302cc-ce64-4454-ba60-b2415c5bff33

## The idea

Most gifting apps start from the shop. Noticed starts from the person. You keep a short, private record of the things people tell you in passing (she's started pottery, he misses proper Turkish coffee, she keeps quoting *Olive Kitteridge*), and when a birthday comes round the app reads those notes and suggests gifts that actually connect to them: objects, experiences, places to go, or something to pay for on their behalf. Mostly things you can get in the UK within 48 hours.

The longer you use it, the better it gets, and the harder it is to leave. The notes are the product.

## What the MVP does (v0.4)

- **People**: the handful of people you buy for most, each with an icon, relationship, birthday, usual budget, where they live (any country: suggestions use local retailers, local venues and local currency), Instagram handle and Spotify link
- **What you've learnt**: dated notes with tags and an optional image, one per thing you noticed
- **Gift ideas**: a running list per person, objects and experiences, with a 48h flag, and a "Given" button so nothing is repeated
- **Suggest ideas**: reads the notes and returns 3 objects and 3 experiences with a reason for each, filtered by occasion and budget
- **Online delivery / In person today**: online mode attaches a real product page to each idea (via LinkUp or Tavily) plus retailer search links; in-person mode takes an area, suggests named shops you can walk into today and things bookable tonight, with a Directions & hours link for each
- **Sign in and share** (when Supabase is configured): email magic link, no password; your people are stored server-side and a six-character household code lets two people share one set of notes
- **Treat yourself**: mark a profile as you, and it suggests things for you instead
- **Together**: pick several people and either get places and things to do that suit the whole group, or one small gift to buy identically for every member of a team (workplace-friendly, budget per head)
- **Write a message**: three short card messages for a person or a group, in a chosen tone, drawn from the notes, with one-click copy

Data lives in the browser (localStorage). Nothing is pulled from Instagram or any other service: what you know about someone, you add yourself.

## Stack

- `index.html`: the whole app. No build step, no framework, two Google Fonts.
- `api/suggest.js`: one Vercel serverless function. The page posts a prompt and the JSON shape it expects; the function calls Claude (`claude-opus-5`, structured JSON output, effort `medium`, server-side refusal fallbacks), then attaches a real link to each idea using `api/_search.js`.
- `api/_search.js`: one search interface, two providers. LinkUp (official SDK) or Tavily (REST), chosen by whichever key is set, `SEARCH_PROVIDER` to force one. Never throws: no link is not an error.
- `api/config.js`: hands the page its public Supabase config, if any.
- `supabase/schema.sql`: households, members, one JSON state document per household, row-level security, and three RPCs (`ensure_household`, `join_household`, `save_state`).

When the page is opened on claude.ai it uses the viewer's built-in `sample` capability instead, so the same file works in both places.

## Running it locally

Open `index.html` in a browser for everything except suggestions. For the full thing:

```
npm install
npx vercel dev
```

and put `ANTHROPIC_API_KEY=...` in a `.env` file (gitignored).

## Deploying

The repo is connected to Vercel: every push to `main` deploys to https://noticedapp.vercel.app automatically.

Environment variables (Vercel → Settings → Environment Variables):

| Name | Required | What |
|---|---|---|
| `ANTHROPIC_API_KEY` | yes | Suggestions and messages |
| `LINKUP_API_KEY` or `TAVILY_API_KEY` | for links | Real product and shop links. Set one; `SEARCH_PROVIDER=linkup|tavily` forces a choice if both exist |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | for sign-in | From Supabase → Project Settings → API. The anon key is public by design; row-level security protects the data |

### Setting up sign-in (about five minutes)

1. Create a free project at supabase.com. Any region; London is fine.
2. SQL Editor → paste `supabase/schema.sql` → Run.
3. Authentication → URL Configuration → Site URL `https://noticedapp.vercel.app`, and add it to Redirect URLs.
4. Copy the Project URL and anon key into Vercel as `SUPABASE_URL` and `SUPABASE_ANON_KEY`, then redeploy.

Supabase's built-in email sender is rate-limited to a handful of messages an hour, which is fine for the two of us and not for launch. Before launch, add a custom SMTP provider (Resend's free tier is enough) under Authentication → SMTP.

## Roadmap

See the planning doc for the full picture. In order:

1. **v0.5**: buy links with affiliate tracking; occasion reminders by email; add a note from a shared screenshot or voice note
2. **v0.6**: Spotify and Goodreads read-only connections, with the person's permission
3. **Later, only once there are users**: reward points and tiers, sending points to someone who has to sign up to use them, a community feed and messaging, self-gift suggestions as a standalone feature

## Not doing

- Scraping Instagram or any social profile. It breaks Meta's terms and GDPR, and it isn't needed: the notes you write yourself are better data than a feed
- Holding stock or running delivery. Fast delivery comes from retailers who already do it

## Founders

Emre Yavuz and his sister. September 2026. The name: the whole product is noticing things about people, and "she noticed" is the feeling a good gift gives.
