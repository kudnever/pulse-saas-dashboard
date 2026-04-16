import { useAuthStore } from "@/stores/authStore";

const BASE_URL = "/api";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

async function request<T>(
  method: string,
  path: string,
  options: { body?: unknown; params?: Record<string, string | string[] | number | undefined> } = {}
): Promise<T> {
  const { accessToken, logout, refreshTokenFn } = useAuthStore.getState();

  let url = `${BASE_URL}${path}`;
  if (options.params) {
    const params = new URLSearchParams();
    for (const [key, val] of Object.entries(options.params)) {
      if (val === undefined) continue;
      if (Array.isArray(val)) {
        params.set(key, val.join(","));
      } else {
        params.set(key, String(val));
      }
    }
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (res.status === 401 && accessToken) {
    // Try to refresh
    try {
      await refreshTokenFn();
      // Retry with new token
      const newToken = useAuthStore.getState().accessToken;
      const retryRes = await fetch(url, {
        method,
        headers: { ...headers, Authorization: `Bearer ${newToken}` },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
      if (!retryRes.ok) {
        logout();
        throw new ApiError(retryRes.status, "Session expired");
      }
      return retryRes.json();
    } catch {
      logout();
      throw new ApiError(401, "Session expired");
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new ApiError(res.status, error.error ?? "Request failed");
  }

  return res.json();
}

export const api = {
  get: <T>(path: string, params?: Record<string, string | string[] | number | undefined>) =>
    request<T>("GET", path, { params }),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, { body }),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, { body }),
  delete: <T>(path: string) => request<T>("DELETE", path),
};

export { ApiError };
