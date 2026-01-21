"use client";

import { createClient } from "@/utils/supabase/client"; // Pakai Client utils
import { useState, useEffect } from "react";
import { Camera, MapPin, Send, Loader2 } from "lucide-react";

export default function SubmitPage() {
  const supabase = createClient();
  
  // State Data
  const [projects, setProjects] = useState<any[]>([]);
  const [workItems, setWorkItems] = useState<any[]>([]);
  
  // State Input
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [claimedProgress, setClaimedProgress] = useState(0);
  const [description, setDescription] = useState("");
  
  // State File & Lokasi
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const [loading, setLoading] = useState(false);

  // 1. Ambil Data Proyek & Pekerjaan saat aplikasi dibuka
  useEffect(() => {
    const fetchData = async () => {
      const { data: pData } = await supabase.from("projects").select("id, name");
      if (pData) setProjects(pData);

      const { data: wData } = await supabase.from("work_items").select("*");
      if (wData) setWorkItems(wData);
    };

    fetchData();
    getLocation();
  }, []);

  // 2. Fungsi Ambil GPS
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.log("GPS Error", err),
        { enableHighAccuracy: true }
      );
    }
  };

  // 3. Handle Pilih Foto
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
    }
  };

  // 4. KIRIM LAPORAN
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedProject || !location) {
      alert("Mohon lengkapi Foto, Proyek, dan GPS!");
      return;
    }

    setLoading(true);
    try {
      // A. Upload Foto ke Storage
      const fileName = `${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage
        .from("report-images")
        .upload(`${selectedProject}/${fileName}`, file);

      if (upErr) throw upErr;

      // Ambil Link Foto
      const { data: urlData } = supabase.storage
        .from("report-images")
        .getPublicUrl(`${selectedProject}/${fileName}`);

      // B. Simpan Data ke Database
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

      alert("Laporan Berhasil Terkirim!");
      
      // Reset Form
      setFile(null);
      setPreviewUrl(null);
      setDescription("");
      setClaimedProgress(0);

    } catch (error: any) {
      alert("Gagal kirim: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4 text-gray-800">Lapor Lapangan 👷‍♂️</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-xl shadow-sm">
        
        {/* Pilih Proyek */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Proyek</label>
          <select 
            className="w-full p-3 border rounded-lg mt-1"
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

        {/* Pilih Pekerjaan */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Pekerjaan</label>
          <select 
            className="w-full p-3 border rounded-lg mt-1"
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
          >
            <option value="">-- Jenis Pekerjaan --</option>
            {workItems.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>

        {/* Progress Slider */}
        <div>
           <div className="flex justify-between">
             <label className="text-xs font-bold text-gray-500 uppercase">Klaim Progres</label>
             <span className="text-blue-600 font-bold">{claimedProgress}%</span>
           </div>
           <input 
             type="range" min="0" max="100" step="5"
             value={claimedProgress}
             onChange={(e) => setClaimedProgress(Number(e.target.value))}
             className="w-full mt-2"
           />
        </div>

        {/* Input Foto */}
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center relative bg-gray-50">
          <input 
            type="file" accept="image/*" capture="environment"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 z-10 w-full h-full"
            required
          />
          {previewUrl ? (
            <img src={previewUrl} className="h-40 mx-auto object-cover rounded" />
          ) : (
            <div className="text-gray-400">
              <Camera className="w-10 h-10 mx-auto mb-1" />
              <span className="text-xs">Tap untuk ambil foto</span>
            </div>
          )}
        </div>

        {/* GPS Info */}
        <div className="flex items-center gap-2 text-xs bg-gray-100 p-2 rounded text-gray-600">
          <MapPin className="w-4 h-4" />
          {location ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : "Mencari Lokasi..."}
        </div>

        <textarea 
          placeholder="Catatan..." 
          className="w-full p-3 border rounded-lg"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold flex justify-center items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Send className="w-4 h-4" />} Kirim Laporan
        </button>

      </form>
    </div>
  );
}