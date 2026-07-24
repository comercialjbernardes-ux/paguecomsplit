"use client";

import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/login";
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-2 text-sm font-medium text-muted hover:text-warm-600 transition-colors disabled:opacity-50"
      aria-label="Sair da conta"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        <LogOut className="h-4 w-4" aria-hidden />
      )}
      <span className="hidden sm:inline">Sair</span>
    </button>
  );
}
