import { makeOidcConfig, makeJourneyConfig } from "@forgerock/sdk-utilities";
try {
  const config = {
    serverConfig: {
      baseUrl: "https://id.credots.local/am",
      timeout: 30000,
    },
    oidc: {
      clientId: "credo-tokenize-client",
      redirectUri: "http://localhost:3000/callback",
      scopes: ["openid", "profile", "email"],
      discoveryEndpoint: "https://id.credots.local/am/oauth2/.well-known/openid-configuration"
    }
  };
  console.log("OIDC:", makeOidcConfig(config as any));
  console.log("Journey:", makeJourneyConfig(config as any));
} catch(e: any) {
  console.log("Error:", e.message);
}
