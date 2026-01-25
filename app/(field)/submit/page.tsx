"use client";

import { createClient } from "@/utils/supabase/client"; 
import { useState, useEffect } from "react";
import { Camera, MapPin, Send, Loader2, Share2, CheckCircle, CloudRain, Hammer, Building2, FileText } from "lucide-react";

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
  const [weather, setWeather] = useState<string>("Mencari data cuaca...");
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: pData } = await supabase.from("projects").select("id, name, contractor_name, client_name");
      if (pData) setProjects(pData);
      const { data: wData } = await supabase.from("work_items").select("*");
      if (wData) setWorkItems(wData);
    };
    fetchData();
    
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

  const processWatermark = async (originalFile: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(originalFile);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(originalFile);
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Watermark Style Baru (Lebih Modern)
        const footerH = img.height * 0.35;
        const footerY = img.height - footerH;
        
        // Gradient Background
        const gradient = ctx.createLinearGradient(0, footerY, 0, img.height);
        gradient.addColorStop(0, "rgba(0,0,0,0)");
        gradient.addColorStop(0.3, "rgba(0,0,0,0.7)");
        gradient.addColorStop(1, "rgba(0,0,0,0.9)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, footerY, img.width, footerH);

        const projData = projects.find(p => p.id === selectedProject);
        const itemData = workItems.find(w => w.id === selectedItem);
        const dateStr = new Date().toLocaleString('id-ID');

        const fontSize = img.width * 0.035;
        ctx.font = `600 ${fontSize}px sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.textBaseline = 'top';
        
        const pad = img.width * 0.05;
        let textY = footerY + (pad * 1.5);
        const lineHeight = fontSize * 1.6;

        ctx.fillStyle = '#fbbf24'; // Warna Kuning Emas untuk Judul
        ctx.fillText(`${projData?.name || 'PROYEK'}`, pad, textY);
        
        ctx.fillStyle = '#ffffff'; // Kembali Putih
        textY += lineHeight * 1.2;
        ctx.fillText(`📍 ${location?.lat.toFixed(5)}, ${location?.lng.toFixed(5)}`, pad, textY);
        textY += lineHeight;
        ctx.fillText(`🔨 ${itemData?.name || 'Kegiatan Umum'}`, pad, textY);
        textY += lineHeight;
        ctx.fillText(`🌤️ ${weather}`, pad, textY);
        textY += lineHeight;
        ctx.fillText(`🕒 ${dateStr}`, pad, textY);

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
    if (!file || !selectedProject || !location) return alert("Mohon lengkapi Data!");
    setLoading(true);
    try {
      const fileToUpload = await processWatermark(file);
      const fileName = `${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage.from("report-images").upload(`${selectedProject}/${fileName}`, fileToUpload);
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("report-images").getPublicUrl(`${selectedProject}/${fileName}`);

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
      <div className="min-h-screen bg-white p-6 flex flex-col items-center justify-center text-center font-sans">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 ring-4 ring-green-100">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Laporan Diterima!</h2>
        <p className="text-slate-500 mb-8 max-w-xs mx-auto">Data telah tersimpan di server dan siap dipantau.</p>
        <a href={`https://wa.me/?text=${successData}`} target="_blank" className="w-full max-w-sm bg-[#25D366] text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-green-200 hover:bg-green-600 flex items-center justify-center gap-3 transition transform active:scale-95">
          <Share2 size={24}/> Lapor ke Grup WA
        </a>
        <button onClick={() => setSuccessData(null)} className="mt-6 text-slate-400 font-medium text-sm hover:text-slate-600">Buat Laporan Baru</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-20 font-sans">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Lapor Lapangan</h1>
          <p className="text-sm text-slate-500">Update progres harian proyek.</p>
        </div>
      
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* SELECTION CARD */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <div className="relative">
              <Building2 className="absolute left-3 top-3.5 text-blue-500 w-5 h-5"/>
              <select className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none font-medium text-slate-700" value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} required>
                <option value="">Pilih Proyek...</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div className="relative">
              <Hammer className="absolute left-3 top-3.5 text-orange-500 w-5 h-5"/>
              <select className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none appearance-none font-medium text-slate-700" value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)}>
                <option value="">Pilih Kegiatan...</option>
                {workItems.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
          </div>

          {/* WEATHER & GPS CARD */}
          <div className="flex gap-3">
            <div className="flex-1 bg-blue-50 p-3 rounded-2xl border border-blue-100 flex items-center gap-3">
              <div className="bg-white p-2 rounded-full shadow-sm"><CloudRain className="text-blue-500 w-5 h-5" /></div>
              <div>
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wide">Cuaca</p>
                <p className="text-xs font-bold text-blue-900 truncate">{weather}</p>
              </div>
            </div>
            <div className="flex-1 bg-emerald-50 p-3 rounded-2xl border border-emerald-100 flex items-center gap-3">
              <div className="bg-white p-2 rounded-full shadow-sm"><MapPin className="text-emerald-500 w-5 h-5" /></div>
              <div>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wide">GPS</p>
                <p className="text-xs font-bold text-emerald-900 truncate">{location ? "Terkunci" : "Mencari..."}</p>
              </div>
            </div>
          </div>

          {/* CAMERA CARD (BIG) */}
          <div className="relative group cursor-pointer">
            <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="absolute inset-0 opacity-0 z-20 w-full h-full cursor-pointer" required />
            <div className={`aspect-[4/3] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden relative z-10 
              ${previewUrl ? 'border-blue-500 bg-black' : 'border-slate-300 bg-white hover:bg-slate-50'}`}>
              
              {previewUrl ? (
                <img src={previewUrl} className="w-full h-full object-contain" />
              ) : (
                <div className="text-center p-6">
                  <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Camera className="w-8 h-8 text-blue-600"/>
                  </div>
                  <span className="block font-bold text-slate-700">Ambil Foto Bukti</span>
                  <span className="text-xs text-slate-400 mt-1">Tap disini untuk buka kamera</span>
                </div>
              )}
            </div>
          </div>

          {/* PROGRESS & NOTE */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <div>
               <div className="flex justify-between mb-2">
                 <label className="text-xs font-bold text-slate-400 uppercase">Estimasi Progres</label>
                 <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded text-xs">{claimedProgress}%</span>
               </div>
               <input type="range" min="0" max="100" step="5" value={claimedProgress} onChange={(e) => setClaimedProgress(Number(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
            </div>
            
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-slate-400 w-5 h-5"/>
              <textarea placeholder="Catatan lapangan (Kendala, material, dll)..." className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm h-24 resize-none" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>

          <button type="submit" disabled={loading || !location} className="w-full bg-slate-900 text-white p-4 rounded-2xl font-bold flex justify-center items-center gap-2 hover:bg-black shadow-xl shadow-slate-200 active:scale-95 transition disabled:opacity-70 disabled:active:scale-100">
            {loading ? <Loader2 className="animate-spin" /> : <><Send className="w-5 h-5" /> Kirim Laporan</>}
          </button>
        </form>
      </div>
    </div>
  );
}