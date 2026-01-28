import Link from "next/link";
import { ArrowRight, CheckCircle, ShieldCheck, Zap, Globe, Lock } from "lucide-react";
import BrandBackground from "./components/BrandBackground";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-orange-500 selection:text-white overflow-hidden relative">
      
      {/* BACKGROUND GRID (Efek Tech) */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
      
      {/* LOGO BACKGROUND ANIMASI */}
      <BrandBackground />

      {/* NAVBAR */}
      <nav className="relative z-50 w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl tracking-wider">
          <div className="bg-orange-600 p-1 rounded-lg">
            <ShieldCheck size={24} className="text-white"/>
          </div>
          <span>CONTECH<span className="text-orange-500">LABS</span></span>
        </div>
        <Link 
          href="/login" 
          className="bg-white text-slate-950 px-6 py-2 rounded-full font-bold text-sm hover:bg-orange-50 transition transform hover:scale-105"
        >
          Login System
        </Link>
      </nav>

      {/* HERO SECTION */}
      <main className="relative z-10 flex flex-col items-center justify-center pt-20 pb-32 text-center px-4">
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-bold uppercase tracking-widest mb-8 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
          System Online v.2.0
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500 leading-tight">
          CONSTRUCTION <br/>
          <span className="text-orange-600 drop-shadow-2xl">INTELLIGENCE</span>
        </h1>

        <p className="max-w-2xl text-lg text-slate-400 mb-10 leading-relaxed">
          Bukan sekadar aplikasi laporan. Ini adalah <span className="text-white font-bold">saraf digital</span> untuk bisnis konstruksi Anda. 
          Pantau progres, validasi mandor, dan amankan cashflow dengan presisi AI.
        </p>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <Link 
            href="/login" 
            className="group relative px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-lg transition-all shadow-[0_0_40px_-10px_rgba(234,88,12,0.5)] flex items-center justify-center gap-2"
          >
            AKSES CONSOLE <ArrowRight className="group-hover:translate-x-1 transition"/>
          </Link>
          <button className="px-8 py-4 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl font-bold text-lg hover:border-slate-600 hover:text-white transition">
            LIHAT DEMO
          </button>
        </div>

      </main>

      {/* FEATURES GRID (BENTO STYLE) */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20 border-t border-slate-900">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-8 rounded-2xl hover:border-orange-500/50 transition duration-500 group">
            <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-6 group-hover:bg-orange-600 transition">
              <Globe className="text-white"/>
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">White Label</h3>
            <p className="text-slate-400 text-sm">Gunakan logo dan identitas perusahaan Anda sendiri. Klien melihat ini sebagai sistem eksklusif milik Anda.</p>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-8 rounded-2xl hover:border-orange-500/50 transition duration-500 group">
            <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-6 group-hover:bg-orange-600 transition">
              <Zap className="text-white"/>
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Real-Time Sync</h3>
            <p className="text-slate-400 text-sm">Laporan lapangan masuk detik itu juga. GPS terkunci, Foto ber-watermark. Anti manipulasi data.</p>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-8 rounded-2xl hover:border-orange-500/50 transition duration-500 group">
            <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-6 group-hover:bg-orange-600 transition">
              <Lock className="text-white"/>
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Secure Portal</h3>
            <p className="text-slate-400 text-sm">Portal khusus untuk Owner melihat S-Curve dan progres fisik tanpa melihat kerumitan dapur operasional.</p>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-slate-900 py-8 text-center">
        <p className="text-slate-600 text-xs tracking-widest uppercase">
          SECURE CONNECTION • ENCRYPTED • CONTECH LABS
        </p>
      </footer>

    </div>
  );
}