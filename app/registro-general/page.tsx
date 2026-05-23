"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import StatsCard from "../components/StatsCard";
import { supabase } from "../lib/supabase";
import {
  generarPDFRegistroGeneral,
  RegistroGeneral,
} from "../lib/generarPDFRegistroGeneral";

export default function RegistroGeneralPage() {
  const [registros, setRegistros] = useState<RegistroGeneral[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("TODOS");
  const [cargando, setCargando] = useState(true);

  const cargarRegistroGeneral = async () => {
    setCargando(true);

    const registrosGenerales: RegistroGeneral[] = [];

    const { data: visitas } = await supabase
      .from("visitas")
      .select("id, nombre_visitante, motivo, estado, hora_ingreso")
      .order("hora_ingreso", { ascending: false });

    (visitas || []).forEach((visita: any) => {
      registrosGenerales.push({
        id: `visita-${visita.id}`,
        tipo: "VISITA",
        descripcion: `Ingreso de visitante: ${
          visita.nombre_visitante || "Sin nombre"
        }${visita.motivo ? ` - Motivo: ${visita.motivo}` : ""}`,
        responsable: visita.nombre_visitante || "-",
        fecha: visita.hora_ingreso,
        estado: visita.estado || "-",
      });
    });

    const { data: encomiendas } = await supabase
      .from("encomiendas")
      .select("*")
      .order("created_at", { ascending: false });

    (encomiendas || []).forEach((encomienda: any) => {
      registrosGenerales.push({
        id: `encomienda-${encomienda.id}`,
        tipo: "ENCOMIENDA",
        descripcion: `Encomienda registrada para departamento ${
          encomienda.departamento_numero ||
          encomienda.departamento ||
          encomienda.depto ||
          "N/A"
        }`,
        responsable:
          encomienda.recibido_por ||
          encomienda.destinatario ||
          encomienda.nombre_destinatario ||
          "-",
        fecha: encomienda.created_at,
        estado: encomienda.estado || "-",
      });
    });

    const { data: novedades } = await supabase
      .from("novedades")
      .select("*")
      .order("created_at", { ascending: false });

    (novedades || []).forEach((novedad: any) => {
      registrosGenerales.push({
        id: `novedad-${novedad.id}`,
        tipo: "NOVEDAD",
        descripcion:
          novedad.descripcion ||
          novedad.detalle ||
          novedad.titulo ||
          "Novedad registrada",
        responsable:
          novedad.responsable || novedad.registrado_por || "Conserjería",
        fecha: novedad.created_at,
        estado: novedad.estado || novedad.tipo || "-",
      });
    });

    const { data: reservas } = await supabase
      .from("reservas")
      .select("*")
      .order("created_at", { ascending: false });

    (reservas || []).forEach((reserva: any) => {
      registrosGenerales.push({
        id: `reserva-${reserva.id}`,
        tipo: "RESERVA",
        descripcion: `Reserva de ${
          reserva.espacio || reserva.espacio_comun || "espacio común"
        }`,
        responsable:
          reserva.responsable ||
          reserva.nombre_residente ||
          reserva.solicitante ||
          "-",
        fecha: reserva.created_at,
        estado: reserva.estado || "-",
      });
    });

    const { data: turnos } = await supabase
      .from("turnos")
      .select("*")
      .order("hora_inicio", { ascending: false });

    (turnos || []).forEach((turno: any) => {
      registrosGenerales.push({
        id: `turno-${turno.id}`,
        tipo: "ASISTENCIA",
        descripcion: `Turno ${turno.tipo_turno} - ${
          turno.estado === "FINALIZADO" ? "finalizado" : "activo"
        }`,
        responsable: turno.nombre_conserje || "-",
        fecha: turno.hora_inicio,
        estado: turno.estado || "-",
      });
    });

    registrosGenerales.sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );

    setRegistros(registrosGenerales);
    setCargando(false);
  };

  useEffect(() => {
    cargarRegistroGeneral();
  }, []);

  const registrosFiltrados = registros.filter((registro) => {
    const texto = busqueda.toLowerCase();

    const coincideBusqueda =
      registro.tipo.toLowerCase().includes(texto) ||
      registro.descripcion.toLowerCase().includes(texto) ||
      registro.responsable.toLowerCase().includes(texto) ||
      registro.estado.toLowerCase().includes(texto);

    const coincideTipo =
      tipoFiltro === "TODOS" || registro.tipo === tipoFiltro;

    return coincideBusqueda && coincideTipo;
  });

  const totalVisitas = registrosFiltrados.filter(
    (r) => r.tipo === "VISITA"
  ).length;

  const totalEncomiendas = registrosFiltrados.filter(
    (r) => r.tipo === "ENCOMIENDA"
  ).length;

  const totalNovedades = registrosFiltrados.filter(
    (r) => r.tipo === "NOVEDAD"
  ).length;

  const totalReservas = registrosFiltrados.filter(
    (r) => r.tipo === "RESERVA"
  ).length;

  const totalAsistencia = registrosFiltrados.filter(
    (r) => r.tipo === "ASISTENCIA"
  ).length;

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

              <button
                onClick={() => generarPDFRegistroGeneral(registrosFiltrados)}
                className="w-fit rounded-xl bg-[#0B1F3A] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#163B73]"
              >
                Descargar registro general PDF
              </button>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-6">
              <StatsCard
                title="Total"
                value={String(registrosFiltrados.length)}
                description="Registros filtrados"
                highlighted
              />

              <StatsCard
                title="Visitas"
                value={String(totalVisitas)}
                description="Ingresos"
              />

              <StatsCard
                title="Encomiendas"
                value={String(totalEncomiendas)}
                description="Paquetes"
              />

              <StatsCard
                title="Novedades"
                value={String(totalNovedades)}
                description="Eventos"
              />

              <StatsCard
                title="Reservas"
                value={String(totalReservas)}
                description="Espacios"
              />

              <StatsCard
                title="Asistencia"
                value={String(totalAsistencia)}
                description="Turnos"
              />
            </div>

            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_260px]">
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por tipo, descripción, responsable o estado..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#D9A520] focus:ring-4 focus:ring-[#D9A520]/10"
                />

                <select
                  value={tipoFiltro}
                  onChange={(e) => setTipoFiltro(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#D9A520] focus:ring-4 focus:ring-[#D9A520]/10"
                >
                  <option value="TODOS">Todos los tipos</option>
                  <option value="VISITA">Visitas</option>
                  <option value="ENCOMIENDA">Encomiendas</option>
                  <option value="NOVEDAD">Novedades</option>
                  <option value="RESERVA">Reservas</option>
                  <option value="ASISTENCIA">Asistencia</option>
                </select>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] border-collapse">
                  <thead className="bg-[#0B1F3A] text-white">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-black uppercase">
                        Fecha
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-black uppercase">
                        Tipo
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-black uppercase">
                        Descripción
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-black uppercase">
                        Responsable
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
                          colSpan={5}
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
                            {formatearFecha(registro.fecha)}
                          </td>

                          <td className="px-5 py-4">
                            <span className="rounded-full bg-[#F4F6F9] px-3 py-1 text-xs font-black text-[#0B1F3A]">
                              {registro.tipo}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {registro.descripcion}
                          </td>

                          <td className="px-5 py-4 text-sm font-bold text-[#0B1F3A]">
                            {registro.responsable}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-500">
                            {registro.estado}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-5 py-10 text-center text-slate-500"
                        >
                          No se encontraron registros.
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