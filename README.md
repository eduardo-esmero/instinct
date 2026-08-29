# Eduardo's Instinct

The Instinct made visible. One site he opens to see whether it is alive, what it
is doing, what it knows about him, and what it is learning. Dark, calm,
typographic. Truth law everywhere: nothing green that hasn't earned, inference
rendered dimmer than his verbatim words, staleness always labeled.

## Sections

- **Now** - the pulse: running streams, factory motion, what waits on him.
- **The Factory** - Project Time's money truth: the floor of seats, the
  scoreboard, the record of the day.
- **The Workers** - the same record read as people: who is seated, what each is
  doing, what gates them.
- **The Instrument** - the machine side of the mirror: nature, capabilities,
  the verified surface, honestly bounded.
- **The Days** - the record of the relationship in time, one prose page per day.
- **Understanding** - the belief ledger with doubt attached (SETTLED / WORKING /
  OPEN), fed by the why seat; until that feed lands, the two doctrine documents.
- **Learning** - the canon ledger: what was admitted, folded in, or refused.

## How it stays fresh

Everything renders live from the Eduardo's Instinct Drive tree through small
serverless proxies as Cloudflare Pages Functions in `functions/api/`:

- `functions/api/doc.js` (`/api/doc?key=...`) - allowlisted documents (factory data.json, now.md, the
  doctrine files, the canon). The allowlist compiled into the function is the
  privacy boundary.
- `functions/api/days.js` (`/api/days`) - enumerates the shared days folder server-side, so a new day
  page appears with no redeploy.
- `functions/api/day.js` (`/api/day?id=...`) - serves one day page after confirming it lives in the
  days folder.

No framework, no build step. Deployed on Cloudflare Pages (`wrangler pages deploy . --project-name instinct`); Pages Functions serve the proxies server-side so the Drive tree stays readable to real browsers. Data changes need no deploy at all.

## Design

See ARCHITECTURE.md. Three type voices: Inter Tight for the instrument, IBM Plex
Mono for the record, Newsreader for the library. Gold means earned money and
nothing else. Red means killed, failed, or corrected, always attached to a fact.
