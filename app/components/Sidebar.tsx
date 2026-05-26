"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type ConfiguracionSistema = {
  nombre_edificio: string | null;
  direccion: string | null;
};

type UsuarioLocal = {
  nombre?: string;
  name?: string;
  email?: string;
  rol?: string;
  role?: string;
  tipo?: string;
  tipo_usuario?: string;
  perfil?: string;
};

type IconName =
  | "home"
  | "book"
  | "visits"
  | "history"
  | "box"
  | "calendar"
  | "clock"
  | "building"
  | "resident"
  | "car"
  | "file"
  | "settings";

type MenuItem = {
  label: string;
  href: string;
  icon: IconName;
  roles?: string[];
};

const menuOperacion: MenuItem[] = [
  { label: "Inicio", href: "/", icon: "home" },
  { label: "Libro de novedades", href: "/novedades", icon: "book" },
  { label: "Visitas", href: "/visitas", icon: "visits" },
  { label: "Historial visitas", href: "/historial-visitas", icon: "history" },
  { label: "Encomiendas", href: "/encomiendas", icon: "box" },
  {
    label: "Historial encomiendas",
    href: "/historial-encomiendas",
    icon: "history",
  },
  { label: "Reserva espacios", href: "/reservas", icon: "calendar" },
  { label: "Control asistencia", href: "/asistencia", icon: "clock" },
];

const menuAdministracion: MenuItem[] = [
  { label: "Departamentos", href: "/departamentos", icon: "building" },
  { label: "Residentes", href: "/residentes", icon: "resident" },
  { label: "Vehículos", href: "/vehiculos", icon: "car" },
];

const menuSistema: MenuItem[] = [
  {
    label: "Registro general",
    href: "/registro-general",
    icon: "file",
    roles: ["ADMINISTRADOR", "SUPERVISOR", "ADMIN"],
  },
  {
    label: "Configuración",
    href: "/configuracion",
    icon: "settings",
    roles: ["ADMINISTRADOR", "SUPERVISOR", "ADMIN"],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const [nombreEdificio, setNombreEdificio] = useState("Edificio Los Alerces");
  const [direccion, setDireccion] = useState("Av. Alemania 1234, Temuco");
  const [logoError, setLogoError] = useState(false);

  const [usuario, setUsuario] = useState<UsuarioLocal>({
    nombre: "Usuario",
    rol: "CONSERJE",
  });

  useEffect(() => {
    const cargarConfiguracion = async () => {
      const { data, error } = await supabase
        .from("configuracion_sistema")
        .select("nombre_edificio, direccion")
        .eq("id", "general")
        .maybeSingle();

      if (error) {
        console.error("Error al cargar datos del sidebar:", error);
        return;
      }

      if (data) {
        const config = data as ConfiguracionSistema;

        setNombreEdificio(config.nombre_edificio || "Edificio Los Alerces");
        setDireccion(config.direccion || "Av. Alemania 1234, Temuco");
      }
    };

    cargarConfiguracion();
  }, []);

  useEffect(() => {
  try {
    const posiblesKeys = [
      "usuario",
      "usuarioActivo",
      "user",
      "currentUser",
      "authUser",
      "sesionUsuario",
      "sessionUser",
      "loginUser",
      "rol",
      "role",
    ];

    const limpiarTexto = (valor: any) => {
      return String(valor || "")
        .trim()
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    };

    const normalizarRolDetectado = (valor: any) => {
      const rol = limpiarTexto(valor);

      if (
        rol.includes("ADMIN") ||
        rol.includes("ADMINISTRADOR") ||
        rol.includes("ADMINISTRACION")
      ) {
        return "ADMINISTRADOR";
      }

      if (rol.includes("SUPERVISOR")) {
        return "SUPERVISOR";
      }

      if (
        rol.includes("CONSERJE") ||
        rol.includes("PORTERO") ||
        rol.includes("GUARDIA") ||
        rol.includes("OPERADOR")
      ) {
        return "CONSERJE";
      }

      return "";
    };

    const buscarValor = (objeto: any, campos: string[]): string | null => {
      if (!objeto || typeof objeto !== "object") return null;

      for (const campo of campos) {
        if (objeto[campo]) return String(objeto[campo]);
      }

      for (const key of Object.keys(objeto)) {
        if (typeof objeto[key] === "object") {
          const encontrado = buscarValor(objeto[key], campos);
          if (encontrado) return encontrado;
        }
      }

      return null;
    };

    let usuarioFinal: UsuarioLocal | null = null;

    for (const key of posiblesKeys) {
      const valorLocal = localStorage.getItem(key);
      const valorSession = sessionStorage.getItem(key);
      const valor = valorLocal || valorSession;

      if (!valor) continue;

      try {
        const parseado = JSON.parse(valor);

        const rolEncontrado = buscarValor(parseado, [
          "rol",
          "role",
          "tipo",
          "tipo_usuario",
          "tipoUsuario",
          "perfil",
          "cargo",
        ]);

        const nombreEncontrado = buscarValor(parseado, [
          "nombre",
          "name",
          "email",
          "usuario",
          "username",
        ]);

        const rolNormalizado = normalizarRolDetectado(rolEncontrado);

        if (rolNormalizado || nombreEncontrado) {
          usuarioFinal = {
            nombre: nombreEncontrado || "Usuario",
            rol: rolNormalizado || "CONSERJE",
          };

          break;
        }
      } catch {
        const rolNormalizado = normalizarRolDetectado(valor);

        if (rolNormalizado) {
          usuarioFinal = {
            nombre: "Usuario",
            rol: rolNormalizado,
          };

          break;
        }
      }
    }

    if (usuarioFinal) {
      setUsuario(usuarioFinal);
      console.log("USUARIO DETECTADO SIDEBAR:", usuarioFinal);
    } else {
      setUsuario({
        nombre: "Usuario",
        rol: "CONSERJE",
      });

      console.log("NO SE DETECTÓ ROL, SE ASIGNA CONSERJE");
    }
  } catch (error) {
    console.error("Error al leer usuario local:", error);

    setUsuario({
      nombre: "Usuario",
      rol: "CONSERJE",
    });
  }
}, []);

  const rolNormalizado = useMemo(() => {
    const rol = String(usuario.rol || "CONSERJE").toUpperCase();

    if (rol === "ADMIN") return "ADMIN";
    if (rol === "ADMINISTRADOR") return "ADMINISTRADOR";
    if (rol === "SUPERVISOR") return "SUPERVISOR";
    if (rol === "CONSERJE") return "CONSERJE";

    return "CONSERJE";
  }, [usuario]);

  const nombreUsuario = useMemo(() => {
    return usuario.nombre || usuario.name || usuario.email || "Usuario";
  }, [usuario]);

  const puedeVerItem = (item: MenuItem) => {
    if (!item.roles || item.roles.length === 0) {
      return true;
    }

    return item.roles.includes(rolNormalizado);
  };

  const esActivo = (href: string) => {
    if (href === "/") return pathname === "/";

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const renderMenu = (items: MenuItem[]) => {
    return items.filter(puedeVerItem).map((item) => {
      const activo = esActivo(item.href);

      return (
        <Link
          key={item.href}
          href={item.href}
          className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-bold transition ${
            activo
              ? "bg-white text-[#0B1F3A] shadow-sm"
              : "text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
              activo
                ? "bg-[#F4F6F9] text-[#0B1F3A]"
                : "bg-white/5 text-slate-300 group-hover:bg-white/10 group-hover:text-white"
            }`}
          >
            <SidebarIcon name={item.icon} />
          </span>

          <span className="min-w-0 flex-1 truncate">{item.label}</span>

          {activo && (
            <span className="absolute right-2 h-6 w-1 rounded-full bg-[#D9A520]" />
          )}
        </Link>
      );
    });
  };

  const itemsSistemaVisibles = menuSistema.filter(puedeVerItem);

  return (
    <aside className="sticky top-0 hidden h-screen w-[255px] shrink-0 overflow-y-auto bg-[#071A33] px-4 py-5 text-white shadow-xl lg:block">
      <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1.5 shadow-md">
            {!logoError ? (
              <Image
                src="/logo_LG.png"
                alt="Logo LG"
                width={48}
                height={48}
                className="h-full w-full object-contain"
                priority
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="text-sm font-black text-[#0B1F3A]">LG</span>
            )}
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#D9A520]">
              Control
            </p>

            <h2 className="truncate text-lg font-black leading-tight text-white">
              Conserjería
            </h2>
          </div>
        </div>

        <h3 className="line-clamp-2 text-lg font-black leading-tight text-white">
          {nombreEdificio}
        </h3>

        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-300">
          {direccion}
        </p>

        <div className="mt-4 h-1 w-14 rounded-full bg-[#D9A520]" />
      </div>

      <div className="mb-5 rounded-xl border border-white/10 bg-white/5 p-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D9A520]">
          Usuario activo
        </p>

        <p className="mt-1 truncate text-sm font-black text-white">
          {nombreUsuario}
        </p>

        <p
          className={`mt-1 text-[11px] font-bold uppercase ${
            rolNormalizado === "CONSERJE"
              ? "text-yellow-300"
              : "text-green-300"
          }`}
        >
          {rolNormalizado}
        </p>
      </div>

      <nav className="space-y-5">
        <section>
          <TituloSeccion texto="Operación" />
          <div className="space-y-1.5">{renderMenu(menuOperacion)}</div>
        </section>

        <section>
          <TituloSeccion texto="Administración" />
          <div className="space-y-1.5">{renderMenu(menuAdministracion)}</div>
        </section>

        {itemsSistemaVisibles.length > 0 && (
          <section>
            <TituloSeccion texto="Sistema" />
            <div className="space-y-1.5">{renderMenu(menuSistema)}</div>
          </section>
        )}
      </nav>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-3">
        <p className="text-[11px] leading-relaxed text-slate-400">
          Control operacional de conserjería.
        </p>

        <p className="mt-1 text-[11px] font-bold text-slate-500">
          Versión 1.0.0
        </p>
      </div>
    </aside>
  );
}

function TituloSeccion({ texto }: { texto: string }) {
  return (
    <p className="mb-2 px-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#D9A520]">
      {texto}
    </p>
  );
}

function SidebarIcon({ name }: { name: IconName }) {
  const common = "h-[18px] w-[18px]";

  if (name === "home") {
    return (
      <svg
        className={common}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M3 11.5 12 4l9 7.5" />
        <path d="M5 10.5V20h14v-9.5" />
        <path d="M9 20v-6h6v6" />
      </svg>
    );
  }

  if (name === "book") {
    return (
      <svg
        className={common}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 0-3 0V4Z" />
        <path d="M5 18a3 3 0 0 1 3-3h11" />
      </svg>
    );
  }

  if (name === "visits") {
    return (
      <svg
        className={common}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
        <path d="M16 11h5" />
        <path d="M18.5 8.5 21 11l-2.5 2.5" />
      </svg>
    );
  }

  if (name === "history") {
    return (
      <svg
        className={common}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M3 12a9 9 0 1 0 3-6.7" />
        <path d="M3 4v6h6" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  }

  if (name === "box") {
    return (
      <svg
        className={common}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M21 8 12 3 3 8l9 5 9-5Z" />
        <path d="M3 8v8l9 5 9-5V8" />
        <path d="M12 13v8" />
      </svg>
    );
  }

  if (name === "calendar") {
    return (
      <svg
        className={common}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M7 3v4" />
        <path d="M17 3v4" />
        <path d="M4 8h16" />
        <path d="M5 5h14a2 2 0 0 1 2 2v13H3V7a2 2 0 0 1 2-2Z" />
      </svg>
    );
  }

  if (name === "clock") {
    return (
      <svg
        className={common}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  }

  if (name === "building") {
    return (
      <svg
        className={common}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16" />
        <path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2" />
      </svg>
    );
  }

  if (name === "resident") {
    return (
      <svg
        className={common}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </svg>
    );
  }

  if (name === "car") {
    return (
      <svg
        className={common}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M5 13 7 7h10l2 6" />
        <path d="M4 13h16v5H4z" />
        <circle cx="7" cy="18" r="1.5" />
        <circle cx="17" cy="18" r="1.5" />
      </svg>
    );
  }

  if (name === "file") {
    return (
      <svg
        className={common}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M7 3h7l5 5v13H7z" />
        <path d="M14 3v6h5" />
        <path d="M9 13h6M9 17h6" />
      </svg>
    );
  }

  return (
    <svg
      className={common}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a8 8 0 0 0 .1-6" />
      <path d="M4.5 9a8 8 0 0 0 .1 6" />
      <path d="M8 4.7a8 8 0 0 1 8 0" />
      <path d="M16 19.3a8 8 0 0 1-8 0" />
    </svg>
  );
}