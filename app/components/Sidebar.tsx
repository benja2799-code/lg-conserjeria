"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { obtenerRol } from "../lib/permisos";
import { supabase } from "../lib/supabase";

type IconProps = {
  className?: string;
};

function HomeIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 11l9-8 9 8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10v10h5v-6h4v6h5V10" />
    </svg>
  );
}

function BookIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15z" />
    </svg>
  );
}

function UsersIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4h-1" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20H4v-2a4 4 0 014-4h1" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a4 4 0 100-8 4 4 0 000 8z" />
    </svg>
  );
}

function ClockIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
    </svg>
  );
}

function PackageIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.3 7L12 12l8.7-5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 22V12" />
    </svg>
  );
}

function CalendarIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function BuildingIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 21h16" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 21V3h12v18" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1" />
    </svg>
  );
}

function UserIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 22a8 8 0 0116 0" />
    </svg>
  );
}

function CarIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13l2-5a3 3 0 012.8-2h8.4A3 3 0 0119 8l2 5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13h14v6H5z" />
      <circle cx="7.5" cy="18.5" r="1.5" />
      <circle cx="16.5" cy="18.5" r="1.5" />
    </svg>
  );
}

function SettingsIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 01-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.6V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1-1.6 1.7 1.7 0 00-1.9.3l-.1.1A2 2 0 014.2 17l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.6-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.6-1 1.7 1.7 0 00-.3-1.9l-.1-.1A2 2 0 017 4.2l.1.1a1.7 1.7 0 001.9.3A1.7 1.7 0 0010 3V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.6 1.7 1.7 0 001.9-.3l.1-.1A2 2 0 0119.8 7l-.1.1a1.7 1.7 0 00-.3 1.9 1.7 1.7 0 001.6 1h.1a2 2 0 010 4H21a1.7 1.7 0 00-1.6 1z" />
    </svg>
  );
}

const menuItems = [
  { label: "Inicio", href: "/", icon: HomeIcon },
  { label: "Libro de novedades", href: "/novedades", icon: BookIcon },
  { label: "Visitas", href: "/visitas", icon: UsersIcon },
  { label: "Historial visitas", href: "/historial-visitas", icon: ClockIcon },
  { label: "Encomiendas", href: "/encomiendas", icon: PackageIcon },
  { label: "Historial encomiendas", href: "/historial-encomiendas", icon: ClockIcon },
  { label: "Reserva espacios", href: "/reservas", icon: CalendarIcon },
  { label: "Departamentos", href: "/departamentos", icon: BuildingIcon },
  { label: "Residentes", href: "/residentes", icon: UserIcon },
  { label: "Vehículos", href: "/vehiculos", icon: CarIcon },
  { label: "Configuración", href: "/configuracion", icon: SettingsIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  const [nombreEdificio, setNombreEdificio] = useState("Edificio Los Alerces");
  const [direccion, setDireccion] = useState("Av. Alemania 1234, Temuco");
  const [rol, setRol] = useState<string | null>(null);

  useEffect(() => {
  const cargarDatosSidebar = async () => {
    const configuracionGuardada = localStorage.getItem("configuracion");

    if (configuracionGuardada) {
      const configuracion = JSON.parse(configuracionGuardada);

      setNombreEdificio(configuracion.nombreEdificio || "Edificio Los Alerces");
      setDireccion(configuracion.direccion || "Av. Alemania 1234, Temuco");
    }

    const {
      data: { user },
      error: errorUser,
    } = await supabase.auth.getUser();

    if (errorUser || !user) {
      setRol(null);
      return;
    }

    const { data: perfil, error: errorPerfil } = await supabase
      .from("usuarios")
      .select("rol, activo")
      .eq("id", user.id)
      .single();

    if (errorPerfil || !perfil || !perfil.activo) {
      setRol(null);
      return;
    }

    setRol(perfil.rol);
  };

  cargarDatosSidebar();
}, []);

  const menuFiltrado = menuItems.filter((item) => {
  if (
    item.label === "Configuración" &&
    rol !== "ADMINISTRADOR" &&
    rol !== "SUPERVISOR"
  ) {
    return false;
  }

  return true;
});
  

  return (
    <aside className="w-72 bg-[#0B1F3A] text-white">
      <div className="flex min-h-screen flex-col justify-between p-6">
        <div>
          <div className="mb-8 rounded-2xl border border-white/10 bg-[#061A33] p-5 shadow-lg">
            <div className="mb-5 flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-md">
                <img
                  src="/logo_LG.png"
                  alt="Logo LG"
                  className="h-full w-full object-contain p-2"
                />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-[#D9A520]">
                  Control
                </p>

                <p className="text-lg font-black leading-tight text-white">
                  Conserjería
                </p>
              </div>
            </div>

            <h1 className="text-xl font-black leading-tight text-white">
              {nombreEdificio}
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              {direccion}
            </p>

            <div className="mt-4 h-1 w-16 rounded-full bg-[#D9A520]" />
          </div>

          <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-[#D9A520]">
            Módulos del sistema
          </p>

          <nav className="space-y-2">
            {menuFiltrado.map((item) => {
              const activo = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`relative flex items-center gap-3 rounded-xl px-4 py-3 font-bold transition ${
                    activo
                      ? "bg-white text-[#0B1F3A] shadow-md"
                      : "text-slate-200 hover:bg-white/10"
                  }`}
                >
                  {activo && (
                    <span className="absolute right-0 top-2 h-8 w-1 rounded-l-full bg-[#D9A520]" />
                  )}

                  <Icon
                    className={`h-5 w-5 ${
                      activo ? "text-[#0B1F3A]" : "text-slate-300"
                    }`}
                  />

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-black uppercase text-[#D9A520]">
            Rol activo
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-200">
            {rol || "Sin rol"}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            Sistema de control operacional
          </p>
        </div>
      </div>
    </aside>
  );
}