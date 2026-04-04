import { useState, useCallback } from "react";

export function useCurrencyMask(initial = 0) {
  const [cents, setCents] = useState(initial);

  const value = cents / 100;
  const display = value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleChange = useCallback((raw: string) => {
    const digits = raw.replace(/\D/g, "");
    setCents(parseInt(digits || "0", 10));
  }, []);

  const reset = useCallback(() => setCents(0), []);

  return { cents, value, display, handleChange, reset, setCents };
}
