"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    label: "Inicio",
    href: "/",
  },
  {
    label: "Libro de novedades",
    href: "/novedades",
  },
  {
    label: "Visitas",
    href: "/visitas",
  },
  {
    label: "Historial visitas",
    href: "/historial-visitas",
  },
  {
    label: "Encomiendas",
    href: "/encomiendas",
  },
  {
    label: "Historial encomiendas",
    href: "/historial-encomiendas",
  },
  {
    label: "Reserva espacios",
    href: "/reservas",
  },
  {
    label: "Departamentos",
    href: "/",
  },
  {
    label: "Residentes",
    href: "/residentes",
  },
  {
    label: "Vehículos",
    href: "/vehiculos",
  },
  {
    label: "Configuración",
    href: "/configuracion",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const [nombreEdificio, setNombreEdificio] = useState("Edificio Los Alerces");
  const [direccion, setDireccion] = useState("Av. Alemania 1234, Temuco");

  useEffect(() => {
    const configuracionGuardada = localStorage.getItem("configuracion");

    if (configuracionGuardada) {
      const configuracion = JSON.parse(configuracionGuardada);

      setNombreEdificio(configuracion.nombreEdificio || "Edificio Los Alerces");
      setDireccion(configuracion.direccion || "Av. Alemania 1234, Temuco");
    }
  }, []);

  return (
    <aside className="w-72 bg-[#061A33] text-white">
      <div className="flex min-h-screen flex-col justify-between p-6">
        <div>
          <div className="mb-10 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
              Control Conserjería
            </p>

            <h1 className="mt-3 text-xl font-bold leading-tight text-white">
              {nombreEdificio}
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              {direccion}
            </p>

            <div className="mt-4 h-1 w-16 rounded-full bg-[#D4AF37]" />
          </div>

          <nav className="space-y-2">
            {menuItems.map((item, index) => {
              const activo = pathname === item.href;

              return (
                <div key={item.label}>
                  {index === 1 && (
                    <p className="pt-4 pb-2 text-xs font-semibold uppercase text-[#D4AF37]">
                      Módulos del sistema
                    </p>
                  )}

                  <Link
                    href={item.href}
                    className={`block rounded-xl px-4 py-3 font-semibold transition ${
                      activo
                        ? "bg-white text-[#061A33] shadow-sm"
                        : "text-slate-200 hover:bg-white/10"
                    }`}
                  >
                    {item.label}
                  </Link>
                </div>
              );
            })}
          </nav>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase text-[#D4AF37]">
            Turno activo
          </p>
          <p className="mt-1 text-sm text-slate-200">
            Sistema de control operacional
          </p>
        </div>
      </div>
    </aside>
  );
}