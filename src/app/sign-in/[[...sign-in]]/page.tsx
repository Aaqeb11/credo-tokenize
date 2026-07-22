"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { journey } from "@forgerock/journey-client";
import { makeJourneyConfig } from "@forgerock/sdk-utilities";
import { pingConfig, journeyConfig } from "@/lib/ping-config";
import { useAuthStore } from "@/store/auth-store";
import { setAuthSession } from "@/lib/actions/auth.actions";

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<any>(null);

  const oidcClient = useAuthStore((s) => s.oidcClient);
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const setUser = useAuthStore((s) => s.setUser);

  // Initialize Journey on mount
  useEffect(() => {
    async function startJourney() {
      try {
        const jConfig = makeJourneyConfig(pingConfig);
        const client = await journey({ config: jConfig });
        const initialStep = await client.start({ journey: journeyConfig.journey });

        if ("error" in initialStep) {
          setError((initialStep.error as any)?.message || "Failed to start login journey.");
          return;
        }

        setStep(initialStep);
      } catch (err) {
        setError("Error initializing journey.");
        console.error(err);
      }
    }

    startJourney();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!step) return;
    
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);

    // Update the step with the input values
    step.callbacks?.forEach((callback: any) => {
      const type = callback.getType();
      const name = callback.payload?.input?.[0]?.name;

      if (!name) return;

      if (type === "NameCallback" || type === "ValidatedCreateUsernameCallback") {
        callback.setInputValue(form.get("username") as string);
      } else if (type === "PasswordCallback" || type === "ValidatedCreatePasswordCallback") {
        callback.setInputValue(form.get("password") as string);
      }
    });

    try {
      const jConfig = makeJourneyConfig(pingConfig);
      const client = await journey({ config: jConfig });
      const nextStep = await client.next(step);

      if ("error" in nextStep) {
        setError((nextStep.error as any)?.message || "Login failed.");
        setStep(nextStep); // Wait for user to retry
        return;
      }

      if (nextStep.type === "LoginFailure") {
        setError("Invalid credentials or authentication failed.");
        setStep(null);
        // Restart the journey on failure
        const freshStep = await client.start({ journey: journeyConfig.journey });
        if (!("error" in freshStep)) {
          setStep(freshStep);
        }
        return;
      }

      if (nextStep.type === "LoginSuccess") {
        // Success! Now get OIDC tokens via background authorize
        if (oidcClient) {
          const authRes = await oidcClient.authorize.background();
          if ("error" in authRes) {
            setError(authRes.error_description || "OIDC Authorization failed.");
            return;
          }
          if ("code" in authRes && "state" in authRes) {
            const tokenRes = await oidcClient.token.exchange(authRes.code, authRes.state);
            if (!("error" in tokenRes)) {
              
              // Optional: get user info
              const userInfo = await oidcClient.user.info();
              let userPayload = null;
              if (!("error" in userInfo)) {
                 setUser(userInfo);
                 userPayload = {
                    username: userInfo.name || userInfo.preferred_username || "user",
                    is_staff: true,
                    is_superuser: false,
                 };
              }
              
              setAuthenticated(true);
              
              // Sync this to a server cookie here for API usage
              await setAuthSession(tokenRes.access_token, userPayload);
              
              router.push("/");
              return;
            } else {
              setError("Token exchange failed.");
            }
          }
        } else {
           // Fallback redirect if no oidc client available
           router.push("/");
        }
      } else if (nextStep.type === "Step") {
        // It's another step (e.g., MFA)
        setStep(nextStep);
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Determine what to render based on current step
  const renderCallbacks = () => {
    if (!step || !step.callbacks) return null;

    return step.callbacks.map((callback: any, idx: number) => {
      const type = callback.getType();
      const name = callback.payload?.input?.[0]?.name;

      if (type === "NameCallback" || type === "ValidatedCreateUsernameCallback") {
        return (
          <div key={idx} className="flex flex-col gap-1">
            <label className="text-sm font-medium">Username</label>
            <input
              name="username"
              type="text"
              required
              autoComplete="username"
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        );
      }

      if (type === "PasswordCallback" || type === "ValidatedCreatePasswordCallback") {
        return (
          <div key={idx} className="flex flex-col gap-1">
            <label className="text-sm font-medium">Password</label>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        );
      }
      
      return (
        <div key={idx} className="text-sm text-yellow-600">
          [Unsupported Callback Type: {type}]
        </div>
      );
    });
  };

  if (!step) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <p className="text-gray-500 animate-pulse">Initializing login...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen w-full">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 w-full max-w-sm p-8 rounded-xl border border-gray-200 shadow-sm"
      >
        <h1 className="text-2xl font-semibold">Sign In</h1>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>
        )}

        {renderCallbacks()}

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white rounded-lg py-2 mt-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
