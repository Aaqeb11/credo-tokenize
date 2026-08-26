import NextAuth from "next-auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  debug: true,
  secret: process.env.AUTH_SECRET || process.env.BETTER_AUTH_SECRET,
  providers: [
    {
      id: "ping",
      name: "Ping",
      type: "oidc",
      issuer: "https://id.credots.local/am/oauth2/realms/root/realms/alpha",
      clientId: process.env.AUTH_CLIENT_ID,
      clientSecret: process.env.AUTH_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid ctvl:tokenize",
          service: "credo-ctvl"
        },
      },
    },
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.accessToken = token.accessToken;
        if (session.user && token.sub) {
          session.user.id = token.sub;
        }
      }
      return session;
    },
  },
});
