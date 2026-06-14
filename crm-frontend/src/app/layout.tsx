import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Xeno CRM — AI-Native Marketing Platform",
  description: "Intelligent CRM for modern brands",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} flex h-screen overflow-hidden`}>
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-[#0a0a0f] p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
