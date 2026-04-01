"use client";

import Image from "next/image";
import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth.actions";
import CTMStatus from "./CTMStatus";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const Header = () => {
  const pathname = usePathname();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const syncUsername = async () => {
      const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith("ctvl_user="));

      if (!match) {
        setUsername(null);
        return;
      }

      const value = decodeURIComponent(match.split("=")[1]);
      const user = JSON.parse(value);
      setUsername(user.username);
    };

    syncUsername();
  }, [pathname]);
  return (
    <header className="flex flex-row justify-between items-center w-full px-8 py-3 bg-gray-50 border-b border-gray-200 shadow-sm">
      <Image src="/CREDOLOGO.png" alt="logo" height={100} width={100} />

      <div className="flex items-center gap-8">
        {!pathname.startsWith("/sign-in") && <CTMStatus />}

        {username && (
          <span className="text-sm text-gray-600 font-medium">
            👤 {username}
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

        <button
          onClick={() => logoutAction()}
          className="text-sm font-medium text-gray-700 hover:text-black transition-colors duration-200 hover:underline underline-offset-4 hover:cursor-pointer"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
};

export default Header;
