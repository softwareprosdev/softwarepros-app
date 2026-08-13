import "server-only";

/**
 * Turns a thrown database error into something an operator can act on.
 *
 * The motivating failure: `/discovery` told visitors "Check your connection
 * and try again" when the *server* could not reach Postgres. That blames the
 * visitor for an outage they cannot fix, and it hides the real cause from
 * whoever is on call — the two things an error message must not do.
 *
 * So each handler logs a specific, greppable line, and the visitor is told
 * the truth: it is us, not them.
 */

export type DbFailure = {
  /** Stable machine code returned to the client. Never a raw driver message. */
  code: "db_unreachable" | "db_not_migrated" | "db_error";
  /** What the operator needs to do, logged server-side. */
  operatorHint: string;
};

/**
 * Prisma surfaces the underlying driver code on `error.code`. The two worth
 * separating are a refused connection (wrong `DATABASE_URL`, or Postgres is
 * down) and a missing relation (the deploy skipped `prisma migrate deploy`),
 * because the fix is completely different and both look identical from the
 * browser.
 */
export function classifyDbError(error: unknown): DbFailure {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: unknown }).code)
      : "";

  switch (code) {
    case "ECONNREFUSED":
    case "ENOTFOUND":
    case "ETIMEDOUT":
    case "P1001":
    case "P1002":
      return {
        code: "db_unreachable",
        operatorHint:
          "Cannot reach Postgres. Check DATABASE_URL and that the database is running and reachable from this container.",
      };

    // P2021 table does not exist, P2022 column does not exist.
    case "P2021":
    case "P2022":
      return {
        code: "db_not_migrated",
        operatorHint:
          "The schema is missing or out of date. Run `npx prisma migrate deploy` against this database — as a Coolify pre-deployment command, not `migrate dev`.",
      };

    default:
      return {
        code: "db_error",
        operatorHint: "Unhandled database error.",
      };
  }
}

/**
 * Logs the failure with enough context to find it, and returns the
 * classification. Keep the full error server-side: driver messages can carry
 * connection strings, and those must never reach a browser.
 */
export function logDbFailure(operation: string, error: unknown): DbFailure {
  const failure = classifyDbError(error);
  console.error(
    `[db:${failure.code}] ${operation} failed — ${failure.operatorHint}`,
    error,
  );
  return failure;
}
