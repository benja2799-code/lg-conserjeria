"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import StatsCard from "../components/StatsCard";
import { supabase } from "../lib/supabase";
import { registrarEvento } from "../lib/registrarEvento";

type Novedad = {
  id: string;
  tipo: string | null;
  titulo: string | null;
  descripcion: string | null;
  responsable: string | null;
  estado: string;
  created_at: string;
};

export default function NovedadesPage() {
  const [novedades, setNovedades] = useState<Novedad[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  const [tipo, setTipo] = useState("OBSERVACION");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [responsable, setResponsable] = useState("");

  const cargarNovedades = async () => {
    setCargando(true);

    const { data, error } = await supabase
      .from("novedades")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al cargar novedades:", error);
      alert(`Error al cargar novedades: ${error.message}`);
      setCargando(false);
      return;
    }

    setNovedades((data || []) as Novedad[]);
    setCargando(false);
  };

  useEffect(() => {
    cargarNovedades();
  }, []);

  const limpiarFormulario = () => {
    setTipo("OBSERVACION");
    setTitulo("");
    setDescripcion("");
    setResponsable("");
  };

  const registrarNovedad = async () => {
    if (!titulo.trim()) {
      alert("Debes ingresar un título.");
      return;
    }

    if (!descripcion.trim()) {
      alert("Debes ingresar una descripción.");
      return;
    }

    const { data, error } = await supabase
      .from("novedades")
      .insert({
        tipo,
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        responsable: responsable.trim() || "Conserjería",
        estado: tipo === "INCIDENTE" ? "ABIERTA" : "REGISTRADA",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error al registrar novedad:", error);
      alert(`Error al registrar novedad: ${error.message}`);
      return;
    }

    await registrarEvento({
      modulo: "Novedades",
      accion: "Registrar novedad",
      descripcion: `Se registró una novedad tipo ${tipo}: ${titulo.trim()}.`,
      referencia_id: data?.id || null,
      referencia_tabla: "novedades",
    });

    limpiarFormulario();
    await cargarNovedades();

    alert("Novedad registrada correctamente.");
  };

  const cerrarNovedad = async (novedad: Novedad) => {
    const confirmar = confirm(
      `¿Deseas cerrar la novedad "${novedad.titulo || "Sin título"}"?`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("novedades")
      .update({
        estado: "CERRADA",
      })
      .eq("id", novedad.id);

    if (error) {
      console.error("Error al cerrar novedad:", error);
      alert(`Error al cerrar novedad: ${error.message}`);
      return;
    }

    await registrarEvento({
      modulo: "Novedades",
      accion: "Cerrar novedad",
      descripcion: `Se cerró la novedad: ${novedad.titulo || "Sin título"}.`,
      referencia_id: novedad.id,
      referencia_tabla: "novedades",
    });

    await cargarNovedades();
  };

  const eliminarNovedad = async (novedad: Novedad) => {
    const confirmar = confirm(
      `¿Deseas eliminar la novedad "${novedad.titulo || "Sin título"}"?`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("novedades")
      .delete()
      .eq("id", novedad.id);

    if (error) {
      console.error("Error al eliminar novedad:", error);
      alert(`Error al eliminar novedad: ${error.message}`);
      return;
    }

    await registrarEvento({
      modulo: "Novedades",
      accion: "Eliminar novedad",
      descripcion: `Se eliminó la novedad: ${novedad.titulo || "Sin título"}.`,
      referencia_id: novedad.id,
      referencia_tabla: "novedades",
    });

    await cargarNovedades();
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

  const novedadesFiltradas = useMemo(() => {
    const texto = busqueda.toLowerCase();

    return novedades.filter((novedad) => {
      return (
        (novedad.tipo || "").toLowerCase().includes(texto) ||
        (novedad.titulo || "").toLowerCase().includes(texto) ||
        (novedad.descripcion || "").toLowerCase().includes(texto) ||
        (novedad.responsable || "").toLowerCase().includes(texto) ||
        novedad.estado.toLowerCase().includes(texto)
      );
    });
  }, [novedades, busqueda]);

  const totalIncidentes = novedades.filter(
    (novedad) => novedad.tipo === "INCIDENTE"
  ).length;

  const totalObservaciones = novedades.filter(
    (novedad) => novedad.tipo === "OBSERVACION"
  ).length;

  const novedadesAbiertas = novedades.filter(
    (novedad) => novedad.estado === "ABIERTA"
  ).length;

  return (
    <main className="min-h-screen bg-[#F4F6F9] text-[#0B1220]">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="flex min-h-screen flex-1 flex-col">
          <Header />

          <div className="flex-1 p-8">
            <div className="mb-8">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.25em] text-[#D9A520]">
                Libro de turno
              </p>

              <h1 className="text-4xl font-black text-[#0B1F3A]">
                Libro de novedades
              </h1>

              <p className="mt-2 max-w-2xl text-slate-500">
                Registra incidentes, observaciones, rondas y eventos relevantes
                ocurridos durante el turno.
              </p>

              <div className="mt-4 h-1 w-16 rounded-full bg-[#D9A520]" />
            </div>

            <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-4">
              <StatsCard
                title="Total"
                value={String(novedades.length)}
                description="Registros generales"
                highlighted
              />

              <StatsCard
                title="Incidentes"
                value={String(totalIncidentes)}
                description="Eventos críticos"
              />

              <StatsCard
                title="Observaciones"
                value={String(totalObservaciones)}
                description="Notas de turno"
              />

              <StatsCard
                title="Abiertas"
                value={String(novedadesAbiertas)}
                description="Pendientes"
              />
            </div>

            <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-2xl font-black text-[#0B1F3A]">
                  Registrar novedad
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Cada novedad registrada quedará automáticamente en el Registro
                  general del sistema.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                    Tipo
                  </label>

                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520]"
                  >
                    <option value="OBSERVACION">Observación</option>
                    <option value="INCIDENTE">Incidente</option>
                    <option value="RONDA">Ronda</option>
                    <option value="MANTENCION">Mantención</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>

                <div className="xl:col-span-2">
                  <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                    Título
                  </label>

                  <input
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ej: Ruido en departamento, ronda nocturna, incidente en acceso"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                    Responsable
                  </label>

                  <input
                    value={responsable}
                    onChange={(e) => setResponsable(e.target.value)}
                    placeholder="Ej: Conserjería"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520]"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                  Descripción
                </label>

                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe claramente lo ocurrido, hora aproximada, personas involucradas o acciones realizadas."
                  className="min-h-[110px] w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520]"
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={registrarNovedad}
                  className="rounded-xl bg-[#0B1F3A] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#163B73]"
                >
                  Registrar novedad
                </button>

                <button
                  onClick={limpiarFormulario}
                  className="rounded-xl border border-slate-200 bg-[#F8FAFC] px-5 py-3 text-sm font-bold text-[#0B1F3A] transition hover:bg-slate-100"
                >
                  Limpiar
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-black text-[#0B1F3A]">
                    Registros de novedades
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Historial de eventos registrados durante los turnos.
                  </p>
                </div>

                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar novedad..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520] md:w-80"
                />
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px] border-collapse">
                    <thead className="bg-[#0B1F3A] text-white">
                      <tr>
                        <th className="px-5 py-4 text-left text-xs font-black uppercase">
                          Fecha
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-black uppercase">
                          Tipo
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-black uppercase">
                          Título
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
                        <th className="px-5 py-4 text-left text-xs font-black uppercase">
                          Acciones
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
                            Cargando novedades...
                          </td>
                        </tr>
                      ) : novedadesFiltradas.length > 0 ? (
                        novedadesFiltradas.map((novedad) => (
                          <tr
                            key={novedad.id}
                            className="border-b border-slate-100 hover:bg-[#F8FAFC]"
                          >
                            <td className="px-5 py-4 text-sm text-slate-500">
                              {formatearFecha(novedad.created_at)}
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-black ${
                                  novedad.tipo === "INCIDENTE"
                                    ? "bg-red-100 text-red-700"
                                    : novedad.tipo === "RONDA"
                                    ? "bg-blue-100 text-blue-700"
                                    : novedad.tipo === "MANTENCION"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {novedad.tipo || "-"}
                              </span>
                            </td>

                            <td className="px-5 py-4 font-bold text-[#0B1F3A]">
                              {novedad.titulo || "-"}
                            </td>

                            <td className="max-w-[380px] px-5 py-4 text-sm leading-relaxed text-slate-500">
                              {novedad.descripcion || "-"}
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-500">
                              {novedad.responsable || "-"}
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-black ${
                                  novedad.estado === "ABIERTA"
                                    ? "bg-green-100 text-green-700"
                                    : novedad.estado === "CERRADA"
                                    ? "bg-slate-100 text-slate-500"
                                    : "bg-blue-50 text-blue-700"
                                }`}
                              >
                                {novedad.estado}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex flex-wrap gap-2">
                                {novedad.estado === "ABIERTA" && (
                                  <button
                                    onClick={() => cerrarNovedad(novedad)}
                                    className="rounded-lg bg-green-50 px-3 py-2 text-xs font-bold text-green-700 transition hover:bg-green-100"
                                  >
                                    Cerrar
                                  </button>
                                )}

                                <button
                                  onClick={() => eliminarNovedad(novedad)}
                                  className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
                                >
                                  Eliminar
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-5 py-10 text-center text-slate-500"
                          >
                            No se encontraron novedades.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
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