"use client";

import { useUser, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/lib/role";

export default function Home() {
  const router = useRouter();
  const { isLoaded } = useUser();
  const { isAdmin, userSlug } = useRole();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (isAdmin) router.replace("/admin");
    else if (userSlug) router.replace(`/${userSlug}`);
    else router.replace("/unauthorized");
    setReady(true);
  }, [isLoaded, isAdmin, userSlug, router]);

  return (
    <>
      <SignedIn>{!ready && <div>Loading…</div>}</SignedIn>
      <SignedOut><RedirectToSignIn /></SignedOut>
    </>
  );
}
