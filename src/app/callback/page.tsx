"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

export default function CallbackPage() {
  const router = useRouter();
  const oidcClient = useAuthStore((s) => s.oidcClient);
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);

  useEffect(() => {
    async function handleCallback() {
      if (!oidcClient) return;

      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const state = urlParams.get("state");

      if (code && state) {
        try {
          const tokenRes = await oidcClient.token.exchange(code, state);
          if (!("error" in tokenRes)) {
            setAuthenticated(true);
            // Optionally, handle token syncing with backend here if needed
            router.push("/");
          } else {
            console.error("Token exchange error:", tokenRes);
            router.push("/sign-in?error=token_exchange_failed");
          }
        } catch (err) {
          console.error("Token exchange failed", err);
          router.push("/sign-in?error=token_exchange_failed");
        }
      } else {
        router.push("/sign-in");
      }
    }

    handleCallback();
  }, [oidcClient, router, setAuthenticated]);

  return (
    <div className="flex items-center justify-center h-screen w-full">
      <p className="text-gray-500 animate-pulse">Processing authentication...</p>
    </div>
  );
}
