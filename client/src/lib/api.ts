const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:3001";
export const API_BASE_URL =
  rawBaseUrl.startsWith("http://") || rawBaseUrl.startsWith("https://")
    ? rawBaseUrl
    : rawBaseUrl.includes("localhost") || rawBaseUrl.includes("127.0.0.1")
      ? `http://${rawBaseUrl}`
      : `https://${rawBaseUrl}`;

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {})
    },
    credentials: "include"
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json() : null;
  if (!res.ok) {
    const error = (body as any)?.error ?? `HTTP ${res.status}`;
    throw new Error(error);
  }
  return body as T;
}
