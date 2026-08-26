import { auth } from "../../auth";

interface CTVL_USER {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export const getToken = async () => {
  const session: any = await auth();
  return session?.accessToken ?? null;
};

export const getUser = async (): Promise<CTVL_USER | null> => {
  const session = await auth();
  if (!session?.user) {
    console.warn("[auth] getUser: no user session found");
    return null;
  }
  return session.user;
};
