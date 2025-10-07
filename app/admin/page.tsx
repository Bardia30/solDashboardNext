"use client";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import Dashboard from "@/components/Dashboard";

export default function AdminPage() {
  return (
    <>
      <SignedIn><Dashboard isAdminRoute /></SignedIn>
      <SignedOut><RedirectToSignIn /></SignedOut>
    </>
  );
}
