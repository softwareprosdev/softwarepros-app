"use client";

import { useId, useMemo, useState } from "react";
import { Icon } from "@/components/Icon";

export const LEAD_STATUSES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "ARCHIVED",
] as const;

export type LeadStatusValue = (typeof LEAD_STATUSES)[number];

export type LeadRow = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  timeline: string | null;
  message: string | null;
  source: string;
  status: LeadStatusValue;
  createdAt: string;
  createdAtLabel: string;
  session: { publicId: string; title: string } | null;
  summary: { publicId: string; title: string } | null;
};

const STATUS_STYLE: Record<LeadStatusValue, string> = {
  NEW: "badge-purple",
  CONTACTED: "badge-yellow",
  QUALIFIED: "badge-orange",
  ARCHIVED: "badge-red",
};

type RowState = { saving: boolean; error: string | null };

export function LeadTable({ leads }: { leads: LeadRow[] }) {
  const filterId = useId();
  const [statuses, setStatuses] = useState<Record<string, LeadStatusValue>>(
    () => Object.fromEntries(leads.map((l) => [l.id, l.status])),
  );
  const [rowState, setRowState] = useState<Record<string, RowState>>({});
  const [filter, setFilter] = useState<"ALL" | LeadStatusValue>("ALL");

  const counts = useMemo(() => {
    const base: Record<LeadStatusValue, number> = {
      NEW: 0,
      CONTACTED: 0,
      QUALIFIED: 0,
      ARCHIVED: 0,
    };
    for (const lead of leads) base[statuses[lead.id] ?? lead.status] += 1;
    return base;
  }, [leads, statuses]);

  const visible = leads.filter(
    (l) => filter === "ALL" || (statuses[l.id] ?? l.status) === filter,
  );

  async function updateStatus(id: string, next: LeadStatusValue) {
    const previous = statuses[id];
    setStatuses((s) => ({ ...s, [id]: next }));
    setRowState((s) => ({ ...s, [id]: { saving: true, error: null } }));
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error(`Update failed (${res.status})`);
      setRowState((s) => ({ ...s, [id]: { saving: false, error: null } }));
    } catch (err) {
      setStatuses((s) => ({ ...s, [id]: previous }));
      setRowState((s) => ({
        ...s,
        [id]: {
          saving: false,
          error: err instanceof Error ? err.message : "Update failed",
        },
      }));
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-6 mb-6">
        <div className="flex items-center gap-3">
          <label
            htmlFor={filterId}
            className="text-[10px] font-bold tracking-widest uppercase text-gray-500"
          >
            Filter by status
          </label>
          <select
            id={filterId}
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as "ALL" | LeadStatusValue)
            }
            className="bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/60"
          >
            <option value="ALL" className="bg-surface-elevated">
              All ({leads.length})
            </option>
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s} className="bg-surface-elevated">
                {s} ({counts[s]})
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-gray-600" role="status">
          Showing {visible.length} of {leads.length}
        </p>
      </div>

      <div className="overflow-x-auto glass-card rounded-2xl">
        <table className="w-full text-sm min-w-[64rem]">
          <caption className="sr-only">
            Captured leads, newest first, with editable status
          </caption>
          <thead>
            <tr className="text-left text-[10px] font-bold tracking-widest uppercase text-gray-500 border-b border-white/10">
              <th scope="col" className="px-4 py-3 font-bold">
                Received
              </th>
              <th scope="col" className="px-4 py-3 font-bold">
                Contact
              </th>
              <th scope="col" className="px-4 py-3 font-bold">
                Company
              </th>
              <th scope="col" className="px-4 py-3 font-bold">
                Timeline
              </th>
              <th scope="col" className="px-4 py-3 font-bold">
                Source
              </th>
              <th scope="col" className="px-4 py-3 font-bold">
                Message
              </th>
              <th scope="col" className="px-4 py-3 font-bold">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((lead) => {
              const status = statuses[lead.id] ?? lead.status;
              const state = rowState[lead.id];
              return (
                <tr
                  key={lead.id}
                  className="border-b border-white/5 align-top last:border-0"
                >
                  <td className="px-4 py-4 text-gray-500 whitespace-nowrap">
                    <time dateTime={lead.createdAt}>{lead.createdAtLabel}</time>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-white">{lead.name}</p>
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-primary hover:underline break-all"
                    >
                      {lead.email}
                    </a>
                    {lead.phone && (
                      <p className="text-gray-500 text-xs mt-1">{lead.phone}</p>
                    )}
                  </td>
                  <td className="px-4 py-4 text-gray-400">
                    {lead.company ?? "—"}
                  </td>
                  <td className="px-4 py-4 text-gray-400 whitespace-nowrap">
                    {lead.timeline ?? "—"}
                  </td>
                  <td className="px-4 py-4">
                    <span className="threat-badge badge-purple">
                      {lead.source}
                    </span>
                    <div className="mt-2 flex flex-col gap-1 text-xs">
                      {lead.session && (
                        <a
                          href={`/discovery/${lead.session.publicId}`}
                          className="inline-flex items-center gap-1 text-gray-400 hover:text-white"
                        >
                          <Icon name="comments" />
                          <span className="truncate max-w-[10rem]">
                            {lead.session.title}
                          </span>
                        </a>
                      )}
                      {lead.summary && (
                        <a
                          href={`/summary/${lead.summary.publicId}`}
                          className="inline-flex items-center gap-1 text-gray-400 hover:text-white"
                        >
                          <Icon name="file-lines" />
                          <span className="truncate max-w-[10rem]">
                            {lead.summary.title}
                          </span>
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 max-w-sm">
                    {lead.message ? (
                      <details>
                        <summary className="cursor-pointer text-gray-400 hover:text-white">
                          {lead.message.length > 70
                            ? `${lead.message.slice(0, 70)}…`
                            : lead.message}
                        </summary>
                        {/* Attacker-controlled free text — rendered as a text node only. */}
                        <p className="mt-2 text-gray-300 whitespace-pre-wrap break-words">
                          {lead.message}
                        </p>
                      </details>
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`threat-badge ${STATUS_STYLE[status]} mr-2 hidden xl:inline`}
                    >
                      {status}
                    </span>
                    <label htmlFor={`status-${lead.id}`} className="sr-only">
                      Status for {lead.name}
                    </label>
                    <select
                      id={`status-${lead.id}`}
                      value={status}
                      disabled={state?.saving}
                      onChange={(e) =>
                        updateStatus(lead.id, e.target.value as LeadStatusValue)
                      }
                      className="bg-white/[0.03] border border-white/10 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-primary/60 disabled:opacity-50"
                    >
                      {LEAD_STATUSES.map((s) => (
                        <option key={s} value={s} className="bg-surface-elevated">
                          {s}
                        </option>
                      ))}
                    </select>
                    {state?.error && (
                      <p role="alert" className="text-red-300 text-xs mt-1">
                        {state.error}
                      </p>
                    )}
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-600">
                  No leads match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
