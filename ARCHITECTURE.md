# Eduardo's Instinct - the dashboard

Architecture. Written before pixels, August 28, 2026. This document says what the
thing is, what each part is for, what feeds it, and what it refuses to be.

## What this is

Not a metrics dashboard. The Instinct made visible: one page he opens and sees
whether it is alive, what it is doing, what it knows, and what it is learning.
His words: "you living and breathing." The test for every element on every page:
does this answer a question he actually walks in with, from the record, with its
source attached. If it decorates, it dies.

One site. Dark, calm, typographic. No framework, no build step, no tracking.
Unlisted URL, noindex, server-side proxies that expose only allowlisted Drive
files. A passphrase gate stays available if he wants it.

## The questions he walks in with

Every section exists to answer one question on sight. That question is the
section's design brief.

### Now - "Is it alive, and what is it doing?"
The cover page. The running streams from instinct/now.md rendered as the standing
state. The factory's latest recorded event. Today's day-page, first lines. What
the machine is waiting on him for, plainly listed. The live Sao Paulo clock.
This page is the proof of life: if nothing here moved today, that shows.

### The Factory - "Is the machine real? Is money moving?"
The Project Time page already built, folded in whole. Scoreboard with the honest
zero, waypoint distance, pace required, the floor of 34 seats, money events,
costs on record. Feed: factory-tracker-data.json, maintained by the factory hand,
proxied live.

### The Workers - "Who is working, and on what?"
The same factory record through a different lens: the seats as entities, not as
money instruments. What each worker is, its rhythm, what it is doing right now,
what gates it. Killed seats stay visible, struck. One data source as the Factory
section, two lenses; if a fact appears in both, it is rendered from the same
record, never copied.

### The Instrument - "What is it, and what can it do?"
The machine side of the mirror. instinct/nature.md (what it has learned about
its own nature), instinct/capabilities.md (what is available, honestly bounded),
instinct/agent.md (the verified surface). This section answers "what's
available" in his own framing: capabilities expressed with their boundaries
named, never a feature list.

### The Days - "What passed between us? Does it remember truthfully?"
The days/ folder as a reading room. One page per day, continuous prose, in the
form its README defines. Index of days, newest first; each day its own page.
Absence is part of the record: a silent day says so.

### Understanding - "What does it know about me, and how sure is it?"
Not a personality profile. No trait cards, no coverage meter. A ledger of beliefs
with the doubt attached, in three zones:

- SETTLED: one line per belief, the evidence as his verbatim words, inference
  labeled as inference, the date it was last attacked.
- WORKING: thin beliefs, single-source, deliberately provisional, shown as thin.
- OPEN: standing questions and unresolved tensions, stated as open.

Above the zones, one sentence in his own words: the sharpest true statement of
why he is doing this. Everything beneath is doubt machinery. The metrics grade
the machine, never him: a repeated-lecture counter per correction theme (the
decay metric), the revision history of beliefs changed or killed, the provenance
ratio of his words against inference. The functional test: he can catch the
machine being wrong at a glance.

Feed: a beliefs data file drafted by the why seat (statement, status, provenance,
evidence quote with source, last-tested date, revision count). Until that feed
lands, the section renders its two source documents as longform reading:
why-we-are-doing-this.md and how-he-thinks.md, labeled as maps he corrects.

### Learning - "What has it read, and what did it do with it?"
The canon ledger: what was admitted, from where, what was folded in, what was
refused and why. Provenance as the content. Alongside it, the principles the
work has distilled so far. Feeds: foundation/canon.md, foundation/sources.md,
principles.md.

## Navigation

A masthead, not a menu. The wordmark "Eduardo's Instinct" and the seven section
names as quiet text links, set in the same line, like a broadsheet's nameplate
carrying its sections. Hash routes (#/now, #/factory, #/workers, #/instrument, #/days,
#/days/2026-08-28, #/understanding, #/learning) so the whole thing stays a
static site with no server routing. The current section is marked by weight,
not color. No breadcrumbs, no sidebars, no cards-in-a-grid landing page: the
cover is Now, and Now is content, not a lobby.

## Content model

Everything renders from the tree. The site invents nothing.

| Section | Feed | Drive ID | Freshness |
| --- | --- | --- | --- |
| Now | instinct/now.md + factory data.json + days/ latest | 1pgwYFVdjPafhd4s5KJ-aDLsWOEXTnE2k | live proxy |
| Factory | factory-tracker-data.json | 1kGc7N5RD1TuplVGnaTyhjNy1CdSPFbSl | live proxy (already shared) |
| Workers | factory data.json, same record | same | same |
| Instrument | nature.md, capabilities.md, agent.md | 1LlLOAbDdOQC_562umgJoJoX-5IO0vBwP, 1UvgHi_Wqe-4SIdIhGtxoa2lYvjQk7__u, 10m6_Obaix9n_lMpH5mlD446qMn57zqqm | live proxy |
| Days | days/*.md + folder listing | folder 1kUDSTW0IPZmpzhUDehDwB5vrn8RZqYZg (shared) | live proxy, folder enumerated server-side |
| Understanding | beliefs feed (why seat, pending) + two doctrine files | 1SLybFRaEsVWPwhb-kYEND5QyHq67160K, 1MacWd73-8Dsm_KCG6lcuWaj2bTvJheEd | live proxy |
| Learning | canon.md, sources.md, principles.md | 1ffoK1QKXxregI9mWYCOHddbRigSObsHW, 1_ALvSEB4mGkd0ZSqkrqKjDdIYIJ0GkE3, 1iyShVGZfV6iLDAvvQJNIP7jDXbCkAoTu | live proxy |

Mechanics:

- One Vercel serverless proxy, /api/doc?key=<name>, with the allowlist above
  compiled in. It fetches the Drive file server-side and serves it with a
  30-second cache. The browser never talks to Drive.
- /api/days enumerates the shared days folder server-side (the folder listing
  carries names and IDs; verified working), so a new day page appears in the
  index with no redeploy and no one maintaining a manifest. When the hand's
  days/index.json exists, it becomes the preferred source.
- Every rendered document carries its own stamp where the file has one (these
  files self-date: "Written August 28", "Last set: ..."), plus the proxy's
  fetched-at time. Where content is a snapshot, the page says snapshot.
- Failure mode: if a feed fails, the section shows the last baked copy, labeled
  with its age. Nothing ever renders as fresh when it is not.

## Design language

One system across all sections, extended from the factory page.

- Surface: near-black ink (#0a0a0b), hairline rules, one reading column at
  1180px, generous air. No cards pretending to be widgets. No gradients.
- Type, three voices with three jobs:
  - Inter Tight for display and interface. The instrument voice.
  - IBM Plex Mono for labels, numbers, stamps, metadata. The record voice.
  - Newsreader (serif) for longform prose: day pages, doctrine, canon. The
    library voice. Reading sections switch to serif on purpose: the war-room
    is sans, the library is serif, and he feels the difference when he crosses.
- Color is semantic and rationed:
  - Gold (#c9a227): money actually earned, and nothing else. The zero today is
    grey because it is zero. When the first dollar lands, gold appears exactly
    there. This is the truth law rendered as pigment.
  - Red (#9e3b2c): killed lanes, failures, corrections. Always attached to a
    fact, never ambient.
  - Paper white: live, current, now.
  - Dim greys: queued, waiting, inference. Inference is rendered dimmer than
    his verbatim words everywhere it appears. Provenance you can see.
- Motion: the clock ticks, data settles in, nothing else moves. Calm.
- Every page footer: the section's source, its stamp, and the truth-law line.

## What it refuses to be

- No admin template, no sidebar SaaS chrome, no emoji, no sparkline decoration.
- No scoring him. Metrics grade the machine's convergence, never the man.
- No section claims what its source does not say. No green that hasn't earned.
- No coverage meters or completeness bars: they measure performance of
  understanding, not understanding. He catches that in seconds.
- Not a product tour. This is his UI into a living thing, not a pitch about one.

## Build order

1. Midnight tonight (browser budget reset): repo eduardo-esmero/instinct, Vercel
   project, the shell plus Now, Factory, Workers, Days live on real feeds.
2. Understanding and Learning longform reading next, on the same proxies.
3. The belief ledger lands when the why seat's data shape does; the section is
   built for it from the start, so the feed drops in without redesign.
4. He walks in, walks through, and corrects. The map gets corrected by him.
