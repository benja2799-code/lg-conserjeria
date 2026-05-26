"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

type ModuloInicio = {
  numero: string;
  categoria: string;
  titulo: string;
  descripcion: string;
  href: string;
  destacado?: boolean;
  roles?: string[];
};

type UsuarioLocal = {
  nombre?: string;
  name?: string;
  email?: string;
  rol?: string;
  role?: string;
  tipo?: string;
  tipo_usuario?: string;
  tipoUsuario?: string;
  perfil?: string;
};

const modulos: ModuloInicio[] = [
  {
    numero: "01",
    categoria: "Gestión",
    titulo: "Departamentos",
    descripcion:
      "Administrar unidades, propietarios y datos generales del edificio.",
    href: "/departamentos",
  },
  {
    numero: "02",
    categoria: "Personas",
    titulo: "Residentes",
    descripcion: "Registro de residentes, contactos y datos de emergencia.",
    href: "/residentes",
  },
  {
    numero: "03",
    categoria: "Control",
    titulo: "Vehículos",
    descripcion:
      "Control de vehículos asociados a departamentos y estacionamientos.",
    href: "/vehiculos",
  },
  {
    numero: "04",
    categoria: "Acceso",
    titulo: "Visitas",
    descripcion: "Registrar ingreso, salida, motivo, autorización y patente.",
    href: "/visitas",
    destacado: true,
  },
  {
    numero: "05",
    categoria: "Historial",
    titulo: "Historial visitas",
    descripcion: "Consultar ingresos, salidas y movimientos históricos.",
    href: "/historial-visitas",
  },
  {
    numero: "06",
    categoria: "Paquetes",
    titulo: "Encomiendas",
    descripcion: "Recepción, seguimiento, entrega e historial de paquetes.",
    href: "/encomiendas",
    destacado: true,
  },
  {
    numero: "07",
    categoria: "Turno",
    titulo: "Libro de novedades",
    descripcion: "Registrar incidentes, rondas y observaciones.",
    href: "/novedades",
    destacado: true,
  },
  {
    numero: "08",
    categoria: "Espacios",
    titulo: "Reservas",
    descripcion: "Control de espacios comunes del edificio.",
    href: "/reservas",
  },
  {
    numero: "09",
    categoria: "Sistema",
    titulo: "Configuración",
    descripcion: "Datos generales del edificio y conserjería.",
    href: "/configuracion",
    roles: ["ADMINISTRADOR", "SUPERVISOR", "ADMIN"],
  },
];

export default function HomePage() {
  const [usuario, setUsuario] = useState<UsuarioLocal>({
    nombre: "Usuario",
    rol: "CONSERJE",
  });

  useEffect(() => {
    try {
      const usuarioGuardado =
        localStorage.getItem("usuario") ||
        localStorage.getItem("usuarioSistema") ||
        localStorage.getItem("usuarioActivo") ||
        localStorage.getItem("user");

      const rolDirecto = localStorage.getItem("rol");

      if (usuarioGuardado) {
        const parseado = JSON.parse(usuarioGuardado);

        setUsuario({
          nombre:
            parseado.nombre ||
            parseado.name ||
            parseado.email ||
            "Usuario",
          rol:
            parseado.rol ||
            parseado.role ||
            parseado.tipo ||
            parseado.tipo_usuario ||
            parseado.tipoUsuario ||
            parseado.perfil ||
            rolDirecto ||
            "CONSERJE",
        });

        return;
      }

      if (rolDirecto) {
        setUsuario({
          nombre: "Usuario",
          rol: rolDirecto,
        });
      }
    } catch (error) {
      console.error("Error al leer usuario en inicio:", error);

      setUsuario({
        nombre: "Usuario",
        rol: "CONSERJE",
      });
    }
  }, []);

  const rolNormalizado = useMemo(() => {
    const rol = String(usuario.rol || "CONSERJE")
      .trim()
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    if (
      rol === "ADMIN" ||
      rol === "ADMINISTRADOR" ||
      rol === "ADMINISTRACION" ||
      rol === "ADMINISTRADOR(A)"
    ) {
      return "ADMINISTRADOR";
    }

    if (rol === "SUPERVISOR" || rol === "SUPERVISORA") {
      return "SUPERVISOR";
    }

    return "CONSERJE";
  }, [usuario]);

  const modulosVisibles = useMemo(() => {
    return modulos.filter((modulo) => {
      if (!modulo.roles || modulo.roles.length === 0) {
        return true;
      }

      return modulo.roles.includes(rolNormalizado);
    });
  }, [rolNormalizado]);

  const destacados = modulosVisibles.filter((modulo) => modulo.destacado).length;

  return (
    <main className="min-h-screen bg-[#F4F6F9] text-[#0B1220]">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden">
          <Header />

          <div className="min-w-0 flex-1 overflow-x-hidden p-8">
            <section className="mb-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className="relative p-8">
                <div className="absolute right-0 top-0 h-40 w-40 rounded-bl-full bg-[#D9A520]/10" />
                <div className="absolute bottom-0 right-20 h-24 w-24 rounded-full bg-[#0B1F3A]/5" />

                <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                  <div>
                    <p className="mb-2 text-xs font-black uppercase tracking-[0.35em] text-[#D9A520]">
                      Accesos principales
                    </p>

                    <h1 className="text-4xl font-black tracking-tight text-[#0B1F3A]">
                      Gestión del sistema
                    </h1>

                    <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-500">
                      Ingresa rápidamente a los módulos operativos de conserjería
                      y administra la información diaria del edificio.
                    </p>

                    <div className="mt-5 h-1 w-16 rounded-full bg-[#D9A520]" />
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <ResumenCard
                      titulo="Módulos"
                      valor={String(modulosVisibles.length)}
                    />

                    <ResumenCard
                      titulo="Operativos"
                      valor={String(destacados)}
                    />

                    <ResumenCard titulo="Estado" valor="Activo" />
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
              <AccesoRapido
                titulo="Registrar visita"
                descripcion="Ingreso rápido de visitantes."
                href="/visitas"
              />

              <AccesoRapido
                titulo="Nueva encomienda"
                descripcion="Recepción de paquetes."
                href="/encomiendas"
              />

              <AccesoRapido
                titulo="Nueva novedad"
                descripcion="Registro de eventos del turno."
                href="/novedades"
              />
            </section>

            <section>
              <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-2xl font-black text-[#0B1F3A]">
                    Módulos disponibles
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Selecciona un módulo para comenzar a trabajar.
                  </p>
                </div>

                <span className="w-fit rounded-full bg-white px-4 py-2 text-xs font-black text-slate-500 shadow-sm">
                  Rol activo: {rolNormalizado}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
                {modulosVisibles.map((modulo) => (
                  <Link
                    key={modulo.href}
                    href={modulo.href}
                    className={`group rounded-[1.6rem] border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
                      modulo.destacado
                        ? "border-[#D9A520]/40"
                        : "border-slate-200 hover:border-[#D9A520]/50"
                    }`}
                  >
                    <div className="flex items-start gap-5">
                      <div
                        className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-lg font-black shadow-md transition ${
                          modulo.destacado
                            ? "bg-[#D9A520] text-white group-hover:bg-[#0B1F3A]"
                            : "bg-[#0B1F3A] text-white group-hover:bg-[#D9A520]"
                        }`}
                      >
                        {modulo.numero}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#D9A520]">
                            {modulo.categoria}
                          </p>

                          {modulo.destacado && (
                            <span className="rounded-full bg-[#FFF7E0] px-3 py-1 text-[10px] font-black uppercase text-[#9A7520]">
                              Diario
                            </span>
                          )}
                        </div>

                        <h3 className="mt-3 text-2xl font-black text-[#0B1F3A]">
                          {modulo.titulo}
                        </h3>

                        <p className="mt-3 min-h-[66px] text-sm leading-relaxed text-slate-500">
                          {modulo.descripcion}
                        </p>

                        <div className="mt-5 flex items-center justify-between">
                          <span className="rounded-full bg-[#F1F5F9] px-4 py-2 text-xs font-black text-slate-500">
                            Módulo activo
                          </span>

                          <span className="text-sm font-black text-[#0B1F3A] transition group-hover:translate-x-1">
                            Entrar →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <footer className="mt-auto flex items-center justify-between bg-[#0B1F3A] px-8 py-4 text-sm text-white">
            <p>© 2026 Control Conserjería. Todos los derechos reservados.</p>
            <p>Versión 1.0.0</p>
          </footer>
        </section>
      </div>
    </main>
  );
}

function ResumenCard({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] px-5 py-4 text-center shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
        {titulo}
      </p>

      <p className="mt-2 text-2xl font-black text-[#0B1F3A]">{valor}</p>
    </div>
  );
}

function AccesoRapido({
  titulo,
  descripcion,
  href,
}: {
  titulo: string;
  descripcion: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[1.5rem] border border-slate-200 bg-[#0B1F3A] p-5 text-white shadow-sm transition hover:-translate-y-1 hover:bg-[#163B73] hover:shadow-md"
    >
      <p className="text-xs font-black uppercase tracking-[0.25em] text-[#D9A520]">
        Acceso rápido
      </p>

      <h3 className="mt-3 text-xl font-black">{titulo}</h3>

      <p className="mt-2 text-sm leading-relaxed text-slate-300">
        {descripcion}
      </p>

      <div className="mt-4 text-sm font-black transition group-hover:translate-x-1">
        Ingresar →
      </div>
    </Link>
  );
}