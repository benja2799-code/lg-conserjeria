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
  estado: string | null;
  created_at: string | null;
};

export default function NovedadesPage() {
  const [novedades, setNovedades] = useState<Novedad[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

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

  const cerrarFormulario = () => {
    limpiarFormulario();
    setMostrarFormulario(false);
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

    const estadoInicial = tipo === "INCIDENTE" ? "ABIERTA" : "REGISTRADA";

    const { data, error } = await supabase
      .from("novedades")
      .insert({
        tipo,
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        responsable: responsable.trim() || "Conserjería",
        estado: estadoInicial,
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
    setMostrarFormulario(false);
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
        (novedad.estado || "").toLowerCase().includes(texto)
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

        <section className="flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden">
          <Header />

          <div className="min-w-0 flex-1 overflow-x-hidden p-8">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
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

              <button
                type="button"
                onClick={() => setMostrarFormulario((actual) => !actual)}
                className={`w-fit rounded-xl px-5 py-3 text-sm font-bold shadow-md transition ${
                  mostrarFormulario
                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                    : "bg-[#0B1F3A] text-white hover:bg-[#163B73]"
                }`}
              >
                {mostrarFormulario ? "Cerrar formulario" : "+ Nueva novedad"}
              </button>
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

            {mostrarFormulario && (
              <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-[#0B1F3A]">
                      Nueva novedad
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Completa los datos para registrar un evento del turno.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={cerrarFormulario}
                    className="w-fit rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-2 text-sm font-bold text-[#0B1F3A] transition hover:bg-slate-100"
                  >
                    Cancelar
                  </button>
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
                    <Campo
                      label="Título"
                      value={titulo}
                      onChange={setTitulo}
                      placeholder="Ej: Ronda nocturna, ruido, mantención"
                    />
                  </div>

                  <Campo
                    label="Responsable"
                    value={responsable}
                    onChange={setResponsable}
                    placeholder="Ej: Conserjería"
                  />
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
                    type="button"
                    onClick={registrarNovedad}
                    className="rounded-xl bg-[#0B1F3A] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#163B73]"
                  >
                    Guardar novedad
                  </button>

                  <button
                    type="button"
                    onClick={limpiarFormulario}
                    className="rounded-xl border border-slate-200 bg-[#F8FAFC] px-5 py-3 text-sm font-bold text-[#0B1F3A] transition hover:bg-slate-100"
                  >
                    Limpiar
                  </button>
                </div>
              </section>
            )}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-black text-[#0B1F3A]">
                    Listado de novedades
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Eventos registrados actualmente en el sistema.
                  </p>
                </div>

                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar novedad..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#D9A520] md:w-72"
                />
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full table-fixed border-collapse text-sm">
                  <thead className="bg-[#0B1F3A] text-white">
                    <tr>
                      <th className="w-[15%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Fecha
                      </th>
                      <th className="w-[13%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Tipo
                      </th>
                      <th className="w-[20%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Título
                      </th>
                      <th className="w-[25%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Descripción
                      </th>
                      <th className="w-[12%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Estado
                      </th>
                      <th className="w-[15%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Acciones
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {cargando ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-8 text-center text-sm font-bold text-[#0B1F3A]"
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
                          <td className="px-3 py-3 align-top">
                            <p className="text-xs text-slate-500">
                              {formatearFecha(novedad.created_at)}
                            </p>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <span
                              className={`inline-flex max-w-full rounded-full px-2.5 py-1 text-[10px] font-black ${
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

                          <td className="px-3 py-3 align-top">
                            <div className="min-w-0">
                              <p className="truncate text-xs font-black text-[#0B1F3A]">
                                {novedad.titulo || "-"}
                              </p>
                              <p className="truncate text-[11px] text-slate-400">
                                Resp.: {novedad.responsable || "-"}
                              </p>
                            </div>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <p className="truncate text-xs text-slate-600">
                              {novedad.descripcion || "-"}
                            </p>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <span
                              className={`inline-flex max-w-full rounded-full px-2.5 py-1 text-[10px] font-black ${
                                novedad.estado === "ABIERTA"
                                  ? "bg-green-100 text-green-700"
                                  : novedad.estado === "CERRADA"
                                  ? "bg-slate-100 text-slate-500"
                                  : "bg-blue-50 text-blue-700"
                              }`}
                            >
                              {novedad.estado || "-"}
                            </span>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <div className="flex flex-col gap-1.5">
                              {novedad.estado === "ABIERTA" && (
                                <button
                                  type="button"
                                  onClick={() => cerrarNovedad(novedad)}
                                  className="rounded-lg bg-green-50 px-2 py-1.5 text-[11px] font-bold text-green-700 transition hover:bg-green-100"
                                >
                                  Cerrar
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => eliminarNovedad(novedad)}
                                className="rounded-lg bg-red-50 px-2 py-1.5 text-[11px] font-bold text-red-600 transition hover:bg-red-100"
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
                          colSpan={6}
                          className="px-4 py-8 text-center text-sm text-slate-500"
                        >
                          No se encontraron novedades.
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

type CampoProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

function Campo({ label, value, onChange, placeholder = "" }: CampoProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520]"
      />
    </div>
  );
}