"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import StatsCard from "../components/StatsCard";
import { supabase } from "../lib/supabase";

type Encomienda = {
  id: string;
  departamento_numero: string | null;
  destinatario: string | null;
  empresa: string | null;
  descripcion: string | null;
  recibido_por: string | null;
  entregado_a: string | null;
  observacion: string | null;
  estado: string | null;
  created_at: string | null;
};

export default function HistorialEncomiendasPage() {
  const [encomiendas, setEncomiendas] = useState<Encomienda[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("TODOS");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [cargando, setCargando] = useState(true);

  const cargarEncomiendas = async () => {
    setCargando(true);

    const { data, error } = await supabase
      .from("encomiendas")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al cargar historial de encomiendas:", error);
      alert(`Error al cargar historial de encomiendas: ${error.message}`);
      setCargando(false);
      return;
    }

    setEncomiendas((data || []) as Encomienda[]);
    setCargando(false);
  };

  useEffect(() => {
    cargarEncomiendas();
  }, []);

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

  const limpiarFiltros = () => {
    setBusqueda("");
    setEstadoFiltro("TODOS");
    setFechaDesde("");
    setFechaHasta("");
  };

  const encomiendasFiltradas = useMemo(() => {
    const texto = busqueda.toLowerCase();

    return encomiendas.filter((encomienda) => {
      const coincideBusqueda =
        (encomienda.departamento_numero || "").toLowerCase().includes(texto) ||
        (encomienda.destinatario || "").toLowerCase().includes(texto) ||
        (encomienda.empresa || "").toLowerCase().includes(texto) ||
        (encomienda.descripcion || "").toLowerCase().includes(texto) ||
        (encomienda.recibido_por || "").toLowerCase().includes(texto) ||
        (encomienda.entregado_a || "").toLowerCase().includes(texto) ||
        (encomienda.observacion || "").toLowerCase().includes(texto) ||
        (encomienda.estado || "").toLowerCase().includes(texto);

      const coincideEstado =
        estadoFiltro === "TODOS" || encomienda.estado === estadoFiltro;

      const fechaRegistro = encomienda.created_at
        ? new Date(encomienda.created_at)
        : null;

      const coincideDesde =
        fechaDesde && fechaRegistro
          ? fechaRegistro >= new Date(`${fechaDesde}T00:00:00`)
          : true;

      const coincideHasta =
        fechaHasta && fechaRegistro
          ? fechaRegistro <= new Date(`${fechaHasta}T23:59:59`)
          : true;

      return (
        coincideBusqueda && coincideEstado && coincideDesde && coincideHasta
      );
    });
  }, [encomiendas, busqueda, estadoFiltro, fechaDesde, fechaHasta]);

  const totalEncomiendas = encomiendas.length;

  const encomiendasPendientes = encomiendas.filter(
    (encomienda) => encomienda.estado === "PENDIENTE"
  ).length;

  const encomiendasEntregadas = encomiendas.filter(
    (encomienda) => encomienda.estado === "ENTREGADA"
  ).length;

  const encomiendasConEmpresa = encomiendas.filter(
    (encomienda) => encomienda.empresa && encomienda.empresa.trim() !== ""
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
                  Historial de encomiendas
                </h1>

                <p className="mt-2 max-w-2xl text-slate-500">
                  Consulta el registro histórico de encomiendas recibidas,
                  pendientes y entregadas.
                </p>

                <div className="mt-4 h-1 w-16 rounded-full bg-[#D9A520]" />
              </div>

              <button
                type="button"
                onClick={cargarEncomiendas}
                className="w-fit rounded-xl bg-[#0B1F3A] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#163B73]"
              >
                Actualizar historial
              </button>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-4">
              <StatsCard
                title="Total"
                value={String(totalEncomiendas)}
                description="Encomiendas registradas"
                highlighted
              />

              <StatsCard
                title="Pendientes"
                value={String(encomiendasPendientes)}
                description="Por entregar"
              />

              <StatsCard
                title="Entregadas"
                value={String(encomiendasEntregadas)}
                description="Retiradas"
              />

              <StatsCard
                title="Con empresa"
                value={String(encomiendasConEmpresa)}
                description="Courier registrado"
              />
            </div>

            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_180px_160px_160px_120px]">
                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por depto, destinatario, empresa, descripción..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#D9A520]"
                />

                <select
                  value={estadoFiltro}
                  onChange={(e) => setEstadoFiltro(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#D9A520]"
                >
                  <option value="TODOS">Todos</option>
                  <option value="PENDIENTE">Pendientes</option>
                  <option value="ENTREGADA">Entregadas</option>
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
                  type="button"
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
                    Mostrando {encomiendasFiltradas.length} de{" "}
                    {encomiendas.length} registros.
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full table-fixed border-collapse text-sm">
                  <thead className="bg-[#0B1F3A] text-white">
                    <tr>
                      <th className="w-[13%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Fecha
                      </th>
                      <th className="w-[9%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Depto
                      </th>
                      <th className="w-[17%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Destinatario
                      </th>
                      <th className="w-[16%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Empresa
                      </th>
                      <th className="w-[20%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Descripción
                      </th>
                      <th className="w-[14%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Entregado a
                      </th>
                      <th className="w-[11%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Estado
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {cargando ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-8 text-center text-sm font-bold text-[#0B1F3A]"
                        >
                          Cargando historial de encomiendas...
                        </td>
                      </tr>
                    ) : encomiendasFiltradas.length > 0 ? (
                      encomiendasFiltradas.map((encomienda) => (
                        <tr
                          key={encomienda.id}
                          className="border-b border-slate-100 hover:bg-[#F8FAFC]"
                        >
                          <td className="px-3 py-3 align-top">
                            <p className="text-xs text-slate-500">
                              {formatearFecha(encomienda.created_at)}
                            </p>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <p className="truncate text-sm font-black text-[#0B1F3A]">
                              {encomienda.departamento_numero || "-"}
                            </p>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <p className="truncate text-xs font-bold text-slate-700">
                              {encomienda.destinatario || "-"}
                            </p>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <p className="truncate text-xs text-slate-500">
                              {encomienda.empresa || "-"}
                            </p>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <div className="min-w-0">
                              <p className="truncate text-xs text-slate-600">
                                {encomienda.descripcion || "-"}
                              </p>
                              <p className="truncate text-[11px] text-slate-400">
                                Recibido por: {encomienda.recibido_por || "-"}
                              </p>
                            </div>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <p className="truncate text-xs text-slate-500">
                              {encomienda.entregado_a || "-"}
                            </p>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <span
                              className={`inline-flex max-w-full rounded-full px-2.5 py-1 text-[10px] font-black ${
                                encomienda.estado === "PENDIENTE"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {encomienda.estado || "-"}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-8 text-center text-sm text-slate-500"
                        >
                          No se encontraron encomiendas para los filtros
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