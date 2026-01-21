"use client";

import { createClient } from "@/utils/supabase/client"; 
import { useState, useEffect } from "react";
import { Camera, MapPin, Send, Loader2, Share2, CheckCircle } from "lucide-react";

export default function SubmitPage() {
  const supabase = createClient();
  
  const [projects, setProjects] = useState<any[]>([]);
  const [workItems, setWorkItems] = useState<any[]>([]);
  
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [claimedProgress, setClaimedProgress] = useState(0);
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<string | null>(null); // DATA UNTUK WA

  useEffect(() => {
    const fetchData = async () => {
      const { data: pData } = await supabase.from("projects").select("id, name");
      if (pData) setProjects(pData);
      const { data: wData } = await supabase.from("work_items").select("*");
      if (wData) setWorkItems(wData);
    };
    fetchData();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.log("GPS Error", err), { enableHighAccuracy: true }
      );
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedProject || !location) {
      alert("Mohon lengkapi Foto, Proyek, dan GPS!");
      return;
    }

    setLoading(true);
    try {
      // 1. Upload
      const fileName = `${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage.from("report-images").upload(`${selectedProject}/${fileName}`, file);
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("report-images").getPublicUrl(`${selectedProject}/${fileName}`);

      // 2. Insert DB
      const { error: dbErr } = await supabase.from("reports").insert({
        project_id: selectedProject,
        work_item_id: selectedItem || null,
        description_text: description,
        photo_url: urlData.publicUrl,
        gps_lat: location.lat,
        gps_long: location.lng,
        claimed_progress: claimedProgress,
        created_at: new Date().toISOString(),
      });

      if (dbErr) throw dbErr;

      // 3. SIAPKAN PESAN WA
      const projectName = projects.find(p => p.id === selectedProject)?.name;
      const itemName = workItems.find(w => w.id === selectedItem)?.name || "Umum";
      const gmapsLink = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
      
      const message = `*LAPORAN PROYEK BARU* %0A` +
        `🏗️ *${projectName}* %0A` +
        `🔨 Pekerjaan: ${itemName} %0A` +
        `📊 Progres: ${claimedProgress}% %0A` +
        `📝 Ket: ${description} %0A` +
        `📍 Lokasi: ${gmapsLink} %0A` +
        `📷 Lihat Foto: ${urlData.publicUrl}`;

      setSuccessData(message); // Tampilkan Layar Sukses

      // Reset
      setFile(null);
      setPreviewUrl(null);
      setDescription("");
      setClaimedProgress(0);

    } catch (error: any) {
      alert("Gagal: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- LAYAR SUKSES (TOMBOL WA) ---
  if (successData) {
    return (
      <div className="min-h-screen bg-green-50 p-6 flex flex-col items-center justify-center text-center font-sans">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Terima Kasih!</h2>
        <p className="text-gray-600 mb-10">Laporan Anda berhasil disimpan.</p>
        
        <a 
          href={`https://wa.me/?text=${successData}`} 
          target="_blank"
          className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-green-700 flex items-center justify-center gap-3 transition transform active:scale-95"
        >
          <Share2 size={24}/> Kirim ke WhatsApp
        </a>

        <button 
          onClick={() => setSuccessData(null)}
          className="mt-6 text-gray-500 underline text-sm hover:text-gray-800"
        >
          Buat Laporan Baru
        </button>
      </div>
    );
  }

  // --- FORMULIR ---
  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4 text-gray-800">Lapor Lapangan 👷‍♂️</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-xl shadow-sm">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Proyek</label>
          <select 
            className="w-full p-3 border rounded-lg mt-1 bg-white"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            required
          >
            <option value="">-- Pilih Proyek --</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Pekerjaan</label>
          <select 
            className="w-full p-3 border rounded-lg mt-1 bg-white"
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
          >
            <option value="">-- Jenis Pekerjaan --</option>
            {workItems.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>

        <div>
           <div className="flex justify-between">
             <label className="text-xs font-bold text-gray-500 uppercase">Klaim Progres</label>
             <span className="text-blue-600 font-bold">{claimedProgress}%</span>
           </div>
           <input 
             type="range" min="0" max="100" step="5"
             value={claimedProgress}
             onChange={(e) => setClaimedProgress(Number(e.target.value))}
             className="w-full mt-2 accent-blue-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
           />
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center relative bg-gray-50 hover:bg-gray-100 transition">
          <input 
            type="file" accept="image/*" capture="environment"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 z-10 w-full h-full cursor-pointer"
            required
          />
          {previewUrl ? (
            <img src={previewUrl} className="h-48 w-full object-cover rounded shadow-sm" />
          ) : (
            <div className="text-gray-400 py-4">
              <Camera className="w-12 h-12 mx-auto mb-2 text-blue-300" />
              <span className="text-sm font-medium text-gray-500">Tap Kamera</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs bg-gray-100 p-3 rounded text-gray-600">
          <MapPin className="w-4 h-4 text-red-500" />
          {location ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : "Mencari Lokasi..."}
        </div>

        <textarea 
          placeholder="Catatan tambahan..." 
          className="w-full p-3 border rounded-lg h-24"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-blue-700 shadow-lg active:scale-95 transition disabled:opacity-70"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Send className="w-5 h-5" />} Kirim Laporan
        </button>
      </form>
    </div>
  );
}