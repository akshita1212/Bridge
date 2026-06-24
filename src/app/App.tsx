import { useState, useEffect } from "react";
import { Landing } from "./components/Landing";
import { Auth } from "./components/Auth";
import { Onboarding } from "./components/Onboarding";
import { Home } from "./components/Home";
import { Canvas } from "./components/Canvas";

export type Page = "landing" | "auth" | "onboarding" | "home" | "canvas";
export type Theme = "light" | "dark";

export default function App() {
  const [theme, setTheme] = useState<Theme>("light");
  const [page, setPage] = useState<Page>("landing");
  const [canvasId, setCanvasId] = useState<string>("product-handoff");

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const navigate = (target: Page, id?: string) => {
    if (id) setCanvasId(id);
    setPage(target);
  };

  const props = { theme, onToggleTheme: toggleTheme, onNavigate: navigate };

  if (page === "landing") return <Landing {...props} />;
  if (page === "auth") return <Auth {...props} />;
  if (page === "onboarding") return <Onboarding {...props} />;
  if (page === "home") return <Home {...props} />;
  if (page === "canvas") return <Canvas {...props} canvasId={canvasId} />;
  return null;
}
