"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, ShieldAlert, Eye, CheckCircle } from "lucide-react";

export default function Dashboard() {
  const [reports, setReports] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const getData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "client") {
      router.push("/portal");
      return;
    }
    if (profile?.role === "field_worker") {
      router.push("/submit");
      return;
    }

    setUserEmail(user.email || "");

    const { data: reportsData } = await supabase
      .from("reports")
      .select("*, projects(name), work_items(name)")
      .order("created_at", { ascending: false });

    if (reportsData) setReports(reportsData);
    setLoading(false);
  };

  useEffect(() => {
    getData();
  }, []);

  const handleApprove = async (reportId: string) => {
    setProcessingId(reportId);
    await supabase.from("reports").update({ ai_is_valid: true, is_published_to_client: true }).eq("id", reportId);
    await getData();
    setProcessingId(null);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600"/></div>;
  }

  return (
    <div className="font-sans">
      
      {/* HEADER BERSIH (Tanpa Tombol Navigasi) */}
      <header className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Command Center 🏗️</h1>
          <p className="text-slate-500 text-sm mt-1">Selamat datang, {userEmail}</p>
        </div>
      </header>

      {/* GRID LAPORAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {reports.length === 0 ? (
          <div className="col-span-full text-center py-20 text-gray-400 bg-white rounded-2xl border border-dashed">
            <p className="mb-2 text-4xl">📭</p> Belum ada laporan masuk.
          </div>
        ) : (
          reports.map((rpt: any) => (
            <div key={rpt.id} className={`bg-white p-4 rounded-2xl shadow-sm border transition hover:shadow-md ${rpt.ai_is_valid ? 'border-green-500' : 'border-gray-200'}`}>
              <div className="flex justify-between mb-3">
                <span className="font-bold text-xs text-blue-800 bg-blue-50 px-2 py-1 rounded uppercase tracking-wide">{rpt.projects?.name}</span>
                <span className="text-xs text-gray-400">{new Date(rpt.created_at).toLocaleDateString()}</span>
              </div>
              <div className="h-48 bg-gray-100 rounded-xl overflow-hidden mb-3 relative group">
                 <img src={rpt.photo_url} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" alt="Bukti" />
                 {rpt.is_published_to_client && <div className="absolute top-2 right-2 bg-blue-600/90 text-white text-[10px] px-2 py-1 rounded-full flex items-center shadow-lg backdrop-blur-sm"><Eye className="w-3 h-3 mr-1"/> Tayang</div>}
              </div>
              <h3 className="font-bold text-gray-800">{rpt.work_items?.name}</h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2 italic">"{rpt.description_text}"</p>
              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                <div className="text-xs text-gray-500">Klaim: <b className="text-blue-600 text-sm">{rpt.claimed_progress}%</b></div>
                {rpt.ai_is_valid ? (
                  <button disabled className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg font-bold cursor-default"><CheckCircle className="w-3 h-3"/> Disetujui</button>
                ) : (
                  <button onClick={() => handleApprove(rpt.id)} disabled={processingId === rpt.id} className="flex items-center gap-1 text-xs bg-slate-900 hover:bg-black text-white px-4 py-1.5 rounded-lg font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50">
                    {processingId === rpt.id ? <Loader2 className="w-3 h-3 animate-spin"/> : "Setujui & Publish"}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}