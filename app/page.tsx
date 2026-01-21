'use client'; // <--- INI KUNCINYA (Jalan di Browser)

import { createClient } from '@/utils/supabase/client'; // Pakai Client utils
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [reports, setReports] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getData = async () => {
      // 1. Cek User Login
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // Kalau belum login, lempar keluar
        router.push('/login');
        return;
      }

      setUserEmail(user.email || '');

      // 2. Ambil Data Laporan
      const { data: reportsData, error } = await supabase
        .from('reports')
        .select('*, projects(name), work_items(name)')
        .order('created_at', { ascending: false });

      if (reportsData) {
        setReports(reportsData);
      }

      setLoading(false);
    };

    getData();
  }, []);

  // Tampilan Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-500">Memuat Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Command Center 🏗️
          </h1>
          <p className="text-gray-500 text-sm">Halo, {userEmail}</p>
        </div>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push('/login');
          }}
          className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-200"
        >
          Logout
        </button>
      </header>

      {/* Grid Laporan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.length === 0 ? (
          <div className="col-span-full text-center py-20 text-gray-400 bg-white rounded-xl border border-dashed">
            <p className="mb-2 text-4xl">📭</p>
            Belum ada laporan masuk dari lapangan.
          </div>
        ) : (
          reports.map((rpt: any) => (
            <div
              key={rpt.id}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition"
            >
              <div className="flex justify-between mb-3">
                <span className="font-bold text-sm text-blue-800 bg-blue-50 px-2 py-1 rounded">
                  {rpt.projects?.name || 'Tanpa Proyek'}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(rpt.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="h-48 bg-gray-100 rounded-lg overflow-hidden mb-3 relative">
                <img
                  src={rpt.photo_url}
                  className="w-full h-full object-cover"
                  alt="Bukti"
                />
              </div>

              <h3 className="font-bold text-gray-800">
                {rpt.work_items?.name || 'Pekerjaan Umum'}
              </h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {rpt.description_text}
              </p>

              <div className="mt-3 flex justify-between items-center pt-3 border-t border-gray-100">
                <div className="text-xs">
                  Klaim:{' '}
                  <b className="text-blue-600 text-sm">
                    {rpt.claimed_progress}%
                  </b>
                </div>
                {rpt.ai_is_valid ? (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">
                    ✅ Valid
                  </span>
                ) : (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                    Belum Dicek
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
