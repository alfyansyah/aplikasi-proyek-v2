"use client";

import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import { Package, Send, Loader2, History, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function MaterialRequest() {
  const supabase = createClient();
  const [projects, setProjects] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]); // Riwayat
  
  // Form State
  const [selectedProject, setSelectedProject] = useState("");
  const [item, setItem] = useState("");
  const [qty, setQty] = useState("");
  const [unit, setUnit] = useState("Sak");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from("projects").select("id, name");
      if (data) setProjects(data);
      fetchHistory();
    };
    fetchData();
  }, []);

  const fetchHistory = async () => {
    // Ambil 5 request terakhir
    const { data } = await supabase
      .from("material_requests")
      .select("*, projects(name)")
      .order("created_at", { ascending: false })
      .limit(5);
    if (data) setRequests(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !item || !qty) return alert("Isi data barang!");

    setLoading(true);
    const { error } = await supabase.from("material_requests").insert({
      project_id: selectedProject,
      item_name: item,
      quantity: Number(qty),
      unit: unit,
      notes: notes,
      status: 'pending'
    });

    if (error) alert("Gagal: " + error.message);
    else {
      alert("Permintaan Terkirim ke Gudang!");
      setItem(""); setQty(""); setNotes(""); // Reset form
      fetchHistory(); // Refresh list bawah
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans max-w-md mx-auto">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Package className="text-orange-600"/> Request Material
        </h1>
        <Link href="/submit" className="text-xs text-blue-600 font-bold flex items-center">
          <ArrowLeft size={12}/> Kembali Lapor
        </Link>
      </div>

      {/* FORM REQUEST */}
      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl shadow-sm space-y-4 mb-8 border border-slate-200">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Untuk Proyek</label>
          <select className="w-full p-2 border rounded mt-1 bg-white" value={selectedProject} onChange={e=>setSelectedProject(e.target.value)} required>
            <option value="">-- Pilih Proyek --</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Nama Barang</label>
            <input type="text" placeholder="Semen / Pasir" className="w-full p-2 border rounded mt-1" value={item} onChange={e=>setItem(e.target.value)} required />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Jml & Satuan</label>
            <div className="flex">
              <input type="number" placeholder="0" className="w-1/2 p-2 border-y border-l rounded-l" value={qty} onChange={e=>setQty(e.target.value)} required />
              <input type="text" placeholder="Sak" className="w-1/2 p-2 border rounded-r bg-gray-50 text-center" value={unit} onChange={e=>setUnit(e.target.value)} required />
            </div>
          </div>
        </div>

        <div>
          <textarea placeholder="Catatan (Opsional)..." className="w-full p-2 border rounded h-16 text-sm" value={notes} onChange={e=>setNotes(e.target.value)}></textarea>
        </div>

        <button disabled={loading} className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold shadow-lg hover:bg-orange-700 flex justify-center gap-2">
          {loading ? <Loader2 className="animate-spin"/> : <Send size={18}/>} Kirim Permintaan
        </button>
      </form>

      {/* RIWAYAT TERAKHIR */}
      <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2 text-sm">
        <History size={16}/> Status Permintaan Terakhir
      </h3>
      <div className="space-y-3">
        {requests.map(req => (
          <div key={req.id} className="bg-white p-3 rounded-lg border border-slate-200 flex justify-between items-center shadow-sm">
            <div>
              <p className="font-bold text-slate-800">{req.item_name} <span className="text-slate-500 text-xs">({req.quantity} {req.unit})</span></p>
              <p className="text-[10px] text-gray-400">{req.projects?.name} • {new Date(req.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              {req.status === 'pending' && <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-bold">Menunggu</span>}
              {req.status === 'approved' && <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">Dikirim</span>}
              {req.status === 'rejected' && <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-bold">Ditolak</span>}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}