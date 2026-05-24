"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { supabase } from "../lib/supabase";
import { generarPDFRegistroSistema } from "../lib/generarPDFRegistroSistema";

type RegistroSistema = {
  id: string;
  modulo: string;
  accion: string;
  descripcion: string;
  usuario_nombre: string | null;
  usuario_rol: string | null;
  referencia_id: string | null;
  referencia_tabla: string | null;
  created_at: string;
};

export default function RegistroGeneralPage() {
  const [registros, setRegistros] = useState<RegistroSistema[]>([]);
  const [cargando, setCargando] = useState(true);
  const [descargando, setDescargando] = useState(false);

  const cargarRegistros = async () => {
    setCargando(true);

    const { data, error } = await supabase
      .from("registro_sistema")
      .select(
        `
        id,
        modulo,
        accion,
        descripcion,
        usuario_nombre,
        usuario_rol,
        referencia_id,
        referencia_tabla,
        created_at
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al cargar registro general:", error);
      alert(`Error al cargar registro general: ${error.message}`);
      setCargando(false);
      return;
    }

    setRegistros((data || []) as RegistroSistema[]);
    setCargando(false);
  };

  useEffect(() => {
    cargarRegistros();
  }, []);

  const modulosDisponibles = useMemo(() => {
    return Array.from(new Set(registros.map((registro) => registro.modulo))).sort();
  }, [registros]);

  const descargarPDF = async () => {
    if (registros.length === 0) {
      alert("No hay registros para descargar.");
      return;
    }

    setDescargando(true);

    try {
      generarPDFRegistroSistema(registros);
    } catch (error) {
      console.error("Error al descargar PDF:", error);
      alert("No se pudo descargar el PDF.");
    }

    setDescargando(false);
  };

  const ultimaActualizacion = registros[0]?.created_at
    ? new Date(registros[0].created_at).toLocaleString("es-CL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Sin registros";

  return (
    <main className="min-h-screen bg-[#F4F6F9] text-[#0B1220]">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden">
          <Header />

          <div className="flex min-w-0 flex-1 items-center justify-center overflow-x-hidden p-8">
            <section className="w-full max-w-5xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div>
                  <p className="mb-3 text-xs font-black uppercase tracking-[0.28em] text-[#D9A520]">
                    Auditoría del sistema
                  </p>

                  <h1 className="text-4xl font-black leading-tight text-[#0B1F3A] md:text-5xl">
                    Registro general
                  </h1>

                  <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-500">
                    Descarga un informe PDF con el historial completo de acciones
                    registradas en el sistema: visitas, encomiendas, novedades,
                    reservas, asistencia, departamentos y demás módulos conectados.
                  </p>

                  <div className="mt-6 h-1 w-20 rounded-full bg-[#D9A520]" />

                  <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl bg-[#F8FAFC] p-5">
                      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                        Total registros
                      </p>
                      <p className="mt-2 text-3xl font-black text-[#0B1F3A]">
                        {cargando ? "..." : registros.length}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#F8FAFC] p-5">
                      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                        Módulos
                      </p>
                      <p className="mt-2 text-3xl font-black text-[#0B1F3A]">
                        {cargando ? "..." : modulosDisponibles.length}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#F8FAFC] p-5">
                      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                        Último registro
                      </p>
                      <p className="mt-2 text-sm font-bold leading-relaxed text-[#0B1F3A]">
                        {ultimaActualizacion}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.7rem] bg-[#0B1F3A] p-7 text-white shadow-xl">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-3xl">
                    📄
                  </div>

                  <p className="mb-2 text-xs font-black uppercase tracking-[0.24em] text-[#D9A520]">
                    Informe PDF
                  </p>

                  <h2 className="text-2xl font-black">
                    Descargar registro completo
                  </h2>

                  <p className="mt-3 text-sm leading-relaxed text-slate-300">
                    El archivo se generará con todos los movimientos guardados en
                    la tabla de auditoría del sistema.
                  </p>

                  <button
                    onClick={descargarPDF}
                    disabled={cargando || descargando || registros.length === 0}
                    className="mt-7 flex w-full items-center justify-center gap-3 rounded-2xl bg-[#D9A520] px-6 py-4 text-sm font-black text-[#0B1F3A] shadow-lg transition hover:scale-[1.02] hover:bg-[#E8B93A] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span>{descargando ? "Generando PDF..." : "Descargar PDF"}</span>
                    <span className="text-lg">↓</span>
                  </button>

                  <button
                    onClick={cargarRegistros}
                    disabled={cargando}
                    className="mt-3 w-full rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {cargando ? "Actualizando..." : "Actualizar registros"}
                  </button>

                  <div className="mt-6 border-t border-white/10 pt-5">
                    <p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-400">
                      Módulos detectados
                    </p>

                    {modulosDisponibles.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {modulosDisponibles.map((modulo) => (
                          <span
                            key={modulo}
                            className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-100"
                          >
                            {modulo}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">
                        Aún no hay módulos registrados.
                      </p>
                    )}
                  </div>
                </div>
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