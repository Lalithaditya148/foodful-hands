const rawApiUrl = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const baseUrl = rawApiUrl
  ? rawApiUrl.endsWith("/api")
    ? rawApiUrl
    : `${rawApiUrl}/api`
  : typeof window !== "undefined"
    ? "/api"
    : "http://localhost:5000/api";

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const normalizedPath = path.startsWith("/api") ? path.replace(/^\/api/, "") : path;
  const fullUrl = `${baseUrl}${normalizedPath.startsWith("/") ? "" : "/"}${normalizedPath}`;

  const response = await fetch(fullUrl, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const payload = (await response.json().catch(() => ({}))) as T & { message?: string };
  if (!response.ok) throw new Error(payload.message || "Request failed");
  return payload;
}
