"use client";
import { useUser } from "@clerk/nextjs";

export function useRole() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return { isLoaded, isAdmin: false, userSlug: "", allEmails: [] as string[] };
  if (!user) return { isLoaded, isAdmin: false, userSlug: "", allEmails: [] as string[] };

  const allEmails: string[] = [];
  if (user.primaryEmailAddress?.emailAddress)
    allEmails.push(user.primaryEmailAddress.emailAddress.toLowerCase());
  user.emailAddresses?.forEach((e) => allEmails.push(e.emailAddress.toLowerCase()));
  user.externalAccounts?.forEach((e) => {
    if (e.emailAddress) allEmails.push(e.emailAddress.toLowerCase());
  });
  if (user.username) allEmails.push(user.username.toLowerCase());
  if (user.firstName && user.lastName)
    allEmails.push(`${user.firstName}.${user.lastName}`.toLowerCase());

  const ADMIN_EMAILS = new Set(["solschoolofmusic@gmail.com"]);
  const isAdmin = allEmails.some((e) => ADMIN_EMAILS.has(e));

  const teacherMap: Record<string, string> = {
    "bardia@solschoolofmusic.ca": "bardia",
    "bardiadehbasti@gmail.com": "bardia",
    "sdehbasti@gmail.com": "soheil",
    "haleh@solschoolofmusic.ca": "haleh",
    "negin@solschoolofmusic.ca": "negin",
    "masih@solschoolofmusic.ca": "masih",
  };

  const userSlug =
    Object.entries(teacherMap).find(([email]) => allEmails.includes(email.toLowerCase()))?.[1] ||
    "";

  return { isLoaded, isAdmin, userSlug, allEmails };
}
