/** Canonical routes shared by navigation, share links, and tests. */
export const PATHS = {
  home: "/",
  thelema: "/thelema",
  library: "/thelema/library",
  study: "/thelema/study",
  journal: "/thelema/journal",
  tradition: "/thelema/tradition",
  chaos: "/chaos",
} as const;

export type AppSystem = "home" | "thelema" | "chaos";

const LEGACY_THELEMA_PATHS = new Set(["/library", "/study", "/journal", "/tradition"]);

export function systemForPath(pathname: string): AppSystem {
  if (pathname === PATHS.chaos || pathname.startsWith(`${PATHS.chaos}/`)) {
    return "chaos";
  }

  if (
    pathname === PATHS.thelema ||
    pathname.startsWith(`${PATHS.thelema}/`) ||
    LEGACY_THELEMA_PATHS.has(pathname) ||
    pathname.startsWith("/cards/")
  ) {
    return "thelema";
  }

  return "home";
}

export function cardPath(cardId: string): string {
  return `${PATHS.thelema}/cards/${encodeURIComponent(cardId)}`;
}

export function thelemaReadingPath(search = ""): string {
  return search ? `${PATHS.thelema}?${search}` : PATHS.thelema;
}
