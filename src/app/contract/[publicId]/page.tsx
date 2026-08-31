import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session-user";
import { Wordmark } from "@/components/SiteNav";
import { ContractView } from "@/components/contract/ContractView";
import { Icon } from "@/components/Icon";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Contract",
  robots: { index: false, follow: false },
};

export default async function ContractPage({
  params,
}: PageProps<"/contract/[publicId]">) {
  const { publicId } = await params;

  const user = await getCurrentUser();
  if (!user) notFound();

  const contract = await prisma.contract.findUnique({
    where: { publicId },
    include: { payments: { where: { status: "PAID" }, take: 1 } },
  });

  // "Not found" either way — a contract that exists but belongs to someone
  // else, or one still PENDING_REVIEW and not yet released, must look
  // identical from the outside to one that doesn't exist.
  if (!contract || contract.userId !== user.id) notFound();

  return (
    <>
      <nav
        aria-label="Contract"
        className="sticky top-0 w-full z-50 px-6 py-4 flex items-center gap-4 bg-ink/90 backdrop-blur-md border-b border-white/5"
      >
        <Wordmark />
        <span className="h-4 w-px bg-white/10" aria-hidden="true" />
        <span className="text-sm text-gray-400">{contract.projectTitle}</span>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-10">
        {contract.status === "PENDING_REVIEW" && (
          <div className="glass rounded-2xl p-8 text-center">
            <Icon name="hourglass-half" className="text-2xl text-blue-400 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Your Contract Is Being Finalized</h1>
            <p className="text-sm text-gray-400 max-w-md mx-auto">
              A SoftwarePros Senior Software Architect is reviewing your project scope
              and pricing. We&apos;ll email you at {contract.clientEmail} the moment
              it&apos;s ready to sign.
            </p>
          </div>
        )}

        {contract.status === "VOID" && (
          <div className="glass rounded-2xl p-8 text-center">
            <h1 className="text-2xl font-bold mb-2">This Contract Is No Longer Available</h1>
            <p className="text-sm text-gray-400">
              Contact SoftwarePros if you believe this is a mistake.
            </p>
          </div>
        )}

        {(contract.status === "SENT" || contract.status === "SIGNED") && (
          <>
            <header className="mb-6">
              <h1 className="text-2xl font-bold mb-1">{contract.projectTitle}</h1>
              <p className="text-sm text-gray-500">
                Prepared for {contract.clientName} · {contract.clientEmail}
              </p>
            </header>
            <ContractView
              contractId={contract.publicId}
              bodyText={contract.bodyText}
              status={contract.status}
              signerNameDefault={contract.clientName}
              paid={contract.payments.length > 0}
            />
          </>
        )}
      </main>
    </>
  );
}
