import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ContractApproveForm } from "@/components/admin/ContractApproveForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contracts",
  robots: { index: false, follow: false },
};

const FORMATTER = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function money(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "usd" }).format(
    cents / 100,
  );
}

export default async function AdminContractsPage() {
  const [pending, recent] = await Promise.all([
    prisma.contract.findMany({
      where: { status: "PENDING_REVIEW" },
      orderBy: { createdAt: "asc" },
      include: { summary: { select: { estimateNotes: true } } },
    }),
    prisma.contract.findMany({
      where: { status: { in: ["SENT", "SIGNED"] } },
      orderBy: { updatedAt: "desc" },
      take: 50,
      include: { payments: { where: { status: "PAID" }, take: 1 } },
    }),
  ]);

  return (
    <main id="main" className="min-h-screen bg-ink px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <p className="text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-3">
            Internal — not indexed
          </p>
          <h1 className="text-4xl font-black mb-2">Contracts</h1>
          <p className="text-sm text-gray-500">
            AI-drafted contracts wait here until a Senior Software Architect reviews
            pricing and releases them. Nothing below is visible to a client until you
            approve it.
          </p>
        </header>

        <section className="mb-12">
          <h2 className="text-lg font-bold mb-4">
            Pending Review{" "}
            <span className="text-sm font-normal text-gray-500">
              ({pending.length})
            </span>
          </h2>
          {pending.length === 0 ? (
            <p className="text-sm text-gray-500">Nothing waiting on review.</p>
          ) : (
            <div className="space-y-4">
              {pending.map((contract) => (
                <div key={contract.id} className="glass-card rounded-hex p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="font-semibold">{contract.projectTitle}</p>
                      <p className="text-xs text-gray-500">
                        {contract.clientName} · {contract.clientEmail}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Drafted {FORMATTER.format(contract.createdAt)} UTC
                      </p>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full border border-amber-500/30 bg-amber-950/40 text-amber-300">
                      AI-priced · unreviewed
                    </span>
                  </div>

                  <details className="mb-4">
                    <summary className="text-xs text-blue-400 cursor-pointer">
                      Scope & AI reasoning
                    </summary>
                    <p className="text-xs text-gray-400 mt-2 whitespace-pre-wrap">
                      {contract.scopeText}
                    </p>
                    {contract.summary?.estimateNotes && (
                      <p className="text-xs text-gray-500 mt-3 border-t border-white/10 pt-3">
                        <strong className="text-gray-400">AI notes:</strong>{" "}
                        {contract.summary.estimateNotes}
                      </p>
                    )}
                  </details>

                  <ContractApproveForm
                    contractId={contract.id}
                    defaultTotalCents={contract.totalCents}
                    defaultDepositCents={contract.depositCents}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-bold mb-4">Sent & Signed</h2>
          {recent.length === 0 ? (
            <p className="text-sm text-gray-500">Nothing sent yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wider text-gray-500 border-b border-white/10">
                    <th className="py-2 pr-4">Client</th>
                    <th className="py-2 pr-4">Project</th>
                    <th className="py-2 pr-4">Total</th>
                    <th className="py-2 pr-4">Deposit</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((contract) => (
                    <tr key={contract.id} className="border-b border-white/5">
                      <td className="py-2 pr-4">{contract.clientName}</td>
                      <td className="py-2 pr-4">{contract.projectTitle}</td>
                      <td className="py-2 pr-4">{money(contract.totalCents)}</td>
                      <td className="py-2 pr-4">{money(contract.depositCents)}</td>
                      <td className="py-2 pr-4">{contract.status}</td>
                      <td className="py-2 pr-4">
                        {contract.payments.length > 0 ? (
                          <span className="text-emerald-400">Yes</span>
                        ) : (
                          <span className="text-gray-600">No</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
