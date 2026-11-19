import { lazy, useEffect } from "react";
import {
  HashRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";
import { HomePage } from "../pages/HomePage";
import { ReadingPage } from "../pages/ReadingPage";
import { Layout } from "./Layout";
import { cardPath, PATHS } from "./paths";

// The reading page stays eager: it is the main route and every share link
// opens there, so it should not wait on a second chunk.
const CardPage = lazy(() =>
  import("../pages/CardPage").then((module) => ({ default: module.CardPage })),
);
const ChaosHomePage = lazy(() =>
  import("../pages/ChaosHomePage").then((module) => ({
    default: module.ChaosHomePage,
  })),
);
const GnosisPage = lazy(() =>
  import("../pages/chaos/GnosisPage").then((module) => ({
    default: module.GnosisPage,
  })),
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
const SigilPage = lazy(() =>
  import("../pages/chaos/SigilPage").then((module) => ({
    default: module.SigilPage,
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

function LegacyRedirect({ to }: { to: string }) {
  const { search, hash } = useLocation();

  return <Navigate to={{ pathname: to, search, hash }} replace />;
}

function LegacyCardRedirect() {
  const { cardId } = useParams();
  const { search, hash } = useLocation();

  return (
    <Navigate
      to={{
        pathname: cardId ? cardPath(cardId) : PATHS.library,
        search,
        hash,
      }}
      replace
    />
  );
}

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
          <Route index element={<HomePage />} />

          <Route path="thelema" element={<ReadingPage />} />
          <Route path="thelema/library" element={<LibraryPage />} />
          <Route path="thelema/journal" element={<JournalPage />} />
          <Route path="thelema/study" element={<StudyPage />} />
          <Route path="thelema/cards/:cardId" element={<CardPage />} />
          <Route path="thelema/tradition" element={<TraditionPage />} />

          <Route path="chaos" element={<ChaosHomePage />} />
          <Route path="chaos/sigil" element={<SigilPage />} />
          <Route path="chaos/gnosis" element={<GnosisPage />} />

          {/* Old links keep working after the move under /thelema. */}
          <Route path="library" element={<LegacyRedirect to={PATHS.library} />} />
          <Route path="journal" element={<LegacyRedirect to={PATHS.journal} />} />
          <Route path="study" element={<LegacyRedirect to={PATHS.study} />} />
          <Route path="tradition" element={<LegacyRedirect to={PATHS.tradition} />} />
          <Route path="cards/:cardId" element={<LegacyCardRedirect />} />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
