'use server';

import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

// --- FUNGSI 1: TAMBAH USER BARU ---
export async function createNewUser(formData: FormData) {
  const supabase = createAdminClient();
  
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;
  const role = formData.get('role') as string;

  // 1. Buat Akun Login (Auth)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Langsung verifikasi email
  });

  if (authError) {
    return { error: 'Gagal buat akun: ' + authError.message };
  }

  if (authData.user) {
    // 2. Simpan Data Profil & Jabatan
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: fullName,
        role: role,
      });

    if (profileError) {
      return { error: 'Akun jadi, tapi gagal simpan profil: ' + profileError.message };
    }
  }

  revalidatePath('/admin'); // Refresh halaman admin
  return { success: 'User berhasil dibuat!' };
}

// --- FUNGSI 2: TAMBAH PROYEK BARU ---
export async function createNewProject(formData: FormData) {
  const supabase = createAdminClient();

  const name = formData.get('name') as string;
  const location = formData.get('location') as string;
  const ownerId = formData.get('ownerId') as string;

  const { error } = await supabase.from('projects').insert({
    name,
    location_name: location,
    owner_user_id: ownerId !== 'none' ? ownerId : null,
    current_progress_percent: 0,
  });

  if (error) {
    return { error: 'Gagal buat proyek: ' + error.message };
  }

  revalidatePath('/admin');
  revalidatePath('/submit'); // Agar muncul di HP Mandor
  return { success: 'Proyek berhasil dibuat!' };
}

export async function getClients() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "client");
  
  return data || [];
}