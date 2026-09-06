import type { Metadata } from "next";
import { Wordmark } from "@/components/SiteNav";
import { SignupForm } from "@/components/auth/SignupForm";
import { safeRedirect } from "@/lib/safe-redirect";

export const metadata: Metadata = {
  title: "Create Account",
  robots: { index: false, follow: false },
};

export default async function SignupPage({
  searchParams,
}: PageProps<"/signup">) {
  const { redirect } = await searchParams;
  const redirectTo = safeRedirect(typeof redirect === "string" ? redirect : undefined);

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Wordmark className="text-2xl" />
          <p className="text-sm text-gray-400 mt-3">
            Create an account to use the AI Discovery Center — your conversations
            stay private to you.
          </p>
        </div>
        <SignupForm redirectTo={redirectTo} />
      </div>
    </main>
  );
}
