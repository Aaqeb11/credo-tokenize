"use client";

import Image from "next/image";
import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth.actions";

const Header = () => {
  return (
    <header className="flex flex-row justify-between items-center w-full px-8 py-3 bg-gray-50 border-b border-gray-200 shadow-sm">
      <Image src="/CREDOLOGO.png" alt="logo" height={100} width={100} />

      <div className="flex items-center gap-8">
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
