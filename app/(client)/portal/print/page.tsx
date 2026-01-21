"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { Loader2, Printer } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PrintReportPage() {
  const supabase = createClient();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Cek User
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // 2. Ambil Proyek User
      const { data: proj } = await supabase
        .from("projects")
        .select("*")
        .eq("owner_user_id", user.id)
        .single();

      if (proj) {
        setProject(proj);
        // 3. Ambil Laporan (Hanya yang sudah Publish/Approve)
        const { data: rpts } = await supabase
          .from("reports")
          .select("*, work_items(name)")
          .eq("project_id", proj.id)
          .eq("is_published_to_client", true)
          .order("created_at", { ascending: false });
        
        if (rpts) setReports(rpts);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center">Menyiapkan Dokumen...</div>;
  if (!project) return <div className="p-10">Data Proyek tidak ditemukan.</div>;

  return (
    <div className="bg-white min-h-screen text-black p-8 font-serif max-w-4xl mx-auto">
      
      {/* TOMBOL CETAK (Akan hilang saat diprint) */}
      <div className="print:hidden mb-8 flex justify-between bg-blue-50 p-4 rounded-lg border border-blue-100">
        <div>
          <h3 className="font-bold text-blue-900">Mode Cetak Laporan</h3>
          <p className="text-sm text-blue-700">Klik tombol di kanan untuk menyimpan sebagai PDF.</p>
        </div>
        <button 
          onClick={() => window.print()} 
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 shadow-md"
        >
          <Printer size={18} /> Cetak / Simpan PDF
        </button>
      </div>

      {/* --- ISI DOKUMEN --- */}
      
      {/* KOP SURAT */}
      <div className="border-b-4 border-black pb-4 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-widest">LAPORAN PROYEK</h1>
          <p className="text-sm text-gray-600 mt-1">Laporan Progres Mingguan & Dokumentasi Lapangan</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold">{project.name}</h2>
          <p className="text-sm">{project.location_name}</p>
        </div>
      </div>

      {/* RINGKASAN */}
      <div className="mb-8 p-4 border border-gray-300 rounded grid grid-cols-2 gap-4 bg-gray-50 print:bg-white">
        <div>
          <span className="block text-xs text-gray-500 uppercase tracking-wide">Tanggal Cetak</span>
          <span className="font-bold text-lg">{new Date().toLocaleDateString('id-ID', {dateStyle: 'full'})}</span>
        </div>
        <div className="text-right">
          <span className="block text-xs text-gray-500 uppercase tracking-wide">Realisasi Progres Fisik</span>
          <span className="text-4xl font-bold text-blue-900">{project.current_progress_percent || 0}%</span>
        </div>
      </div>

      {/* GALERI FOTO */}
      <h3 className="font-bold text-lg border-b border-gray-300 mb-4 pb-1">Dokumentasi Pekerjaan</h3>
      
      {reports.length === 0 ? (
        <p className="text-center italic text-gray-400 py-10">Belum ada foto dokumentasi.</p>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {reports.map((rpt) => (
            <div key={rpt.id} className="border border-gray-200 p-2 break-inside-avoid rounded">
              <div className="aspect-video bg-gray-100 mb-2 overflow-hidden rounded relative">
                {/* Gunakan img biasa agar tercetak di PDF */}
                <img src={rpt.photo_url} className="w-full h-full object-cover" alt="Foto" />
              </div>
              <div className="px-1">
                <div className="font-bold text-sm uppercase">{rpt.work_items?.name}</div>
                <div className="text-xs text-gray-500 mb-1">
                  {new Date(rpt.created_at).toLocaleDateString('id-ID')} | Klaim: {rpt.claimed_progress}%
                </div>
                <p className="text-xs italic text-gray-700 bg-gray-50 p-1 rounded">
                  "{rpt.description_text}"
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FOOTER TANDA TANGAN */}
      <div className="mt-20 pt-10 border-t border-gray-200 flex justify-between text-center break-inside-avoid">
        <div className="w-48">
          <p className="text-xs mb-20 text-gray-500">Dibuat Oleh (Kontraktor),</p>
          <p className="font-bold border-b border-black pb-1">Pelaksana Proyek</p>
        </div>
        <div className="w-48">
          <p className="text-xs mb-20 text-gray-500">Disetujui Oleh (Owner),</p>
          <p className="font-bold border-b border-black pb-1">{project.client_name || "Pemilik Proyek"}</p>
        </div>
      </div>

    </div>
  );
}