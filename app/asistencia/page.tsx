"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import StatsCard from "../components/StatsCard";
import { supabase } from "../lib/supabase";
import { generarPDFAsistencia } from "../lib/generarPDFAsistencia";

type Turno = {
  id: string;
  usuario_id: string | null;
  nombre_conserje: string;
  rol: string | null;
  tipo_turno: string;
  hora_inicio: string;
  hora_termino: string | null;
  estado: string;
  created_at: string;
};

const meses = [
  { value: "0", label: "Enero" },
  { value: "1", label: "Febrero" },
  { value: "2", label: "Marzo" },
  { value: "3", label: "Abril" },
  { value: "4", label: "Mayo" },
  { value: "5", label: "Junio" },
  { value: "6", label: "Julio" },
  { value: "7", label: "Agosto" },
  { value: "8", label: "Septiembre" },
  { value: "9", label: "Octubre" },
  { value: "10", label: "Noviembre" },
  { value: "11", label: "Diciembre" },
];

export default function AsistenciaPage() {
  const fechaActual = new Date();

  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [mesSeleccionado, setMesSeleccionado] = useState(
    String(fechaActual.getMonth())
  );
  const [anioSeleccionado, setAnioSeleccionado] = useState(
    String(fechaActual.getFullYear())
  );
  const [conserjeSeleccionado, setConserjeSeleccionado] = useState("TODOS");
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("TODOS");
  const [cargando, setCargando] = useState(true);

  const cargarTurnos = async () => {
    setCargando(true);

    const { data, error } = await supabase
      .from("turnos")
      .select("*")
      .order("hora_inicio", { ascending: false });

    if (error) {
      console.error(error);
      alert(`Error al cargar asistencia: ${error.message}`);
      setCargando(false);
      return;
    }

    setTurnos(data || []);
    setCargando(false);
  };

  useEffect(() => {
    cargarTurnos();
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

  const calcularDuracion = (inicio: string, termino: string | null) => {
    if (!termino) return "En curso";

    const inicioDate = new Date(inicio).getTime();
    const terminoDate = new Date(termino).getTime();

    const diferenciaMs = terminoDate - inicioDate;

    if (diferenciaMs <= 0) return "0h 0m";

    const totalMinutos = Math.floor(diferenciaMs / 60000);
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;

    return `${horas}h ${minutos}m`;
  };

  const calcularHorasNumero = (inicio: string, termino: string | null) => {
    if (!termino) return 0;

    const inicioDate = new Date(inicio).getTime();
    const terminoDate = new Date(termino).getTime();

    const diferenciaMs = terminoDate - inicioDate;

    if (diferenciaMs <= 0) return 0;

    return diferenciaMs / 1000 / 60 / 60;
  };

  const conserjesDisponibles = useMemo(() => {
    const nombres = turnos.map((turno) => turno.nombre_conserje).filter(Boolean);

    return Array.from(new Set(nombres));
  }, [turnos]);

  const aniosDisponibles = useMemo(() => {
    const anios = turnos.map((turno) =>
      String(new Date(turno.hora_inicio).getFullYear())
    );

    const unicos = Array.from(new Set(anios));

    if (!unicos.includes(String(fechaActual.getFullYear()))) {
      unicos.push(String(fechaActual.getFullYear()));
    }

    return unicos.sort((a, b) => Number(b) - Number(a));
  }, [turnos]);

  const turnosFiltrados = turnos.filter((turno) => {
    const texto = busqueda.toLowerCase();
    const fechaTurno = new Date(turno.hora_inicio);

    const coincideBusqueda =
      turno.nombre_conserje.toLowerCase().includes(texto) ||
      (turno.rol || "").toLowerCase().includes(texto) ||
      turno.tipo_turno.toLowerCase().includes(texto) ||
      turno.estado.toLowerCase().includes(texto);

    const coincideMes =
      String(fechaTurno.getMonth()) === String(mesSeleccionado);

    const coincideAnio =
      String(fechaTurno.getFullYear()) === String(anioSeleccionado);

    const coincideConserje =
      conserjeSeleccionado === "TODOS" ||
      turno.nombre_conserje === conserjeSeleccionado;

    const coincideEstado =
      estadoSeleccionado === "TODOS" || turno.estado === estadoSeleccionado;

    return (
      coincideBusqueda &&
      coincideMes &&
      coincideAnio &&
      coincideConserje &&
      coincideEstado
    );
  });

  const turnosActivos = turnosFiltrados.filter(
    (turno) => turno.estado === "ACTIVO"
  );

  const turnosFinalizados = turnosFiltrados.filter(
    (turno) => turno.estado === "FINALIZADO"
  );

  const totalHoras = turnosFiltrados.reduce((total, turno) => {
    return total + calcularHorasNumero(turno.hora_inicio, turno.hora_termino);
  }, 0);

  const limpiarFiltros = () => {
    setBusqueda("");
    setMesSeleccionado(String(fechaActual.getMonth()));
    setAnioSeleccionado(String(fechaActual.getFullYear()));
    setConserjeSeleccionado("TODOS");
    setEstadoSeleccionado("TODOS");
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
                  Control de asistencia
                </p>

                <h1 className="text-4xl font-black text-[#0B1F3A]">
                  Historial de asistencia
                </h1>

                <p className="mt-2 max-w-2xl text-slate-500">
                  Registro mensual de ingresos, salidas y duración de turnos del
                  personal de conserjería.
                </p>

                <div className="mt-4 h-1 w-16 rounded-full bg-[#D9A520]" />
              </div>

              <button
                onClick={() => generarPDFAsistencia(turnosFiltrados)}
                className="w-fit rounded-xl bg-[#0B1F3A] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#163B73]"
              >
                Descargar PDF
              </button>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-4">
              <StatsCard
                title="Registros"
                value={String(turnosFiltrados.length)}
                description="Turnos filtrados"
                highlighted
              />

              <StatsCard
                title="Activos"
                value={String(turnosActivos.length)}
                description="Turnos en curso"
              />

              <StatsCard
                title="Finalizados"
                value={String(turnosFinalizados.length)}
                description="Turnos cerrados"
              />

              <StatsCard
                title="Horas"
                value={`${totalHoras.toFixed(1)}`}
                description="Total realizadas"
              />
            </div>

            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                    Buscar
                  </label>

                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por conserje, rol, turno o estado..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#D9A520] focus:ring-4 focus:ring-[#D9A520]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                    Conserje
                  </label>

                  <select
                    value={conserjeSeleccionado}
                    onChange={(e) => setConserjeSeleccionado(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#D9A520] focus:ring-4 focus:ring-[#D9A520]/10"
                  >
                    <option value="TODOS">Todos</option>

                    {conserjesDisponibles.map((nombre) => (
                      <option key={nombre} value={nombre}>
                        {nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                    Mes
                  </label>

                  <select
                    value={mesSeleccionado}
                    onChange={(e) => setMesSeleccionado(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#D9A520] focus:ring-4 focus:ring-[#D9A520]/10"
                  >
                    {meses.map((mes) => (
                      <option key={mes.value} value={mes.value}>
                        {mes.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                    Año
                  </label>

                  <select
                    value={anioSeleccionado}
                    onChange={(e) => setAnioSeleccionado(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#D9A520] focus:ring-4 focus:ring-[#D9A520]/10"
                  >
                    {aniosDisponibles.map((anio) => (
                      <option key={anio} value={anio}>
                        {anio}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                    Estado
                  </label>

                  <select
                    value={estadoSeleccionado}
                    onChange={(e) => setEstadoSeleccionado(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#D9A520] focus:ring-4 focus:ring-[#D9A520]/10 md:w-64"
                  >
                    <option value="TODOS">Todos</option>
                    <option value="ACTIVO">Activo</option>
                    <option value="FINALIZADO">Finalizado</option>
                  </select>
                </div>

                <button
                  onClick={limpiarFiltros}
                  className="w-fit rounded-xl border border-slate-200 bg-[#F8FAFC] px-5 py-3 text-sm font-bold text-[#0B1F3A] transition hover:bg-slate-100"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse">
                  <thead className="bg-[#0B1F3A] text-white">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-black uppercase">
                        Conserje
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-black uppercase">
                        Rol
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-black uppercase">
                        Turno
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-black uppercase">
                        Inicio
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-black uppercase">
                        Término
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-black uppercase">
                        Duración
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-black uppercase">
                        Estado
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {cargando ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-5 py-10 text-center font-bold text-[#0B1F3A]"
                        >
                          Cargando asistencia...
                        </td>
                      </tr>
                    ) : turnosFiltrados.length > 0 ? (
                      turnosFiltrados.map((turno) => (
                        <tr
                          key={turno.id}
                          className="border-b border-slate-100 hover:bg-[#F8FAFC]"
                        >
                          <td className="px-5 py-4 font-bold text-[#0B1F3A]">
                            {turno.nombre_conserje}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-500">
                            {turno.rol || "-"}
                          </td>

                          <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                            {turno.tipo_turno}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-500">
                            {formatearFecha(turno.hora_inicio)}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-500">
                            {formatearFecha(turno.hora_termino)}
                          </td>

                          <td className="px-5 py-4 text-sm font-bold text-[#0B1F3A]">
                            {calcularDuracion(
                              turno.hora_inicio,
                              turno.hora_termino
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-black ${
                                turno.estado === "ACTIVO"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {turno.estado}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-5 py-10 text-center text-slate-500"
                        >
                          No se encontraron registros de asistencia para los
                          filtros seleccionados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <footer className="mt-auto flex items-center justify-between bg-[#0B1F3A] px-8 py-4 text-sm text-white">
            <p>
              © 2026 Control Conserjería. Todos los derechos reservados.
            </p>
            <p>Versión 1.0.0</p>
          </footer>
        </section>
      </div>
    </main>
  );
}