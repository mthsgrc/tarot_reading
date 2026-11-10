const POSITIONS = ["Past", "Present", "Future"];
const REVEAL_DELAYS = [800, 1400, 2000];
const FLIP_DURATION = 700;

const dealBtn = document.getElementById("deal-btn");
const statusEl = document.getElementById("status");
const slots = POSITIONS.map((_, index) => document.getElementById(`card-${index + 1}`));

const state = {
    picks: [],
    revealed: 0,
    dealing: false,
    timers: []
};

function shuffleDeck() {
    const deck = Array.from({ length: TAROT_CARDS.length }, (_, index) => index);

    for (let i = deck.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
}

function clearTimers() {
    state.timers.forEach((timer) => clearTimeout(timer));
    state.timers = [];
}

function buildCard(cardIndex) {
    const card = document.createElement("div");
    card.className = "tarot-card";

    const inner = document.createElement("div");
    inner.className = "tarot-card-inner";

    const back = document.createElement("div");
    back.className = "tarot-card-face tarot-card-back";
    back.setAttribute("aria-hidden", "true");

    const front = document.createElement("div");
    front.className = "tarot-card-face tarot-card-front";

    const image = document.createElement("img");
    image.className = "tarot-card-image";
    image.src = `images/${cardIndex}.png`;
    image.alt = `${TAROT_CARDS[cardIndex].name} tarot card`;
    image.width = 278;
    image.height = 408;
    image.decoding = "async";

    front.append(image);
    inner.append(back, front);
    card.append(inner);

    return card;
}

function buildInfoContent(card) {
    const fragment = document.createDocumentFragment();

    const name = document.createElement("h3");
    name.className = "card-name";
    name.textContent = card.name;

    const subtitle = document.createElement("p");
    subtitle.className = "card-subtitle";
    subtitle.textContent = card.arcana === "Major"
        ? "Major Arcana"
        : [card.title, card.suit, card.element].filter(Boolean).join(" - ");

    const keywords = document.createElement("p");
    keywords.className = "card-keywords";
    keywords.textContent = card.keywords.join(" / ");

    const meaning = document.createElement("p");
    meaning.className = "card-meaning";
    meaning.textContent = card.upright;

    fragment.append(name, subtitle, keywords, meaning);

    return fragment;
}

function deal() {
    if (state.dealing) {
        return;
    }

    clearTimers();
    state.dealing = true;
    state.revealed = 0;
    state.picks = shuffleDeck().slice(0, POSITIONS.length);
    dealBtn.disabled = true;
    dealBtn.textContent = "Spreading...";
    statusEl.textContent = "Spreading three cards.";

    state.picks.forEach((cardIndex, position) => {
        const slot = slots[position];
        const info = document.createElement("div");
        info.className = "card-info";
        slot.replaceChildren(buildCard(cardIndex), info);

        const preload = new Image();
        preload.src = `images/${cardIndex}.png`;

        state.timers.push(setTimeout(() => revealCard(position), REVEAL_DELAYS[position]));
    });
}

function revealCard(position) {
    const cardIndex = state.picks[position];
    const card = TAROT_CARDS[cardIndex];
    const slot = slots[position];
    const cardElement = slot.querySelector(".tarot-card");
    const image = cardElement ? cardElement.querySelector(".tarot-card-image") : null;

    if (!cardElement) {
        return;
    }

    if (image && !image.complete) {
        const onReady = () => flipCard(position, card, slot, cardElement);
        image.addEventListener("load", onReady, { once: true });
        image.addEventListener("error", onReady, { once: true });

        if (image.complete) {
            onReady();
        }

        return;
    }

    flipCard(position, card, slot, cardElement);
}

function flipCard(position, card, slot, cardElement) {
    if (!slot.contains(cardElement) || cardElement.classList.contains("is-flipped")) {
        return;
    }

    const info = slot.querySelector(".card-info");

    cardElement.classList.add("is-flipped");

    if (info) {
        info.replaceChildren(buildInfoContent(card));
    }

    statusEl.textContent = `${POSITIONS[position]}: ${card.name}. ${card.upright}`;
    state.revealed += 1;

    if (state.revealed === POSITIONS.length) {
        state.timers.push(setTimeout(finishDealing, FLIP_DURATION));
    }
}

function finishDealing() {
    if (!state.dealing) {
        return;
    }

    state.dealing = false;
    dealBtn.disabled = false;
    dealBtn.textContent = "New Reading";
    statusEl.textContent = "Spread complete. Choose New Reading to clear the cards.";
}

function reset() {
    clearTimers();
    state.picks = [];
    state.revealed = 0;
    state.dealing = false;
    slots.forEach((slot) => slot.replaceChildren());
    dealBtn.disabled = false;
    dealBtn.textContent = "..:Spread the Cards:..";
    statusEl.textContent = "Spread cleared. Ready for a new reading.";
}

dealBtn.addEventListener("click", () => {
    if (state.dealing) {
        return;
    }

    if (state.picks.length > 0) {
        reset();
        return;
    }

    deal();
});
