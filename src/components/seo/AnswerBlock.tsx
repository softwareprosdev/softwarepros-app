/**
 * A short, self-contained definition placed high on a page.
 *
 * Generative answer engines and featured snippets both lift a single passage
 * and present it without the page around it, so this block is written to
 * survive that: the first sentence names the subject and answers the question
 * outright, and nothing in it depends on the heading above or the section
 * below. Keep the body to roughly 40–60 words — long enough to be a real
 * answer, short enough to be quoted whole.
 */
export function AnswerBlock({
  question,
  children,
  className = "",
}: {
  question: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <aside
      aria-label={question}
      className={`glass-blue rounded-2xl p-6 md:p-8 max-w-3xl ${className}`}
    >
      <p className="text-xs font-bold tracking-widest uppercase text-sky-300 mb-3">
        {question}
      </p>
      <p className="text-base md:text-lg text-gray-200 leading-relaxed">
        {children}
      </p>
    </aside>
  );
}
