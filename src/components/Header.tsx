"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import CTMStatus from "./CTMStatus";
import { usePathname } from "next/navigation";

const Header = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  console.log(status, session);

  return (
    <header className="flex flex-row justify-between items-center w-full px-8 py-3 bg-gray-50 border-b border-gray-200 shadow-sm">
      <Image src="/CREDOLOGO.png" alt="logo" height={100} width={100} />

      <div className="flex items-center gap-8">
        {!pathname.startsWith("/sign-in") && <CTMStatus />}

        {session?.user && (
          <span className="text-sm text-gray-600 font-medium">
            👤 {session.user.name ?? session.user.email ?? (session.user as any).id ?? "Authenticated"}
          </span>
        )}
        <nav className="flex gap-6 items-center">
          <Link
            href="/"
            className="text-gray-700 font-medium text-sm hover:text-black transition-colors duration-200 hover:underline underline-offset-4"
          >
            Home
          </Link>
        </nav>

        <>
              {status === "authenticated" && (
                <button
                  onClick={() => signOut({ callbackUrl: "/sign-in" })}
                  className="text-sm font-medium text-gray-700 hover:text-black"
                >
                  Sign Out
                </button>
              )}
            </>
      </div>
    </header>
  );
};

export default Header;
