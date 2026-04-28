import { useState, useEffect, Dispatch, SetStateAction } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const readValue = (): T => {
    if (typeof window === "undefined") return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Erro ao ler a key "${key}" do localStorage:`, error);
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue: Dispatch<SetStateAction<T>> = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      setStoredValue(valueToStore);

      if (typeof window !== "undefined") {
        const serialized = JSON.stringify(valueToStore);
        window.localStorage.setItem(key, serialized);
        // Dispara evento customizado para sincronizar outras instâncias na mesma aba
        window.dispatchEvent(
          new CustomEvent("local-storage-change", {
            detail: { key, newValue: serialized },
          })
        );
      }
    } catch (error) {
      console.warn(`Erro ao salvar a key "${key}" no localStorage:`, error);
    }
  };

  // Sincroniza entre abas e dentro da mesma aba
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === key) {
        setStoredValue(event.newValue ? JSON.parse(event.newValue) : initialValue);
      }
    };

    const handleCustomStorage = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (detail.key === key) {
        setStoredValue(detail.newValue ? JSON.parse(detail.newValue) : initialValue);
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("local-storage-change", handleCustomStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("local-storage-change", handleCustomStorage);
    };
  }, [key, initialValue]);

  return [storedValue, setValue] as const;
}
