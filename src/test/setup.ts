import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// jsdom does not implement scrolling; the router and study quiz call it.
Object.defineProperty(window, "scrollTo", {
  configurable: true,
  value: () => {},
});

Object.defineProperty(Element.prototype, "scrollIntoView", {
  configurable: true,
  value: () => {},
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});
