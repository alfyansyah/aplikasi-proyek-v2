"use client";

import { createClient } from "@/utils/supabase/client"; 
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lock, Mail, Loader2, HardHat } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMsg("Email atau Password salah.");
      setLoading(false);
      return;
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', data.user.id).single();
      
      const role = profile?.role || 'field_worker';
      
      if (role === 'client') window.location.href = '/portal';
      else if (role === 'field_worker') window.location.href = '/submit';
      else window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-white font-sans">
      
      {/* BAGIAN KIRI: GAMBAR / BRANDING (Hanya muncul di Layar Besar) */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative items-center justify-center overflow-hidden">
        {/* Background Pattern atau Gambar Proyek */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/50"></div>
        
        <div className="relative z-10 text-white p-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-orange-500 p-3 rounded-lg">
              <HardHat size={32} className="text-white"/>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">KONTRAKTOR PRO</h1>
          </div>
          <p className="text-xl text-slate-300 font-light leading-relaxed">
            Membangun masa depan dengan transparansi data dan integritas konstruksi terpercaya.
          </p>
        </div>
      </div>

      {/* BAGIAN KANAN: FORM LOGIN */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Selamat Datang Kembali</h2>
            <p className="text-slate-500 text-sm mt-1">Silakan masuk ke akun manajemen proyek Anda.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Perusahaan</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                  placeholder="nama@perusahaan.com"
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  required 
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center justify-center gap-2">
                ⚠️ {errorMsg}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-all transform active:scale-95 flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Masuk Dashboard"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400">
              © 2024 Sistem Manajemen Konstruksi. v2.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}