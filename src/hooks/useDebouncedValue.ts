import { useEffect, useState } from 'react';

/** Évite de filtrer à chaque frappe — même réflexe qu’un typeahead à l’échelle. */
export function useDebouncedValue<T>(value: T, delayMs = 200): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
