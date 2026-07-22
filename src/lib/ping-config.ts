const baseUrl = process.env.NEXT_PUBLIC_PING_BASE_URL || "https://id.credots.local/am";
const realm = process.env.NEXT_PUBLIC_PING_REALM_PATH || "root";
const isRoot = realm === "root" || realm === "/";
const discoveryEndpoint = isRoot
  ? `${baseUrl}/oauth2/.well-known/openid-configuration`
  : `${baseUrl}/oauth2/realms/root/realms/${realm}/.well-known/openid-configuration`;

export const pingConfig = {
  serverConfig: {
    baseUrl,
    timeout: 30000,
  },
  oidc: {
    clientId: process.env.NEXT_PUBLIC_PING_CLIENT_ID!,
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/callback`,
    scopes: (process.env.NEXT_PUBLIC_PING_SCOPE || "openid profile email").split(" "),
    discoveryEndpoint,
  },
};

export const journeyConfig = {
  journey: process.env.NEXT_PUBLIC_PING_JOURNEY || "Login",
};
