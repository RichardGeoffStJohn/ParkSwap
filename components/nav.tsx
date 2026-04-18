"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

interface NavProps {
  isAdmin: boolean;
  hasAccessibleSpot: boolean;
  userName: string;
}

export default function Nav({ isAdmin, hasAccessibleSpot, userName }: NavProps) {
  const pathname = usePathname();

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-semibold text-gray-900">
            ParkSwap
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link
              href="/dashboard"
              className={pathname === "/dashboard" ? "font-medium text-gray-900" : "text-gray-500 hover:text-gray-700"}
            >
              Dashboard
            </Link>
            {!hasAccessibleSpot && (
              <Link
                href="/requests/new"
                className={pathname === "/requests/new" ? "font-medium text-gray-900" : "text-gray-500 hover:text-gray-700"}
              >
                Request Swap
              </Link>
            )}
            {isAdmin && (
              <>
                <Link
                  href="/admin/users"
                  className={pathname.startsWith("/admin/users") ? "font-medium text-gray-900" : "text-gray-500 hover:text-gray-700"}
                >
                  Residents
                </Link>
                <Link
                  href="/admin/swaps"
                  className={pathname.startsWith("/admin/swaps") ? "font-medium text-gray-900" : "text-gray-500 hover:text-gray-700"}
                >
                  All Swaps
                </Link>
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{userName}</span>
          <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
