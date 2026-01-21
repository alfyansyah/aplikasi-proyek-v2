"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, ShieldAlert, Eye, CheckCircle } from "lucide-react"; // Tambah ShieldAlert

export default function Dashboard() {
  const [reports, setReports] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(true); // Status Izin
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const getData = async () => {
    // 1. Cek User Login
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    // 2. CEK ROLE USER (SECURITY CHECK)
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // JIKA DIA CLIENT, TENDANG KE PORTAL (JANGAN KASIH LIHAT DAPUR)
    if (profile?.role === "client") {
      router.push("/portal");
      return;
    }
    
    // JIKA DIA MANDOR, TENDANG KE SUBMIT
    if (profile?.role === "field_worker") {
      router.push("/submit");
      return;
    }

    // Jika Admin/PM/Bos, Lanjut...
    setUserEmail(user.email || "");

    // 3. Ambil Data Laporan
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
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-blue-600"/></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Command Center 🏗️</h1>
          <p className="text-gray-500 text-sm">Halo, {userEmail} (Admin)</p>
        </div>
        <div className="flex gap-2">
          {/* Tombol ke Admin Panel */}
          <a href="/admin" className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-black flex items-center gap-2">
            <ShieldAlert className="w-4 h-4"/> Admin Panel
          </a>
          {/* Tombol ke Dashboard Bos */}
          <a href="/executive" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center gap-2">
            <TrendingUp className="w-4 h-4"/> Executive
          </a>
          <button onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }} className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-200">
            Logout
          </button>
        </div>
      </header>

      {/* Grid Laporan (Sama seperti sebelumnya) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.length === 0 ? (
          <div className="col-span-full text-center py-20 text-gray-400 bg-white rounded-xl border border-dashed">
            <p className="mb-2 text-4xl">📭</p> Belum ada laporan masuk.
          </div>
        ) : (
          reports.map((rpt: any) => (
            <div key={rpt.id} className={`bg-white p-4 rounded-xl shadow-sm border transition hover:shadow-md ${rpt.ai_is_valid ? 'border-green-500' : 'border-gray-200'}`}>
              <div className="flex justify-between mb-3">
                <span className="font-bold text-xs text-blue-800 bg-blue-50 px-2 py-1 rounded uppercase tracking-wide">{rpt.projects?.name}</span>
                <span className="text-xs text-gray-400">{new Date(rpt.created_at).toLocaleDateString()}</span>
              </div>
              <div className="h-48 bg-gray-100 rounded-lg overflow-hidden mb-3 relative group">
                 <img src={rpt.photo_url} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" alt="Bukti" />
                 {rpt.is_published_to_client && <div className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] px-2 py-1 rounded-full flex items-center shadow-lg"><Eye className="w-3 h-3 mr-1"/> Tayang</div>}
              </div>
              <h3 className="font-bold text-gray-800">{rpt.work_items?.name}</h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2 italic">{rpt.description_text}</p>
              <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                <div className="text-xs text-gray-500">Klaim: <b className="text-blue-600 text-sm">{rpt.claimed_progress}%</b></div>
                {rpt.ai_is_valid ? (
                  <button disabled className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg font-bold cursor-default"><CheckCircle className="w-3 h-3"/> Disetujui</button>
                ) : (
                  <button onClick={() => handleApprove(rpt.id)} disabled={processingId === rpt.id} className="flex items-center gap-1 text-xs bg-gray-800 hover:bg-black text-white px-4 py-1.5 rounded-lg font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50">
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