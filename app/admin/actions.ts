'use server';

import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

// --- 1. AMBIL LIST CLIENT (Untuk Dropdown) ---
export async function getClients() {
  const supabase = createAdminClient();
  
  // Mengambil id, nama, dan email dari tabel profiles
  // Pastikan Anda sudah menjalankan SQL 'ADD COLUMN email' di Supabase sebelumnya
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "client"); // Hanya ambil yang jabatannya Client
  
  if (error) {
    console.error("Gagal ambil data client:", error.message);
    return [];
  }

  return data || [];
}

// --- 2. BUAT USER BARU ---
export async function createNewUser(formData: FormData) {
  const supabase = createAdminClient();
  
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;
  const role = formData.get('role') as string;

  // A. Buat Akun Login (Authentication)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Langsung verifikasi email
  });

  if (authError) {
    return { error: 'Gagal buat akun Auth: ' + authError.message };
  }

  // B. Simpan Data Profil & Jabatan (Database Public)
  if (authData.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: fullName,
        role: role,
        email: email, // <--- PENTING: Menyimpan email agar muncul di dropdown
      });

    if (profileError) {
      // Jika gagal simpan profil, hapus akun auth biar tidak numpuk sampah
      await supabase.auth.admin.deleteUser(authData.user.id);
      return { error: 'Gagal simpan profil database: ' + profileError.message };
    }
  }

  revalidatePath('/admin');
  return { success: 'User berhasil dibuat!' };
}

// --- 3. BUAT PROYEK BARU ---
export async function createNewProject(formData: FormData) {
  const supabase = createAdminClient();

  const name = formData.get('name') as string;
  const location = formData.get('location') as string;
  const ownerIdRaw = formData.get('ownerId') as string;

  // Logika: Jika dropdown tidak dipilih ('none'), maka set NULL
  const finalOwnerId = (ownerIdRaw && ownerIdRaw !== 'none' && ownerIdRaw.length > 5) 
    ? ownerIdRaw 
    : null;

  const { error } = await supabase.from('projects').insert({
    name,
    location_name: location,
    owner_user_id: finalOwnerId, 
    current_progress_percent: 0,
  });

  if (error) {
    return { error: 'Gagal buat proyek: ' + error.message };
  }

  revalidatePath('/admin');
  revalidatePath('/submit');
  return { success: 'Proyek berhasil dibuat!' };
}