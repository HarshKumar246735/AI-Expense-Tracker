import { useCallback } from "react";
import { useAuth } from "./useAuth";
import { formatCurrency, formatCompact } from "../utils/format";

// const { fmt, compact } = useCurrency();  fmt(1250) -> "₹1,250.00"
export function useCurrency() {
  const { user } = useAuth();
  const currency = user?.currency || "INR";
  const fmt = useCallback((n) => formatCurrency(n, currency), [currency]);
  const compact = useCallback((n) => formatCompact(n, currency), [currency]);
  return { fmt, compact, currency };
}
