/**
 * Names of everything this site stores in the browser.
 *
 * Split out of `session-owner.ts` (which is `server-only`) so the cookie
 * policy page and the client-side notice can name the same constants the
 * runtime actually uses. A cookie policy that lists a key by hand is a cookie
 * policy that goes stale the first time someone renames one.
 */

/** Owner token cookie — see `lib/session-owner.ts`. */
export const OWNER_COOKIE_NAME = "sp_owner";

/** localStorage key recording that the cookie notice was dismissed. */
export const COOKIE_NOTICE_KEY = "sp_cookie_notice";
