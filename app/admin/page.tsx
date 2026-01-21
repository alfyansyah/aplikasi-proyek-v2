"use client"; // <--- INI PENTING

import { createNewUser, createNewProject, getClients } from "./actions";
import { Users, Briefcase, PlusCircle, ShieldAlert, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function AdminPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Ref untuk mereset form
  const userFormRef = useRef<HTMLFormElement>(null);
  const projectFormRef = useRef<HTMLFormElement>(null);

  // Ambil data client saat halaman dibuka
  useEffect(() => {
    getClients().then((data) => setClients(data));
  }, []);

  // Wrapper untuk Handle Submit User
  async function handleUserSubmit(formData: FormData) {
    setLoading(true);
    const res = await createNewUser(formData);
    setLoading(false);

    if (res?.error) {
      alert("❌ GAGAL: " + res.error);
    } else {
      alert("✅ SUKSES: User Berhasil Dibuat!");
      userFormRef.current?.reset(); // Kosongkan form
    }
  }

  // Wrapper untuk Handle Submit Proyek
  async function handleProjectSubmit(formData: FormData) {
    setLoading(true);
    const res = await createNewProject(formData);
    setLoading(false);

    if (res?.error) {
      alert("❌ GAGAL: " + res.error);
    } else {
      alert("✅ SUKSES: Proyek Berhasil Dibuat!");
      projectFormRef.current?.reset(); // Kosongkan form
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <h1 className="text-3xl font-bold text-slate-800 mb-8 flex items-center gap-2">
        <ShieldAlert className="text-blue-600" /> Admin Panel
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* --- FORM 1: BUAT USER --- */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b">
            <Users className="text-blue-500" />
            <h2 className="text-xl font-bold text-slate-700">Tambah User Baru</h2>
          </div>

          <form ref={userFormRef} action={handleUserSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">Nama Lengkap</label>
              <input name="fullName" type="text" placeholder="Contoh: Budi Mandor" className="w-full p-2 border rounded" required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Email Login</label>
                <input name="email" type="email" placeholder="budi@email.com" className="w-full p-2 border rounded" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Password</label>
                <input name="password" type="text" placeholder="Min 6 karakter" className="w-full p-2 border rounded" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">Jabatan / Role</label>
              <select name="role" className="w-full p-2 border rounded bg-white" required>
                <option value="field_worker">👷‍♂️ Field Worker (Mandor)</option>
                <option value="client">🤵 Client (Owner Proyek)</option>
                <option value="admin">🛠️ Admin IT</option>
              </select>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2 mt-4 disabled:bg-gray-400">
              {loading ? <Loader2 className="animate-spin"/> : <PlusCircle size={18} />} Buat Akun
            </button>
          </form>
        </div>

        {/* --- FORM 2: BUAT PROYEK --- */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b">
            <Briefcase className="text-green-600" />
            <h2 className="text-xl font-bold text-slate-700">Tambah Proyek Baru</h2>
          </div>

          <form ref={projectFormRef} action={handleProjectSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">Nama Proyek</label>
              <input name="name" type="text" placeholder="Contoh: Renovasi Rumah Pak Andi" className="w-full p-2 border rounded" required />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">Lokasi</label>
              <input name="location" type="text" placeholder="Contoh: Jakarta Selatan" className="w-full p-2 border rounded" required />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">Pemilik Proyek (Owner)</label>
              <select name="ownerId" className="w-full p-2 border rounded bg-white">
                <option value="none">-- Pilih Klien (Jika Ada) --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} ({c.email})
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2 mt-8 disabled:bg-gray-400">
              {loading ? <Loader2 className="animate-spin"/> : <PlusCircle size={18} />} Buat Proyek
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}