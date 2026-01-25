"use client";

import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import { Package, Check, X, ArrowLeft, Loader2, Filter, Search } from "lucide-react";
import Link from "next/link";

export default function LogisticsDashboard() {
  const supabase = createClient();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("material_requests")
      .select("*, projects(name)")
      .order("created_at", { ascending: false });
    if (data) setRequests(data);
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  const updateStatus = async (id: string, status: string) => {
    if(!confirm(`Ubah status menjadi ${status}?`)) return;
    await supabase.from("material_requests").update({ status }).eq("id", id);
    fetchRequests();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10 font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg"><Package className="text-orange-600 w-6 h-6"/></div>
            Logistik & Gudang
          </h1>
          <p className="text-slate-500 mt-1 text-sm ml-12">Monitoring permintaan material dari semua proyek.</p>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-100 flex gap-2 bg-slate-50/50">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4"/>
            <input type="text" placeholder="Cari item..." className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"/>
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
            <Filter size={14}/> Filter
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 flex flex-col items-center">
            <Loader2 className="animate-spin mb-2 text-orange-500"/> Memuat Data...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-5">Tanggal</th>
                  <th className="p-5">Nama Proyek</th>
                  <th className="p-5">Item Barang</th>
                  <th className="p-5">Jumlah</th>
                  <th className="p-5">Catatan</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-orange-50/30 transition-colors group">
                    <td className="p-5 text-slate-500 whitespace-nowrap">
                      {new Date(req.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="p-5 font-bold text-slate-800">{req.projects?.name}</td>
                    <td className="p-5">
                      <div className="font-semibold text-slate-700 flex items-center gap-2">
                        <Package size={14} className="text-orange-400"/> {req.item_name}
                      </div>
                    </td>
                    <td className="p-5 font-mono text-slate-600 bg-slate-50 w-fit rounded">{req.quantity} {req.unit}</td>
                    <td className="p-5 text-slate-500 italic max-w-xs truncate" title={req.notes}>{req.notes || "-"}</td>
                    <td className="p-5">
                      {req.status === 'pending' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Menunggu</span>}
                      {req.status === 'approved' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Dikirim</span>}
                      {req.status === 'rejected' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Ditolak</span>}
                    </td>
                    <td className="p-5 flex justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      {req.status === 'pending' && (
                        <>
                          <button onClick={() => updateStatus(req.id, 'approved')} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition shadow-sm border border-green-200" title="Setujui">
                            <Check size={16}/>
                          </button>
                          <button onClick={() => updateStatus(req.id, 'rejected')} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition shadow-sm border border-red-200" title="Tolak">
                            <X size={16}/>
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {requests.length === 0 && (
              <div className="p-10 text-center text-slate-400">Belum ada permintaan material.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}