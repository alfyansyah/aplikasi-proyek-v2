"use client";

import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import { Calendar, CloudRain, Hammer, Package, ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";

export default function DailyReportPage() {
  const supabase = createClient();
  
  // State Filter
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Hari ini
  
  // State Data
  const [reports, setReports] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. Load Daftar Proyek
  useEffect(() => {
    supabase.from("projects").select("id, name").then(({ data }) => {
      if (data) {
        setProjects(data);
        if(data.length > 0) setSelectedProject(data[0].id); // Pilih yg pertama default
      }
    });
  }, []);

  // 2. Ambil Data Harian (Setiap ganti tanggal/proyek)
  useEffect(() => {
    if (!selectedProject || !date) return;
    
    const fetchData = async () => {
      setLoading(true);
      
      // Ambil Laporan Fisik (Foto & Cuaca)
      // Filter dari jam 00:00 sampai 23:59 pada tanggal tersebut
      const start = `${date}T00:00:00.000Z`;
      const end = `${date}T23:59:59.999Z`;

      const { data: rpts } = await supabase
        .from("reports")
        .select("*, work_items(name)")
        .eq("project_id", selectedProject)
        .gte("created_at", start)
        .lte("created_at", end)
        .order("created_at", { ascending: false });
      
      if (rpts) setReports(rpts);

      // Ambil Request Material
      const { data: mats } = await supabase
        .from("material_requests")
        .select("*")
        .eq("project_id", selectedProject)
        .gte("created_at", start)
        .lte("created_at", end);
      
      if (mats) setMaterials(mats);

      setLoading(false);
    };

    fetchData();
  }, [selectedProject, date]);

  // Hitung Dominasi Cuaca (Simpel)
  const weatherSummary = reports.length > 0 ? reports[0].weather_info : "Tidak ada data";

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      
      {/* HEADER & FILTER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="text-blue-600"/> Laporan Harian Proyek (LHP)
          </h1>
          <Link href="/" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1">
            <ArrowLeft size={14}/> Kembali ke Dashboard
          </Link>
        </div>

        <div className="flex gap-2 bg-white p-2 rounded-lg shadow-sm border">
          <select 
            className="p-2 border rounded text-sm"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input 
            type="date" 
            className="p-2 border rounded text-sm"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <button onClick={() => window.print()} className="bg-gray-800 text-white p-2 rounded hover:bg-black">
            <Printer size={18}/>
          </button>
        </div>
      </div>

      {/* --- KERTAS LAPORAN (AREA CETAK) --- */}
      <div className="bg-white max-w-4xl mx-auto p-8 rounded-xl shadow-lg border border-slate-200 print:shadow-none print:border-none print:p-0">
        
        {/* KOP LAPORAN */}
        <div className="border-b-2 border-black pb-4 mb-6">
          <h2 className="text-xl font-bold uppercase text-center mb-1">LAPORAN HARIAN PROYEK</h2>
          <div className="flex justify-between text-sm mt-4">
            <div>
              <p><span className="font-bold">Proyek:</span> {projects.find(p=>p.id===selectedProject)?.name}</p>
              <p><span className="font-bold">Tanggal:</span> {new Date(date).toLocaleDateString('id-ID', {dateStyle: 'full'})}</p>
            </div>
            <div className="text-right">
              <p><span className="font-bold">Cuaca Dominan:</span> {weatherSummary}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10">Memuat Data...</div>
        ) : (
          <div className="space-y-8">
            
            {/* 1. PROGRESS FISIK (FOTO) */}
            <section>
              <h3 className="font-bold bg-slate-100 p-2 border-l-4 border-blue-600 mb-3 flex items-center gap-2">
                <Hammer size={16}/> Pekerjaan Fisik & Dokumentasi
              </h3>
              {reports.length === 0 ? <p className="text-gray-400 italic text-sm">Tidak ada aktivitas dilaporkan hari ini.</p> : (
                <div className="grid grid-cols-2 gap-4">
                  {reports.map(rpt => (
                    <div key={rpt.id} className="border p-2 rounded flex gap-3 break-inside-avoid">
                      <img src={rpt.photo_url} className="w-24 h-24 object-cover rounded bg-gray-100" />
                      <div className="text-xs">
                        <p className="font-bold text-sm">{rpt.work_items?.name}</p>
                        <p className="text-gray-500 mb-1">{new Date(rpt.created_at).toLocaleTimeString()} | Klaim: {rpt.claimed_progress}%</p>
                        <p className="italic">{rpt.description_text}</p>
                        <p className="mt-1 text-blue-600 font-semibold flex items-center gap-1">
                          <CloudRain size={10}/> {rpt.weather_info}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 2. LOGISTIK & MATERIAL */}
            <section>
              <h3 className="font-bold bg-slate-100 p-2 border-l-4 border-orange-600 mb-3 flex items-center gap-2">
                <Package size={16}/> Material & Logistik Masuk
              </h3>
              {materials.length === 0 ? <p className="text-gray-400 italic text-sm">Tidak ada permintaan material hari ini.</p> : (
                <table className="w-full text-sm text-left border border-collapse">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="border p-2">Jam</th>
                      <th className="border p-2">Barang</th>
                      <th className="border p-2">Jumlah</th>
                      <th className="border p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map(mat => (
                      <tr key={mat.id}>
                        <td className="border p-2">{new Date(mat.created_at).toLocaleTimeString()}</td>
                        <td className="border p-2 font-bold">{mat.item_name}</td>
                        <td className="border p-2">{mat.quantity} {mat.unit}</td>
                        <td className="border p-2 capitalize">{mat.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            {/* 3. CATATAN KHUSUS (Space Manual) */}
            <section className="print:block">
              <h3 className="font-bold bg-slate-100 p-2 border-l-4 border-gray-600 mb-3">Catatan / Kendala (Diisi PM)</h3>
              <div className="border h-24 rounded p-2 text-sm text-gray-400 italic">
                (Area ini untuk catatan manual PM saat dicetak...)
              </div>
            </section>

            {/* TANDA TANGAN */}
            <div className="flex justify-between pt-10 mt-10 border-t break-inside-avoid">
              <div className="text-center w-40">
                <p className="text-xs mb-16">Dibuat Oleh,</p>
                <p className="font-bold border-b border-black">Pelaksana</p>
              </div>
              <div className="text-center w-40">
                <p className="text-xs mb-16">Diketahui Oleh,</p>
                <p className="font-bold border-b border-black">Site Manager</p>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}