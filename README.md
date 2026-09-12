# Wrapid

A private log of what you learn about the people you love, turned into gift ideas when an occasion comes round.

**Live MVP:** https://claude.ai/code/artifact/80e302cc-ce64-4454-ba60-b2415c5bff33

## The idea

Most gifting apps start from the shop. Wrapid starts from the person. You keep a short, private record of the things people tell you in passing (she's started pottery, he misses proper Turkish coffee, she keeps quoting *Olive Kitteridge*), and when a birthday comes round the app reads those notes and suggests gifts that actually connect to them: objects, experiences, places to go, or something to pay for on their behalf. Mostly things you can get in the UK within 48 hours.

The longer you use it, the better it gets, and the harder it is to leave. The notes are the product.

## What the MVP does (v0.2)

- **People**: the handful of people you buy for most, each with an icon, relationship, birthday, usual budget, Instagram handle and Spotify link
- **What you've learnt**: dated notes with tags and an optional image, one per thing you noticed
- **Gift ideas**: a running list per person, objects and experiences, with a 48h flag, and a "Given" button so nothing is repeated
- **Suggest ideas**: reads the notes and returns 3 objects and 3 experiences with a reason for each, filtered by occasion and budget (runs in the claude.ai viewer)
- **Treat yourself**: mark a profile as you, and it suggests things for you instead
- **Together**: pick several people and either get places and things to do that suit the whole group, or one small gift to buy identically for every member of a team (workplace-friendly, budget per head)
- **Write a message**: three short card messages for a person or a group, in a chosen tone, drawn from the notes, with one-click copy

Data lives in the browser (localStorage). Nothing is pulled from Instagram or any other service: what you know about someone, you add yourself.

## Stack

Single `index.html`. No build step, no framework, no dependencies beyond two Google Fonts. Gift suggestions, group planning and message writing use the claude.ai artifact runtime's `sample` capability, so they work on the live link above and degrade gracefully (button disabled, with a message) anywhere else.

## Running it

Open `index.html` in a browser. That's it.

## Deploying to Vercel

Import this repo (eyavuz21/wrapid) at https://vercel.com/new, framework preset "Other", no build command, output directory `.`. It will serve as a static site.

One caveat: on Vercel the **Suggest**, **Together** and **Write** buttons will be disabled, because the MVP calls Claude through the claude.ai viewer rather than through a server. Making suggestions work on Vercel is the first real engineering task: a small serverless function (`/api/suggest`) that holds an Anthropic API key and calls the Messages API with the same prompt the page builds today.

## Roadmap

See the planning doc for the full picture. In order:

1. **v0.3**: suggestions via a serverless function so the Vercel deploy is complete; shared accounts so two people (say, two siblings) see the same notes
2. **v0.4**: buy links with affiliate tracking (Amazon, Not On The High Street, Bloom & Wild, Buyagift), occasion reminders by email
3. **Later, only once there are users**: reward points and tiers, sending points to someone who has to sign up to use them, a community feed and messaging, self-gift suggestions as a standalone feature

## Not doing

- Scraping Instagram or any social profile. It breaks Meta's terms and GDPR, and it isn't needed: the notes you write yourself are better data than a feed
- Holding stock or running delivery. Fast delivery comes from retailers who already do it

## Founders

Emre Yavuz and his sister. September 2026. The name is wrap + rapid.
