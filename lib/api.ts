export async function j<T = any>(method: string, url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export const api = {
  teachers: {
    list: () => j("GET", "/api/teachers"),
    create: (t: any) => j("POST", "/api/teachers", t),
  },
  students: {
    list: () => j("GET", "/api/students"),
    create: (s: any) => j("POST", "/api/students", s),
    update: (id: string, patch: any) => j("PUT", `/api/students/${id}`, patch),
  },
  timeSlots: {
    list: () => j("GET", "/api/timeSlots"),
    replace: (slots: string[]) => j("PUT", "/api/timeSlots", slots),
  },
  lessons: {
    list: (q?: { date?: string; teacherId?: string }) => {
      const qs = new URLSearchParams(q as any).toString();
      return j("GET", `/api/lessons${qs ? `?${qs}` : ""}`);
    },
    create: (l: any) => j("POST", "/api/lessons", l),
    update: (id: string, patch: any) => j("PUT", `/api/lessons/${id}`, patch),
    remove: (id: string) => j("DELETE", `/api/lessons/${id}`),
  },
};
