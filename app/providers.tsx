// app/providers.tsx
"use client";
import { ClerkProvider } from "@clerk/nextjs";

export default function Providers({ children }: { children: React.ReactNode }) {
  // Try BOTH env names; some folks only set CLERK_PUBLISHABLE_KEY in Vercel
  const pk =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ??
    process.env.CLERK_PUBLISHABLE_KEY;

  if (!pk) {
    // This renders a visible message instead of a blank screen if the key isn't present
    return (
      <div style={{ padding: 24, fontFamily: "system-ui" }}>
        <h1>Clerk is not configured</h1>
        <p>
          Missing <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> (or{" "}
          <code>CLERK_PUBLISHABLE_KEY</code>) in Vercel Production env vars.
        </p>
      </div>
    );
  }

  return (
    <ClerkProvider
      publishableKey={pk}
      // If you’re using HOSTED pages, set these envs in Vercel (no local /sign-in)
      signInUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || undefined}
      signUpUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || undefined}
      afterSignInUrl="/"
      afterSignUpUrl="/"
    >
      {children}
    </ClerkProvider>
  );
}
