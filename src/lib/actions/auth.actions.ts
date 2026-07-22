"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const CTVL_URL_IP = process.env.CTVL_URL_IP!;

export const loginAction = async (username: string, password: string) => {
  const res = await fetch(`${CTVL_URL_IP}/api/api-token-auth/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) throw new Error("Invalid username or password");

  const data = await res.json();

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

  redirect("/");
};

export const setAuthSession = async (token: string, user?: any) => {
  const cookieStore = await cookies();
  
  // Set a generic auth token to signify the user is logged in via ForgeRock
  cookieStore.set("ctvl_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60,
  });

  if (user) {
    cookieStore.set("ctvl_user", JSON.stringify(user), {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60,
    });
  }
};

export const logoutAction = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("ctvl_token")?.value;

  if (token) {
    // Attempt CTVL logout (might fail if it's a Ping token, but safe to try)
    try {
      await fetch(`${CTVL_URL_IP}/logout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ session_key: token }),
      });
    } catch (e) {
      console.warn("CTVL logout failed or was bypassed", e);
    }
  }

  cookieStore.delete("ctvl_token");
  cookieStore.delete("ctvl_user");

  redirect("/sign-in");
};
