'use client';

// PERUBAHAN PENTING DI SINI: Import dari utils yang baru
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Lock, Mail, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Panggil Supabase dengan cara yang benar (Cookie-based)
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    console.log('Mencoba login...'); // Cek Console

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login Gagal:', error);
      setErrorMsg('Email/Password Salah!');
      setLoading(false);
      return;
    }

    console.log('Login Sukses! Mengecek role...');

    // Cek Role
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      const role = profile?.role || 'field_worker';

      console.log('Role user:', role);
      console.log('Mengalihkan halaman...');

      // JURUS PAKSA PINDAH HALAMAN (Hard Navigation)
      // Ini memastikan Cookie terbaca oleh Server
      if (role === 'client') {
        window.location.href = '/portal';
      } else if (role === 'field_worker') {
        window.location.href = '/submit';
      } else {
        window.location.href = '/';
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-gray-200">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Lock className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Login Proyek</h1>
          <p className="text-sm text-gray-500 mt-1">
            Masuk untuk memulai pekerjaan
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
              required
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center font-medium">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all flex justify-center items-center"
          >
            {loading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              'Masuk Aplikasi'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
