import { createClient } from '@/utils/supabase/server';
import { createNewUser, createNewProject } from './actions';
import { Users, Briefcase, PlusCircle, ShieldAlert } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const supabase = createClient();

  // 1. Cek Security: Hanya Admin yang boleh masuk sini
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-red-600">
        <ShieldAlert size={64} className="mb-4" />
        <h1 className="text-2xl font-bold">Akses Ditolak</h1>
        <p>Halaman ini khusus Administrator.</p>
      </div>
    );
  }

  // 2. Ambil Data Client (Untuk dropdown Owner di form proyek)
  const { data: clients } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('role', 'client');

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
            <h2 className="text-xl font-bold text-slate-700">
              Tambah User Baru
            </h2>
          </div>

          <form action={createNewUser} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">
                Nama Lengkap
              </label>
              <input
                name="fullName"
                type="text"
                placeholder="Contoh: Budi Mandor"
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">
                  Email Login
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="budi@email.com"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">
                  Password
                </label>
                <input
                  name="password"
                  type="text"
                  placeholder="Min 6 karakter"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">
                Jabatan / Role
              </label>
              <select
                name="role"
                className="w-full p-2 border rounded bg-white"
                required
              >
                <option value="field_worker">👷‍♂️ Field Worker (Mandor)</option>
                <option value="client">🤵 Client (Owner Proyek)</option>
                <option value="admin">🛠️ Admin IT</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2 mt-4"
            >
              <PlusCircle size={18} /> Buat Akun
            </button>
          </form>
        </div>

        {/* --- FORM 2: BUAT PROYEK --- */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b">
            <Briefcase className="text-green-600" />
            <h2 className="text-xl font-bold text-slate-700">
              Tambah Proyek Baru
            </h2>
          </div>

          <form action={createNewProject} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">
                Nama Proyek
              </label>
              <input
                name="name"
                type="text"
                placeholder="Contoh: Renovasi Rumah Pak Andi"
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">
                Lokasi
              </label>
              <input
                name="location"
                type="text"
                placeholder="Contoh: Jakarta Selatan"
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">
                Pemilik Proyek (Owner)
              </label>
              <select
                name="ownerId"
                className="w-full p-2 border rounded bg-white"
              >
                <option value="none">-- Pilih Klien (Jika Ada) --</option>
                {clients?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} ({c.email})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                *Klien harus dibuat dulu di menu sebelah kiri agar muncul di
                sini.
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2 mt-8"
            >
              <PlusCircle size={18} /> Buat Proyek
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
