// app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/nextjs";
import { useRole } from "@/lib/role";

export default function Home() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const { isAdmin, userSlug } = useRole();

  // After sign-in, send user to their destination
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (isAdmin) router.replace("/admin");
    else if (userSlug) router.replace(`/${userSlug}`);
    else router.replace("/unauthorized");
  }, [isLoaded, isSignedIn, isAdmin, userSlug, router]);

  return (
    <>
      <SignedOut>
        {/* Auto-redirect to hosted Clerk sign-in (from ClerkProvider.signInUrl) */}
        <RedirectToSignIn /* optionally: redirectUrl="/" */ />
      </SignedOut>

      <SignedIn>
        <div style={{ padding: 24 }}>Redirecting to your dashboard…</div>
      </SignedIn>
    </>
  );
}
