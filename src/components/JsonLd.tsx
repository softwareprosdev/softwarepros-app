import type { JsonLdNode } from "@/lib/schema";

/**
 * Renders a schema.org graph as a JSON-LD script tag.
 *
 * This is the site's only `dangerouslySetInnerHTML`, and it is unavoidable:
 * React escapes text nodes, which would corrupt the JSON a crawler parses.
 * The escaping below is what makes it safe — `<` cannot survive into the
 * document, so no value in the graph can close the script element early and
 * start an injection, no matter where that value came from.
 *
 * Everything fed to this component today is build-time constant, but the
 * escaping is not conditional on that staying true.
 */
function serialize(data: JsonLdNode): string {
  return (
    JSON.stringify(data)
      .replace(/</g, "\\u003c")
      .replace(/>/g, "\\u003e")
      .replace(/&/g, "\\u0026")
      // Legal in JSON, but they terminate a JavaScript string literal — which
      // breaks any consumer that evaluates the block rather than parsing it.
      .replace(/\u2028/g, "\\u2028")
      .replace(/\u2029/g, "\\u2029")
  );
}

export function JsonLd({ data }: { data: JsonLdNode }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialize(data) }}
    />
  );
}
