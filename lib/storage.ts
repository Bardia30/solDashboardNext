// src/lib/storage.ts
const NS = "sol-dashboard";

export function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(`${NS}:${key}`);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${NS}:${key}`, JSON.stringify(value));
  } catch {}
}

export function clearAll() {
  if (typeof window === "undefined") return;
  Object.keys(localStorage)
    .filter((k) => k.startsWith(`${NS}:`))
    .forEach((k) => localStorage.removeItem(k));
}
