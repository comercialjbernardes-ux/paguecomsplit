"use client";

import { useEffect } from "react";

const STORAGE_KEY = "pcs_rep";
const TTL_DAYS = 30;
const TTL_MS = TTL_DAYS * 24 * 60 * 60 * 1000;

type Stored = { rep: string; expiresAt: number };

export function readRep(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Stored;
    if (!parsed?.rep || Date.now() > parsed.expiresAt) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed.rep;
  } catch {
    return null;
  }
}

export function RepTracker() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rep = params.get("rep");
    if (!rep) return;
    const sanitized = rep.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);
    if (!sanitized) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ rep: sanitized, expiresAt: Date.now() + TTL_MS })
      );
    } catch {
      // ignore quota / private mode
    }
  }, []);

  return null;
}
