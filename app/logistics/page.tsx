"use client";

import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import { Package, Check, X, ArrowLeft, Loader2 } from "lucide-react";
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
    if(!confirm(`Yakin ingin mengubah status menjadi ${status}?`)) return;
    await supabase.from("material_requests").update({ status }).eq("id", id);
    fetchRequests(); // Refresh data
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <Package className="text-orange-600"/> Logistik & Gudang
          </h1>
          <p className="text-slate-500">Kelola permintaan material dari lapangan.</p>
        </div>
        <Link href="/" className="bg-white border px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-gray-50">
          <ArrowLeft size={16} className="mr-2"/> Kembali Dashboard
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-blue-600"/></div>
      ) : (
        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-xs">
              <tr>
                <th className="p-4">Tanggal</th>
                <th className="p-4">Proyek</th>
                <th className="p-4">Barang</th>
                <th className="p-4">Qty</th>
                <th className="p-4">Catatan</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50">
                  <td className="p-4 text-gray-500">{new Date(req.created_at).toLocaleDateString()}</td>
                  <td className="p-4 font-bold">{req.projects?.name}</td>
                  <td className="p-4 text-orange-700 font-bold">{req.item_name}</td>
                  <td className="p-4">{req.quantity} {req.unit}</td>
                  <td className="p-4 italic text-gray-500">{req.notes || "-"}</td>
                  <td className="p-4">
                    {req.status === 'pending' && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">Menunggu</span>}
                    {req.status === 'approved' && <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold">Dikirim</span>}
                    {req.status === 'rejected' && <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-bold">Ditolak</span>}
                  </td>
                  <td className="p-4 flex justify-center gap-2">
                    {req.status === 'pending' && (
                      <>
                        <button onClick={() => updateStatus(req.id, 'approved')} className="bg-green-600 text-white p-2 rounded hover:bg-green-700" title="Setujui">
                          <Check size={16}/>
                        </button>
                        <button onClick={() => updateStatus(req.id, 'rejected')} className="bg-red-100 text-red-600 p-2 rounded hover:bg-red-200" title="Tolak">
                          <X size={16}/>
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}