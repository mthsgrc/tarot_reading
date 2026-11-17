# Thoth Tarot

A Thoth Tarot reading app built around Thelema, the Golden Dawn, and the Tree of Life. It includes all 78 cards, six spreads, upright and shadow readings, optimized card artwork, a searchable study library, and a rule-based interpretation engine that reads the draw rather than looking up a fixed answer.

Readings are for reflection, not prediction, and are not a substitute for medical, legal, financial, or relationship advice.

## Stack

- React 19 + TypeScript + Vite
- React Router with `HashRouter` for static hosting
- Custom CSS Modules and design tokens
- Vitest + Testing Library + jsdom
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
├── pages/        # Reading, library, card detail, tradition, 404
├── styles/       # Design tokens and global base styles
└── test/         # Vitest setup
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

The same draw always produces the same reading, including phrase variants. No backend, no LLM, and no `Math.random()` at render time. Copying the reading exports the full interpretation as plain text, with the reflection disclaimer.

## Card artwork

The original scans are in `images/` and were optimized with ImageMagick into native `278×408` AVIF and WebP files:

```bash
node scripts/optimize-images.mjs
node scripts/optimize-images.mjs --force
```

Output lives in `public/images/cards/` with one file pair per card ID, plus `public/images/back-cover.{avif,webp}`. The `<picture>` element prefers AVIF, falls back to WebP, and renders an accessible styled placeholder if the image fails to load. The optimized set is about 3.9 MB instead of the original 18 MB PNGs.

## Deployment

`vite.config.ts` uses `base: "./"` and the app uses `HashRouter`, so the production `dist/` can be served from a domain root or a GitHub Pages repository subpath without server rewrites.

```bash
npm run build
# deploy the contents of dist/
```

Card image URLs are built with `import.meta.env.BASE_URL`, so they follow the same base path.

## Testing

The suite covers:

- 78 unique cards and the expected suit distribution
- Unique Hebrew letters and Tree paths 11–32
- The Emperor/Star Thelemic correction
- Required content completeness for every card
- Existence of both optimized image formats for every card
- All six spreads, position guidance, and the Tree spread order
- Shuffle determinism, non-mutation, duplicate-free draws, and shadow orientation
- Reading facts, lens inference, shared Sephira, Tree and planetary resonances
- Deterministic interpretation, all-spread smoke tests, every card in both orientations, and text export
- The complete reading flow, interpretation section, copy behavior, larger spread selection, library search/filters, card detail pages, and tradition page

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

An automated axe pass against the main pages is a sensible next addition.

## Roadmap

- Persist reading history locally in IndexedDB or localStorage
- Export a reading as a shareable image
- Add a study mode that quizzes correspondences
- Add automated accessibility checks with axe
- Add a visual regression pass once the layout stabilizes

## Sources

- [The Book of Thoth](https://hermetic.com/crowley/book-of-thoth/)
- [Liber AL vel Legis](https://hermetic.com/crowley/liber-al-vel-legis/)
- [The Golden Dawn documents](https://hermetic.com/golden-dawn/)

Card meanings are original study summaries informed by these sources and the Golden Dawn correspondences, not quotations. Thoth Tarot artwork is by Lady Frieda Harris. This is an independent study project, not affiliated with the Ordo Templi Orientis, the Crowley estate, or any Tarot publisher.
