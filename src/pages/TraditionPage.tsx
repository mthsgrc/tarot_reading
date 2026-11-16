import { TreeOfLifeDiagram } from "../components/TreeOfLifeDiagram";
import { ELEMENT_COLORS, ELEMENT_GLYPHS, SEPHIROTH } from "../domain/tree";
import type { Element, Sephira } from "../domain/types";
import styles from "./TraditionPage.module.css";

const SEPHIRA_THEMES: Record<Sephira, string> = {
  kether: "Pure being, the point before form, the crown of the Tree.",
  chokmah: "Dynamic wisdom, the first flash of creative force.",
  binah: "Understanding, form, the womb that receives and shapes.",
  chesed: "Mercy, expansion, generosity, the law that builds.",
  geburah: "Severity, restriction, discipline, the necessary cutting.",
  tiphareth: "Beauty, harmony, the solar heart and the harmonized self.",
  netzach: "Victory, desire, emotion, art, and the vitality that persists.",
  hod: "Splendour, intellect, language, and the architecture of thought.",
  yesod: "Foundation, imagination, the subconscious root of manifestation.",
  malkuth: "Kingdom, the body, the earth, and the place where it becomes real.",
};

const THELEMIC_TRIAD = [
  {
    name: "Nuit",
    title: "Infinite Space",
    text: "The circumference: all possibility, the body of the stars. Nuit is not a distant goddess but the field in which every star has its place.",
  },
  {
    name: "Hadit",
    title: "The Point of View",
    text: "The centre: the spark of individual consciousness. Hadit is the secret self that experiences the field from one irreplaceable angle.",
  },
  {
    name: "Ra-Hoor-Khuit",
    title: "Manifest Will",
    text: "The child: force in action. Ra-Hoor-Khuit is the union of space and point become a living current in the world.",
  },
];

const ELEMENT_PRACTICE: ReadonlyArray<{
  element: Element;
  suit: string;
  theme: string;
  question: string;
}> = [
  {
    element: "Fire",
    suit: "Wands",
    theme: "Will, creativity, initiative, courage.",
    question: "What wants to begin or burn?",
  },
  {
    element: "Water",
    suit: "Cups",
    theme: "Love, feeling, memory, receptivity.",
    question: "What is moving beneath the surface?",
  },
  {
    element: "Air",
    suit: "Swords",
    theme: "Mind, language, analysis, conflict.",
    question: "What needs to be named clearly?",
  },
  {
    element: "Earth",
    suit: "Disks",
    theme: "Body, work, resources, manifestation.",
    question: "What must be built or tended?",
  },
];

const RENAMED_TRUMPS = [
  ["The Magician", "The Magus"],
  ["The High Priestess", "The Priestess"],
  ["Justice", "Adjustment"],
  ["Strength", "Lust"],
  ["Wheel of Fortune", "Fortune"],
  ["Temperance", "Art"],
  ["Judgement", "The Aeon"],
  ["The World", "The Universe"],
];

const NUMBER_NOTES = [
  ["Ace", "The root or seed of the element."],
  ["Two", "Polarity, choice, the first relationship."],
  ["Three", "The first stable form; birth and growth."],
  ["Four", "Stability, structure, and the risk of stagnation."],
  ["Five", "Disruption, conflict, and necessary change."],
  ["Six", "Harmony, balance, and the heart of the cycle."],
  ["Seven", "Desire, testing, and the strain of manifestation."],
  ["Eight", "Movement, skill, and the acceleration of the current."],
  ["Nine", "Culmination, fullness, and the last stage before the end."],
  ["Ten", "Completion, the return to the world, the end of the cycle."],
];

export function TraditionPage() {
  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.hero}>
        <p className="eyebrow">The tradition</p>
        <h1 className={`display-title ${styles.title}`}>The map behind the cards</h1>
        <p className="lede">
          Thoth Tarot is not a fortune-telling deck with occult decoration. It is a visual
          Qabalah: 78 images built by Aleister Crowley and Lady Frieda Harris to teach the
          Tree of Life, the elements, and the Thelemic current.
        </p>
      </header>

      <section className={styles.section} aria-labelledby="thelema-heading">
        <div className={styles.sectionHead}>
          <span className={styles.sectionNumber}>01</span>
          <div>
            <p className="eyebrow">Thelema</p>
            <h2 id="thelema-heading" className="section-title">
              Will, love, and the new Aeon
            </h2>
          </div>
        </div>

        <div className={styles.twoCol}>
          <div className={styles.prose}>
            <p>
              Thelema begins with a simple and difficult claim: every star has its own
              orbit. “Do what thou wilt” does not mean doing whatever you feel like. It
              means discovering the direction that belongs to you and living it without
              apology or imitation.
            </p>
            <p>
              That Will is inseparable from love. “Love is the law, love under will”
              describes a union in which two natures meet without either being erased. The
              point is not fusion; it is right relation.
            </p>
            <p>
              Crowley dated the start of the Aeon of Horus to 1904, when he received{" "}
              <cite>Liber AL vel Legis</cite>. This app treats Thelema as a symbolic and
              philosophical lens, not as a creed you must accept to read the cards.
            </p>
          </div>

          <div className={styles.triad}>
            {THELEMIC_TRIAD.map((figure) => (
              <article key={figure.name} className={styles.triadCard}>
                <h3 className={styles.triadName}>{figure.name}</h3>
                <p className={styles.triadTitle}>{figure.title}</p>
                <p className={styles.triadText}>{figure.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="thoth-heading">
        <div className={styles.sectionHead}>
          <span className={styles.sectionNumber}>02</span>
          <div>
            <p className="eyebrow">The deck</p>
            <h2 id="thoth-heading" className="section-title">
              The Book of Thoth
            </h2>
          </div>
        </div>

        <div className={styles.twoCol}>
          <div className={styles.prose}>
            <p>
              Aleister Crowley wrote <cite>The Book of Thoth</cite> as the intellectual
              key to the deck. Lady Frieda Harris painted the cards between roughly 1938
              and 1943, working from his instructions and her own deep study of the Golden
              Dawn system.
            </p>
            <p>
              The result is deliberately dense. The majors, called <em>Atu</em>, carry
              Hebrew letters, zodiac signs, planets, and Tree paths. The minors carry
              decans and Sephiroth. The court cards are built from the elements within the
              elements. None of it is decoration: every symbol is a coordinate.
            </p>
            <p>
              The deck also renames several trumps. If you learned on Rider–Waite–Smith,
              the correspondences below will help you translate.
            </p>
          </div>

          <div className={styles.tableCard}>
            <h3 className={styles.tableTitle}>Rider–Waite → Thoth</h3>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Rider–Waite</th>
                  <th scope="col">Thoth</th>
                </tr>
              </thead>
              <tbody>
                {RENAMED_TRUMPS.map(([waits, thoth]) => (
                  <tr key={waits}>
                    <td>{waits}</td>
                    <td>{thoth}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className={styles.tableNote}>
              The suits become Wands, Cups, Swords, and Disks. Court names become Knight,
              Queen, Prince, and Princess.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="tree-heading">
        <div className={styles.sectionHead}>
          <span className={styles.sectionNumber}>03</span>
          <div>
            <p className="eyebrow">Qabalah</p>
            <h2 id="tree-heading" className="section-title">
              The Tree of Life
            </h2>
          </div>
        </div>

        <div className={styles.treeLayout}>
          <div className={styles.diagramCard}>
            <TreeOfLifeDiagram className={styles.diagram} />
            <p className={styles.diagramCaption}>
              Ten Sephiroth and 22 paths. Da’ath, the dashed circle, is the abyss between
              the supernal and ethical triangles, not a Sephira proper.
            </p>
          </div>

          <div>
            <p className={`${styles.prose} ${styles.treeIntro}`}>
              The Tree is a diagram of emanation: unity differentiates into force and
              form, then descends through expansion and restriction into the heart,
              desire, intellect, imagination, and finally the material world. The 22 paths
              connecting the Sephiroth are the 22 Atu. The four worlds — Atziluth, Briah,
              Yetzirah, and Assiah — apply the same pattern at four scales.
            </p>

            <ol className={styles.sephiraList}>
              {SEPHIROTH.map((sephira) => (
                <li key={sephira.id}>
                  <span className={styles.sephiraNumber}>{sephira.number}</span>
                  <div>
                    <strong>
                      {sephira.name} <span>· {sephira.title}</span>
                    </strong>
                    <p>{SEPHIRA_THEMES[sephira.id]}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="correction-heading">
        <div className={styles.sectionHead}>
          <span className={styles.sectionNumber}>04</span>
          <div>
            <p className="eyebrow">The Thelemic correction</p>
            <h2 id="correction-heading" className="section-title">
              Why the Emperor is Tzaddi
            </h2>
          </div>
        </div>

        <div className={styles.correctionGrid}>
          <div className={styles.prose}>
            <p>
              In the traditional Golden Dawn system, the Emperor is attributed to{" "}
              <strong>Heh</strong> and the Star to <strong>Tzaddi</strong>. Crowley
              reverses them because of a line in <cite>Liber AL</cite>: “All these old
              letters of my Book are aright; but צ is not the Star.”
            </p>
            <p>
              The zodiacal signs do not change: the Emperor remains Aries and the Star
              remains Aquarius. What changes is the Hebrew letter, and with it the path on
              the Tree. This app follows the Thoth attribution, so the Emperor sits on the
              path from Netzach to Yesod, and the Star on the path from Chokmah to
              Tiphareth.
            </p>
            <p className={styles.nuance}>
              This is a specifically Thelemic correction. Many decks and teachers retain
              the older Golden Dawn correspondence, so it is worth naming which system you
              are reading with.
            </p>
          </div>

          <div className={styles.tableCard}>
            <table className={styles.table}>
              <caption className="visually-hidden">
                Hebrew letter attributions for the Emperor and Star
              </caption>
              <thead>
                <tr>
                  <th scope="col">Card</th>
                  <th scope="col">Golden Dawn</th>
                  <th scope="col">Thoth</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">The Emperor</th>
                  <td>Heh</td>
                  <td className={styles.corrected}>Tzaddi</td>
                </tr>
                <tr>
                  <th scope="row">The Star</th>
                  <td>Tzaddi</td>
                  <td className={styles.corrected}>Heh</td>
                </tr>
              </tbody>
            </table>
            <p className={styles.tableNote}>
              Same signs, swapped letters. The map is the same; the door has moved.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="elements-heading">
        <div className={styles.sectionHead}>
          <span className={styles.sectionNumber}>05</span>
          <div>
            <p className="eyebrow">The four powers</p>
            <h2 id="elements-heading" className="section-title">
              Elements, suits, and court cards
            </h2>
          </div>
        </div>

        <div className={styles.elementGrid}>
          {ELEMENT_PRACTICE.map((item) => (
            <article
              key={item.element}
              className={styles.elementCard}
              style={{ borderTopColor: ELEMENT_COLORS[item.element] }}
            >
              <div className={styles.elementHead}>
                <span className={styles.elementGlyph} aria-hidden="true">
                  {ELEMENT_GLYPHS[item.element]}
                </span>
                <div>
                  <h3>{item.element}</h3>
                  <p>{item.suit}</p>
                </div>
              </div>
              <p className={styles.elementTheme}>{item.theme}</p>
              <p className={styles.elementQuestion}>“{item.question}”</p>
            </article>
          ))}
        </div>

        <div className={`${styles.callout} panel`}>
          <h3>The court is a second layer of elements</h3>
          <p>
            Each court card combines its suit with a rank-element. Knights are the fiery
            part of the suit, Queens the watery part, Princes the airy part, and
            Princesses the earthy part. So the Queen of Wands is water within fire:
            charisma, receptivity, and emotional intelligence applied to will.
          </p>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="reading-heading">
        <div className={styles.sectionHead}>
          <span className={styles.sectionNumber}>06</span>
          <div>
            <p className="eyebrow">Practice</p>
            <h2 id="reading-heading" className="section-title">
              How to read with this app
            </h2>
          </div>
        </div>

        <div className={styles.practiceGrid}>
          <article className={styles.practiceCard}>
            <span className={styles.practiceNumber}>01</span>
            <h3>Position first, then card</h3>
            <p>
              A card in “The Abyss” is not saying the same thing as the same card in “The
              Potential.” The spread is the grammar; the card is the word.
            </p>
          </article>
          <article className={styles.practiceCard}>
            <span className={styles.practiceNumber}>02</span>
            <h3>Watch the proportions</h3>
            <p>
              Count suits, elements, majors, and court cards. A reading with four Swords
              is talking about the mind; two Knights are talking about movement and
              people.
            </p>
          </article>
          <article className={styles.practiceCard}>
            <span className={styles.practiceNumber}>03</span>
            <h3>Use shadow deliberately</h3>
            <p>
              Upright is the default here because it keeps the first reading clear. Turn
              on shadow cards when you want the blocked, excessive, or inverted side of
              the current.
            </p>
          </article>
          <article className={styles.practiceCard}>
            <span className={styles.practiceNumber}>04</span>
            <h3>Close with one action</h3>
            <p>
              A reading is useful when it changes what you notice or do next. End with one
              honest action, not a fixed prediction.
            </p>
          </article>
        </div>

        <div className={styles.numberTable}>
          <h3 className={styles.tableTitle}>The number current</h3>
          <dl>
            {NUMBER_NOTES.map(([number, note]) => (
              <div key={number}>
                <dt>{number}</dt>
                <dd>{note}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className={`panel ${styles.sources}`} aria-labelledby="sources-heading">
        <p className="eyebrow">Further study</p>
        <h2 id="sources-heading" className={styles.sourcesTitle}>
          Sources and doors
        </h2>
        <p className={styles.sourcesText}>
          The card meanings in this app are original study summaries, not quotations. They
          are informed by the primary texts below and by the Golden Dawn correspondences
          that Crowley adapted.
        </p>
        <ul className={styles.sourceLinks}>
          <li>
            <a
              href="https://hermetic.com/crowley/book-of-thoth/"
              target="_blank"
              rel="noreferrer"
            >
              The Book of Thoth <span aria-hidden="true">↗</span>
            </a>
          </li>
          <li>
            <a
              href="https://hermetic.com/crowley/liber-al-vel-legis/"
              target="_blank"
              rel="noreferrer"
            >
              Liber AL vel Legis <span aria-hidden="true">↗</span>
            </a>
          </li>
          <li>
            <a href="https://hermetic.com/golden-dawn/" target="_blank" rel="noreferrer">
              The Golden Dawn documents <span aria-hidden="true">↗</span>
            </a>
          </li>
        </ul>
        <p className={styles.disclaimer}>
          Independent study project. Not affiliated with the Ordo Templi Orientis, the
          Crowley estate, or any Tarot publisher. Artwork by Lady Frieda Harris.
        </p>
      </section>
    </div>
  );
}
