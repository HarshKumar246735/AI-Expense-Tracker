import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import * as categoryApi from "../api/categoryApi";

export const CategoryContext = createContext(null);

export function CategoryProvider({ children }) {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await categoryApi.list();
      setCategories(res.data.categories);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) refresh().catch(() => {});
    else setCategories([]);
  }, [user, refresh]);

  const byType = useCallback((type) => categories.filter((c) => c.type === type), [categories]);
  const value = useMemo(() => ({ categories, loading, refresh, byType }), [categories, loading, refresh, byType]);

  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>;
}
