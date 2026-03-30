import { cookies } from "next/headers";

const CTVL_URL_IP = process.env.CTVL_URL_IP!;

interface CTVL_USER {
  username: string;
  is_staff: boolean;
  is_superuser: boolean;
}

export const getToken = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("ctvl_token")?.value ?? null;
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
