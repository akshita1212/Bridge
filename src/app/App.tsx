import { useState, useEffect } from "react";
import { Landing } from "./components/Landing";
import { Auth } from "./components/Auth";
import { Onboarding } from "./components/Onboarding";
import { Home } from "./components/Home";
import { Canvas } from "./components/Canvas";

export type Page = "landing" | "auth" | "onboarding" | "home" | "canvas";
export type Theme = "light" | "dark";

const PAGES: Page[] = ["landing", "auth", "onboarding", "home", "canvas"];

function readHash(): { page: Page; id?: string } {
  const [page, id] = window.location.hash.replace(/^#\/?/, "").split("/");
  if (PAGES.includes(page as Page)) return { page: page as Page, id };
  return { page: "landing" };
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("theme");
    if (fromUrl === "dark" || fromUrl === "light") return fromUrl;
    return (localStorage.getItem("bridge-theme") as Theme) || "light";
  });
  const initial = readHash();
  const [page, setPage] = useState<Page>(initial.page);
  const [canvasId, setCanvasId] = useState<string>(initial.id || "product-handoff");

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("bridge-theme", theme);
  }, [theme]);

  useEffect(() => {
    const onHashChange = () => {
      const next = readHash();
      setPage(next.page);
      if (next.id) setCanvasId(next.id);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = (target: Page, id?: string) => {
    if (id) setCanvasId(id);
    setPage(target);
    window.location.hash = target === "canvas" && (id || canvasId) ? `/${target}/${id || canvasId}` : `/${target}`;
  };

  const props = { theme, onToggleTheme: toggleTheme, onNavigate: navigate };

  if (page === "landing") return <Landing {...props} />;
  if (page === "auth") return <Auth {...props} />;
  if (page === "onboarding") return <Onboarding {...props} />;
  if (page === "home") return <Home {...props} />;
  if (page === "canvas") return <Canvas {...props} canvasId={canvasId} />;
  return null;
}
