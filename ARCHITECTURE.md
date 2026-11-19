# Project Architecture

> A styled, standalone browser version is available at [public/architecture.html](public/architecture.html) and is published with the app at [/architecture.html](https://mthsgrc.github.io/tarot_reading/architecture.html).

A practical map of the Two Currents application: the Thoth Tarot system, the Chaos Magic shell, technology, layers, data flow, and how the files communicate.

> Snapshot of the repository as of 2026-11-19. Current verification: **161 tests across 21 files**, plus typecheck, lint, formatting, and production build.

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

A client-only **React SPA** with two systems: Thelema/Golden Dawn Thoth Tarot and Chaos Magic. There is no backend, database, authentication, LLM, or runtime API. The deck, spreads, and interpretation rules are static data plus deterministic TypeScript logic; saved readings and shareable links are encoded locally. Chaos adds a separate shell, accent system, and toolkit route without changing the reading engine.

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
                └── app/Layout.tsx (system-aware shell + accent)
                    ├── header / navigation / footer
                    ├── RouteErrorBoundary + Suspense
                    └── <Outlet />
                        ├── HomePage        (eager chooser)
                        ├── ReadingPage     (eager, /thelema)
                        ├── ChaosHomePage   (lazy, /chaos)
                        ├── SigilPage       (lazy, /chaos/sigil)
                        ├── GnosisPage      (lazy, /chaos/gnosis)
                        ├── CutUpPage       (lazy, /chaos/cut-up)
                        ├── ServitorsPage   (lazy, /chaos/servitors)
                        ├── ParadigmPage    (lazy, /chaos/paradigms)
                        ├── RecordPage      (lazy, /chaos/record)
                        ├── WorkingPage     (lazy, /chaos/working)
                        ├── SourcesPage     (lazy, /chaos/sources)
                        ├── LibraryPage     (lazy)
                        ├── StudyPage       (lazy)
                        ├── JournalPage     (lazy)
                        ├── CardPage        (lazy)
                        ├── TraditionPage   (lazy)
                        └── NotFoundPage    (lazy)
```

### Layer responsibilities

| Directory        | Responsibility                                            | Depends on                      | Consumed by                |
| ---------------- | --------------------------------------------------------- | ------------------------------- | -------------------------- |
| `src/app`        | Shell, router, layout, accent picker, route states        | pages, components, router       | `main.tsx`                 |
| `src/pages`      | Route-level state and feature orchestration               | domain, data, lib, components   | `app/App.tsx`              |
| `src/components` | Reusable presentation and interaction                     | domain types, occasionally data | pages and other components |
| `src/domain`     | Types, deck logic, Tree constants, interpretation engine  | data, other domain modules      | pages, components, lib     |
| `src/data`       | 78 cards, six spreads, tradition notes, chaos source copy | domain types                    | domain, pages, components  |
| `src/lib`        | Browser storage adapters                                  | domain journal/share logic      | pages                      |
| `src/styles`     | Tokens, base styles, Chaos theme, print overrides         | fonts                           | `main.tsx`                 |
| `src/test`       | Vitest setup and axe helper                               | Testing Library, axe            | tests                      |

The main dependency direction is **one-way**: `pages → domain/data/lib/components`. Components do not import pages, and domain modules do not import React.

## Routes

`src/app/App.tsx` defines:

| Route                | Page            | Loading |
| -------------------- | --------------- | ------- |
| `/`                  | `HomePage`      | Eager   |
| `/thelema`           | `ReadingPage`   | Eager   |
| `/thelema/library`   | `LibraryPage`   | Lazy    |
| `/thelema/study`     | `StudyPage`     | Lazy    |
| `/thelema/journal`   | `JournalPage`   | Lazy    |
| `/thelema/cards/:id` | `CardPage`      | Lazy    |
| `/thelema/tradition` | `TraditionPage` | Lazy    |
| `/chaos`             | `ChaosHomePage` | Lazy    |
| `/chaos/sigil`       | `SigilPage`     | Lazy    |
| `/chaos/gnosis`      | `GnosisPage`    | Lazy    |
| `/chaos/cut-up`      | `CutUpPage`     | Lazy    |
| `/chaos/servitors`   | `ServitorsPage` | Lazy    |
| `/chaos/paradigms`   | `ParadigmPage`  | Lazy    |
| `/chaos/record`      | `RecordPage`    | Lazy    |
| `/chaos/working`     | `WorkingPage`   | Lazy    |
| `/chaos/sources`     | `SourcesPage`   | Lazy    |
| `*`                  | `NotFoundPage`  | Lazy    |

Legacy routes (`/library`, `/study`, `/journal`, `/tradition`, `/cards/:cardId`) redirect to their canonical `/thelema` paths and preserve search parameters. Old `#/?...` share links are forwarded by `HomePage` to `#/thelema?...`.

The reading page stays in the entry bundle because it is the main Thelema route and every share link opens there. `Layout` wraps pages in a `RouteErrorBoundary` keyed by pathname and a `Suspense` fallback (`src/app/Layout.tsx`). `Layout` derives the active system from the path, swaps brand/navigation/footer content, and sets `data-system` and `data-accent` on `<html>` so global tokens follow the current system. The chosen Chaos accent lives in `Layout` state, so it survives route changes.

The Chaos toolkit index is generated from `src/app/chaosTools.ts`. Each entry carries a title, path, and description. The home grid and the Sources page both read the same list. `SigilPage`, `GnosisPage`, `CutUpPage`, `ServitorsPage`, `ParadigmPage`, `RecordPage`, `WorkingPage`, and `SourcesPage` cover the eight tools.

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
  → links to /thelema/cards/:cardId
      → CardPage
          → useParams
          → getCardById
          → CardDetail
          → previous/next card pager from ALL_CARDS
```

The search index is precomputed once at module load, so typing does not rebuild every card's searchable text on each keystroke.

### Study quiz

```text
StudyPage
  → domain/study.ts createStudyQuestion
      → ALL_CARDS + Tree/Sephira metadata
      → one topic for the card kind
      → four shuffled, unique options and an explanation
  → local question, selected answer, and in-session score
  → links to /thelema/cards/:cardId after answering
```

`createStudyQuestion` accepts an injected `RandomSource`: the page uses `Math.random`, and tests use `seededRandom` to prove determinism and full topic coverage. There is no saved score or URL state, so leaving the page resets the quiz.

### Tradition page

```text
TraditionPage
  → data/tradition.ts       Sephira themes, number notes, element practices
  → domain/tree.ts          Sephiroth and element metadata
  → TreeOfLifeDiagram       visual Tree with optional path/Sephira highlight
```

`TreeOfLifeDiagram` also imports the major cards so each path can be drawn and labelled from the card's `path` metadata.

### Sigil Forge

```text
SigilPage
  → domain/chaos/sigil.ts buildSigil
      → normalizeSigilStatement   collapse whitespace, cap length
      → sigilLetters              drop vowels, then repeated consonants
      → hashString + mulberry32   stable FNV-1a seed and seeded geometry
      → mirrored SVG paths        main path plus 100 - x mirror
  → SigilGlyph                  accessible SVG with a <title>
  → sigilSvgMarkup              escaped standalone download, statement-free metadata
```

The domain layer never calls `Math.random()`. The statement is the seed, so the same normalized text always yields the same glyph; the page only owns form state, focus, and the blob download. A statement with fewer than two charge letters is rejected with an alert rather than drawing an arbitrary shape. `SigilGlyph` renders the domain output and owns no sigil rules.

### Gnosis Timer

```text
GnosisPage
  → domain/chaos/gnosis.ts     span constants and MM:SS formatting
  → local phase               idle | running | paused | complete
  → endAtRef                  absolute deadline, immune to interval drift
  → setInterval(250ms)        refresh displayed remaining time
  → <progress>                native elapsed-time semantics
```

The timer treats the deadline as the source of truth. A background tab may throttle the interval, but the next tick subtracts the real clock and catches up. The page locks the duration while running or paused, moves focus to the completion heading at zero, and keeps the safety copy visible before starting. It does not guide breathwork, play audio, or persist anything.

### Cut-up Oracle

```text
CutUpPage
  → domain/chaos/cutup.ts normalizeCutUpText
      → splitCutUp          lines, or sentences by punctuation and line break
      → buildCutUp          FNV-1a seed + mulberry32 + Fisher-Yates
      → previous guard      rotate once if a new cut repeats the last order
  → ordered fragment list
  → focused result heading
```

The shared helpers in `src/domain/chaos/random.ts` keep hashing, seeded randomness, and shuffling in one place; the Sigil Forge and Cut-up Oracle both use them. The page clears stale output when the text or mode changes, so the visible cut always belongs to the current input. Editing never mutates the original text, and the only state is in memory.

### Servitor Workshop

```text
ServitorsPage
  → domain/chaos/servitor.ts     draft normalization, validation, record shape
  → lib/servitorStorage.ts       localStorage read/write, id generation, cap
  → local draft + record list
      → force names, tasks, forms, review dates
      → retire | restore | delete after inline confirmation
      → storage event refreshes another tab
```

The domain module validates both new drafts and parsed files, so hand-edited storage cannot inject overlong or malformed records. `servitorStorage` caps the file at 50, returns typed `saved | invalid | full | error` results, and never clears the form when a write fails. The page treats a review date as a reminder only and keeps the record as a creative focus object rather than an external authority.

### Paradigm Shift

```text
ParadigmPage
  → domain/chaos/paradigm.ts     belief/reflection validation, duration math
  → lib/paradigmStorage.ts       one open experiment, 30-record history
  → local mode                   setup | open reflection
      → prompts fill a custom belief
      → start, complete, or discard after confirmation
      → storage event refreshes another tab
```

The domain layer computes `endsAt` from the chosen duration and refuses a second open experiment when parsing or saving. Completed records keep their belief, span, timestamps, and reflection, and the page caps history at 30 through the storage adapter. A 30-second interval only refreshes the “ready to reflect” status; the user can complete early or late. The page focuses the open belief after starting, the new history entry after completing, and the setup heading after discarding.

### Magical Record

```text
RecordPage
  → domain/chaos/record.ts      kinds, draft validation, diary ordering
  → lib/recordStorage.ts        shared add/delete API, 100-entry cap
  → form                       title, kind, date, practice, result
  → log                        kind filter, sorted entries, delete confirmation
```

`recordStorage` is deliberately reusable: the Working Composer calls `addStoredRecord` with a `working` draft instead of inventing a second format. Entries sort by working date and then by creation time, while the stored file keeps insertion order. Parsing re-validates every field, filters duplicates, and keeps only the first 100 entries. Focus moves to the new entry after a save, to the next visible entry after a delete, to the filter-empty heading when a filter has no matches, and to the empty heading when the log is empty.

### Working Composer

```text
WorkingPage
  → domain/chaos/working.ts     draft validation, labelled plain text
  → workingToRecordDraft         kind = "working"
  → lib/recordStorage.ts         addStoredRecord
  → preview panel                live title, date, sequence, reflection
  → saved state                  focus the confirmation, disable repeat saves
```

The composer's length limits are chosen so the longest possible practice text still fits inside one record entry. Saving writes the full sequence to `localStorage` and keeps the composed text on screen; editing any field clears the saved state and re-enables the button. The working is a plan, not guided instruction: the copy asks for a form the user can stop safely and a closing that returns to ordinary attention.

### Sources & Context

```text
SourcesPage
  → data/chaosSources.ts        context notes, tool claims, safety, sources, books
  → app/chaosTools.ts           canonical tool titles and paths
  → external links              target="_blank" rel="noreferrer"
```

The final page is static reference content, not a practice. `src/data/chaosSources.ts` separates the claims from the tools: each practice tool has an “It does” and “It does not” statement, the safety notes cover coercion, dangerous practices, privacy, and professional advice, and ritual or banishing remains context rather than a guided exercise. The sources include Wikipedia overviews, the Hermetic Library (which blocks some automated fetchers), and a further-reading list of primary and practitioner texts. The app does not copy their exercises or claim affiliation.

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

- `src/styles/tokens.css` — colors, semantic accent tokens, fonts, spacing, radii, shadows.
- `src/styles/base.css` — reset, typography, buttons, panels, focus, skip link, visually-hidden utilities.
- `src/styles/chaos.css` — black-and-white Chaos palette, `data-accent` colour map, and system-scoped body/type overrides.
- `src/styles/print.css` — flips both dark themes to ink-on-paper, hides navigation and dialogs, and controls page breaks.
- Each component/page has a colocated `.module.css` for scoped layout and print rules.

There is no CSS-in-JS runtime and no utility framework.

### Two-system theme

`Layout` chooses a system from the pathname (`src/app/paths.ts`) and writes `data-system="home|thelema|chaos"` plus `data-accent="..."` to `<html>`. Shared components consume semantic tokens such as `--color-accent`, `--line`, and `--color-surface`, so the same buttons and panels work in both systems.

The Chaos accent is one of the ids in `src/app/chaosAccent.ts`; `src/styles/chaos.css` maps each id to RGB channels and derives soft, focus, and glow values. The picker uses `Math.random()` once when `Layout` mounts, and **New signal** calls it again while excluding the current colour. A test reads `chaos.css?raw` and enforces AAA contrast for every accent against the black shell.

## Testing and CI

Tests are colocated by concern:

| Test area             | Files                                                                                                                                                                                                                                                                                                                                                                             |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Static data integrity | `src/data/cards.test.ts`, `src/data/spreads.test.ts`                                                                                                                                                                                                                                                                                                                              |
| Domain logic          | `src/domain/deck.test.ts`, `src/domain/cardLabels.test.ts`, `src/domain/study.test.ts`, `src/domain/chaos/sigil.test.ts`, `src/domain/chaos/gnosis.test.ts`, `src/domain/chaos/cutup.test.ts`, `src/domain/chaos/random.test.ts`, `src/domain/chaos/servitor.test.ts`, `src/domain/chaos/paradigm.test.ts`, `src/domain/chaos/record.test.ts`, `src/domain/chaos/working.test.ts` |
| Reading engine        | `src/domain/reading/reading.test.ts`                                                                                                                                                                                                                                                                                                                                              |
| Share/journal         | `share.test.ts`, `journal.test.ts`                                                                                                                                                                                                                                                                                                                                                |
| Browser adapter       | `src/lib/journalStorage.test.ts`, `src/lib/servitorStorage.test.ts`, `src/lib/paradigmStorage.test.ts`, `src/lib/recordStorage.test.ts`                                                                                                                                                                                                                                           |
| Components            | `SpreadBoard.test.tsx`, `CardImage.test.tsx`                                                                                                                                                                                                                                                                                                                                      |
| Pages                 | `ReadingPage.test.tsx`, `LibraryPage.test.tsx`, `CardPage.test.tsx`, `JournalPage.test.tsx`, `TraditionPage.test.tsx`, `StudyPage.test.tsx`, `SigilPage.test.tsx`, `GnosisPage.test.tsx`, `CutUpPage.test.tsx`, `ServitorsPage.test.tsx`, `ParadigmPage.test.tsx`, `RecordPage.test.tsx`, `WorkingPage.test.tsx`, `SourcesPage.test.tsx`                                          |
| App/routing           | `App.test.tsx`, `RouteStates.test.tsx`, `chaosAccent.test.ts`                                                                                                                                                                                                                                                                                                                     |
| Accessibility         | `src/app/accessibility.test.tsx` + `src/test/axe.ts` (chooser, Chaos toolkit, Sigil Forge, Gnosis Timer, Cut-up Oracle, Servitor Workshop, Paradigm Shift, Magical Record, Working Composer, Sources & Context, Thelema pages)                                                                                                                                                    |

The accessibility audit renders real pages with axe under WCAG A/AA tags, but explicitly disables color contrast because jsdom has no paint/layout. Real-browser contrast and layout checks remain a manual step.

CI (`.github/workflows/ci.yml`) runs `npm run verify` on push to `master` and pull requests. Deployment (`.github/workflows/deploy.yml`) reruns verification, builds `dist/`, and publishes to GitHub Pages.

## Architectural strengths

- Clear separation between **content**, **domain logic**, **presentation**, and **browser side effects**.
- Deterministic interpretation engine with no network or runtime randomness during rendering.
- Share links and journal entries use one validated encoding format.
- Strong data-integrity and domain test coverage.
- Injected randomness keeps quiz generation testable without a live source.
- Lazy-loaded secondary routes with route error recovery.
- Accessibility is treated as part of the component/API design, not an afterthought.

## Notable coupling and risks

- `ReadingPage` is still the largest orchestration point (~650 lines), owning setup, reading, URL sync, clipboard, journal, and dialog state. The planned M8 split into `ReadingSetup`, `ReadingResult`, and a reducer/hook has not been done.
- The reading engine has spread-specific branches in `relations.ts`, `notices.ts`, and `synthesis.ts`, all keyed by position IDs. This is readable but means adding a spread requires coordinated updates in several modules.
- `domain/deck.ts` imports `ALL_CARDS` directly, even though `drawCards` also accepts an injected deck. Domain modules therefore depend on static data rather than being fully content-agnostic.
- `HashRouter` keeps GitHub Pages deployment simple, but URLs live after `#`, which is less SEO-friendly. New share links use `#/thelema?...`; the old `#/?...` form survives only as a redirect.
- Color contrast and visual layout still need real-browser verification; the jsdom axe pass cannot judge them.
