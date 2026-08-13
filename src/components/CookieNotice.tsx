"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { COOKIE_NOTICE_KEY } from "@/lib/cookie-names";

/**
 * Cookie disclosure.
 *
 * It is a notice, not a consent gate, and that is a deliberate choice: the
 * site sets exactly one cookie, it is strictly necessary (it is what stops
 * one visitor's discovery sessions appearing in another's sidebar), and there
 * is no analytics or advertising storage to consent to. An "Accept / Reject"
 * pair here would be a lie — rejecting would either change nothing or break
 * the visitor's own session privacy.
 *
 * If optional tracking is ever added, this component has to become a real
 * consent manager before that tracking ships, not after.
 *
 * Dismissal is stored in localStorage rather than a cookie, so that
 * dismissing a cookie notice does not itself set a cookie.
 */

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // `storage` fires in *other* tabs; dismissing in one tab should not leave
  // the notice sitting there in another.
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function isDismissed(): boolean {
  try {
    return window.localStorage.getItem(COOKIE_NOTICE_KEY) === "dismissed";
  } catch {
    // Storage blocked (private mode, or the visitor disabled it). Treating it
    // as not dismissed errs toward disclosure rather than toward silence.
    return false;
  }
}

/**
 * The server cannot read localStorage, so it always reports "dismissed" and
 * renders nothing. That is what keeps a visitor who dismissed this months ago
 * from seeing it flash back on every navigation.
 */
function serverSnapshot(): boolean {
  return true;
}

function dismiss() {
  try {
    window.localStorage.setItem(COOKIE_NOTICE_KEY, "dismissed");
  } catch {
    // Nothing to do — the notice reappears next visit, which is acceptable.
  }
  listeners.forEach((listener) => listener());
}

export function CookieNotice() {
  // localStorage is an external store, so it is read through the API built
  // for external stores rather than mirrored into state inside an effect.
  const dismissed = useSyncExternalStore(
    subscribe,
    isDismissed,
    serverSnapshot,
  );

  if (dismissed) return null;

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      className="fixed bottom-0 inset-x-0 z-[60] p-4 sm:p-6 pointer-events-none"
    >
      <div className="glass-dark rounded-2xl max-w-3xl mx-auto p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 pointer-events-auto shadow-2xl">
        <Icon
          name="circle-info"
          className="text-primary text-lg shrink-0 hidden sm:block"
        />
        <p className="text-sm text-gray-300 leading-relaxed flex-1">
          This site uses one strictly necessary cookie to keep your AI
          Discovery Center sessions private to your browser. No advertising, no
          analytics, no cross-site tracking.{" "}
          <Link
            href="/legal/cookies"
            className="text-sky-300 underline underline-offset-2 hover:text-sky-200"
          >
            Read the cookie policy
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 px-6 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-gray-200 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
