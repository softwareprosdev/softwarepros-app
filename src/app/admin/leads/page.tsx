import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { LeadStatus } from "@/generated/prisma/enums";
import { LeadTable, type LeadRow } from "@/components/admin/LeadTable";

// Sourced here rather than imported from the client component: only components
// survive the client boundary — a plain array arrives as a module proxy.
const STATUSES = Object.values(LeadStatus);

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Leads",
  robots: { index: false, follow: false },
};

// Fixed formatter so the server and client render identical strings.
const FORMATTER = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export default async function AdminLeadsPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      session: { select: { publicId: true, title: true } },
      summary: { select: { publicId: true, title: true } },
    },
  });

  const rows: LeadRow[] = leads.map((lead) => ({
    id: lead.id,
    name: lead.name,
    email: lead.email,
    company: lead.company,
    phone: lead.phone,
    timeline: lead.timeline,
    message: lead.message,
    source: lead.source,
    status: lead.status,
    createdAt: lead.createdAt.toISOString(),
    createdAtLabel: `${FORMATTER.format(lead.createdAt)} UTC`,
    session: lead.session
      ? { publicId: lead.session.publicId, title: lead.session.title }
      : null,
    summary: lead.summary
      ? { publicId: lead.summary.publicId, title: lead.summary.title }
      : null,
  }));

  const counts: Record<LeadStatus, number> = {
    NEW: 0,
    CONTACTED: 0,
    QUALIFIED: 0,
    ARCHIVED: 0,
  };
  for (const row of rows) counts[row.status] += 1;

  return (
    <main id="main" className="min-h-screen bg-ink px-6 py-12">
      <div className="max-w-[110rem] mx-auto">
        <header className="mb-10">
          <p className="text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-3">
            Internal — not indexed
          </p>
          <h1 className="text-4xl font-black mb-2">Leads</h1>
          <p className="text-sm text-gray-500">
            The 200 most recent submissions. Contains personal data — do not
            share this page or its contents.
          </p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          <div className="glass-card rounded-hex px-5 py-4">
            <p className="text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-1">
              Total
            </p>
            <p className="text-2xl font-black stat-count">{rows.length}</p>
          </div>
          {STATUSES.map((status) => (
            <div key={status} className="glass-card rounded-hex px-5 py-4">
              <p className="text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-1">
                {status}
              </p>
              <p className="text-2xl font-black stat-count">{counts[status]}</p>
            </div>
          ))}
        </div>

        <LeadTable leads={rows} />
      </div>
    </main>
  );
}
