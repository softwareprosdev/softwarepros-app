import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session-user";
import { Wordmark } from "@/components/SiteNav";
import { SignOutButton } from "@/components/auth/SignOutButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Account",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) notFound();

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm text-center">
        <Wordmark className="text-2xl" />
        <div className="glass rounded-2xl p-6 mt-8 text-left">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            Signed in as
          </p>
          <p className="text-sm font-semibold mb-6">{user.name ?? user.email}</p>
          <div className="flex items-center gap-3">
            <Link
              href="/discovery"
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              Go to Discovery Center
            </Link>
            <SignOutButton />
          </div>
        </div>
      </div>
    </main>
  );
}
