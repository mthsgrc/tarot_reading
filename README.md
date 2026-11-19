# Two Currents

A client-only tarot and Chaos Magic app. The home route chooses between two systems:

- **Thelema · Golden Dawn** — the Thoth Tarot deck, six spreads, upright and shadow readings, a study library, a correspondence quiz, a journal, and a deterministic interpretation engine.
- **Chaos Magic** — a black-and-white workbench for sigils, gnosis, servitors, paradigm experiments, cut-up divination, and a magical record, with one contrast accent chosen at random for each app load.

Both systems stay in the browser. Nothing is uploaded, and there is no account, backend, or runtime network call.

Readings and magical records are for reflection, not prediction, and are not a substitute for medical, legal, financial, or relationship advice.

## Stack

- React 19 + TypeScript + Vite
- React Router with `HashRouter` for static hosting
- Custom CSS Modules and design tokens
- Vitest + Testing Library + jsdom
- axe-core for accessibility checks
- oxlint + Prettier
- ImageMagick for the AVIF/WebP asset pipeline

## Quick start

Node 22 or newer is recommended.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Routes and systems

`src/app/paths.ts` is the source of truth for canonical routes.

| Route                | System                | Purpose                       |
| -------------------- | --------------------- | ----------------------------- |
| `/`                  | Chooser               | Pick Thelema or Chaos         |
| `/thelema`           | Thelema · Golden Dawn | Reading table and share links |
| `/thelema/library`   | Thelema · Golden Dawn | All 78 cards                  |
| `/thelema/study`     | Thelema · Golden Dawn | Correspondence quiz           |
| `/thelema/journal`   | Thelema · Golden Dawn | Saved readings                |
| `/thelema/tradition` | Thelema · Golden Dawn | Thelema and Golden Dawn notes |
| `/thelema/cards/:id` | Thelema · Golden Dawn | Card detail                   |
| `/chaos`             | Chaos Magic           | Chaos toolkit shell and index |
| `/chaos/sigil`       | Chaos Magic           | Sigil Forge                   |
| `/chaos/gnosis`      | Chaos Magic           | Gnosis Timer                  |
| `/chaos/cut-up`      | Chaos Magic           | Cut-up Oracle                 |
| `/chaos/servitors`   | Chaos Magic           | Servitor Workshop             |
| `/chaos/paradigms`   | Chaos Magic           | Paradigm Shift                |
| `/chaos/record`      | Chaos Magic           | Magical Record                |
| `/chaos/working`     | Chaos Magic           | Working Composer              |
| `/chaos/sources`     | Chaos Magic           | Sources and safety context    |

Old paths such as `#/library`, `#/journal`, and `#/cards/:id` redirect to their `/thelema` equivalents. Old `#/?...` share links are forwarded from the chooser to `#/thelema?...`, so links already in circulation keep working.

## Scripts

| Script                 | Purpose                                        |
| ---------------------- | ---------------------------------------------- |
| `npm run dev`          | Start the Vite development server              |
| `npm run build`        | Typecheck and build to `dist/`                 |
| `npm run preview`      | Preview the production build                   |
| `npm run test`         | Run the Vitest suite once                      |
| `npm run test:watch`   | Run Vitest in watch mode                       |
| `npm run test:a11y`    | Run only the axe accessibility audit           |
| `npm run typecheck`    | Run the TypeScript project build               |
| `npm run lint`         | Run oxlint                                     |
| `npm run format`       | Format the repository with Prettier            |
| `npm run format:check` | Verify formatting without writing              |
| `npm run verify`       | Typecheck, lint, format-check, test, and build |

## The deck

The app contains:

- 22 major cards (Atu), including the Thoth names: Magus, Priestess, Adjustment, Fortune, Lust, Art, Aeon, and Universe
- 4 suits of 14: Wands, Cups, Swords, and Disks
- Court ranks: Knight, Queen, Prince, and Princess
- Upright and shadow meanings, symbolism, keywords, and correspondences for every card

The **Thelemic correction** is applied: the Emperor is attributed to Tzaddi and the Star to Heh, following _Liber AL_ I:57. Zodiacal attributions do not change; the letters and Tree paths swap. Many decks retain the older Golden Dawn attribution, so the app names its system explicitly.

## Spreads

1. **Thelema Triad** — Will, Love, Union (3 cards)
2. **Past · Present · Future** — the classic timeline (3 cards)
3. **Thelemic Cross** — Crown, Abyss, Root, Star, Aeon (5 cards)
4. **Tree of Life** — the ten Sephiroth (10 cards)
5. **The Great Work** — seven planetary powers (7 cards)
6. **Lovers' Cross** — Love under Will (5 cards)

## Project structure

```text
src/
├── app/          # Router, system-aware layout, accent picker, canonical paths
├── components/   # Card views, spreads, dialog, Tree diagram, Chaos star
├── data/         # 78 cards, six spread definitions, shared tradition notes
├── domain/       # Types, Tree constants, draw engine, reading engine, labels
├── lib/          # Browser storage adapters
├── pages/        # Chooser, Thelema pages, Chaos shell, 404
├── styles/       # Tokens, global base, Chaos theme, print styles
└── test/         # Vitest setup and the axe helper
scripts/
└── optimize-images.mjs
```

Business logic lives in `src/domain`, content in `src/data`, and presentation in `src/components` and `src/pages`.

## Reading engine

`src/domain/deck.ts` contains a pure, testable draw engine:

- Fisher–Yates shuffle, non-mutating
- Cryptographically random values from `crypto.getRandomValues`
- A seeded RNG for tests and reproducible debugging
- One card per position, without replacement
- Optional shadow orientation per card
- A guard that throws if a spread asks for more cards than the deck contains

React state in `ReadingPage` owns the current draw. Cards start face down, reveal individually or all at once, and open a native `<dialog>` with the full entry.

### Interpretation

`src/domain/reading/` is a pure, deterministic expert system. The spread supplies the grammar, each card supplies the vocabulary, and the engine supplies the connective tissue:

1. **Facts** — element, suit, arcana, court, number, orientation, and Sephira counts; repeated numbers; shared Tree stations; card-to-station resonances; and an optional question lens.
2. **Relations** — card-to-card comparisons with spread-specific recipes for all six spreads.
3. **Notices** — only the strongest patterns, weighted and capped so a three-card draw does not become a lecture.
4. **Synthesis** — headline, overview, a position-aware paragraph for every card, the movement of the spread, and one grounded action.
5. **Transparency** — a “How this reading was built” disclosure shows the facts behind the prose.

Before drawing, choose a **lens** and a **depth**. The lens can be Automatic, which infers from the question’s wording, or explicit: Open question, Will and work, Love and relationship, or Inner work. An explicit lens always wins. Depth is Brief, Standard, or Deep: Brief keeps the headline, strongest patterns, and action, and omits positions and movement from the screen, copy, and print; Deep raises the number of pattern notices.

The same draw always produces the same reading, including phrase variants. No backend, no LLM, and no `Math.random()` at render time. Copying the reading exports the full interpretation as plain text, with the reflection disclaimer.

### Sharing

**Copy reading** exports the interpretation as plain text. **Copy link** encodes the spread, cards, orientations, question, lens, depth, and shadow flag in the URL, so the recipient sees the reading exactly as it was drawn. **Copy link without question** leaves the question out but keeps the resolved lens, so a private question does not change how the shared reading is framed. Lens and depth are additive optional parameters: links made before they existed still infer the lens and use Standard depth. Nothing is uploaded; the link is self-contained. Decoding rejects unknown spreads, cards, orientations, lenses, depths, and overlong questions, and shows a notice instead of failing.

### Printing

**Print reading** in the synthesis panel opens the browser's print dialog for paper or **Save as PDF**. The print stylesheet flips the dark interface to ink on white, hides navigation, buttons, dialogs, and status chrome, and keeps every card with its caption. Spread layouts are re-expressed in millimetres so the Tree and cross spreads keep their geometry on A4 or Letter, and long readings break between cards and interpretation blocks rather than through them. The print copy is the same deterministic reading shown on screen.

### Journal

**Save to journal** keeps a fully revealed reading in `localStorage` on that device, including its lens and depth. The `/thelema/journal` page lists the 50 most recent saves with their question, cards, lens, depth, and date; each entry reopens the exact draw through the same versioned link format, and entries can be deleted individually or cleared together after confirmation. Nothing is uploaded, no account is involved, and clearing browser storage clears the journal. Stored entries are re-validated when read, so corrupt or hand-edited data is ignored rather than rendered.

### Study mode

The `/thelema/study` page drills correspondences with a four-choice quiz. Each question draws a card and asks one of six topics: element for any card; Hebrew letter, Tree path, or Golden Dawn title for majors; Sephira for minors; elemental nature for court cards. Answers are scored in memory only, and each result shows a short explanation plus a link to the full card entry. Leaving the page resets the score.

`src/domain/study.ts` builds each question from the static deck with four unique options. It accepts an injected `RandomSource`, so tests use `seededRandom` while the page uses `Math.random`. No persistence, backend, or LLM is involved.

## Chaos Magic

The `/chaos` route uses a deliberately different shell: black and white, sans-serif headings, and one contrast colour chosen when the app loads. The accent is applied through `data-accent`; `src/styles/chaos.css` maps every choice to a colour that keeps AAA contrast with the black shell. **New signal** in the Chaos header rerolls the accent without changing route, and the choice survives navigation during that visit.

`src/app/chaosAccent.ts` owns the accent ids and the injected-random picker. The CSS owns the colours, and a test reads the stylesheet back to verify every accent stays contrast-safe. The palette is intentionally small so the shell still reads as black and white rather than a theme park.

The toolkit route is the shell for the Chaos system. The home index lists all eight local tools with short descriptions and direct links. Every tool is built and works without a network; records stay in the browser.

### Sigil Forge

`/chaos/sigil` turns a written statement into a deterministic glyph. The domain layer in `src/domain/chaos/sigil.ts` collapses whitespace, removes vowels, then removes repeated consonants. The surviving charge letters seed an FNV-1a hash, and a seeded `mulberry32` generator places the mirrored path points. The same statement therefore always produces the same shape; no `Math.random()` runs during render.

A statement needs at least two surviving consonants. The page explains the reduction, shows the charge letters, moves focus to the result heading, and can download a standalone SVG. The SVG is generated locally from a blob with a white background and only the charge letters in its metadata, so the private statement is not embedded in the file. Reset returns focus to the statement field, and print styles reduce the result to ink on white. A sigil is framed as a creative focus object, not a prediction.

### Gnosis Timer

`/chaos/gnosis` is a silent attention timer, not a guided induction. Choose 3, 5, 10, or 20 minutes, then start, pause, resume, or reset. The deadline is stored as a timestamp, so a throttled background tab does not stretch the span; the interval only refreshes the display. The span is locked while the timer runs or is paused, and the native `<progress>` element shows elapsed time.

When the countdown reaches zero, focus moves to a compact completion heading and the page suggests stopping and noting what happened. The safety copy is visible before starting: breathe normally, do not hold your breath or hyperventilate, and stop if you feel dizzy, panicked, or unwell. No sound is played, nothing is saved, and leaving the page discards the timer.

### Cut-up Oracle

`/chaos/cut-up` rearranges your own lines or sentences. Lines mode treats each non-empty line as one fragment; sentences mode splits on `.`, `!`, `?`, and line breaks. Abbreviations can split like any other full stop, which is part of the collage rather than a grammar checker.

`src/domain/chaos/cutup.ts` normalizes the text, builds at least two fragments, and shuffles them with the shared FNV-1a and `mulberry32` helpers. The same text, mode, and cut number always produce the same order. The first cut is guaranteed to move when two fragments could otherwise return unchanged, and **Cut again** passes the previous order so it always changes. Editing the text or mode clears the old result. The output is an ordered list with a focused heading, and nothing is uploaded or saved.

### Servitor Workshop

`/chaos/servitors` keeps a local record for each named intention: a name, one task, an optional form, and an optional review date. A due date is only a reminder to check in; it is not an instruction to perform a practice. **Retire** marks a record inactive while keeping it, **Restore** returns it to the active list, and **Delete** removes it permanently after an inline confirmation. Group egregores are outside this personal workshop.

Records are validated twice: in `src/domain/chaos/servitor.ts` before creation and when reading stored data. The browser adapter in `src/lib/servitorStorage.ts` owns `localStorage`, caps the file at 50 records, keeps records newest-first, and reports storage failures without clearing the form. A storage event refreshes the list when another tab changes it. The page moves focus to a new record, to the next record after a deletion, or to the empty heading when the last record goes. Treat a servitor as a creative fiction you can revise, not an external authority.

### Paradigm Shift

`/chaos/paradigms` runs one temporary-belief experiment at a time. Choose a starting point or write your own belief, pick one hour, one day, or one week, and start. The open experiment shows its belief, start, end, and whether it is ready to reflect. A complete experiment asks for a reflection and then moves into a local history of up to 30 records. An open experiment can be discarded after confirmation.

`src/domain/chaos/paradigm.ts` computes end timestamps, validates records, and allows only one open experiment. The storage adapter keeps the current file versioned and local, and a storage event refreshes another tab. The page updates the “ready to reflect” copy while open, but completion is always available; the tool does not enforce a deadline. The safety copy asks you to keep the belief provisional and kind, and not to use it to override evidence about health, money, safety, or consent.

### Magical Record

`/chaos/record` is the shared local log. An entry has a title, a kind, a working date, what you did, and an optional note about what changed. The kinds cover notes, sigils, gnosis, cut-ups, servitors, paradigms, and workings, so the page doubles as a general diary. Filters narrow the list by kind, entries sort by working date and then by when they were written, and deleting an entry requires an inline confirmation. The file holds up to 100 entries.

`src/domain/chaos/record.ts` validates both drafts and parsed files. `src/lib/recordStorage.ts` exposes `addStoredRecord` for other tools as well as the page, which is how the Working Composer appends to the same log. Records are stored newest-first, and a storage event refreshes another tab. The record is reflective, not proof of causation, and nothing is uploaded. It is not a replacement for medical, legal, financial, or relationship advice.

### Working Composer

`/chaos/working` writes a structured working into the shared Magical Record. A working has a title, date, intention, optional preparation, action, closing, and optional reflection. The right panel previews the sequence as you write. Saving calls the same `addStoredRecord` adapter as the record page, with the kind set to `working`; the intention, preparation, action, and closing become labelled plain text in the record. The composer stays on screen after a save and disables the save button until you change something, so the same text does not create duplicate entries.

The composer does not teach a ritual. The safety copy asks you to avoid breath-holding, hyperventilation, sleep deprivation, fasting, pain, or anything that could harm you or someone else, and to stop whenever you choose. The closing field asks how you will end and return to ordinary attention, not for a prescribed banishing.

### Sources & Context

`/chaos/sources` is the reference page for the toolkit. It separates the historical and contested claims from the tools: chaos magic as a modern current with no single lineage; Spare's sigil work and this app's original deterministic variation; the different uses of “gnosis”; practitioner language around servitors and egregores; cut-up as an art technique; and records as reflection rather than proof of causation. Each practice tool gets an “It does” and “It does not” statement.

The page also collects safety and scope notes: no guided breath-holding, hyperventilation, sleep deprivation, fasting, or pain; stop and get support if a practice leaves you unwell; keep workings consent-based; ritual and banishing stay as context rather than guided exercises; records are local; and nothing here is professional advice. External sources and a short further-reading list are included, with a note that the site is independent and does not reproduce the source exercises.

## Card artwork

The original scans are in `images/` and were optimized with ImageMagick into native `278×408` AVIF and WebP files:

```bash
node scripts/optimize-images.mjs
node scripts/optimize-images.mjs --force
```

Output lives in `public/images/cards/` with one file pair per card ID, plus `public/images/back-cover.{avif,webp}`. The `<picture>` element prefers AVIF, falls back to WebP, and renders an accessible styled placeholder if the image fails to load. The optimized set is about 3.9 MB instead of the original 18 MB PNGs.

## Deployment

`.github/workflows/deploy.yml` runs the full verification suite and publishes `dist/` to GitHub Pages on every push to `master`. It can also be started manually from the Actions tab.

One-time repository setting: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

`vite.config.ts` uses `base: "./"` and the app uses `HashRouter`, so the production `dist/` can be served from a domain root or a GitHub Pages repository subpath without server rewrites. Card image URLs are built with `import.meta.env.BASE_URL`, so they follow the same base path.

`public/architecture.html` is copied into `dist/` by Vite, so the styled architecture guide is published at `/architecture.html` alongside the app.

The reading page ships in the entry bundle because it is the main Thelema route and every share link opens there. Library, study, journal, card, tradition, and 404 routes are lazy-loaded into separate chunks. Suspense keeps the header and navigation visible while a chunk loads, and a route error boundary offers a reload if a previously cached page requests a chunk that a deployment has replaced.

```bash
npm run build
# inspect the result locally with: npm run preview
```

## Testing

The suite covers:

- 78 unique cards and the expected suit distribution
- Unique Hebrew letters and Tree paths 11–32
- The Emperor/Star Thelemic correction
- Required content completeness for every card
- Existence of both optimized image formats for every card
- All six spreads, position guidance, and the Tree spread order
- Shuffle determinism, non-mutation, duplicate-free draws, and shadow orientation
- Reading facts, lens inference, explicit lens precedence, shared Sephira, Tree and planetary resonances
- Deterministic interpretation, depth-based notice counts, brief text export, all-spread smoke tests, and every card in both orientations
- Share-link round trips for every spread, lens/depth parameters, special characters in questions, and rejection of malformed links
- Journal validation, deduplication, the 50-entry cap, storage failures, and delete/clear flows
- Study question topics, four unique options, correct answers, full topic coverage, and seeded determinism
- Study quiz scoring, wrong-answer feedback, skip behavior, focus movement, and card links
- Canonical `/thelema` routes, home chooser links, old route redirects, and old share-link forwarding
- Chaos accent selection, reroll behavior, and a stylesheet-backed AAA contrast check for every accent
- Sigil statement normalization, consonant reduction, deterministic geometry, mirrored paths, and statement-free SVG export
- Sigil Forge validation, normalized repeatability, result focus, reset focus, download status, and toolkit navigation
- Gnosis clock formatting, span changes, run/pause/resume, completion focus, reset, and duration locking
- Cut-up normalization, line and sentence splitting, deterministic shuffles, previous-order movement, and fragment preservation
- Cut-up validation, repeated cuts, mode switching, result focus, clearing on edit, reset focus, and toolkit navigation
- Servitor draft validation, review dates, create/retire/restore/delete flows, storage failures, the 50-record cap, and cross-tab refresh
- Paradigm duration math, readiness, belief/reflection validation, one-open-experiment enforcement, start/complete/discard flows, storage failures, and cross-tab refresh
- Magical Record validation, kind filters, diary ordering, add/delete focus, storage failures, the 100-entry cap, and cross-tab refresh
- Working Composer validation, live preview, save-to-record conversion, saved-state clearing, clear, storage failures, and record-full handling
- Sources & Context tool claims, safety boundaries, external-link attributes, further reading, and toolkit links
- axe audits of the chooser, Chaos toolkit, Sigil Forge, Gnosis Timer, Cut-up Oracle, Servitor Workshop, Paradigm Shift, Magical Record, Working Composer, Sources & Context, setup, completed reading, card dialog, library, card page, study quiz, tradition page, journal, and 404 under the WCAG A/AA tags
- Lazy route loading, the route loading state, and stale-chunk error recovery
- The complete reading flow, shared-link loading, journal saves, interpretation section, copy and print behavior, larger spread selection, library search/filters, card detail pages, and tradition page

Run:

```bash
npm run test
npm run verify
```

## Accessibility

- Semantic landmarks and one page-level heading
- Keyboard-operable card reveal buttons
- Native `<dialog>` for card details
- Native `<details>` disclosure for the reading's working
- Visible focus styles and a skip link
- `aria-live` status messages for reveal progress
- Responsive layouts and reduced-motion support
- Color is not the only carrier of meaning

`npm run test:a11y` runs axe-core over every main page and the card dialog under the WCAG 2.0/2.1 A and AA tags. jsdom has no layout or paint, so color contrast is disabled in that pass and should be checked in a real browser.

### Manual real-browser checks

Run `npm run build && npm run preview` before a release, then verify:

- Text and focus indicators meet WCAG AA contrast.
- The reading board, library grid, study quiz, Sigil Forge, Gnosis Timer, Cut-up Oracle, Servitor Workshop, Paradigm Shift, Magical Record, Working Composer, Sources & Context, and print preview do not overflow at 320 px, 768 px, and 1280 px.
- Keyboard navigation, the card dialog, study answer focus, Sigil Forge focus movement, Gnosis Timer pause/complete states, Cut-up result focus, Servitor create/delete focus, Paradigm start/complete/discard focus, Magical Record add/delete focus, Working Composer save focus, external-link behavior, and reduced-motion preferences behave correctly.
- The journal persists after a reload and stays in sync when a second tab changes it.

## Roadmap

- Export the journal as a JSON backup
- Export a reading as a shareable image
- Add real-browser contrast and layout checks beyond the jsdom axe pass
- Add a visual regression pass once the layout stabilizes

## Sources

- [The Book of Thoth](https://hermetic.com/crowley/book-of-thoth/)
- [Liber AL vel Legis](https://hermetic.com/crowley/liber-al-vel-legis/)
- [The Golden Dawn documents](https://hermetic.com/golden-dawn/)
- [Chaos magic](https://en.wikipedia.org/wiki/Chaos_magic)
- [Hermetic Library: Chaos](https://hermetic.com/chaos)
- [Austin Osman Spare](https://en.wikipedia.org/wiki/Austin_Osman_Spare)
- [Peter J. Carroll](https://en.wikipedia.org/wiki/Peter_J._Carroll)
- [Sigil (magic)](<https://en.wikipedia.org/wiki/Sigil_(magic)>)
- [Cut-up technique](https://en.wikipedia.org/wiki/Cut-up_technique)
- [Egregore](https://en.wikipedia.org/wiki/Egregore)
- [Illuminates of Thanateros](https://en.wikipedia.org/wiki/Illuminates_of_Thanateros)
- [Magical record](https://en.wikipedia.org/wiki/Magical_record)

The Chaos Sources & Context page includes the full reference list, safety boundaries, and further reading.

Card meanings and Chaos tool copy are original study summaries informed by these sources, not quotations. Thoth Tarot artwork is by Lady Frieda Harris. This is an independent study project, not affiliated with the Ordo Templi Orientis, the Crowley estate, the Illuminates of Thanateros, or any Tarot publisher.
