'use server';

import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

// --- 1. AMBIL LIST CLIENT (Untuk Dropdown) ---
export async function getClients() {
  const supabase = createAdminClient();
  const { data,error } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    //.eq("role", "client");
    if (error) {
      console.error("Error ambil client:", error); // Cek error di log server
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

  // Buat Akun Login
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    return { error: 'Gagal buat akun: ' + authError.message };
  }

  // Simpan Profil
  if (authData.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: fullName,
        role: role,
      });

    if (profileError) {
      return { error: 'Gagal simpan profil: ' + profileError.message };
    }
  }

  revalidatePath('/admin');
  return { success: 'User berhasil dibuat!' };
}

// --- 3. BUAT PROYEK BARU (YANG SUDAH DIPERBAIKI) ---
export async function createNewProject(formData: FormData) {
  const supabase = createAdminClient();

  const name = formData.get('name') as string;
  const location = formData.get('location') as string;
  const ownerIdRaw = formData.get('ownerId') as string;

  // Logika Perbaikan: Pastikan ID valid, kalau 'none' jadikan null
  const finalOwnerId = (ownerIdRaw && ownerIdRaw !== 'none' && ownerIdRaw.length > 5) 
    ? ownerIdRaw 
    : null;

  const { error } = await supabase.from('projects').insert({
    name,
    location_name: location,
    owner_user_id: finalOwnerId, // Ini yang tadi NULL terus, sekarang sudah diperbaiki
    current_progress_percent: 0,
  });

  if (error) {
    return { error: 'Gagal buat proyek: ' + error.message };
  }

  revalidatePath('/admin');
  revalidatePath('/submit');
  return { success: 'Proyek berhasil dibuat!' };
}