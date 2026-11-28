// lib/assets/favorites.ts
"use client";

import { useState, useEffect, useCallback } from "react";

export type AssetKind = "banner" | "gif" | "badge" | "widget" | "tech" | "image";

export interface FavoriteAssetItem {
  id: string;
  kind: AssetKind;
  title: string;
  previewUrl?: string;
  markdown: string;
  createdAt: number;
}

const STORAGE_KEY = "profile-forge-asset-favorites-v1";

function readStorage(): FavoriteAssetItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useAssetFavorites() {
  const [favorites, setFavorites] = useState<FavoriteAssetItem[]>([]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) setFavorites(readStorage());
    });
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setFavorites(readStorage());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      active = false;
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const persist = useCallback((next: FavoriteAssetItem[]) => {
    setFavorites(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("pf-asset-favorites-updated"));
    } catch {}
  }, []);

  useEffect(() => {
    const onCustom = () => setFavorites(readStorage());
    window.addEventListener("pf-asset-favorites-updated", onCustom);
    return () => window.removeEventListener("pf-asset-favorites-updated", onCustom);
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.some((f) => f.id === id),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (item: Omit<FavoriteAssetItem, "createdAt">) => {
      const current = readStorage();
      const exists = current.some((f) => f.id === item.id);
      const next = exists
        ? current.filter((f) => f.id !== item.id)
        : [{ ...item, createdAt: Date.now() }, ...current];
      persist(next);
    },
    [persist]
  );

  const removeFavorite = useCallback(
    (id: string) => {
      const current = readStorage();
      persist(current.filter((f) => f.id !== id));
    },
    [persist]
  );

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    removeFavorite,
  };
}
