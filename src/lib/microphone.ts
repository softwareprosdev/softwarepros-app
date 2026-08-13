/**
 * Microphone access, with the failure reasons kept apart.
 *
 * `getUserMedia` rejects for at least five unrelated reasons, and the old code
 * collapsed all of them into "Microphone access was blocked." That is wrong
 * often enough to matter: a visitor on a browser with no Web Speech API, or
 * on a laptop with no microphone, or on a page served over plain HTTP, was
 * told to unblock a permission they had never been asked for — and given no
 * way to recover once they had actually denied it.
 *
 * Everything here runs client-side only.
 */

export type MicOutcome =
  | { ok: true; stream: MediaStream }
  | {
      ok: false;
      /** Machine-readable so callers can branch; message is for humans. */
      reason:
        | "insecure-context"
        | "unsupported"
        | "denied"
        | "no-device"
        | "device-busy"
        | "unknown";
      message: string;
      /** True when the browser will not prompt again without user action. */
      needsBrowserSettings: boolean;
    };

/**
 * Browsers only expose `navigator.mediaDevices` in a secure context. Over
 * plain HTTP it is `undefined`, so calling `.getUserMedia` throws a
 * TypeError — which previously surfaced as "access was blocked" and sent
 * people to check permissions that were never the problem.
 *
 * `localhost` counts as secure, which is why this passes in development and
 * only bites on a real deployment without TLS.
 */
export function isSecureForMedia(): boolean {
  if (typeof window === "undefined") return false;
  return window.isSecureContext && Boolean(navigator.mediaDevices);
}

/** Whether this browser can transcribe speech at all. */
export function hasSpeechRecognition(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition);
}

/**
 * Current permission state without triggering a prompt, where the browser
 * supports querying it. Lets the UI say "you blocked this earlier, here is
 * how to undo it" instead of firing a request that rejects instantly.
 *
 * Firefox does not support the `microphone` descriptor, hence the try/catch
 * and the "unknown" fallback rather than treating absence as denial.
 */
export async function getMicPermissionState(): Promise<
  "granted" | "denied" | "prompt" | "unknown"
> {
  if (typeof navigator === "undefined" || !navigator.permissions) {
    return "unknown";
  }
  try {
    const status = await navigator.permissions.query({
      name: "microphone" as PermissionName,
    });
    return status.state;
  } catch {
    return "unknown";
  }
}

const SETTINGS_HINT =
  "Click the lock or camera icon in your browser's address bar, allow the microphone for this site, then try again.";

/**
 * Requests the microphone and returns a classified result rather than
 * throwing. Callers decide what to show; nothing here writes to the DOM.
 */
export async function requestMicrophone(): Promise<MicOutcome> {
  if (typeof window === "undefined") {
    return {
      ok: false,
      reason: "unsupported",
      message: "Voice input is not available here.",
      needsBrowserSettings: false,
    };
  }

  if (!window.isSecureContext) {
    return {
      ok: false,
      reason: "insecure-context",
      message:
        "Voice input needs a secure (HTTPS) connection. Open this page over HTTPS, or type your project instead.",
      needsBrowserSettings: false,
    };
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    return {
      ok: false,
      reason: "unsupported",
      message:
        "This browser doesn't support microphone capture. Try Chrome, Edge, or Safari — or type your project below.",
      needsBrowserSettings: false,
    };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return { ok: true, stream };
  } catch (error) {
    const name =
      error instanceof Error ? error.name : String(error ?? "unknown");

    switch (name) {
      // NotAllowedError covers both an explicit denial and a Permissions-Policy
      // block; SecurityError is the older spelling some browsers still use.
      case "NotAllowedError":
      case "SecurityError":
        return {
          ok: false,
          reason: "denied",
          message: `Microphone access is blocked for this site. ${SETTINGS_HINT}`,
          needsBrowserSettings: true,
        };

      case "NotFoundError":
      case "OverconstrainedError":
        return {
          ok: false,
          reason: "no-device",
          message:
            "No microphone was found. Plug one in, or type your project instead.",
          needsBrowserSettings: false,
        };

      // Another application holds the device, or the OS denied it.
      case "NotReadableError":
      case "AbortError":
        return {
          ok: false,
          reason: "device-busy",
          message:
            "Your microphone is in use by another app. Close it and try again, or type your project instead.",
          needsBrowserSettings: false,
        };

      default:
        return {
          ok: false,
          reason: "unknown",
          message:
            "Couldn't start the microphone. Try again, or type your project instead.",
          needsBrowserSettings: false,
        };
    }
  }
}
