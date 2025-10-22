"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";
import { useRole } from "@/lib/role";

export default function Home() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const { isAdmin, userSlug } = useRole();

  // Only redirect AFTER we’re signed in
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (isAdmin) router.replace("/admin");
    else if (userSlug) router.replace(`/${userSlug}`);
    else router.replace("/unauthorized");
  }, [isLoaded, isSignedIn, isAdmin, userSlug, router]);

  return (
    <>
      <SignedIn>
        <main style={{ padding: 24 }}>Redirecting to your dashboard…</main>
      </SignedIn>
      <SignedOut>
        <main style={{ padding: 24, fontFamily: "system-ui" }}>
          <h1>Welcome</h1>
          <p>You’re signed out.</p>
          // Always send them to "/"
<SignInButton mode="redirect" forceRedirectUrl="/">
  <button style={{ padding: "10px 16px" }}>Sign in</button>
</SignInButton>

        </main>
      </SignedOut>
    </>
  );
}
