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
    "bardiadehbasti@gmail.com": "bardia",
    "sdehbasti@gmail.com": "soheil",
    "haleharami2015@gmail.com": "haleh",
    "negin@solschoolofmusic.ca": "negin",
    "masih.tahvildari@gmail.com": "masih",
    "parnianaghaiani95@gmail.com": "parnian",
    "mehrdadamiri20@gmail.com": "mehrdad",
    "jessica.peng823@outlook.com": "jessica",
    "ricgalvez92@gmail.com": "ric",
    "elahehfotoohi4770@gmail.com": "elaheh",
    "bamdadmaleki@gmail.com": "bamdad",
  };

  const userSlug =
    Object.entries(teacherMap).find(([email]) => allEmails.includes(email.toLowerCase()))?.[1] ||
    "";

  return { isLoaded, isAdmin, userSlug, allEmails };
}
