"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import StatsCard from "../components/StatsCard";
import { supabase } from "../lib/supabase";
import { registrarEvento } from "../lib/registrarEvento";

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
  created_at?: string | null;
};

export default function VisitasPage() {
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [nombreVisitante, setNombreVisitante] = useState("");
  const [rutVisitante, setRutVisitante] = useState("");
  const [departamentoId, setDepartamentoId] = useState("");
  const [motivo, setMotivo] = useState("");
  const [autorizadoPor, setAutorizadoPor] = useState("");
  const [patente, setPatente] = useState("");
  const [observacion, setObservacion] = useState("");

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
      console.error("Error al cargar visitas:", error);
      alert(`Error al cargar visitas: ${error.message}`);
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

  const limpiarFormulario = () => {
    setNombreVisitante("");
    setRutVisitante("");
    setDepartamentoId("");
    setMotivo("");
    setAutorizadoPor("");
    setPatente("");
    setObservacion("");
  };

  const cerrarFormulario = () => {
    limpiarFormulario();
    setMostrarFormulario(false);
  };

  const registrarVisita = async () => {
    if (!nombreVisitante.trim()) {
      alert("Debes ingresar el nombre del visitante.");
      return;
    }

    if (!departamentoId) {
      alert("Debes seleccionar un departamento.");
      return;
    }

    const { data, error } = await supabase
      .from("visitas")
      .insert({
        departamento_id: departamentoId,
        nombre_visitante: nombreVisitante.trim(),
        rut_visitante: rutVisitante.trim() || null,
        motivo: motivo.trim() || null,
        autorizado_por: autorizadoPor.trim() || null,
        patente: patente.trim() || null,
        observacion: observacion.trim() || null,
        estado: "DENTRO",
        hora_ingreso: new Date().toISOString(),
        hora_salida: null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error al registrar visita:", error);
      alert(`Error al registrar visita: ${error.message}`);
      return;
    }

    const departamentoNumero = obtenerNumeroDepartamento(departamentoId);

    await registrarEvento({
      modulo: "Visitas",
      accion: "Registrar visita",
      descripcion: `Se registró el ingreso de ${nombreVisitante.trim()} al departamento ${departamentoNumero}.`,
      referencia_id: data?.id || null,
      referencia_tabla: "visitas",
    });

    limpiarFormulario();
    setMostrarFormulario(false);
    await cargarVisitas();

    alert("Visita registrada correctamente.");
  };

  const marcarSalida = async (visita: Visita) => {
    const confirmar = confirm(
      `¿Deseas registrar la salida de ${visita.nombre_visitante}?`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("visitas")
      .update({
        estado: "SALIO",
        hora_salida: new Date().toISOString(),
      })
      .eq("id", visita.id);

    if (error) {
      console.error("Error al marcar salida:", error);
      alert(`Error al marcar salida: ${error.message}`);
      return;
    }

    await registrarEvento({
      modulo: "Visitas",
      accion: "Marcar salida",
      descripcion: `Se registró la salida de ${visita.nombre_visitante}.`,
      referencia_id: visita.id,
      referencia_tabla: "visitas",
    });

    await cargarVisitas();
  };

  const eliminarVisita = async (visita: Visita) => {
    const confirmar = confirm(
      `¿Deseas eliminar el registro de visita de ${visita.nombre_visitante}?`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("visitas")
      .delete()
      .eq("id", visita.id);

    if (error) {
      console.error("Error al eliminar visita:", error);
      alert(`Error al eliminar visita: ${error.message}`);
      return;
    }

    await registrarEvento({
      modulo: "Visitas",
      accion: "Eliminar visita",
      descripcion: `Se eliminó el registro de visita de ${visita.nombre_visitante}.`,
      referencia_id: visita.id,
      referencia_tabla: "visitas",
    });

    await cargarVisitas();
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

  const visitasFiltradas = useMemo(() => {
    const texto = busqueda.toLowerCase();

    return visitas.filter((visita) => {
      const numeroDepto = obtenerNumeroDepartamento(
        visita.departamento_id
      ).toLowerCase();

      return (
        (visita.nombre_visitante || "").toLowerCase().includes(texto) ||
        (visita.rut_visitante || "").toLowerCase().includes(texto) ||
        (visita.motivo || "").toLowerCase().includes(texto) ||
        (visita.autorizado_por || "").toLowerCase().includes(texto) ||
        (visita.patente || "").toLowerCase().includes(texto) ||
        (visita.observacion || "").toLowerCase().includes(texto) ||
        (visita.estado || "").toLowerCase().includes(texto) ||
        numeroDepto.includes(texto)
      );
    });
  }, [visitas, busqueda, departamentos]);

  const visitasDentro = visitas.filter((visita) => visita.estado === "DENTRO");
  const visitasSalieron = visitas.filter((visita) => visita.estado === "SALIO");

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
                  Control de acceso
                </p>

                <h1 className="text-4xl font-black text-[#0B1F3A]">
                  Visitas
                </h1>

                <p className="mt-2 max-w-2xl text-slate-500">
                  Registra ingresos, salidas y control de visitantes del edificio.
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
                {mostrarFormulario ? "Cerrar formulario" : "+ Nueva visita"}
              </button>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-4">
              <StatsCard
                title="Total"
                value={String(visitas.length)}
                description="Visitas registradas"
                highlighted
              />

              <StatsCard
                title="Dentro"
                value={String(visitasDentro.length)}
                description="Visitantes activos"
              />

              <StatsCard
                title="Salieron"
                value={String(visitasSalieron.length)}
                description="Visitas cerradas"
              />

              <StatsCard
                title="Resultado"
                value={String(visitasFiltradas.length)}
                description="Registros filtrados"
              />
            </div>

            {mostrarFormulario && (
              <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-[#0B1F3A]">
                      Nueva visita
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Completa los datos para registrar un nuevo ingreso.
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

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <Campo
                    label="Nombre visitante"
                    value={nombreVisitante}
                    onChange={setNombreVisitante}
                    placeholder="Ej: Juan Pérez"
                  />

                  <Campo
                    label="RUT visitante"
                    value={rutVisitante}
                    onChange={setRutVisitante}
                    placeholder="Ej: 12.345.678-9"
                  />

                  <div>
                    <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                      Departamento
                    </label>

                    <select
                      value={departamentoId}
                      onChange={(e) => setDepartamentoId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520]"
                    >
                      <option value="">Seleccionar departamento</option>

                      {departamentos.map((departamento) => (
                        <option key={departamento.id} value={departamento.id}>
                          Depto {departamento.numero}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Campo
                    label="Motivo"
                    value={motivo}
                    onChange={setMotivo}
                    placeholder="Ej: Visita familiar"
                  />

                  <Campo
                    label="Autorizado por"
                    value={autorizadoPor}
                    onChange={setAutorizadoPor}
                    placeholder="Ej: Residente"
                  />

                  <Campo
                    label="Patente"
                    value={patente}
                    onChange={setPatente}
                    placeholder="Ej: AB-CD-12"
                  />
                </div>

                <div className="mt-4">
                  <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                    Observación
                  </label>

                  <textarea
                    value={observacion}
                    onChange={(e) => setObservacion(e.target.value)}
                    placeholder="Ej: Ingresa con encomienda, autorización telefónica, etc."
                    className="min-h-[90px] w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520]"
                  />
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={registrarVisita}
                    className="rounded-xl bg-[#0B1F3A] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#163B73]"
                  >
                    Guardar visita
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
                    Listado de visitas
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Visitas registradas actualmente en el sistema.
                  </p>
                </div>

                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar visita..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#D9A520] md:w-72"
                />
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full table-fixed border-collapse text-sm">
                  <thead className="bg-[#0B1F3A] text-white">
                    <tr>
                      <th className="w-[17%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Visitante
                      </th>
                      <th className="w-[12%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        RUT
                      </th>
                      <th className="w-[9%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Depto
                      </th>
                      <th className="w-[17%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Motivo
                      </th>
                      <th className="w-[15%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Ingreso
                      </th>
                      <th className="w-[13%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Estado
                      </th>
                      <th className="w-[17%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Acciones
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
                          Cargando visitas...
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

                          <td className="px-3 py-3 align-top">
                            <div className="flex flex-col gap-1.5">
                              {visita.estado === "DENTRO" && (
                                <button
                                  type="button"
                                  onClick={() => marcarSalida(visita)}
                                  className="rounded-lg bg-green-50 px-2 py-1.5 text-[11px] font-bold text-green-700 transition hover:bg-green-100"
                                >
                                  Salida
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => eliminarVisita(visita)}
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
                          colSpan={7}
                          className="px-4 py-8 text-center text-sm text-slate-500"
                        >
                          No se encontraron visitas.
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