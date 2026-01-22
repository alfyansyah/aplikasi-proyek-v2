"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Printer, Eraser, PenTool } from "lucide-react";
import SignatureCanvas from "react-signature-canvas";

export default function PrintReportPage() {
  const supabase = createClient();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Ref untuk Papan Tanda Tangan
  const sigCanvasKontraktor = useRef<any>({});
  const sigCanvasOwner = useRef<any>({});

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Ambil Proyek
      const { data: proj } = await supabase
        .from("projects")
        .select("*")
        .eq("owner_user_id", user.id)
        .single();

      if (proj) {
        setProject(proj);
        // Ambil Laporan (Published)
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

  const clearSignature = (type: 'kontraktor' | 'owner') => {
    if (type === 'kontraktor') sigCanvasKontraktor.current.clear();
    else sigCanvasOwner.current.clear();
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Menyiapkan Dokumen...</div>;
  if (!project) return <div className="p-10">Data Proyek tidak ditemukan.</div>;

  return (
    <div className="bg-white min-h-screen text-black p-8 font-serif max-w-[210mm] mx-auto">
      
      {/* HEADER TOMBOL (Tidak ikut ter-print) */}
      <div className="print:hidden mb-8 flex flex-col md:flex-row justify-between bg-blue-50 p-4 rounded-lg border border-blue-100 gap-4">
        <div>
          <h3 className="font-bold text-blue-900 flex items-center gap-2"><PenTool size={16}/> Persiapan Cetak</h3>
          <p className="text-sm text-blue-700">Silakan tanda tangan di kotak bawah sebelum mencetak.</p>
        </div>
        <button 
          onClick={() => window.print()} 
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 shadow-md"
        >
          <Printer size={18} /> Cetak / Simpan PDF
        </button>
      </div>

      {/* --- KOP SURAT --- */}
      <div className="border-b-4 border-black pb-4 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-widest text-slate-900">LAPORAN PROGRES</h1>
          <p className="text-sm text-gray-600 mt-1 uppercase">{project.contractor_name || "KONTRAKTOR PELAKSANA"}</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold text-slate-900">{project.name}</h2>
          <p className="text-sm text-gray-600">{project.location_name}</p>
        </div>
      </div>

      {/* DATA RINGKASAN */}
      <div className="mb-8 p-4 border border-gray-400 rounded grid grid-cols-2 gap-4 bg-gray-50 print:bg-white">
        <div>
          <span className="block text-xs text-gray-500 uppercase tracking-wide">Tanggal Laporan</span>
          <span className="font-bold text-lg">{new Date().toLocaleDateString('id-ID', {dateStyle: 'full'})}</span>
        </div>
        <div className="text-right">
          <span className="block text-xs text-gray-500 uppercase tracking-wide">Realisasi Fisik</span>
          <span className="text-3xl font-bold text-black">{project.current_progress_percent || 0}%</span>
        </div>
      </div>

      {/* GALERI FOTO */}
      <h3 className="font-bold text-md border-b border-gray-300 mb-4 pb-1 uppercase">Dokumentasi Lapangan</h3>
      
      {reports.length === 0 ? (
        <p className="text-center italic text-gray-400 py-10">Belum ada dokumentasi.</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
          {reports.map((rpt) => (
            <div key={rpt.id} className="border border-gray-300 p-2 break-inside-avoid rounded page-break-auto">
              <div className="aspect-video bg-gray-100 mb-2 overflow-hidden rounded border border-gray-200">
                <img src={rpt.photo_url} className="w-full h-full object-cover" alt="Foto" />
              </div>
              <div className="px-1">
                <div className="font-bold text-xs uppercase text-slate-800">{rpt.work_items?.name}</div>
                <div className="text-[10px] text-gray-500 mb-1">
                  {new Date(rpt.created_at).toLocaleDateString('id-ID')} | {rpt.weather_info || '-'}
                </div>
                <p className="text-[11px] italic text-gray-700 leading-tight">
                  "{rpt.description_text}"
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AREA TANDA TANGAN (DIGITAL) */}
      <div className="mt-16 pt-4 border-t-2 border-black flex justify-between break-inside-avoid">
        
        {/* KIRI: KONTRAKTOR */}
        <div className="w-56 text-center">
          <p className="text-xs mb-2 text-gray-500">Dibuat Oleh,</p>
          <p className="font-bold text-sm uppercase mb-2">{project.contractor_name || "KONTRAKTOR"}</p>
          
          {/* Canvas Tanda Tangan */}
          <div className="border border-dashed border-gray-400 rounded bg-white relative mx-auto" style={{width: 200, height: 100}}>
            <SignatureCanvas 
              ref={sigCanvasKontraktor}
              penColor="black"
              canvasProps={{width: 200, height: 100, className: 'sigCanvas'}} 
            />
            {/* Tombol Hapus TTD (Hanya muncul di layar, tidak di print) */}
            <button 
              onClick={() => clearSignature('kontraktor')}
              className="print:hidden absolute top-1 right-1 bg-red-100 p-1 rounded hover:bg-red-200 text-red-600"
              title="Hapus TTD"
            >
              <Eraser size={12}/>
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-1 print:hidden">(Tanda tangan di kotak atas)</p>
          <div className="border-b border-black mt-1"></div>
          <p className="text-xs mt-1 font-bold">Site Manager</p>
        </div>

        {/* KANAN: OWNER */}
        <div className="w-56 text-center">
          <p className="text-xs mb-2 text-gray-500">Disetujui Oleh,</p>
          <p className="font-bold text-sm uppercase mb-2">{project.client_name || "PEMILIK PROYEK"}</p>
          
          {/* Canvas Tanda Tangan */}
          <div className="border border-dashed border-gray-400 rounded bg-white relative mx-auto" style={{width: 200, height: 100}}>
            <SignatureCanvas 
              ref={sigCanvasOwner}
              penColor="black"
              canvasProps={{width: 200, height: 100, className: 'sigCanvas'}} 
            />
            <button 
              onClick={() => clearSignature('owner')}
              className="print:hidden absolute top-1 right-1 bg-red-100 p-1 rounded hover:bg-red-200 text-red-600"
              title="Hapus TTD"
            >
              <Eraser size={12}/>
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-1 print:hidden">(Tanda tangan di kotak atas)</p>
          <div className="border-b border-black mt-1"></div>
          <p className="text-xs mt-1 font-bold">Pejabat Pembuat Komitmen / Owner</p>
        </div>

      </div>

    </div>
  );
}