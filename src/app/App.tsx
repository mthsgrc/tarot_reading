import { lazy, useEffect } from "react";
import { HashRouter, Route, Routes, useLocation } from "react-router-dom";
import { ReadingPage } from "../pages/ReadingPage";
import { Layout } from "./Layout";

// The reading page stays eager: it is the index route and every share link
// opens here, so it should not wait on a second chunk.
const CardPage = lazy(() =>
  import("../pages/CardPage").then((module) => ({ default: module.CardPage })),
);
const JournalPage = lazy(() =>
  import("../pages/JournalPage").then((module) => ({
    default: module.JournalPage,
  })),
);
const LibraryPage = lazy(() =>
  import("../pages/LibraryPage").then((module) => ({
    default: module.LibraryPage,
  })),
);
const NotFoundPage = lazy(() =>
  import("../pages/NotFoundPage").then((module) => ({
    default: module.NotFoundPage,
  })),
);
const StudyPage = lazy(() =>
  import("../pages/StudyPage").then((module) => ({
    default: module.StudyPage,
  })),
);
const TraditionPage = lazy(() =>
  import("../pages/TraditionPage").then((module) => ({
    default: module.TraditionPage,
  })),
);

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

export function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<ReadingPage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="journal" element={<JournalPage />} />
          <Route path="study" element={<StudyPage />} />
          <Route path="cards/:cardId" element={<CardPage />} />
          <Route path="tradition" element={<TraditionPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
