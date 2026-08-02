"use client";

export async function api<T = any>(
  path: string,
  options?: RequestInit & { json?: any }
): Promise<T> {
  const { json, ...rest } = options || {};
  const headers: HeadersInit = {
    ...(rest.headers || {}),
  };
  if (json !== undefined) {
    (headers as any)["Content-Type"] = "application/json";
  }
  const res = await fetch(path, {
    ...rest,
    headers,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || err.message || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}
