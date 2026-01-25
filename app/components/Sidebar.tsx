"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { 
  LayoutDashboard, 
  HardHat, 
  ShieldAlert, 
  Package, 
  TrendingUp, 
  LogOut, 
  Menu, 
  X,
  Building2
} from "lucide-react";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false); // Untuk mobile
  const [userRole, setUserRole] = useState<string>("");
  const [logoUrl, setLogoUrl] = useState<string>("");
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Ambil Role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        
        setUserRole(profile?.role || "field_worker");

        // Ambil Logo Perusahaan (Ambil dari Project pertama yg dia punya/terhubung)
        // Logika White Label: Logo diambil dari data project
        const { data: project } = await supabase
          .from("projects")
          .select("contractor_logo_url")
          .limit(1)
          .single();
        
        if (project?.contractor_logo_url) {
          setLogoUrl(project.contractor_logo_url);
        }
      }
    };
    getUserData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Menu berdasarkan Role
  const menus = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard, roles: ["admin", "site_manager", "director"] },
    { name: "Input Lapangan", href: "/submit", icon: HardHat, roles: ["field_worker", "admin"] },
    { name: "Logistik", href: "/logistics", icon: Package, roles: ["admin", "site_manager"] },
    { name: "Executive View", href: "/executive", icon: TrendingUp, roles: ["admin", "director"] },
    { name: "Admin Panel", href: "/admin", icon: ShieldAlert, roles: ["admin"] },
  ];

  // Filter menu yang boleh dilihat user ini
  const filteredMenus = menus.filter(m => m.roles.includes(userRole));

  // Jangan tampilkan sidebar di halaman login atau portal client (Portal punya layout sendiri)
  if (pathname === "/login" || pathname.startsWith("/portal")) return null;

  return (
    <>
      {/* TOMBOL MENU MOBILE */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="lg:hidden fixed top-4 right-4 z-50 bg-white p-2 rounded-lg shadow-md"
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      {/* SIDEBAR CONTAINER */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-slate-900 text-white transition-transform transform z-40
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 shadow-2xl flex flex-col`}
      >
        
        {/* --- BRANDING AREA (LOGO) --- */}
        <div className="h-20 flex items-center justify-center border-b border-slate-800 bg-slate-950 px-4 shadow-sm">
          
          {/* LOGO BRAND ANDA (Hardcode URL Logo Anda disini juga) */}
          <img 
            src="https://prvzdhyyblbsahaxkjlc.supabase.co/storage/v1/object/public/app-assets/logo%20contech.png" 
            alt="Brand" 
            className="h-8 w-auto mr-3" 
          />

          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-wider text-white leading-none">
              KONTRAKTOR
            </span>
            <span className="text-[10px] font-bold text-orange-500 tracking-[0.3em] leading-none">
              PRO APP
            </span>
          </div>
        </div>

        {/* --- NAVIGATION MENU --- */}
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {filteredMenus.map((menu) => {
            const isActive = pathname === menu.href;
            return (
              <Link 
                key={menu.name} 
                href={menu.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
              >
                <menu.icon size={20} className={isActive ? "text-white" : "text-slate-500 group-hover:text-white"} />
                <span className="font-medium text-sm">{menu.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* --- FOOTER (LOGOUT) --- */}
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-950/30 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm">Keluar Aplikasi</span>
          </button>
        </div>

      </div>
    </>
  );
}