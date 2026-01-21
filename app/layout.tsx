import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistem Manajemen Proyek",
  description: "Aplikasi Laporan & Monitoring Konstruksi",
  manifest: "/manifest.json",
  icons: { apple: "/icon.png" },
};

// PERBAIKAN DI SINI: Hapus ": Viewport" agar tidak error
export const viewport = {
  themeColor: "#1e40af",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}