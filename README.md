# Noticed for retail

The client book your staff actually keep, kept by the store.

**Live:** https://noticedapp.vercel.app

## The problem

In any shop with regulars, the valuable knowledge is what the floor staff notice: she's started pottery, he grew up in Bodrum and misses proper coffee, the corporate account wants nothing alcoholic this year. It lives in heads and notebooks, and when a personal shopper leaves, the client book leaves with them. Enterprise clienteling software exists for department stores, on eighteen-month contracts. Nothing exists for the boutique, the concierge, the members' club or the independent with two thousand regulars.

## What it does

- **Clients**, each with an account type, birthday, budget, and where they live
- **What the team has noticed**: dated, tagged notes anyone on the floor can add
- **Stock**: paste your catalogue in once (title, price, link, tags). Every suggestion is drawn from your own stock first, marked "Your stock", with the wider web as backup, marked "Wider web"
- **Suggest**: reads the notes and returns six ideas with a reason each, by occasion and budget. Online mode attaches a link to buy or send; in-person mode picks things to hand over today
- **Together**: one gift for a whole corporate account, chosen to land with all fourteen people, or ideas for an event
- **Write a message**: three card messages in a chosen tone, from the notes
- **One workspace per store**: email sign-in, and a six-character code that brings a colleague into the same clients, notes, ideas and stock

## Who it's for

Boutiques and independents with regulars. Concierge and gifting agencies. Private members' clubs and boutique hotels' guest relations. Executive assistants and account managers who buy for a list of people they have to remember things about. Later: department-store personal shopping, where the incumbent is enterprise clienteling and the pitch is "your shoppers' notes stay with the store".

## Pricing (proposed)

£29 per seat per month, or £199 a month per store for up to ten seats. Free for a single user with up to twenty clients, so a personal shopper can bring it in before the store buys it.

## Stack

- `index.html`: the whole app. No build step.
- `api/suggest.js`: calls Claude with structured JSON output, then attaches real links via `api/_search.js` (LinkUp or Tavily, whichever key is set). Stock items keep their own links and skip the search.
- `api/config.js`: hands the page its public Supabase config.
- `supabase/schema.sql`: workspaces (one per store), members, one JSON state document per workspace holding clients, notes, ideas and stock, row-level security, RPCs.

## Deploying

The repo is connected to Vercel: every push to `main` deploys automatically.

| Variable | Required | What |
|---|---|---|
| `ANTHROPIC_API_KEY` | yes | Suggestions and messages |
| `LINKUP_API_KEY` or `TAVILY_API_KEY` | for links | Real product and shop links; `SEARCH_PROVIDER` forces one |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | for sign-in | Project Settings → API. The anon key is public by design |

Supabase setup: create a project, run `supabase/schema.sql` then `supabase/patch-2026-09-12.sql` in the SQL editor, set the Site URL and Redirect URLs under Authentication to the live address, add the two variables to Vercel. The built-in email sender is rate-limited; add custom SMTP (Resend) before launch.

## Status

Parked, 13 September 2026, in favour of the practice app. Kept as the B2B backdrop: the product works end to end, and the first customer conversation is a boutique or concierge with a list of regulars and no system.

## History

Started 12 September 2026 as a consumer gifting app (Keepsake, then Wrapid, then Giftlore, then Noticed), repositioned for retail the same day once it was clear the people who pay for remembering clients are businesses.

Emre Yavuz and Melisande Yavuz.
