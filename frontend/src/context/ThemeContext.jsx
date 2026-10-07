import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import * as userApi from "../api/userApi";

export const ThemeContext = createContext(null);

const initialTheme = () => {
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export function ThemeProvider({ children }) {
  const { user, updateUser } = useAuth();
  const [theme, setThemeState] = useState(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  // adopt the saved preference when a user logs in
  useEffect(() => {
    if (user?.theme) setThemeState(user.theme);
  }, [user?.theme]);

  const setTheme = useCallback(
    (next) => {
      setThemeState(next);
      if (user) {
        userApi
          .updateSettings({ theme: next })
          .then((res) => updateUser(res.data.user))
          .catch(() => {});
      }
    },
    [user, updateUser]
  );

  const toggleTheme = useCallback(() => setTheme(theme === "dark" ? "light" : "dark"), [theme, setTheme]);
  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
