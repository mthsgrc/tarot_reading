import { useEffect } from "react";
import { HashRouter, Route, Routes, useLocation } from "react-router-dom";
import { CardPage } from "../pages/CardPage";
import { JournalPage } from "../pages/JournalPage";
import { LibraryPage } from "../pages/LibraryPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { ReadingPage } from "../pages/ReadingPage";
import { TraditionPage } from "../pages/TraditionPage";
import { Layout } from "./Layout";

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
          <Route path="cards/:cardId" element={<CardPage />} />
          <Route path="tradition" element={<TraditionPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
