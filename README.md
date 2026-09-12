# Wrapid

A private log of what you learn about the people you love, turned into gift ideas when an occasion comes round.

**Live MVP:** https://claude.ai/code/artifact/80e302cc-ce64-4454-ba60-b2415c5bff33

## The idea

Most gifting apps start from the shop. Wrapid starts from the person. You keep a short, private record of the things people tell you in passing (she's started pottery, he misses proper Turkish coffee, she keeps quoting *Olive Kitteridge*), and when a birthday comes round the app reads those notes and suggests gifts that actually connect to them: objects, experiences, places to go, or something to pay for on their behalf. Mostly things you can get in the UK within 48 hours.

The longer you use it, the better it gets, and the harder it is to leave. The notes are the product.

## What the MVP does (v0.3)

- **People**: the handful of people you buy for most, each with an icon, relationship, birthday, usual budget, where they live (any country: suggestions use local retailers, local venues and local currency), Instagram handle and Spotify link
- **What you've learnt**: dated notes with tags and an optional image, one per thing you noticed
- **Gift ideas**: a running list per person, objects and experiences, with a 48h flag, and a "Given" button so nothing is repeated
- **Suggest ideas**: reads the notes and returns 3 objects and 3 experiences with a reason for each, filtered by occasion and budget (runs in the claude.ai viewer)
- **Treat yourself**: mark a profile as you, and it suggests things for you instead
- **Together**: pick several people and either get places and things to do that suit the whole group, or one small gift to buy identically for every member of a team (workplace-friendly, budget per head)
- **Write a message**: three short card messages for a person or a group, in a chosen tone, drawn from the notes, with one-click copy

Data lives in the browser (localStorage). Nothing is pulled from Instagram or any other service: what you know about someone, you add yourself.

## Stack

- `index.html`: the whole app. No build step, no framework, two Google Fonts.
- `api/suggest.js`: one Vercel serverless function. The page posts a prompt and the JSON shape it expects; the function calls Claude (`claude-opus-5`, structured JSON output, effort `medium`, server-side refusal fallbacks) and returns parsed JSON. The API key lives only in Vercel's environment.

When the page is opened on claude.ai it uses the viewer's built-in `sample` capability instead, so the same file works in both places.

## Running it locally

Open `index.html` in a browser for everything except suggestions. For the full thing:

```
npm install
npx vercel dev
```

and put `ANTHROPIC_API_KEY=...` in a `.env` file (gitignored).

## Deploying to Vercel

```
npx vercel login
npx vercel --prod
npx vercel env add ANTHROPIC_API_KEY production   # paste the key when prompted
npx vercel --prod                                  # redeploy so the function picks it up
```

Framework preset "Other", no build command. Vercel serves `index.html` as static and `api/suggest.js` as a Node function automatically. Get an API key at console.anthropic.com.

## Roadmap

See the planning doc for the full picture. In order:

1. **v0.4**: shared accounts so two people (say, two siblings) see the same notes; sign-in
2. **v0.5**: buy links with affiliate tracking (Amazon, Not On The High Street, Bloom & Wild, Buyagift), occasion reminders by email
3. **Later, only once there are users**: reward points and tiers, sending points to someone who has to sign up to use them, a community feed and messaging, self-gift suggestions as a standalone feature

## Not doing

- Scraping Instagram or any social profile. It breaks Meta's terms and GDPR, and it isn't needed: the notes you write yourself are better data than a feed
- Holding stock or running delivery. Fast delivery comes from retailers who already do it

## Founders

Emre Yavuz and his sister. September 2026. The name is wrap + rapid.
