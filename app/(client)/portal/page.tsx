"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";

export default function OwnerPortal() {
  const supabase = createClient();
  const [project, setProject] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Ambil Data Proyek (Hardcode ID Proyek dulu untuk demo, atau ambil yang pertama)
      const { data: projects } = await supabase.from("projects").select("*").limit(1);
      
      if (projects && projects.length > 0) {
        setProject(projects[0]);
        
        // 2. Ambil Laporan Proyek Tersebut
        const { data: rpts } = await supabase
          .from("reports")
          .select("*, work_items(name)")
          .eq("project_id", projects[0].id)
          .order("created_at", { ascending: false });
          
        if (rpts) setReports(rpts);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin"/></div>;
  if (!project) return <div className="p-10 text-center">Data Proyek Tidak Ditemukan</div>;

  // Data Dummy untuk Grafik S-Curve (Nanti bisa diambil dari DB history)
  const chartData = [
    { week: 'M1', plan: 10, actual: 10 },
    { week: 'M2', plan: 20, actual: 18 },
    { week: 'M3', plan: 35, actual: project.current_progress_percent || 30 },
    { week: 'M4', plan: 50, actual: null },
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* HEADER MEWAH */}
      <div className="bg-blue-900 text-white p-8 rounded-b-[3rem] shadow-xl">
        <div className="max-w-4xl mx-auto">
          <p className="text-blue-300 text-sm tracking-widest uppercase mb-2">Portal Pemilik</p>
          <h1 className="text-4xl font-bold mb-6">{project.name}</h1>
          
          {/* KARTU STATUS UTAMA */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
              <div className="text-blue-200 text-xs mb-1">Progres Realisasi</div>
              <div className="text-3xl font-bold text-yellow-400">{project.current_progress_percent || 0}%</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
              <div className="text-blue-200 text-xs mb-1">Lokasi</div>
              <div className="text-lg font-bold truncate">{project.location_name}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        
        {/* GRAFIK S-CURVE */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Grafik Progres (S-Curve)</h2>
          <div className="h-64 bg-gray-50 rounded-xl p-4 border border-gray-100">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="week" tick={{fontSize: 12}} />
                <YAxis hide />
                <Tooltip />
                <Line type="monotone" dataKey="plan" stroke="#94a3b8" strokeDasharray="5 5" name="Rencana" />
                <Line type="monotone" dataKey="actual" stroke="#2563eb" strokeWidth={3} name="Realisasi" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GALERI FOTO */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">Dokumentasi Lapangan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {reports.map((rpt) => (
            <div key={rpt.id} className="rounded-xl overflow-hidden border border-gray-100 shadow-sm">
              <div className="h-48 bg-gray-200 relative">
                <img src={rpt.photo_url} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 bg-black/50 text-white text-xs px-2 py-1">
                  {new Date(rpt.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="p-3">
                <div className="font-bold text-gray-800">{rpt.work_items?.name}</div>
                <div className="text-sm text-gray-500 mt-1">{rpt.description_text}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}