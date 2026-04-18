import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import AuthSessionProvider from "@/components/session-provider";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ParkSwap — Condo Parking Exchange",
  description: "Request and accept temporary parking spot swaps during construction",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geist.className} min-h-full bg-gray-50 antialiased`}>
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
