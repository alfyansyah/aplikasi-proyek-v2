"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { Loader2, Briefcase, TrendingUp, AlertTriangle, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ExecutiveDashboard() {
  const supabase = createClient();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, avgProgress: 0, critical: 0 });

  useEffect(() => {
    const fetchData = async () => {
      // Ambil semua proyek beserta info ownernya
      const { data } = await supabase
        .from("projects")
        .select("*, profiles:owner_user_id(full_name)")
        .order("created_at", { ascending: false });

      if (data) {
        setProjects(data);
        
        // Hitung Statistik Sederhana
        const total = data.length;
        const totalProg = data.reduce((acc, curr) => acc + (curr.current_progress_percent || 0), 0);
        // Anggap "Kritis" jika progres di bawah 20% (Contoh logika)
        const crit = data.filter(p => (p.current_progress_percent || 0) < 20).length;

        setStats({
          total,
          avgProgress: total > 0 ? Math.round(totalProg / total) : 0,
          critical: crit
        });
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600"/></div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Executive Summary 💼</h1>
          <p className="text-slate-500">Pantauan Portfolio Proyek Perusahaan</p>
        </div>
        <Link href="/" className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline">
          <ArrowLeft size={16}/> Kembali ke Operasional
        </Link>
      </div>

      {/* KARTU STATISTIK (BIG NUMBERS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-4 bg-blue-100 rounded-full text-blue-600"><Briefcase size={24}/></div>
          <div>
            <p className="text-sm text-slate-500 uppercase font-bold">Total Proyek</p>
            <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-4 bg-green-100 rounded-full text-green-600"><TrendingUp size={24}/></div>
          <div>
            <p className="text-sm text-slate-500 uppercase font-bold">Rata-Rata Progres</p>
            <p className="text-3xl font-bold text-slate-800">{stats.avgProgress}%</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-4 bg-orange-100 rounded-full text-orange-600"><AlertTriangle size={24}/></div>
          <div>
            <p className="text-sm text-slate-500 uppercase font-bold">Perlu Perhatian</p>
            <p className="text-3xl font-bold text-slate-800">{stats.critical}</p>
            <p className="text-xs text-orange-500">(Progres &lt; 20%)</p>
          </div>
        </div>
      </div>

      {/* TABEL STATUS PROYEK */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Status Detail Proyek</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-xs">
              <tr>
                <th className="p-4">Nama Proyek</th>
                <th className="p-4">Lokasi</th>
                <th className="p-4">Pemilik (Client)</th>
                <th className="p-4">Progres</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map((proj) => (
                <tr key={proj.id} className="hover:bg-slate-50 transition">
                  <td className="p-4 font-bold text-slate-800">{proj.name}</td>
                  <td className="p-4">{proj.location_name}</td>
                  <td className="p-4">
                    {/* Mengambil nama client dari relasi profiles */}
                    {proj.profiles?.full_name || <span className="text-gray-400 italic">Belum diset</span>}
                  </td>
                  <td className="p-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1 max-w-[100px]">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${proj.current_progress_percent}%` }}></div>
                    </div>
                    <span className="text-xs font-bold">{proj.current_progress_percent}%</span>
                  </td>
                  <td className="p-4">
                    {proj.current_progress_percent >= 50 ? (
                      <span className="inline-flex items-center gap-1 text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs font-bold">
                        <CheckCircle size={12}/> Aman
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-orange-600 bg-orange-100 px-2 py-1 rounded-full text-xs font-bold">
                        <AlertTriangle size={12}/> Awal/Lambat
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}