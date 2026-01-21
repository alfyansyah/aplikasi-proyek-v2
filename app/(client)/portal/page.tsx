"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2, AlertCircle, FileText, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OwnerPortal() {
  const supabase = createClient();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      // 1. Cek User
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // 2. Cari Proyek milik User
      const { data: foundProject, error } = await supabase
        .from("projects")
        .select("*")
        .eq("owner_user_id", user.id)
        .single();

      if (error || !foundProject) {
        setErrorMsg("Anda belum memiliki proyek yang terhubung.");
        setLoading(false);
        return;
      }

      setProject(foundProject);

      // 3. Ambil Laporan
      const { data: rpts } = await supabase
        .from("reports")
        .select("*, work_items(name)")
        .eq("project_id", foundProject.id)
        .eq("is_published_to_client", true)
        .order("created_at", { ascending: false });

      if (rpts) setReports(rpts);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600"/></div>;
  
  if (errorMsg) return (
    <div className="flex h-screen items-center justify-center p-4 text-center">
      <div>
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2"/>
        <h2 className="text-lg font-bold text-gray-800">Akses Ditolak</h2>
        <p className="text-gray-500">{errorMsg}</p>
        <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="mt-4 text-blue-600 underline">Logout</button>
      </div>
    </div>
  );

  const chartData = [
    { week: 'M1', plan: 10, actual: 10 },
    { week: 'M2', plan: 20, actual: 18 },
    { week: 'M3', plan: 35, actual: project.current_progress_percent || 0 },
    { week: 'M4', plan: 50, actual: null },
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* HEADER */}
      <div className="bg-blue-900 text-white p-8 rounded-b-[3rem] shadow-xl">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-300 text-sm tracking-widest uppercase mb-2">Portal Pemilik</p>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{project.name}</h1>
              <p className="opacity-80 text-sm">{project.location_name}</p>
            </div>
            <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="bg-blue-800 hover:bg-blue-700 px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1">
              <LogOut size={14}/> Keluar
            </button>
          </div>
          
          <div className="mt-8 flex flex-col md:flex-row gap-4 items-start md:items-center">
            {/* Kartu Progress */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 min-w-[150px]">
              <div className="text-blue-200 text-xs mb-1">Realisasi Fisik</div>
              <div className="text-3xl font-bold text-yellow-400">{project.current_progress_percent || 0}%</div>
            </div>

            {/* TOMBOL DOWNLOAD PDF (BARU) */}
            <a 
              href="/portal/print" 
              target="_blank"
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition"
            >
              <FileText size={20} /> Download Laporan PDF
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* GRAFIK */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Grafik Progres (S-Curve)</h2>
          <div className="h-64 bg-gray-50 rounded-xl p-4 border border-gray-100 shadow-inner">
            {/* @ts-ignore */}
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="week" tick={{fontSize: 12}} />
                <YAxis hide />
                <Tooltip />
                <Line type="monotone" dataKey="plan" stroke="#94a3b8" strokeDasharray="5 5" name="Rencana" dot={false} />
                <Line type="monotone" dataKey="actual" stroke="#2563eb" strokeWidth={3} name="Realisasi" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GALERI */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">Dokumentasi Terverifikasi</h2>
        {reports.length === 0 ? (
          <p className="text-gray-400 italic text-center py-10 bg-gray-50 rounded-xl">Belum ada foto yang dipublikasikan.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {reports.map((rpt) => (
              <div key={rpt.id} className="rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition bg-white">
                <div className="h-56 bg-gray-200 relative">
                  <img src={rpt.photo_url} className="w-full h-full object-cover" alt="Foto Proyek" />
                  <div className="absolute bottom-0 left-0 bg-black/60 text-white text-[10px] px-2 py-1 backdrop-blur-sm">
                    {new Date(rpt.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-xs font-bold text-blue-600 uppercase mb-1">{rpt.work_items?.name}</div>
                  <div className="text-sm text-gray-700">{rpt.description_text}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}