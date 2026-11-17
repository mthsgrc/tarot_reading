import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// jsdom does not implement scrolling; the router calls it on navigation.
Object.defineProperty(window, "scrollTo", {
  configurable: true,
  value: () => {},
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});
