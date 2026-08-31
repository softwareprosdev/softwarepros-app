"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const [signingOut, setSigningOut] = useState(false);

  async function onClick() {
    if (signingOut) return;
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    // Full navigation so proxy.ts sees the cleared cookie on the next request.
    window.location.href = "/";
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={signingOut}
      className="px-5 py-2.5 border border-white/10 rounded-full text-xs font-semibold text-gray-300 hover:text-white hover:border-white/20 transition-colors disabled:opacity-50"
    >
      {signingOut ? "Signing out…" : "Sign Out"}
    </button>
  );
}
