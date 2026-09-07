import "server-only";

/**
 * Lead notification email via Resend.
 *
 * The lead is already durably saved in the database by the time this runs —
 * this is a best-effort side channel so a human notices a submission arrived
 * without watching /admin/leads. A missing key or a Resend outage must never
 * fail the lead capture itself, so every path here returns a result instead
 * of throwing.
 */

const API_BASE = "https://api.resend.com";

/**
 * Works out of the box against Resend's shared test domain. Once a sending
 * domain is verified in the Resend dashboard, set RESEND_FROM_EMAIL to an
 * address on it — Resend rejects sends `from` an unverified domain.
 */
const DEFAULT_FROM = "SoftwarePros <onboarding@resend.dev>";

/** Where every lead notification lands. Not a secret, so it isn't env-configured. */
const LEADS_EMAIL = "info@softwarepros.org";

export function hasResendCredentials(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export type LeadNotification = {
  name: string;
  email: string;
  company?: string | null;
  phone?: string | null;
  timeline?: string | null;
  message?: string | null;
  source: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderHtml(lead: LeadNotification): string {
  const rows: Array<[string, string]> = [
    ["Name", lead.name],
    ["Email", lead.email],
    ["Company", lead.company || "—"],
    ["Phone", lead.phone || "—"],
    ["Timeline", lead.timeline || "—"],
    ["Source", lead.source],
  ];

  const table = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.05em;">${escapeHtml(label)}</td><td style="padding:4px 0;">${escapeHtml(value)}</td></tr>`,
    )
    .join("");

  const message = lead.message
    ? `<p style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.05em;margin:20px 0 4px;">Message</p><p style="white-space:pre-wrap;">${escapeHtml(lead.message)}</p>`
    : "";

  return `<div style="font-family:sans-serif;color:#0f172a;"><h2 style="margin:0 0 16px;">New lead from softwarepros.org</h2><table>${table}</table>${message}</div>`;
}

/**
 * Sends the notification. Never throws — a failure here is logged by the
 * caller and otherwise swallowed, because the lead is already saved.
 */
export async function sendLeadNotificationEmail(
  lead: LeadNotification,
): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY is unset; skipped." };
  }

  try {
    const response = await fetch(`${API_BASE}/emails`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || DEFAULT_FROM,
        to: LEADS_EMAIL,
        // Replying to the notification goes straight to the prospect.
        reply_to: lead.email,
        subject: `New lead: ${lead.name}${lead.company ? ` (${lead.company})` : ""}`,
        html: renderHtml(lead),
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      return {
        ok: false,
        error: `Resend responded ${response.status}: ${detail.slice(0, 500)}`,
      };
    }
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: `Network failure calling Resend: ${String(error)}`,
    };
  }
}
