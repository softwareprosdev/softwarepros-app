import type { FaqEntry } from "@/lib/schema";

/**
 * Visible FAQ block, paired with the `FAQPage` node the page emits.
 *
 * The answers are rendered open rather than in an accordion on purpose. A
 * `<details>` element hides its text from the first paint, and both Google's
 * FAQ rich result and every generative answer engine weigh visible text
 * differently from collapsed text — the markup has to agree with what the
 * structured data claims is on the page.
 *
 * Headings are `h3` because callers place this under an `h2` section heading.
 */
export function FaqSection({
  id = "faq",
  title = "Frequently Asked Questions",
  intro,
  faqs,
  className = "",
}: {
  id?: string;
  title?: string;
  intro?: string;
  faqs: FaqEntry[];
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className={className}>
      <div className="max-w-4xl mx-auto">
        <span className="text-xs font-bold tracking-widest uppercase text-primary mb-4 block">
          Answers
        </span>
        <h2
          id={`${id}-heading`}
          className="text-4xl md:text-5xl font-black tracking-tight mb-4"
        >
          {title}
        </h2>
        {intro && (
          <p className="text-lg text-gray-400 leading-relaxed mb-12 max-w-2xl">
            {intro}
          </p>
        )}

        {/* Not a <dl>: the HTML content model forbids heading elements inside
            <dt>, and real question headings are the point of this block. */}
        <div className="divide-y divide-white/5 border-t border-white/5">
          {faqs.map((faq) => (
            <section
              key={faq.question}
              className="py-8 grid md:grid-cols-3 gap-4"
            >
              <h3 className="text-base font-bold text-white leading-snug md:col-span-1">
                {faq.question}
              </h3>
              <p className="md:col-span-2 text-gray-400 leading-relaxed">
                {faq.answer}
              </p>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
