export const pingConfig = {
  clientId: process.env.NEXT_PUBLIC_PING_CLIENT_ID!,
  redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/callback`,
  scope: process.env.NEXT_PUBLIC_PING_SCOPE || "openid profile email",
  serverConfig: {
    baseUrl: process.env.NEXT_PUBLIC_PING_BASE_URL!,
    timeout: 30000,
  },
  realmPath: process.env.NEXT_PUBLIC_PING_REALM_PATH!,
};

export const journeyConfig = {
  journey: process.env.NEXT_PUBLIC_PING_JOURNEY || "Login",
};
