# Project Architecture

> A styled, standalone browser version is available at [public/architecture.html](public/architecture.html) and is published with the app at [/architecture.html](https://mthsgrc.github.io/tarot_reading/architecture.html).

A practical map of the Thoth Tarot application: technology, layers, data flow, and how the files communicate.

> Snapshot of the repository as of 2026-11-18. Current verification: **139 tests across 18 files**, plus typecheck, lint, formatting, and production build.

## Contents

- [Snapshot](#snapshot)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Routes](#routes)
- [How the files talk](#how-the-files-talk)
- [Data model](#data-model)
- [Assets](#assets)
- [Styling](#styling)
- [Testing and CI](#testing-and-ci)
- [Architectural strengths](#architectural-strengths)
- [Notable coupling and risks](#notable-coupling-and-risks)

## Snapshot

A client-only **React SPA** for Thoth Tarot readings. There is no backend, database, authentication, LLM, or runtime API. The deck, spreads, and interpretation rules are static data plus deterministic TypeScript logic; saved readings and shareable links are encoded locally.

## Tech stack

| Area        | Technology                                               |
| ----------- | -------------------------------------------------------- |
| UI          | React 19, React DOM                                      |
| Routing     | React Router 7 with `HashRouter`                         |
| Language    | TypeScript 7, strict mode, bundler resolution            |
| Build       | Vite 8, relative `base: "./"`                            |
| Styling     | CSS Modules, global design tokens, `@fontsource`         |
| Persistence | `localStorage` behind a browser adapter                  |
| Testing     | Vitest 5, Testing Library, jsdom, `user-event`, axe-core |
| Quality     | `tsc`, oxlint, Prettier                                  |
| Images      | ImageMagick-generated AVIF + WebP                        |
| CI/CD       | GitHub Actions, GitHub Pages                             |

## Architecture

The project is a layered front end with a strict practical boundary: **domain/data are pure**, pages orchestrate, components render, and `lib` owns browser side effects.

```text
index.html
└── src/main.tsx
    ├── global CSS
    └── app/App.tsx
        └── HashRouter
            ├── ScrollToTop
            └── Routes
                └── app/Layout.tsx
                    ├── header / navigation / footer
                    ├── RouteErrorBoundary + Suspense
                    └── <Outlet />
                        ├── ReadingPage     (eager)
                        ├── LibraryPage     (lazy)
                        ├── JournalPage     (lazy)
                        ├── CardPage        (lazy)
                        ├── TraditionPage   (lazy)
                        └── NotFoundPage    (lazy)
```

### Layer responsibilities

| Directory        | Responsibility                                           | Depends on                      | Consumed by                |
| ---------------- | -------------------------------------------------------- | ------------------------------- | -------------------------- |
| `src/app`        | Shell, router, layout, route loading/error states        | pages, components, router       | `main.tsx`                 |
| `src/pages`      | Route-level state and feature orchestration              | domain, data, lib, components   | `app/App.tsx`              |
| `src/components` | Reusable presentation and interaction                    | domain types, occasionally data | pages and other components |
| `src/domain`     | Types, deck logic, Tree constants, interpretation engine | data, other domain modules      | pages, components, lib     |
| `src/data`       | 78 cards, six spreads, tradition notes                   | domain types                    | domain, pages, components  |
| `src/lib`        | Browser storage adapter                                  | domain journal/share logic      | pages                      |
| `src/styles`     | Tokens, global base styles, print overrides              | fonts                           | `main.tsx`                 |
| `src/test`       | Vitest setup and axe helper                              | Testing Library, axe            | tests                      |

The main dependency direction is **one-way**: `pages → domain/data/lib/components`. Components do not import pages, and domain modules do not import React.

## Routes

`src/app/App.tsx:42` defines:

| Route            | Page            | Loading |
| ---------------- | --------------- | ------- |
| `/`              | `ReadingPage`   | Eager   |
| `/library`       | `LibraryPage`   | Lazy    |
| `/journal`       | `JournalPage`   | Lazy    |
| `/cards/:cardId` | `CardPage`      | Lazy    |
| `/tradition`     | `TraditionPage` | Lazy    |
| `*`              | `NotFoundPage`  | Lazy    |

The reading page stays in the entry bundle because it is the index route and every share link opens there. `Layout` wraps pages in a `RouteErrorBoundary` keyed by pathname and a `Suspense` fallback (`src/app/Layout.tsx:52`).

## How the files talk

### Application startup

```text
index.html → src/main.tsx
  → imports styles/tokens.css, base.css, print.css
  → renders <App />
    → App creates HashRouter and route table
      → Layout renders navigation and <Outlet />
        → selected page renders
```

`ScrollToTop` listens to router location changes and scrolls on navigation (`src/app/App.tsx:32`).

### Reading flow

```text
ReadingPage
  → data/spreads.ts                  spread definitions and defaults
  → domain/deck.ts                   shuffle and draw
  → components/SpreadPicker          choose spread
  → components/SpreadBoard
      → components/TarotCardView
          → components/CardImage / CardBack
  → domain/reading/interpret.ts      once all cards are revealed
  → components/ReadingInterpretation
  → components/CardDetailDialog
      → components/CardDetail
          → CardImage + TreeOfLifeDiagram
```

`ReadingPage` is the main state owner: spread, question, shadow flag, lens, depth, drawn cards, reveal state, dialog index, clipboard status, and journal status. Children receive values and callbacks; they do not reach into storage or the URL directly.

Key actions:

- **Draw** → `handleStart` calls `drawCards` and stores the result in `drawn`.
- **Reveal** → updates the matching card's `revealed` flag.
- **Open card** → stores `openIndex`; `CardDetailDialog` renders the selected `DrawnCard`.
- **Interpret** → once every card is revealed, a memo calls `interpretReading` and passes the result to `ReadingInterpretation`.
- **Copy reading** → `formatReading` converts the interpretation to plain text.
- **Print** → `window.print()`; `print.css` and component print rules take over.

### Interpretation engine

`src/domain/reading/interpret.ts:19` is the single pure entry point:

```text
ReadingInput
  → buildFacts
      counts, arcana, suits, elements, orientations,
      repeated numbers, shared Sephiroth,
      card-to-station resonances, inferred/explicit lens
  → buildFactInsights + buildRelationInsights
      element, major, court, shadow, number,
      Sephira, resonance, keyword observations,
      spread-specific card-to-card relations
  → selectInsights
      sort by weight, deduplicate, cap by depth,
      limit each insight kind
  → synthesis
      headline, overview, per-position paragraphs,
      spread-specific movement, one action
  → ReadingInterpretation
```

Supporting files:

| File           | Role                                                       |
| -------------- | ---------------------------------------------------------- |
| `facts.ts`     | Builds the factual model of the draw                       |
| `relations.ts` | Compares cards and builds spread-specific relations        |
| `notices.ts`   | Creates, scores, and caps pattern observations             |
| `synthesis.ts` | Turns facts and notices into prose                         |
| `language.ts`  | Labels, lens frames, element voices, element relations     |
| `positions.ts` | Position intros, Tree triads, shared element list          |
| `text.ts`      | Text helpers, hashing, deterministic phrase selection      |
| `format.ts`    | Plain-text export                                          |
| `types.ts`     | Reading input/output types and shared lens/depth constants |
| `share.ts`     | Share-link encoding, decoding, validation                  |
| `journal.ts`   | Journal validation, serialization, deduplication           |
| `interpret.ts` | Pipeline composition                                       |

Determinism matters here: the draw is encoded, and phrase variants are selected from a hash of the spread/cards plus a salt (`pickVariant`), so the same draw produces the same reading.

### Share-link loop

```text
ReadingPage state
  → buildShareParams
  → buildShareUrl
  → clipboard

URL hash
  → readSharedReading
  → validates version, spread, cards, orientations,
    duplicates, lens, depth, question length
  → ReadingPage state
```

`readSharedReading` returns `null` for malformed links. `ReadingPage` handles that by returning to setup and showing an error, rather than rendering partial data. Removing share parameters also resets stale reading state.

Share links are self-contained. They contain the spread, card IDs, orientations, optional question, shadow flag, lens, and depth. Nothing is uploaded.

### Journal loop

```text
ReadingPage
  → buildShareParams
  → lib/journalStorage.saveJournalEntry
      → domain/reading/journal.upsertJournalEntry
      → validates through readSharedReading
      → serialize
      → localStorage

JournalPage
  → loadJournal
  → parseJournal
  → re-validates each stored entry through readSharedReading
  → renders entries as links: /?<params>&j=1
  → opens the same ReadingPage share-link path
```

The journal deliberately reuses the share format instead of inventing a second serialization format. Entries store the encoded parameters, timestamp, and stable ID. Cross-tab changes are detected with a `storage` event listener in `JournalPage`.

### Library and card page

```text
LibraryPage
  → ALL_CARDS
  → module-level CARD_SEARCH_WORDS index
  → local search/arcana/suit/element filters
  → links to /cards/:cardId
      → CardPage
          → useParams
          → getCardById
          → CardDetail
          → previous/next card pager from ALL_CARDS
```

The search index is precomputed once at module load, so typing does not rebuild every card's searchable text on each keystroke.

### Tradition page

```text
TraditionPage
  → data/tradition.ts       Sephira themes, number notes, element practices
  → domain/tree.ts          Sephiroth and element metadata
  → TreeOfLifeDiagram       visual Tree with optional path/Sephira highlight
```

`TreeOfLifeDiagram` also imports the major cards so each path can be drawn and labelled from the card's `path` metadata.

## Data model

Core types live in `src/domain/types.ts`:

- `Element`, `Suit`, `CourtRank`, `NumberRank`, `Sephira`, `Orientation`
- `MajorCard | MinorCard | CourtCard` → `TarotCard`
- `Spread`, `SpreadPosition`, `SpreadLayout`
- `DrawnCard` = card + position + orientation + revealed flag

Card content lives under `src/data/cards/`, split by suit:

- `majors.ts` — 22 Atu
- `wands.ts`, `cups.ts`, `swords.ts`, `disks.ts` — 14 each
- `index.ts` — combines them into `ALL_CARDS` and `CARD_BY_ID`

`src/data/cards.test.ts` enforces deck integrity: 78 unique cards, 22 majors, four suits of 14, unique Hebrew letters, unique Tree paths, valid ranks, valid Sephiroth, content completeness, and the existence of AVIF/WebP art for every card.

## Assets

Original artwork lives in `images/` and is not formatted by Prettier. `scripts/optimize-images.mjs` uses ImageMagick to generate:

- `public/images/cards/<card-id>.avif`
- `public/images/cards/<card-id>.webp`
- `public/images/back-cover.avif`
- `public/images/back-cover.webp`

`CardImage` renders a `<picture>` with AVIF first, WebP fallback, and a styled placeholder on failure. Image URLs use `import.meta.env.BASE_URL`, so they work from a GitHub Pages subpath.

## Styling

- `src/styles/tokens.css` — colors, fonts, spacing, radii, shadows.
- `src/styles/base.css` — reset, typography, buttons, panels, focus, skip link, visually-hidden utilities.
- `src/styles/print.css` — flips the dark theme to ink-on-paper, hides navigation and dialogs, and controls page breaks.
- Each component/page has a colocated `.module.css` for scoped layout and print rules.

There is no CSS-in-JS runtime and no utility framework.

## Testing and CI

Tests are colocated by concern:

| Test area             | Files                                                                                                                 |
| --------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Static data integrity | `src/data/cards.test.ts`, `src/data/spreads.test.ts`                                                                  |
| Domain logic          | `src/domain/deck.test.ts`, `src/domain/cardLabels.test.ts`                                                            |
| Reading engine        | `src/domain/reading/reading.test.ts`                                                                                  |
| Share/journal         | `share.test.ts`, `journal.test.ts`                                                                                    |
| Browser adapter       | `src/lib/journalStorage.test.ts`                                                                                      |
| Components            | `SpreadBoard.test.tsx`, `CardImage.test.tsx`                                                                          |
| Pages                 | `ReadingPage.test.tsx`, `LibraryPage.test.tsx`, `CardPage.test.tsx`, `JournalPage.test.tsx`, `TraditionPage.test.tsx` |
| App/routing           | `App.test.tsx`, `RouteStates.test.tsx`                                                                                |
| Accessibility         | `src/app/accessibility.test.tsx` + `src/test/axe.ts`                                                                  |

The accessibility audit renders real pages with axe under WCAG A/AA tags, but explicitly disables color contrast because jsdom has no paint/layout. Real-browser contrast and layout checks remain a manual step.

CI (`.github/workflows/ci.yml`) runs `npm run verify` on push to `master` and pull requests. Deployment (`.github/workflows/deploy.yml`) reruns verification, builds `dist/`, and publishes to GitHub Pages.

## Architectural strengths

- Clear separation between **content**, **domain logic**, **presentation**, and **browser side effects**.
- Deterministic interpretation engine with no network or runtime randomness during rendering.
- Share links and journal entries use one validated encoding format.
- Strong data-integrity and domain test coverage.
- Lazy-loaded secondary routes with route error recovery.
- Accessibility is treated as part of the component/API design, not an afterthought.

## Notable coupling and risks

- `ReadingPage` is still the largest orchestration point (~650 lines), owning setup, reading, URL sync, clipboard, journal, and dialog state. The planned M8 split into `ReadingSetup`, `ReadingResult`, and a reducer/hook has not been done.
- The reading engine has spread-specific branches in `relations.ts`, `notices.ts`, and `synthesis.ts`, all keyed by position IDs. This is readable but means adding a spread requires coordinated updates in several modules.
- `domain/deck.ts` imports `ALL_CARDS` directly, even though `drawCards` also accepts an injected deck. Domain modules therefore depend on static data rather than being fully content-agnostic.
- `HashRouter` keeps GitHub Pages deployment simple, but URLs live after `#`, which is less SEO-friendly and requires the `#/?...` share format.
- Color contrast and visual layout still need real-browser verification; the jsdom axe pass cannot judge them.
