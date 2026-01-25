"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function BrandBackground() {
  const [logoUrl, setLogoUrl] = useState<string>("");
  const supabase = createClient();

  useEffect(() => {
    const fetchLogo = async () => {
      // Ambil logo dari proyek pertama yang ditemukan
      const { data } = await supabase
        .from("projects")
        .select("contractor_logo_url")
        .limit(1)
        .single();
      
      if (data?.contractor_logo_url) {
        setLogoUrl(data.contractor_logo_url);
      }
    };
    fetchLogo();
  }, []);

  if (!logoUrl) return null;

  return (
    <div className="fixed inset-0 z-[-1] flex items-center justify-center pointer-events-none overflow-hidden bg-slate-50">
      {/* 
         PENJELASAN STYLE:
         - fixed inset-0: Menempel memenuhi layar
         - z-[-1]: Di belakang konten utama
         - opacity-[0.03]: Sangat transparan (3-5%) agar tidak mengganggu teks
         - grayscale: Biar tidak warna-warni (elegan)
         - animate-breathe: Animasi kustom kita
      */}
      <img 
        src={logoUrl} 
        alt="Background Brand" 
        className="w-[80%] max-w-lg object-contain opacity-[0.03] grayscale animate-slow-zoom"
      />
    </div>
  );
}