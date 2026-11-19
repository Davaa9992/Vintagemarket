"use client";
import { useSyncExternalStore } from "react";

/** localStorage дээр хадгалагдах жижиг store (сагс, хадгалсан бараа) */
export function createLocalStore<T>(key: string, initial: T) {
  let cache: T | undefined;
  const listeners = new Set<() => void>();

  const read = (): T => {
    if (cache !== undefined) return cache;
    try {
      const raw = window.localStorage.getItem(key);
      cache = raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      cache = initial;
    }
    return cache;
  };

  const set = (next: T | ((prev: T) => T)) => {
    cache = typeof next === "function" ? (next as (p: T) => T)(read()) : next;
    try {
      window.localStorage.setItem(key, JSON.stringify(cache));
    } catch {
      // хувийн цонх гэх мэт үед зөвхөн санах ойд үлдэнэ
    }
    listeners.forEach((l) => l());
  };

  const subscribe = (l: () => void) => {
    listeners.add(l);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) {
        cache = undefined;
        l();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(l);
      window.removeEventListener("storage", onStorage);
    };
  };

  const useValue = (): T => useSyncExternalStore(subscribe, read, () => initial);

  return { useValue, set, read };
}
