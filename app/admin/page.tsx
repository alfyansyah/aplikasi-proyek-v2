"use client";

import { createNewUser, createNewProject, getClients } from "./actions";
import { Users, Briefcase, PlusCircle, ShieldAlert, Loader2, RefreshCcw, FileText } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function AdminPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const userFormRef = useRef<HTMLFormElement>(null);
  const projectFormRef = useRef<HTMLFormElement>(null);

  const refreshData = async () => {
    const data = await getClients();
    setClients(data || []);
  };

  useEffect(() => { refreshData(); }, []);

  async function handleUserSubmit(formData: FormData) {
    setLoading(true);
    const res = await createNewUser(formData);
    setLoading(false);
    if (res?.error) alert("❌ " + res.error);
    else { alert("✅ " + res.success); userFormRef.current?.reset(); refreshData(); }
  }

  async function handleProjectSubmit(formData: FormData) {
    setLoading(true);
    const res = await createNewProject(formData);
    setLoading(false);
    if (res?.error) alert("❌ " + res.error);
    else { alert("✅ " + res.success); projectFormRef.current?.reset(); }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
          <ShieldAlert className="text-blue-600" /> Admin Panel V2
        </h1>
        <button onClick={refreshData} className="text-blue-600 flex gap-1 items-center text-sm"><RefreshCcw size={14}/> Refresh</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* --- FORM USER (UPDATED) --- */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 h-fit">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b">
            <Users className="text-blue-500" />
            <h2 className="text-xl font-bold text-slate-700">Tambah Personil</h2>
          </div>
          <form ref={userFormRef} action={handleUserSubmit} className="space-y-4">
            <input name="fullName" type="text" placeholder="Nama Lengkap" className="w-full p-2 border rounded" required />
            <div className="grid grid-cols-2 gap-4">
              <input name="email" type="email" placeholder="Email Login" className="w-full p-2 border rounded" required />
              <input name="password" type="text" placeholder="Password" className="w-full p-2 border rounded" required />
            </div>
            <label className="block text-sm font-bold text-gray-500">Jabatan / Role</label>
            <select name="role" className="w-full p-2 border rounded bg-white" required>
              <option value="field_worker">👷‍♂️ Pelaksana / Mandor (Input Lapangan)</option>
              <option value="site_manager">🏗️ Site Manager (Manager Lapangan)</option>
              <option value="director">👔 Direktur (Monitor Eksekutif)</option>
              <option value="expert">🎓 Tenaga Ahli (Konsultan)</option>
              <option value="client">🤝 Pemberi Kerja (Owner/PPK)</option>
              <option value="admin">🛠️ Admin IT (Full Akses)</option>
            </select>
            <button disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded font-bold">
              {loading ? "Menyimpan..." : "Buat Akun"}
            </button>
          </form>
        </div>

        {/* --- FORM PROYEK (UPDATED) --- */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b">
            <Briefcase className="text-green-600" />
            <h2 className="text-xl font-bold text-slate-700">Data Kontrak Baru</h2>
          </div>
          <form ref={projectFormRef} action={handleProjectSubmit} className="space-y-4 text-sm">
            
            {/* DATA UMUM */}
            <div className="grid grid-cols-2 gap-4">
              <input name="contractorName" type="text" placeholder="Nama Kontraktor Pelaksana" className="w-full p-2 border rounded" required />
              <input name="name" type="text" placeholder="Nama Paket Pekerjaan" className="w-full p-2 border rounded" required />
            </div>
            <input name="location" type="text" placeholder="Lokasi Proyek" className="w-full p-2 border rounded" required />

            {/* DATA KONTRAK */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
              <h3 className="font-bold flex items-center gap-2 text-slate-600"><FileText size={14}/> Data Legal & SPMK</h3>
              <div className="grid grid-cols-2 gap-3">
                <input name="contractNumber" type="text" placeholder="No. Kontrak" className="w-full p-2 border rounded" />
                <input name="contractValue" type="number" placeholder="Nilai Kontrak (Rp)" className="w-full p-2 border rounded" />
                <input name="spmkNumber" type="text" placeholder="No. SPMK" className="w-full p-2 border rounded" />
                <div>
                  <label className="text-[10px] text-gray-500 block">Tanggal SPMK</label>
                  <input name="spmkDate" type="date" className="w-full p-2 border rounded" />
                </div>
                <input name="executionDuration" type="number" placeholder="Waktu (Hari Kalender)" className="w-full p-2 border rounded" />
                <input name="ownerNip" type="text" placeholder="NIP PPK / Owner" className="w-full p-2 border rounded" />
              </div>
            </div>

            {/* PEMILIK & SCOPE */}
            <div>
              <label className="block font-bold text-gray-500 mb-1">Pemberi Kerja (Akun Login)</label>
              <select name="ownerId" className="w-full p-2 border rounded bg-white">
                <option value="none">-- Pilih Akun Client --</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>)}
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-500 mb-1">Lingkup Pekerjaan (Otomatis masuk ke Dropdown Mandor)</label>
              <textarea 
                name="workItems" 
                placeholder="Pisahkan dengan koma. Contoh: Land Clearing, Pondasi Batu Kali, Cor Sloof, Pasangan Bata, Atap, Finishing" 
                className="w-full p-2 border rounded h-24"
              ></textarea>
            </div>

            <button disabled={loading} className="w-full bg-green-600 text-white py-3 rounded font-bold mt-4">
              {loading ? "Memproses..." : "Simpan Data Proyek"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}