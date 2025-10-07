"use client";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import Dashboard from "@/components/Dashboard";

export default function TeacherPage() {
  const { slug } = useParams<{ slug: string }>();
  return (
    <>
      <SignedIn><Dashboard routeSlug={(slug || "").toString().toLowerCase()} /></SignedIn>
      <SignedOut><RedirectToSignIn /></SignedOut>
    </>
  );
}
