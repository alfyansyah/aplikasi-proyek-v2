"use client";

export default function BrandBackground() {
  // 🔴 GANTI LINK INI DENGAN URL LOGO BRAND ANDA SENDIRI
  const MY_BRAND_LOGO = "https://prvzdhyyblbsahaxkjlc.supabase.co/storage/v1/object/public/app-assets/logo-contech-beckground.png"; 

  return (
    <div className="fixed inset-0 z-[-1] flex items-center justify-center pointer-events-none overflow-hidden bg-slate-50">
      
      {/* Container untuk mengatur posisi tengah */}
      <div className="relative flex items-center justify-center w-full h-full">
        
        {/* LOGO ANIMASI */}
        <img 
          src={MY_BRAND_LOGO} 
          alt="Brand Watermark" 
          className="w-[80%] max-w-2xl object-contain opacity-[0.05] grayscale animate-complex"
        />
        
      </div>
    </div>
  );
}