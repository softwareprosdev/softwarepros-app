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
 * How a failed `SpeechRecognition` attempt should be described.
 *
 * Separate from `MicOutcome` because recognition fails for reasons that have
 * nothing to do with the microphone: the transcription service itself can be
 * unreachable or refuse the request while the mic is granted and working.
 */
export type RecognitionOutcome = {
  message: string;
  /** True only when the site's own permission really is the blocker. */
  needsBrowserSettings: boolean;
};

/**
 * Turns a `SpeechRecognitionErrorEvent.error` code into something worth
 * showing, or `null` when it is an ordinary end to a turn.
 *
 * The reason this is async: `not-allowed` does NOT reliably mean the visitor
 * blocked the microphone. Browsers also raise it when recognition starts
 * outside the user gesture that authorised it — which is exactly what happens
 * after `await requestMicrophone()` — and WebKit raises it when a
 * `getUserMedia` stream already holds the device. Visitors who had granted
 * access were being told to go and unblock a permission that was already on,
 * with a retry button that could only reproduce the same error.
 *
 * So the live permission state is consulted before any such claim is made. If
 * the browser says `granted`, the message must not mention permissions.
 */
export async function describeRecognitionError(
  code: string,
): Promise<RecognitionOutcome | null> {
  switch (code) {
    // A silence timeout and a deliberate stop. Neither is a failure.
    case "no-speech":
    case "aborted":
      return null;

    case "not-allowed": {
      const state = await getMicPermissionState();
      if (state === "granted") {
        return {
          message:
            "The microphone is allowed, but this browser wouldn't start transcribing — usually another tab or app is holding the mic. Close it and press the button again, or type instead.",
          needsBrowserSettings: false,
        };
      }
      return {
        message: `Microphone access is blocked for this site. ${SETTINGS_HINT}`,
        needsBrowserSettings: true,
      };
    }

    // Never the site's permission: the browser's speech backend refused. It
    // is off by policy, unavailable in this build (several Chromium forks
    // ship without the Google speech keys), or blocked by an extension.
    case "service-not-allowed":
      return {
        message:
          "This browser's speech service isn't available, so dictation can't run here. Try Chrome or Safari, or type your project instead.",
        needsBrowserSettings: false,
      };

    // Recognition streams audio to the browser vendor's service, not to this
    // site; corporate proxies, VPNs and content blockers break it while the
    // mic itself is fine.
    //
    // "Check your connection" is not said here. By the time anyone reads this
    // they have loaded the page and usually watched their own words appear in
    // the transcript, so their connection demonstrably works — and the caller
    // only surfaces this after several dropouts in a row. Naming the likely
    // cause beats sending someone to test a connection that is not the fault.
    case "network":
      return {
        message:
          "Dictation keeps losing the browser's own speech service — usually a VPN, proxy or content blocker rather than your connection. Anything already said has been sent; carry on by typing, or start the microphone again.",
        needsBrowserSettings: false,
      };

    case "audio-capture":
      return {
        message:
          "No working microphone was found. Check it's plugged in and not in use by another app, or type your project instead.",
        needsBrowserSettings: false,
      };

    default:
      return {
        message: `Dictation stopped (${code}). Try again, or type your project instead.`,
        needsBrowserSettings: false,
      };
  }
}

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
      case "SecurityError": {
        // But it is *also* what Chrome throws when the site permission is
        // granted and the operating system is the one refusing — Windows
        // Privacy settings and macOS Screen & Privacy both do this. Sending
        // those visitors to the address bar is a dead end: the switch they
        // are told to flip is already on, so the retry fails identically
        // every time. Ask the browser what it actually thinks first.
        const state = await getMicPermissionState();
        if (state === "granted") {
          return {
            ok: false,
            reason: "denied",
            message:
              "This site is allowed to use the microphone, but your system is blocking it. On Windows: Settings → Privacy & security → Microphone, and turn on access for your browser. On macOS: System Settings → Privacy & Security → Microphone.",
            needsBrowserSettings: false,
          };
        }
        return {
          ok: false,
          reason: "denied",
          message: `Microphone access is blocked for this site. ${SETTINGS_HINT}`,
          needsBrowserSettings: true,
        };
      }

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
