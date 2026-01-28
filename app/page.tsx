import Link from "next/link";
import { ArrowRight, Zap, Globe, Lock } from "lucide-react";
import BrandBackground from "./components/BrandBackground";

export default function LandingPage() {
  // GANTI LINK INI DENGAN URL LOGO EMAS ANDA
  const LOGO_URL = "https://prvzdhyyblbsahaxkjlc.supabase.co/storage/v1/object/public/app-assets/logo%20contech.png";

  return (
    <div className="min-h-screen text-slate-800 font-sans selection:bg-orange-500 selection:text-white overflow-hidden relative bg-slate-950">
      
      {/* BACKGROUND (Dibikin lebih transparan agar logo belakang terlihat) */}
      {/* Kita panggil BrandBackground di sini secara manual dengan opacity lebih tinggi khusus halaman ini */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
         <img 
            src={LOGO_URL} 
            alt="Background Brand" 
            className="w-[90%] max-w-3xl object-contain opacity-10 grayscale animate-complex" // Opacity dinaikkan jadi 10%
          />
      </div>

      {/* GRID OVERLAY (Di atas logo, tapi di bawah konten) */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
      
      {/* NAVBAR */}
      <nav className="relative z-50 w-full max-w-7xl mx-auto px-6 h-24 flex items-center justify-between text-white">
        <div className="flex items-center gap-3 font-bold text-xl tracking-wider">
          
          {/* LOGO RESMI DI HEADER (Ganti ShieldCheck dengan Img) */}
          <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/10 shadow-lg">
            <img src="https://prvzdhyyblbsahaxkjlc.supabase.co/storage/v1/object/public/app-assets/logo-contech-beckground.png className="w-8 h-8 object-contain alt="Logo"/>
          </div>
          
          <span className="text-2xl">CONTECH<span className="text-orange-500">LABS</span></span>
        </div>
        <Link 
          href="/login" 
          className="bg-white text-slate-950 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-orange-500 hover:text-white transition-all transform hover:scale-105 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
        >
          Login System
        </Link>
      </nav>

      {/* HERO SECTION */}
      <main className="relative z-10 flex flex-col items-center justify-center pt-24 pb-32 text-center px-4">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-bold uppercase tracking-widest mb-8 animate-pulse shadow-[0_0_15px_-3px_rgba(234,88,12,0.3)]">
          <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_orange]"></span>
          System Online v.2.0
        </div>

        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8 text-white leading-tight drop-shadow-2xl">
          CONSTRUCTION <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 drop-shadow-lg filter brightness-125">INTELLIGENCE</span>
        </h1>

        <p className="max-w-3xl text-xl text-slate-300 mb-12 leading-relaxed font-light">
          Bukan sekadar aplikasi laporan. Ini adalah <span className="text-white font-bold border-b-2 border-orange-500">saraf digital</span> untuk bisnis konstruksi Anda. 
          Pantau progres, validasi mandor, dan amankan cashflow dengan presisi AI.
        </p>

        <div className="flex flex-col md:flex-row gap-5 w-full md:w-auto">
          <Link 
            href="/login" 
            className="group relative px-10 py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-bold text-lg transition-all shadow-[0_0_40px_-10px_rgba(234,88,12,0.6)] flex items-center justify-center gap-3 hover:-translate-y-1"
          >
            AKSES CONSOLE <ArrowRight className="group-hover:translate-x-1 transition"/>
          </Link>
          <button className="px-10 py-4 bg-white/5 backdrop-blur-md border border-white/10 text-slate-200 rounded-2xl font-bold text-lg hover:bg-white/10 hover:text-white transition hover:-translate-y-1">
            LIHAT DEMO
          </button>
        </div>

      </main>

      {/* FEATURES GRID */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cards tetap sama */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-8 rounded-3xl hover:border-orange-500/50 hover:bg-slate-900/60 transition duration-500 group">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-600 transition shadow-lg">
              <Globe className="text-white w-7 h-7"/>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">White Label</h3>
            <p className="text-slate-400 text-base leading-relaxed">Gunakan logo dan identitas perusahaan Anda sendiri. Klien melihat ini sebagai sistem eksklusif milik Anda.</p>
          </div>
          <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-8 rounded-3xl hover:border-orange-500/50 hover:bg-slate-900/60 transition duration-500 group">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-600 transition shadow-lg">
              <Zap className="text-white w-7 h-7"/>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Real-Time Sync</h3>
            <p className="text-slate-400 text-base leading-relaxed">Laporan lapangan masuk detik itu juga. GPS terkunci, Foto ber-watermark. Anti manipulasi data.</p>
          </div>
          <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-8 rounded-3xl hover:border-orange-500/50 hover:bg-slate-900/60 transition duration-500 group">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-600 transition shadow-lg">
              <Lock className="text-white w-7 h-7"/>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Secure Portal</h3>
            <p className="text-slate-400 text-base leading-relaxed">Portal khusus untuk Owner melihat S-Curve dan progres fisik tanpa melihat kerumitan dapur operasional.</p>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/5 py-10 text-center">
        <p className="text-slate-500 text-xs tracking-[0.3em] uppercase font-medium">
          SECURE CONNECTION • ENCRYPTED • CONTECH LABS
        </p>
      </footer>

    </div>
  );
}