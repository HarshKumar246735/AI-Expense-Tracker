import { Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import "./ThemeToggle.css";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button type="button" className="theme-toggle btn-icon" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} title="Toggle theme">
      {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
    </button>
  );
}
