const API_BASE = "/api";

export async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!res.ok) {
    throw new Error("API error");
  }

  return res.json();
}

export async function fetchMenu() {
  const response = await apiFetch("/menu/menus/");
  
  // if the response is empty or doesn't have the expected structure, throw an error
  if (!response || !Array.isArray(response)) {
    throw new Error("Invalid menu data");
  }

  return response;
}
