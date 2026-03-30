import { cookies } from "next/headers";

const CTVL_URL = process.env.CTVL_URL!;

interface CTVL_USER {
  username: string;
  is_staff: boolean;
  is_superuser: boolean;
}

interface CTVL_AUTH {
  token: string;
  user: CTVL_USER;
}

export const login = async (username: string, password: string) => {
  console.log("[auth] Attempting login for:", username);
  console.log("[auth] CTVL_URL:", CTVL_URL);
  console.log("[auth] NODE_ENV:", process.env.NODE_ENV);

  const response = await fetch(`${CTVL_URL}/api/api-token-auth/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  console.log("[auth] CTVL response status:", response.status);

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("[auth] Login failed:", errorBody);
    throw new Error("Invalid username or password");
  }

  const data: CTVL_AUTH = await response.json();
  console.log("[auth] Login success, user:", data.user);
  console.log("[auth] Token received:", data.token.slice(0, 20) + "...");

  const cookieStore = await cookies();

  // ✅ Fix: never set secure on localhost
  const isProduction = process.env.NODE_ENV === "production";

  cookieStore.set("ctvl_token", data.token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 60 * 60,
    path: "/",
  });
  console.log("[auth] ctvl_token cookie set, secure:", isProduction);

  cookieStore.set("ctvl_user", JSON.stringify(data.user), {
    httpOnly: false,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 60 * 60,
    path: "/",
  });
  console.log("[auth] ctvl_user cookie set");

  return data;
};

export const logout = async () => {
  console.log("[auth] Logging out...");
  const cookieStore = await cookies();
  const token = cookieStore.get("ctvl_token")?.value;

  if (token) {
    const res = await fetch(`${CTVL_URL}/logout/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({ session_key: token }),
    });
    console.log("[auth] CTVL logout response:", res.status);
  } else {
    console.warn("[auth] No token found during logout");
  }

  cookieStore.delete("ctvl_token");
  cookieStore.delete("ctvl_user");
  console.log("[auth] Cookies cleared");
};

export const getToken = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("ctvl_token")?.value ?? null;
  console.log("[auth] getToken:", token ? token.slice(0, 20) + "..." : "null");
  return token;
};

export const getUser = async (): Promise<CTVL_USER | null> => {
  const cookieStore = await cookies();
  const user = cookieStore.get("ctvl_user")?.value;
  if (!user) {
    console.warn("[auth] getUser: no user cookie found");
    return null;
  }
  return JSON.parse(user) as CTVL_USER;
};
