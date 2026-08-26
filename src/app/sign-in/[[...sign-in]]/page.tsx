"use client";

import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center h-screen w-full bg-gray-50">
      <div className="flex flex-col gap-6 w-full max-w-sm p-8 rounded-xl border border-gray-200 shadow-sm bg-white">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-gray-500">
            Sign in to access your account
          </p>
        </div>

        <button
          onClick={() => signIn("ping", { callbackUrl: "/" })}
          className="bg-black text-white rounded-lg py-2.5 px-4 text-sm font-medium hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black w-full"
        >
          Sign in with Ping Identity
        </button>
      </div>
    </div>
  );
}
