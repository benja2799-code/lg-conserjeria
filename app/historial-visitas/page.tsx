"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import StatsCard from "../components/StatsCard";
import { supabase } from "../lib/supabase";

type Departamento = {
  id: string;
  numero: string;
};

type Visita = {
  id: string;
  departamento_id: string | null;
  nombre_visitante: string;
  rut_visitante: string | null;
  motivo: string | null;
  autorizado_por: string | null;
  patente: string | null;
  observacion: string | null;
  estado: string | null;
  hora_ingreso: string | null;
  hora_salida: string | null;
};

export default function HistorialVisitasPage() {
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("TODOS");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [cargando, setCargando] = useState(true);

  const cargarDepartamentos = async () => {
    const { data, error } = await supabase
      .from("departamentos")
      .select("id, numero")
      .order("numero", { ascending: true });

    if (error) {
      console.error("Error al cargar departamentos:", error);
      return;
    }

    setDepartamentos(data || []);
  };

  const cargarVisitas = async () => {
    setCargando(true);

    const { data, error } = await supabase
      .from("visitas")
      .select("*")
      .order("hora_ingreso", { ascending: false });

    if (error) {
      console.error("Error al cargar historial de visitas:", error);
      alert(`Error al cargar historial de visitas: ${error.message}`);
      setCargando(false);
      return;
    }

    setVisitas((data || []) as Visita[]);
    setCargando(false);
  };

  useEffect(() => {
    cargarDepartamentos();
    cargarVisitas();
  }, []);

  const obtenerNumeroDepartamento = (id: string | null) => {
    if (!id) return "-";

    const departamento = departamentos.find((depto) => depto.id === id);

    return departamento?.numero || "-";
  };

  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return "-";

    return new Date(fecha).toLocaleString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calcularDuracion = (ingreso: string | null, salida: string | null) => {
    if (!ingreso || !salida) return "-";

    const inicio = new Date(ingreso).getTime();
    const termino = new Date(salida).getTime();

    const diferenciaMs = termino - inicio;

    if (diferenciaMs <= 0) return "-";

    const minutosTotales = Math.floor(diferenciaMs / 60000);
    const horas = Math.floor(minutosTotales / 60);
    const minutos = minutosTotales % 60;

    if (horas <= 0) return `${minutos} min`;

    return `${horas} h ${minutos} min`;
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setEstadoFiltro("TODOS");
    setFechaDesde("");
    setFechaHasta("");
  };

  const visitasFiltradas = useMemo(() => {
    const texto = busqueda.toLowerCase();

    return visitas.filter((visita) => {
      const numeroDepto = obtenerNumeroDepartamento(
        visita.departamento_id
      ).toLowerCase();

      const coincideBusqueda =
        (visita.nombre_visitante || "").toLowerCase().includes(texto) ||
        (visita.rut_visitante || "").toLowerCase().includes(texto) ||
        (visita.motivo || "").toLowerCase().includes(texto) ||
        (visita.autorizado_por || "").toLowerCase().includes(texto) ||
        (visita.patente || "").toLowerCase().includes(texto) ||
        (visita.observacion || "").toLowerCase().includes(texto) ||
        (visita.estado || "").toLowerCase().includes(texto) ||
        numeroDepto.includes(texto);

      const coincideEstado =
        estadoFiltro === "TODOS" || visita.estado === estadoFiltro;

      const fechaIngreso = visita.hora_ingreso
        ? new Date(visita.hora_ingreso)
        : null;

      const coincideDesde =
        fechaDesde && fechaIngreso
          ? fechaIngreso >= new Date(`${fechaDesde}T00:00:00`)
          : true;

      const coincideHasta =
        fechaHasta && fechaIngreso
          ? fechaIngreso <= new Date(`${fechaHasta}T23:59:59`)
          : true;

      return (
        coincideBusqueda && coincideEstado && coincideDesde && coincideHasta
      );
    });
  }, [
    visitas,
    busqueda,
    estadoFiltro,
    fechaDesde,
    fechaHasta,
    departamentos,
  ]);

  const totalVisitas = visitas.length;

  const visitasDentro = visitas.filter(
    (visita) => visita.estado === "DENTRO"
  ).length;

  const visitasSalieron = visitas.filter(
    (visita) => visita.estado === "SALIO"
  ).length;

  const visitasConPatente = visitas.filter(
    (visita) => visita.patente && visita.patente.trim() !== ""
  ).length;

  return (
    <main className="min-h-screen bg-[#F4F6F9] text-[#0B1220]">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden">
          <Header />

          <div className="min-w-0 flex-1 overflow-x-hidden p-8">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-[0.25em] text-[#D9A520]">
                  Control histórico
                </p>

                <h1 className="text-4xl font-black text-[#0B1F3A]">
                  Historial de visitas
                </h1>

                <p className="mt-2 max-w-2xl text-slate-500">
                  Consulta el registro completo de ingresos y salidas de
                  visitantes del edificio.
                </p>

                <div className="mt-4 h-1 w-16 rounded-full bg-[#D9A520]" />
              </div>

              <button
                onClick={cargarVisitas}
                className="w-fit rounded-xl bg-[#0B1F3A] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#163B73]"
              >
                Actualizar historial
              </button>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-4">
              <StatsCard
                title="Total"
                value={String(totalVisitas)}
                description="Visitas registradas"
                highlighted
              />

              <StatsCard
                title="Dentro"
                value={String(visitasDentro)}
                description="Visitantes activos"
              />

              <StatsCard
                title="Salieron"
                value={String(visitasSalieron)}
                description="Visitas cerradas"
              />

              <StatsCard
                title="Con patente"
                value={String(visitasConPatente)}
                description="Vehículos asociados"
              />
            </div>

            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_180px_160px_160px_120px]">
                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por visitante, RUT, depto, patente, motivo..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#D9A520]"
                />

                <select
                  value={estadoFiltro}
                  onChange={(e) => setEstadoFiltro(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#D9A520]"
                >
                  <option value="TODOS">Todos</option>
                  <option value="DENTRO">Dentro</option>
                  <option value="SALIO">Salieron</option>
                </select>

                <input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#D9A520]"
                />

                <input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#D9A520]"
                />

                <button
                  onClick={limpiarFiltros}
                  className="rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-2.5 text-sm font-bold text-[#0B1F3A] transition hover:bg-slate-100"
                >
                  Limpiar
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-black text-[#0B1F3A]">
                    Registros encontrados
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Mostrando {visitasFiltradas.length} de {visitas.length}{" "}
                    registros.
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full table-fixed border-collapse text-sm">
                  <thead className="bg-[#0B1F3A] text-white">
                    <tr>
                      <th className="w-[16%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Visitante
                      </th>
                      <th className="w-[12%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        RUT
                      </th>
                      <th className="w-[9%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Depto
                      </th>
                      <th className="w-[16%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Motivo
                      </th>
                      <th className="w-[15%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Ingreso
                      </th>
                      <th className="w-[15%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Salida
                      </th>
                      <th className="w-[8%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Tiempo
                      </th>
                      <th className="w-[9%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Estado
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {cargando ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-4 py-8 text-center text-sm font-bold text-[#0B1F3A]"
                        >
                          Cargando historial de visitas...
                        </td>
                      </tr>
                    ) : visitasFiltradas.length > 0 ? (
                      visitasFiltradas.map((visita) => (
                        <tr
                          key={visita.id}
                          className="border-b border-slate-100 hover:bg-[#F8FAFC]"
                        >
                          <td className="px-3 py-3 align-top">
                            <div className="min-w-0">
                              <p className="truncate text-xs font-black text-[#0B1F3A]">
                                {visita.nombre_visitante}
                              </p>
                              <p className="truncate text-[11px] text-slate-400">
                                Patente: {visita.patente || "-"}
                              </p>
                            </div>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <p className="truncate text-xs text-slate-500">
                              {visita.rut_visitante || "-"}
                            </p>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <p className="truncate text-sm font-black text-[#0B1F3A]">
                              {obtenerNumeroDepartamento(visita.departamento_id)}
                            </p>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <div className="min-w-0">
                              <p className="truncate text-xs text-slate-600">
                                {visita.motivo || "-"}
                              </p>
                              <p className="truncate text-[11px] text-slate-400">
                                Aut.: {visita.autorizado_por || "-"}
                              </p>
                            </div>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <p className="text-xs text-slate-500">
                              {formatearFecha(visita.hora_ingreso)}
                            </p>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <p className="text-xs text-slate-500">
                              {formatearFecha(visita.hora_salida)}
                            </p>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <p className="text-xs font-bold text-slate-600">
                              {calcularDuracion(
                                visita.hora_ingreso,
                                visita.hora_salida
                              )}
                            </p>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <span
                              className={`inline-flex max-w-full rounded-full px-2.5 py-1 text-[10px] font-black ${
                                visita.estado === "DENTRO"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {visita.estado || "-"}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-4 py-8 text-center text-sm text-slate-500"
                        >
                          No se encontraron visitas para los filtros
                          seleccionados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
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