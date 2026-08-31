import "server-only";
import { createHash } from "node:crypto";

export type ContractInput = {
  clientName: string;
  clientEmail: string;
  projectTitle: string;
  scopeText: string;
  totalCents: number;
  depositCents: number;
  currency: string;
};

export function formatMoney(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

/**
 * Renders the full contract text from a fixed template. This is a starting
 * point, not a substitute for legal review — see the note at the top of
 * api/contracts/route.ts. Nothing in this template should be treated as
 * legal advice, and SoftwarePros should have it reviewed by a lawyer before
 * relying on it for real client agreements.
 */
export function renderContractBody(input: ContractInput): string {
  const total = formatMoney(input.totalCents, input.currency);
  const deposit = formatMoney(input.depositCents, input.currency);
  const remainder = formatMoney(
    input.totalCents - input.depositCents,
    input.currency,
  );
  const today = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date());

  return `SOFTWARE DEVELOPMENT SERVICES AGREEMENT

This Agreement is entered into as of ${today} between SoftwarePros ("Developer") and ${input.clientName} <${input.clientEmail}> ("Client"), for the project described below.

1. PROJECT
${input.projectTitle}

2. SCOPE OF WORK
${input.scopeText}

This scope was produced by SoftwarePros' AI Discovery Center and reviewed by a SoftwarePros Senior Software Architect before being offered to Client. Work outside this scope requires a written change order, agreed by both parties, before it begins.

3. FEES
Total project fee: ${total} (${input.currency.toUpperCase()}).

4. PAYMENT SCHEDULE
- Deposit due before work begins: ${deposit} (50% of the total fee).
- Remaining balance due upon completion, or per a milestone schedule to be confirmed with Client before work begins: ${remainder}.
- The deposit is paid via the secure payment link provided with this Agreement. Work begins once the deposit payment is confirmed and both parties have signed below.

5. CHANGE ORDERS
Any change to the scope described in Section 2 must be agreed in writing by both parties and may adjust the fee and schedule in Sections 3 and 4.

6. TERM AND TERMINATION
Either party may terminate this Agreement for material breach not cured within 14 days of written notice. Client remains responsible for fees for work performed and expenses incurred up to the effective date of termination.

7. CONFIDENTIALITY
Each party will keep the other's confidential information confidential and use it only to perform this Agreement.

8. WARRANTY AND LIMITATION OF LIABILITY
Developer will perform the services in a professional and workmanlike manner. Except as expressly stated, the services are provided without other warranties, express or implied. Developer's aggregate liability under this Agreement is limited to the fees paid by Client under this Agreement.

9. GOVERNING LAW
This Agreement is governed by the laws of the jurisdiction in which SoftwarePros operates, without regard to conflict-of-law principles.

10. ENTIRE AGREEMENT
This Agreement, together with the scope in Section 2, is the entire agreement between the parties regarding the Project and supersedes any prior discussions or proposals on the same subject.

SIGNATURES

Client: ${input.clientName} <${input.clientEmail}>
Signature and date recorded electronically below.

SoftwarePros: countersigned by a Senior Software Architect prior to sending this Agreement to Client.`;
}

/** sha256 of the exact bytes a signature attests to — hex-encoded. */
export function hashContractBody(bodyText: string): string {
  return createHash("sha256").update(bodyText, "utf8").digest("hex");
}
