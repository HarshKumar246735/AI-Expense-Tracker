import { useContext } from "react";
import { CategoryContext } from "../context/CategoryContext";

export function useCategories() {
  const ctx = useContext(CategoryContext);
  if (!ctx) throw new Error("useCategories must be used inside <CategoryProvider>");
  return ctx;
}
