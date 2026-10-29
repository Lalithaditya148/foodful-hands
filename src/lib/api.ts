const API_URL = (
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" ? "/api" : "http://localhost:5000/api")
).replace(/\/$/, "");
export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const payload = (await response.json().catch(() => ({}))) as T & { message?: string };
  if (!response.ok) throw new Error(payload.message || "Request failed");
  return payload;
}
