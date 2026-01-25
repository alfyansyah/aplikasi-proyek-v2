import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/app/components/Sidebar"; // Import Sidebar yang baru dibuat

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistem Manajemen Proyek",
  description: "Aplikasi Laporan & Monitoring Konstruksi",
  manifest: "/manifest.json",
  icons: { apple: "/icon.png" },
};

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
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        <div className="flex min-h-screen">
          
          {/* SIDEBAR (Kiri) */}
          <Sidebar />

          {/* KONTEN UTAMA (Kanan) */}
          <main className="flex-1 lg:ml-64 p-4 lg:p-8 transition-all duration-300">
            {children}
          </main>

        </div>
      </body>
    </html>
  );
}