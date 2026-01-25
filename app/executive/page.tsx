// @ts-nocheck
"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { Loader2, Briefcase, TrendingUp, AlertTriangle, CheckCircle, Wallet, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function ExecutiveDashboard() {
  const supabase = createClient();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ 
    total: 0, 
    avgProgress: 0, 
    critical: 0,
    totalValue: 0 
  });

  useEffect(() => {
    const fetchData = async () => {
      // Ambil semua proyek beserta info ownernya
      const { data } = await supabase
        .from("projects")
        .select("*, profiles:owner_user_id(full_name)")
        .order("created_at", { ascending: false });

      if (data) {
        setProjects(data);
        
        // Hitung Statistik
        const total = data.length;
        const totalProg = data.reduce((acc, curr) => acc + (curr.current_progress_percent || 0), 0);
        const crit = data.filter(p => (p.current_progress_percent || 0) < 20).length;
        // Hitung Total Nilai Kontrak (Asumsi kolom contract_value ada, jika null dianggap 0)
        const value = data.reduce((acc, curr) => acc + (curr.contract_value || 0), 0);

        setStats({
          total,
          avgProgress: total > 0 ? Math.round(totalProg / total) : 0,
          critical: crit,
          totalValue: value
        });
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  // Format Rupiah
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="w-10 h-10 animate-spin text-blue-600"/></div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10 font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Executive Summary</p>
          <h1 className="text-3xl font-bold text-slate-800">Portfolio Proyek</h1>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 text-sm text-slate-600 flex items-center gap-2">
          <Calendar size={16} className="text-blue-500"/>
          {new Date().toLocaleDateString('id-ID', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'})}
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        
        {/* Total Proyek */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Briefcase size={64}/></div>
          <p className="text-slate-500 text-xs font-bold uppercase mb-2">Total Proyek Aktif</p>
          <p className="text-4xl font-bold text-slate-800">{stats.total}</p>
          <div className="mt-4 flex items-center text-xs text-blue-600 font-medium bg-blue-50 w-fit px-2 py-1 rounded">
            Sedang Berjalan
          </div>
        </div>

        {/* Rata-Rata Progres */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp size={64} className="text-green-600"/></div>
          <p className="text-slate-500 text-xs font-bold uppercase mb-2">Rata-Rata Progres</p>
          <p className="text-4xl font-bold text-slate-800">{stats.avgProgress}<span className="text-xl">%</span></p>
          <div className="mt-4 flex items-center text-xs text-green-600 font-medium bg-green-50 w-fit px-2 py-1 rounded">
            Overall Performance
          </div>
        </div>

        {/* Total Nilai Kontrak */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet size={64} className="text-purple-600"/></div>
          <p className="text-slate-500 text-xs font-bold uppercase mb-2">Total Nilai Kontrak</p>
          <p className="text-2xl font-bold text-slate-800 truncate" title={formatRupiah(stats.totalValue)}>
            {stats.totalValue > 1000000000 
              ? `Rp ${(stats.totalValue / 1000000000).toFixed(1)} M` 
              : formatRupiah(stats.totalValue)}
          </p>
          <div className="mt-4 flex items-center text-xs text-purple-600 font-medium bg-purple-50 w-fit px-2 py-1 rounded">
            Revenue Potential
          </div>
        </div>

        {/* Proyek Kritis */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><AlertTriangle size={64} className="text-red-600"/></div>
          <p className="text-slate-500 text-xs font-bold uppercase mb-2">Perlu Perhatian</p>
          <p className="text-4xl font-bold text-slate-800">{stats.critical}</p>
          <div className="mt-4 flex items-center text-xs text-red-600 font-medium bg-red-50 w-fit px-2 py-1 rounded">
            Progres &lt; 20%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CHART SECTION */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-600"/> Perbandingan Progres Proyek
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projects} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" width={150} tick={{fontSize: 12}} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="current_progress_percent" name="Progres (%)" radius={[0, 4, 4, 0]} barSize={20}>
                  {projects.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.current_progress_percent >= 50 ? '#22c55e' : entry.current_progress_percent >= 20 ? '#3b82f6' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* LIST RINGKAS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6">Status Terkini</h3>
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
            {projects.map((proj) => (
              <div key={proj.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="truncate pr-4">
                  <p className="text-sm font-bold text-slate-700 truncate">{proj.name}</p>
                  <p className="text-xs text-slate-500">{proj.location_name}</p>
                </div>
                <div className="text-right whitespace-nowrap">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    proj.current_progress_percent >= 50 ? "bg-green-100 text-green-700" :
                    proj.current_progress_percent >= 20 ? "bg-blue-100 text-blue-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {proj.current_progress_percent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}