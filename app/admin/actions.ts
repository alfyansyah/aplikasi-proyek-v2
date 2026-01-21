'use server';

import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function getClients() {
  const supabase = createAdminClient();
  const { data } = await supabase.from("profiles").select("id, full_name, email").eq("role", "client");
  return data || [];
}

// --- UPDATE: FUNGSI BUAT USER (DENGAN ROLE BARU) ---
export async function createNewUser(formData: FormData) {
  const supabase = createAdminClient();
  
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;
  const role = formData.get('role') as string;

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email, password, email_confirm: true,
  });

  if (authError) return { error: 'Gagal Auth: ' + authError.message };

  if (authData.user) {
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      full_name: fullName,
      role: role,
      email: email,
    });
    if (profileError) return { error: 'Gagal Profil: ' + profileError.message };
  }

  revalidatePath('/admin');
  return { success: 'User berhasil dibuat!' };
}

// --- UPDATE: FUNGSI BUAT PROYEK (DATA KONTRAK) ---
export async function createNewProject(formData: FormData) {
  const supabase = createAdminClient();

  // Ambil Data Dasar
  const name = formData.get('name') as string;
  const location = formData.get('location') as string;
  const ownerIdRaw = formData.get('ownerId') as string;
  const finalOwnerId = (ownerIdRaw && ownerIdRaw.length > 5 && ownerIdRaw !== 'none') ? ownerIdRaw : null;

  // Ambil Data Kontrak Baru
  const contractNumber = formData.get('contractNumber') as string;
  const contractValue = parseFloat(formData.get('contractValue') as string) || 0;
  const spmkNumber = formData.get('spmkNumber') as string;
  const spmkDate = formData.get('spmkDate') as string; // Format YYYY-MM-DD
  const executionDuration = parseInt(formData.get('executionDuration') as string) || 0;
  const ownerNip = formData.get('ownerNip') as string;
  const contractorName = formData.get('contractorName') as string;

  // Insert ke Database
  const { data: newProject, error } = await supabase.from('projects').insert({
    name,
    location_name: location,
    owner_user_id: finalOwnerId,
    current_progress_percent: 0,
    // Data Baru:
    contract_number: contractNumber,
    contract_value: contractValue,
    spmk_number: spmkNumber,
    spmk_date: spmkDate || null,
    execution_duration: executionDuration,
    owner_nip: ownerNip,
    contractor_name: contractorName
  }).select().single();

  if (error) return { error: 'Gagal Proyek: ' + error.message };

  // --- LOGIKA UNTUK ITEM PEKERJAAN (Simple Text Split) ---
  // Admin input: "Pondasi, Struktur, Atap" (Dipisah koma) -> Kita simpan otomatis
  const workItemsRaw = formData.get('workItems') as string;
  if (workItemsRaw && newProject) {
    const items = workItemsRaw.split(',').map(i => i.trim()).filter(i => i.length > 0);
    const itemsToInsert = items.map(itemName => ({
      project_id: newProject.id,
      name: itemName
    }));
    
    if (itemsToInsert.length > 0) {
      await supabase.from('work_items').insert(itemsToInsert);
    }
  }

  revalidatePath('/admin');
  revalidatePath('/submit');
  return { success: 'Proyek & Item Pekerjaan berhasil dibuat!' };
}