# Thoth Tarot

A Thoth Tarot reading app built around Thelema, the Golden Dawn, and the Tree of Life. It includes all 78 cards, six spreads, upright and shadow readings, optimized card artwork, a searchable study library, and a rule-based interpretation engine that reads the draw rather than looking up a fixed answer.

Readings are for reflection, not prediction, and are not a substitute for medical, legal, financial, or relationship advice.

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
├── app/          # Router, layout, navigation
├── components/   # Card views, spreads, dialog, Tree diagram, interpretation
├── data/         # 78 cards, six spread definitions, shared tradition notes
├── domain/       # Types, Tree constants, draw engine, reading engine, labels
├── lib/          # Browser storage adapters
├── pages/        # Reading, journal, library, card detail, tradition, 404
├── styles/       # Design tokens, global base and print styles
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

**Copy reading** exports the interpretation as plain text. **Copy link** encodes the spread, cards, orientations, question, lens, depth, and shadow flag in the URL, so the recipient sees the reading exactly as it was drawn. Lens and depth are additive optional parameters: links made before they existed still infer the lens and use Standard depth. Nothing is uploaded; the link is self-contained. Decoding rejects unknown spreads, cards, orientations, lenses, depths, and overlong questions, and shows a notice instead of failing.

### Printing

**Print reading** in the synthesis panel opens the browser's print dialog for paper or **Save as PDF**. The print stylesheet flips the dark interface to ink on white, hides navigation, buttons, dialogs, and status chrome, and keeps every card with its caption. Spread layouts are re-expressed in millimetres so the Tree and cross spreads keep their geometry on A4 or Letter, and long readings break between cards and interpretation blocks rather than through them. The print copy is the same deterministic reading shown on screen.

### Journal

**Save to journal** keeps a fully revealed reading in `localStorage` on that device, including its lens and depth. The `/journal` page lists the 50 most recent saves with their question, cards, lens, depth, and date; each entry reopens the exact draw through the same versioned link format, and entries can be deleted individually or cleared together after confirmation. Nothing is uploaded, no account is involved, and clearing browser storage clears the journal. Stored entries are re-validated when read, so corrupt or hand-edited data is ignored rather than rendered.

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

The reading page ships in the entry bundle because it is the index route and every share link opens there. Library, journal, card, tradition, and 404 routes are lazy-loaded into separate chunks. Suspense keeps the header and navigation visible while a chunk loads, and a route error boundary offers a reload if a previously cached page requests a chunk that a deployment has replaced.

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
- axe audits of the setup, completed reading, card dialog, library, card page, tradition page, journal, and 404 under the WCAG A/AA tags
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
- The reading board, library grid, and print preview do not overflow at 320 px, 768 px, and 1280 px.
- Keyboard navigation, the card dialog, and reduced-motion preferences behave correctly.
- The journal persists after a reload and stays in sync when a second tab changes it.

## Roadmap

- Export the journal as a JSON backup
- Export a reading as a shareable image
- Add a study mode that quizzes correspondences
- Add real-browser contrast and layout checks beyond the jsdom axe pass
- Add a visual regression pass once the layout stabilizes

## Sources

- [The Book of Thoth](https://hermetic.com/crowley/book-of-thoth/)
- [Liber AL vel Legis](https://hermetic.com/crowley/liber-al-vel-legis/)
- [The Golden Dawn documents](https://hermetic.com/golden-dawn/)

Card meanings are original study summaries informed by these sources and the Golden Dawn correspondences, not quotations. Thoth Tarot artwork is by Lady Frieda Harris. This is an independent study project, not affiliated with the Ordo Templi Orientis, the Crowley estate, or any Tarot publisher.
