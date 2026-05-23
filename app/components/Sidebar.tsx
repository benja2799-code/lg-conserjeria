"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type RolUsuario = "ADMINISTRADOR" | "SUPERVISOR" | "CONSERJE" | "SIN ROL";

type MenuItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

function HomeIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 11l9-8 9 8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10v10h14V10" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11a4 4 0 10-8 0" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 21a8 8 0 0116 0" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v5l3 2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 22a10 10 0 100-20 10 10 0 000 20z" />
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.3 7L12 12l8.7-5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 22V12" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3M16 7V3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 11h16" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5h14a2 2 0 012 2v13a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 21h16" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 21V3h12v18" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a4 4 0 100-8 4 4 0 000 8z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 21a8 8 0 0116 0" />
    </svg>
  );
}

function CarIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 17h14l-1.5-6.5A2 2 0 0015.5 9h-7a2 2 0 00-2 1.5L5 17z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17v2M17 17v2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 13h.01M17 13h.01" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.3 4.3l.4-1.8h2.6l.4 1.8a8.1 8.1 0 012.1.9l1.6-1 1.8 1.8-1 1.6c.4.7.7 1.4.9 2.1l1.8.4v2.6l-1.8.4a8.1 8.1 0 01-.9 2.1l1 1.6-1.8 1.8-1.6-1a8.1 8.1 0 01-2.1.9l-.4 1.8h-2.6l-.4-1.8a8.1 8.1 0 01-2.1-.9l-1.6 1-1.8-1.8 1-1.6a8.1 8.1 0 01-.9-2.1l-1.8-.4v-2.6l1.8-.4c.2-.7.5-1.4.9-2.1l-1-1.6 1.8-1.8 1.6 1c.7-.4 1.4-.7 2.1-.9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
    </svg>
  );
}

const menuItems: MenuItem[] = [
  { label: "Inicio", href: "/", icon: <HomeIcon /> },
  { label: "Libro de novedades", href: "/novedades", icon: <BookIcon /> },
  { label: "Visitas", href: "/visitas", icon: <UsersIcon /> },
  { label: "Historial visitas", href: "/historial-visitas", icon: <ClockIcon /> },
  { label: "Encomiendas", href: "/encomiendas", icon: <PackageIcon /> },
  { label: "Historial encomiendas", href: "/historial-encomiendas", icon: <ClockIcon /> },
  { label: "Reserva espacios", href: "/reservas", icon: <CalendarIcon /> },
  { label: "Historial asistencia", href: "/asistencia", icon: <ClockIcon /> },
  { label: "Departamentos", href: "/departamentos", icon: <BuildingIcon /> },
  { label: "Residentes", href: "/residentes", icon: <UserIcon /> },
  { label: "Vehículos", href: "/vehiculos", icon: <CarIcon /> },
  { label: "Configuración", href: "/configuracion", icon: <SettingsIcon /> },
  { label: "Registro general", href: "/registro-general", icon: <BookIcon /> },
];

export default function Sidebar() {
  const pathname = usePathname();

  const [rol, setRol] = useState<RolUsuario>("SIN ROL");
  const [nombreEdificio, setNombreEdificio] = useState("Edificio Los Alerces");
  const [direccion, setDireccion] = useState("Av. Alemania 1234, Temuco");

  useEffect(() => {
    const cargarDatos = () => {
      const usuarioGuardado = localStorage.getItem("usuarioSistema");

      if (usuarioGuardado) {
        try {
          const usuario = JSON.parse(usuarioGuardado);
          setRol(usuario.rol || "SIN ROL");
        } catch {
          setRol("SIN ROL");
        }
      }

      const configuracionGuardada = localStorage.getItem("configuracion");

      if (configuracionGuardada) {
        try {
          const configuracion = JSON.parse(configuracionGuardada);
          setNombreEdificio(configuracion.nombreEdificio || "Edificio Los Alerces");
          setDireccion(configuracion.direccion || "Av. Alemania 1234, Temuco");
        } catch {
          setNombreEdificio("Edificio Los Alerces");
          setDireccion("Av. Alemania 1234, Temuco");
        }
      }
    };

    cargarDatos();

    window.addEventListener("storage", cargarDatos);

    return () => {
      window.removeEventListener("storage", cargarDatos);
    };
  }, []);

  const menuFiltrado = menuItems.filter((item) => {
    const esAdminSupervisor = rol === "ADMINISTRADOR" || rol === "SUPERVISOR";

    if (esAdminSupervisor) {
      return true;
    }

    const menuPermitidoConserje = [
      "Inicio",
      "Libro de novedades",
      "Visitas",
      "Historial visitas",
      "Encomiendas",
      "Historial encomiendas",
      "Reserva espacios",
    ];

    return menuPermitidoConserje.includes(item.label);
  });

  return (
    <aside className="sticky top-0 hidden h-screen w-[300px] shrink-0 overflow-y-auto bg-[#081E38] px-6 py-8 text-white lg:block">
      <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white text-2xl font-black text-[#0B1F3A] shadow-md">
            <img
              src="/logo_LG.png"
              alt="Logo LG"
              className="h-full w-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <span className="absolute">LG</span>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#D9A520]">
              Control
            </p>
            <h2 className="text-xl font-black leading-tight">Conserjería</h2>
          </div>
        </div>

        <h3 className="text-2xl font-black leading-tight">{nombreEdificio}</h3>

        <p className="mt-3 text-sm leading-relaxed text-slate-200">
          {direccion}
        </p>

        <div className="mt-5 h-1 w-20 rounded-full bg-[#D9A520]" />
      </div>

      <div className="mb-5">
        <p className="mb-4 text-xs font-black uppercase tracking-[0.25em] text-[#D9A520]">
          Módulos del sistema
        </p>

        <nav className="space-y-2">
          {menuFiltrado.map((item) => {
            const activo =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-bold transition ${
                  activo
                    ? "bg-white text-[#0B1F3A] shadow-md"
                    : "text-slate-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span
                  className={`transition ${
                    activo ? "text-[#0B1F3A]" : "text-slate-300 group-hover:text-white"
                  }`}
                >
                  {item.icon}
                </span>

                <span>{item.label}</span>

                {activo && (
                  <span className="ml-auto h-8 w-1 rounded-full bg-[#D9A520]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
        <p className="text-xs font-black uppercase text-[#D9A520]">
          Rol activo
        </p>

        <p className="mt-2 text-sm font-black uppercase text-white">
          {rol}
        </p>

        <p className="mt-2 text-xs leading-relaxed text-slate-300">
          Sistema de control operacional.
        </p>
      </div>
    </aside>
  );
}