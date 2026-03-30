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
  const response = await fetch(`${CTVL_URL}/api/api-token-auth/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) throw new Error("Invalid username or password");

  const data: CTVL_AUTH = await response.json();
  const cookieStore = await cookies();
  cookieStore.set("ctvl_token", data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60,
  });

  cookieStore.set("ctvl_user", JSON.stringify(data.user), {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60,
  });

  return data;
};

// Logout
export const logout = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("ctvl_token")?.value;

  if (token) {
    await fetch(`${process.env.CTVL_URL}/logout/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({ session_key: token }),
    });
  }

  cookieStore.delete("ctvl_token");
  cookieStore.delete("ctvl_user");
};

export const getToken = async () => {
  const cookieStore = await cookies();
  return cookieStore.get("ctvl_token")?.value ?? null;
};

export const getUser = async (): Promise<CTVL_USER | null> => {
  const cookieStore = await cookies();
  const user = cookieStore.get("ctvl_user")?.value;
  if (!user) return null;
  return JSON.parse(user) as CTVL_USER;
};
