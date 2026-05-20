"use client";

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

  return (
    <aside className="w-72 bg-[#061A33] text-white">
      <div className="p-6">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#D4AF37]">LG</h1>
          <p className="text-sm font-semibold">LG Seguridad SPA</p>
          <p className="text-xs text-slate-300">y Diseño</p>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item, index) => {
            const activo = pathname === item.href;

            return (
              <div key={item.label}>
                {index === 1 && (
                  <p className="pt-4 pb-2 text-xs font-semibold uppercase text-[#D4AF37]">
                    Control conserjería
                  </p>
                )}

                <Link
                  href={item.href}
                  className={`block rounded-xl px-4 py-3 font-semibold transition ${
                    activo
                      ? "bg-white text-[#061A33]"
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
    </aside>
  );
}