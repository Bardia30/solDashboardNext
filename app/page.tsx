// app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { useRole } from "@/lib/role";

const HOSTED_SIGN_IN = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL; // e.g. https://<subdomain>.clerk.accounts.dev/sign-in

export default function Home() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const { isAdmin, userSlug } = useRole();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return; // only redirect AFTER login
    if (isAdmin) router.replace("/admin");
    else if (userSlug) router.replace(`/${userSlug}`);
    else router.replace("/unauthorized");
  }, [isLoaded, isSignedIn, isAdmin, userSlug, router]);

  return (
    <>
      <SignedIn>
        <div style={{ padding: 24 }}>Redirecting to your dashboard…</div>
      </SignedIn>

      <SignedOut>
        <main style={{ padding: 24, fontFamily: "system-ui" }}>
          <h1>Welcome</h1>
          <p>You’re signed out.</p>
          <p>
            <a
              href={HOSTED_SIGN_IN ?? "#"}
              style={{ textDecoration: "underline" }}
            >
              Go to Sign-In
            </a>
          </p>
          {!HOSTED_SIGN_IN && (
            <p style={{ color: "crimson" }}>
              Missing <code>NEXT_PUBLIC_CLERK_SIGN_IN_URL</code> in Vercel env.
              Set it to your hosted Clerk sign-in URL.
            </p>
          )}
        </main>
      </SignedOut>
    </>
  );
}
