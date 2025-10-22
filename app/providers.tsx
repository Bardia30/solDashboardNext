"use client";
import { ClerkProvider } from "@clerk/nextjs";

export default function Providers({ children }: { children: React.ReactNode }) {
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!pk) {
    return (
      <main style={{padding:20,fontFamily:"system-ui"}}>
        <h1>Clerk is not configured</h1>
        <p>Missing <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> in env.</p>
      </main>
    );
  }
  return (
    <ClerkProvider publishableKey={pk} afterSignInUrl="/" afterSignUpUrl="/">
      {children}
    </ClerkProvider>
  );
}
