"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import StatsCard from "../components/StatsCard";
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
  const [busqueda, setBusqueda] = useState("");
  const [moduloFiltro, setModuloFiltro] = useState("TODOS");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [cargando, setCargando] = useState(true);

  const cargarRegistros = async () => {
    setCargando(true);

    const { data, error } = await supabase
      .from("registro_sistema")
      .select("*")
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

  const registrosFiltrados = useMemo(() => {
    return registros.filter((registro) => {
      const texto = busqueda.toLowerCase();

      const coincideBusqueda =
        registro.modulo.toLowerCase().includes(texto) ||
        registro.accion.toLowerCase().includes(texto) ||
        registro.descripcion.toLowerCase().includes(texto) ||
        (registro.usuario_nombre || "").toLowerCase().includes(texto) ||
        (registro.usuario_rol || "").toLowerCase().includes(texto) ||
        (registro.referencia_tabla || "").toLowerCase().includes(texto);

      const coincideModulo =
        moduloFiltro === "TODOS" || registro.modulo === moduloFiltro;

      const fechaRegistro = new Date(registro.created_at);

      const coincideDesde = fechaDesde
        ? fechaRegistro >= new Date(`${fechaDesde}T00:00:00`)
        : true;

      const coincideHasta = fechaHasta
        ? fechaRegistro <= new Date(`${fechaHasta}T23:59:59`)
        : true;

      return coincideBusqueda && coincideModulo && coincideDesde && coincideHasta;
    });
  }, [registros, busqueda, moduloFiltro, fechaDesde, fechaHasta]);

  const contarModulo = (modulo: string) => {
    return registrosFiltrados.filter((registro) => registro.modulo === modulo)
      .length;
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setModuloFiltro("TODOS");
    setFechaDesde("");
    setFechaHasta("");
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <main className="min-h-screen bg-[#F4F6F9] text-[#0B1220]">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="flex min-h-screen flex-1 flex-col">
          <Header />

          <div className="flex-1 p-8">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-[0.25em] text-[#D9A520]">
                  Registro operacional
                </p>

                <h1 className="text-4xl font-black text-[#0B1F3A]">
                  Registro general
                </h1>

                <p className="mt-2 max-w-2xl text-slate-500">
                  Historial completo de movimientos registrados en el sistema.
                </p>

                <div className="mt-4 h-1 w-16 rounded-full bg-[#D9A520]" />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={cargarRegistros}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#0B1F3A] shadow-sm transition hover:bg-slate-50"
                >
                  Actualizar
                </button>

                <button
                  onClick={() => generarPDFRegistroSistema(registrosFiltrados)}
                  className="rounded-xl bg-[#0B1F3A] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#163B73]"
                >
                  Descargar registro general
                </button>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-4 xl:grid-cols-6">
              <StatsCard
                title="Total"
                value={String(registrosFiltrados.length)}
                description="Registros filtrados"
                highlighted
              />

              {modulosDisponibles.slice(0, 5).map((modulo) => (
                <StatsCard
                  key={modulo}
                  title={modulo}
                  value={String(contarModulo(modulo))}
                  description="Movimientos"
                />
              ))}
            </div>

            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_240px_170px_170px_140px]">
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por módulo, acción, descripción, usuario o rol..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#D9A520] focus:ring-4 focus:ring-[#D9A520]/10"
                />

                <select
                  value={moduloFiltro}
                  onChange={(e) => setModuloFiltro(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#D9A520] focus:ring-4 focus:ring-[#D9A520]/10"
                >
                  <option value="TODOS">Todos los módulos</option>

                  {modulosDisponibles.map((modulo) => (
                    <option key={modulo} value={modulo}>
                      {modulo}
                    </option>
                  ))}
                </select>

                <input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#D9A520] focus:ring-4 focus:ring-[#D9A520]/10"
                />

                <input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#D9A520] focus:ring-4 focus:ring-[#D9A520]/10"
                />

                <button
                  onClick={limpiarFiltros}
                  className="rounded-xl border border-slate-200 bg-[#F8FAFC] px-5 py-3 text-sm font-bold text-[#0B1F3A] transition hover:bg-slate-100"
                >
                  Limpiar
                </button>
              </div>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-500">
                Resultados encontrados: {registrosFiltrados.length}
              </p>

              {cargando && (
                <p className="text-sm font-bold text-[#0B1F3A]">
                  Cargando registros...
                </p>
              )}
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1150px] border-collapse">
                  <thead className="bg-[#0B1F3A] text-white">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-black uppercase">
                        Fecha
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-black uppercase">
                        Módulo
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-black uppercase">
                        Acción
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-black uppercase">
                        Descripción
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-black uppercase">
                        Usuario
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-black uppercase">
                        Rol
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {cargando ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-5 py-10 text-center font-bold text-[#0B1F3A]"
                        >
                          Cargando registro general...
                        </td>
                      </tr>
                    ) : registrosFiltrados.length > 0 ? (
                      registrosFiltrados.map((registro) => (
                        <tr
                          key={registro.id}
                          className="border-b border-slate-100 hover:bg-[#F8FAFC]"
                        >
                          <td className="px-5 py-4 text-sm text-slate-500">
                            {formatearFecha(registro.created_at)}
                          </td>

                          <td className="px-5 py-4">
                            <span className="rounded-full bg-[#F4F6F9] px-3 py-1 text-xs font-black text-[#0B1F3A]">
                              {registro.modulo}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-sm font-bold text-[#0B1F3A]">
                            {registro.accion}
                          </td>

                          <td className="max-w-[520px] px-5 py-4 text-sm leading-relaxed text-slate-600">
                            {registro.descripcion}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-500">
                            {registro.usuario_nombre || "-"}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-500">
                            {registro.usuario_rol || "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-5 py-10 text-center text-slate-500"
                        >
                          No hay registros para los filtros seleccionados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
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