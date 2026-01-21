"use client";

import { createClient } from "@/utils/supabase/client"; 
import { useState, useEffect } from "react";
import { Camera, MapPin, Send, Loader2, Share2, CheckCircle, CloudRain } from "lucide-react";

export default function SubmitPage() {
  const supabase = createClient();
  
  // Data Master
  const [projects, setProjects] = useState<any[]>([]);
  const [workItems, setWorkItems] = useState<any[]>([]);
  
  // Input User
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [claimedProgress, setClaimedProgress] = useState(0);
  const [description, setDescription] = useState("");
  
  // File & Lokasi
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  // Info Tambahan
  const [weather, setWeather] = useState<string>("Mencari data cuaca...");
  
  // Status
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<string | null>(null);

  // --- 1. LOAD DATA AWAL ---
  useEffect(() => {
    const fetchData = async () => {
      // Ambil Info Proyek Lengkap (Nama, Kontraktor, Client)
      const { data: pData } = await supabase
        .from("projects")
        .select("id, name, contractor_name, client_name");
      
      if (pData) setProjects(pData);

      const { data: wData } = await supabase.from("work_items").select("*");
      if (wData) setWorkItems(wData);
    };
    fetchData();
    
    // Ambil GPS & Cuaca
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setLocation({ lat, lng });
          await fetchWeather(lat, lng);
        },
        (err) => console.log("GPS Error", err), { enableHighAccuracy: true }
      );
    }
  }, []);

  // --- 2. CEK CUACA ---
  const fetchWeather = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code&timezone=auto`);
      const data = await res.json();
      const temp = data.current.temperature_2m;
      const code = data.current.weather_code;
      
      let condition = "Cerah";
      if (code >= 1 && code <= 3) condition = "Berawan";
      if (code >= 45 && code <= 48) condition = "Kabut";
      if (code >= 51 && code <= 67) condition = "Hujan Ringan";
      if (code >= 80 && code <= 99) condition = "Hujan Lebat";

      setWeather(`${condition} (${temp}°C)`);
    } catch (e) {
      setWeather("Data tidak tersedia");
    }
  };

  // --- 3. FUNGSI WATERMARK (INI YANG MENEMPELKAN TEKS KE FOTO) ---
  const processWatermark = async (originalFile: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(originalFile);
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(originalFile);

        // Set Ukuran Canvas
        canvas.width = img.width;
        canvas.height = img.height;

        // 1. Gambar Foto Asli
        ctx.drawImage(img, 0, 0);

        // 2. Buat Kotak Hitam di Bawah (Background Text)
        const footerH = img.height * 0.35; // 35% dari tinggi foto
        const footerY = img.height - footerH;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, footerY, img.width, footerH);

        // 3. Siapkan Data Teks
        const projData = projects.find(p => p.id === selectedProject);
        const itemData = workItems.find(w => w.id === selectedItem);
        const dateStr = new Date().toLocaleString('id-ID');

        // 4. Tulis Teks (Warna Putih)
        const fontSize = img.width * 0.035; // Ukuran font responsif
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillStyle = 'white';
        ctx.textBaseline = 'top';
        
        const pad = img.width * 0.04; // Padding pinggir
        let textY = footerY + pad;
        const lineHeight = fontSize * 1.5;

        // Baris 1: Nama Proyek
        ctx.fillText(`PROYEK: ${projData?.name || '-'}`, pad, textY);
        textY += lineHeight;

        // Baris 2: Pemberi Kerja
        ctx.fillText(`OWNER: ${projData?.client_name || '-'}`, pad, textY);
        textY += lineHeight;

        // Baris 3: Kontraktor
        ctx.fillText(`KONTRAKTOR: ${projData?.contractor_name || '-'}`, pad, textY);
        textY += lineHeight;

        // Baris 4: Item Pekerjaan & Cuaca
        ctx.fillText(`KEGIATAN: ${itemData?.name || 'Umum'} | ${weather}`, pad, textY);
        textY += lineHeight;

        // Baris 5: Koordinat & Waktu
        ctx.fillText(`LOKASI: ${location?.lat.toFixed(5)}, ${location?.lng.toFixed(5)}`, pad, textY);
        textY += lineHeight;
        ctx.fillText(`WAKTU: ${dateStr}`, pad, textY);

        // 5. Convert balik ke File
        canvas.toBlob((blob) => {
          if (blob) resolve(new File([blob], originalFile.name, { type: 'image/jpeg' }));
          else resolve(originalFile);
        }, 'image/jpeg', 0.85);
      };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedProject || !location) {
      alert("Mohon lengkapi Data!");
      return;
    }

    setLoading(true);
    try {
      // PROSES WATERMARK DULU SEBELUM UPLOAD
      const fileToUpload = await processWatermark(file);

      // Upload
      const fileName = `${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage.from("report-images").upload(`${selectedProject}/${fileName}`, fileToUpload);
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("report-images").getPublicUrl(`${selectedProject}/${fileName}`);

      // Simpan DB
      const { error: dbErr } = await supabase.from("reports").insert({
        project_id: selectedProject,
        work_item_id: selectedItem || null,
        description_text: description,
        photo_url: urlData.publicUrl,
        gps_lat: location.lat,
        gps_long: location.lng,
        claimed_progress: claimedProgress,
        weather_info: weather,
        created_at: new Date().toISOString(),
      });

      if (dbErr) throw dbErr;

      // Siapkan Pesan WA
      const projName = projects.find(p => p.id === selectedProject)?.name;
      const gmaps = `https://maps.google.com/?q=${location.lat},${location.lng}`;
      const msg = `*LAPORAN BARU* %0A🏗️ ${projName} %0A📊 Prog: ${claimedProgress}% %0A🌦️ ${weather} %0A📍 ${gmaps} %0A📷 ${urlData.publicUrl}`;
      
      setSuccessData(msg);
      setFile(null); setPreviewUrl(null); setDescription(""); setClaimedProgress(0);

    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="min-h-screen bg-green-50 p-6 flex flex-col items-center justify-center text-center font-sans">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"><CheckCircle className="w-10 h-10 text-green-600"/></div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Terkirim!</h2>
        <p className="text-gray-600 mb-8">Foto sudah diberi watermark & disimpan.</p>
        <a href={`https://wa.me/?text=${successData}`} target="_blank" className="w-full bg-green-600 text-white py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"><Share2/> Kirim WA</a>
        <button onClick={() => setSuccessData(null)} className="mt-6 text-gray-500 underline">Lapor Lagi</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4 text-gray-800">Lapor Lapangan 👷‍♂️</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-xl shadow-sm">
        {/* PROYEK */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Proyek</label>
          <select className="w-full p-3 border rounded-lg mt-1 bg-white" value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} required>
            <option value="">-- Pilih Proyek --</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        {/* PEKERJAAN */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Pekerjaan</label>
          <select className="w-full p-3 border rounded-lg mt-1 bg-white" value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)}>
            <option value="">-- Jenis Kegiatan --</option>
            {workItems.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>

        {/* CUACA */}
        <div className="bg-blue-50 p-3 rounded-lg flex items-center gap-3 border border-blue-100">
          <CloudRain className="text-blue-500 w-6 h-6" />
          <div>
            <p className="text-xs text-blue-400 font-bold uppercase">Cuaca (Otomatis)</p>
            <p className="text-sm font-bold text-blue-900">{weather}</p>
          </div>
        </div>

        {/* PROGRESS */}
        <div>
           <div className="flex justify-between"><label className="text-xs font-bold text-gray-500 uppercase">Klaim Progres</label><span className="text-blue-600 font-bold">{claimedProgress}%</span></div>
           <input type="range" min="0" max="100" step="5" value={claimedProgress} onChange={(e) => setClaimedProgress(Number(e.target.value))} className="w-full mt-2" />
        </div>

        {/* KAMERA */}
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center relative bg-gray-50">
          <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="absolute inset-0 opacity-0 z-10 w-full h-full" required />
          {previewUrl ? <img src={previewUrl} className="h-48 w-full object-cover rounded shadow-sm" /> : <div className="text-gray-400 py-4"><Camera className="w-10 h-10 mx-auto mb-2"/><span className="text-sm">Ambil Foto</span></div>}
        </div>

        {/* GPS */}
        <div className="flex items-center gap-2 text-xs bg-gray-100 p-3 rounded text-gray-600">
          <MapPin className="w-4 h-4 text-red-500" />
          {location ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : "Mencari Lokasi..."}
        </div>

        <textarea placeholder="Catatan..." className="w-full p-3 border rounded-lg h-24" value={description} onChange={(e) => setDescription(e.target.value)} />

        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold flex justify-center items-center gap-2">
          {loading ? <Loader2 className="animate-spin" /> : <Send className="w-5 h-5" />} Kirim Laporan
        </button>
      </form>
    </div>
  );
}