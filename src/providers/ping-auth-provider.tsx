"use client";

import { useEffect, useState } from "react";
import { oidc } from "@forgerock/oidc-client";
import { makeOidcConfig } from "@forgerock/sdk-utilities";
import { pingConfig } from "@/lib/ping-config";
import { useAuthStore } from "@/store/auth-store";

export default function PingAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setOidcClient = useAuthStore((s) => s.setOidcClient);
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const client = await oidc({ config: makeOidcConfig(pingConfig) });

      if (!mounted) return;

      if ("error" in client) {
        setAuthenticated(false);
        setReady(true);
        return;
      }

      const tokens = await client.token.get();

      setOidcClient(client);
      setAuthenticated(!("error" in tokens));
      setReady(true);
    }

    init();

    return () => {
      mounted = false;
    };
  }, [setAuthenticated, setOidcClient]);

  if (!ready) return null;

  return children;
}
