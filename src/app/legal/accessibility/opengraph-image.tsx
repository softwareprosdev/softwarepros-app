// The shared /legal card. Re-exported per page rather than defined once at
// `src/app/legal/` because the `opengraph-image` convention binds to the
// segment that owns a `page.tsx` — a card in a segment with no page applies
// to nothing, and the root card is not inherited once a page declares its own
// `openGraph` metadata. So each policy page names the design it uses.
export { default, alt, size, contentType } from "../opengraph-image";
