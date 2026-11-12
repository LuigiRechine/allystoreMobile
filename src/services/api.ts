
import * as SecureStore from "expo-secure-store";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("EXPO_PUBLIC_API_URL não configurada.");
}

type ApiOptions = RequestInit & {
  authenticated?: boolean;
};

export async function api<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { authenticated = true, headers, ...requestOptions } = options;

  const token = authenticated
    ? await SecureStore.getItemAsync("allystore_token")
    : null;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...requestOptions,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const contentType = response.headers.get("content-type");

  const data = contentType?.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "erro" in data
        ? String(data.erro)
        : `Erro na requisição (${response.status})`;

    throw new Error(message);
  }

  return data as T;
}
