// app/providers.tsx
"use client";
import { ClerkProvider } from "@clerk/nextjs";

export default function Providers({ children }: { children: React.ReactNode }) {
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!;
  const signInUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL; // e.g. https://<subdomain>.clerk.accounts.dev/sign-in

  return (
    <ClerkProvider
      publishableKey={pk}
      signInUrl={signInUrl}     // hosted page
      afterSignInUrl="/"        // come back to "/" after auth
      afterSignUpUrl="/"
    >
      {children}
    </ClerkProvider>
  );
}
