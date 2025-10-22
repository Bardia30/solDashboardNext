"use client";

import { ClerkProvider } from "@clerk/nextjs";

export default function Providers({ children }: { children: React.ReactNode }) {
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!;
  // Point to HOSTED Clerk pages (no local pages)
  const signInUrl  = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL;  // e.g. https://your-subdomain.clerk.accounts.dev/sign-in
  const signUpUrl  = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL;  // e.g. https://your-subdomain.clerk.accounts.dev/sign-up

  return (
    <ClerkProvider
      publishableKey={pk}
      signInUrl={signInUrl}
      signUpUrl={signUpUrl}
      // where to return after auth
      afterSignInUrl="/"
      afterSignUpUrl="/"
    >
      {children}
    </ClerkProvider>
  );
}
