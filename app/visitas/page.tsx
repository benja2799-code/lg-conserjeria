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
  estado: string;
  hora_ingreso: string;
  hora_salida: string | null;
};

export default function VisitasPage() {
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

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
      accion: "Crear visita",
      descripcion: `Se registró la visita de ${nombreVisitante.trim()} para el departamento ${departamentoNumero}.`,
      referencia_id: data?.id || null,
      referencia_tabla: "visitas",
    });

    limpiarFormulario();
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
      `¿Deseas eliminar el registro de ${visita.nombre_visitante}?`
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
        visita.nombre_visitante.toLowerCase().includes(texto) ||
        (visita.rut_visitante || "").toLowerCase().includes(texto) ||
        (visita.motivo || "").toLowerCase().includes(texto) ||
        (visita.autorizado_por || "").toLowerCase().includes(texto) ||
        (visita.patente || "").toLowerCase().includes(texto) ||
        (visita.observacion || "").toLowerCase().includes(texto) ||
        visita.estado.toLowerCase().includes(texto) ||
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

        <section className="flex min-h-screen flex-1 flex-col">
          <Header />

          <div className="flex-1 p-8">
            <div className="mb-8">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.25em] text-[#D9A520]">
                Control de acceso
              </p>

              <h1 className="text-4xl font-black text-[#0B1F3A]">
                Visitas
              </h1>

              <p className="mt-2 max-w-2xl text-slate-500">
                Registra el ingreso, salida y control de visitantes del edificio.
              </p>

              <div className="mt-4 h-1 w-16 rounded-full bg-[#D9A520]" />
            </div>

            <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-4">
              <StatsCard
                title="Total visitas"
                value={String(visitas.length)}
                description="Registros generales"
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

            <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-2xl font-black text-[#0B1F3A]">
                  Registrar nueva visita
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Los registros creados aquí quedarán automáticamente en el
                  Registro general del sistema.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                    Nombre visitante
                  </label>

                  <input
                    value={nombreVisitante}
                    onChange={(e) => setNombreVisitante(e.target.value)}
                    placeholder="Ej: Juan Pérez"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                    RUT visitante
                  </label>

                  <input
                    value={rutVisitante}
                    onChange={(e) => setRutVisitante(e.target.value)}
                    placeholder="Ej: 12.345.678-9"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520]"
                  />
                </div>

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

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                    Motivo
                  </label>

                  <input
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Ej: Visita familiar"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                    Autorizado por
                  </label>

                  <input
                    value={autorizadoPor}
                    onChange={(e) => setAutorizadoPor(e.target.value)}
                    placeholder="Ej: Residente"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                    Patente
                  </label>

                  <input
                    value={patente}
                    onChange={(e) => setPatente(e.target.value)}
                    placeholder="Ej: AB-CD-12"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520]"
                  />
                </div>
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
                  onClick={registrarVisita}
                  className="rounded-xl bg-[#0B1F3A] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#163B73]"
                >
                  Registrar visita
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
                    Registros de visitas
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Listado de ingresos, salidas y visitantes activos.
                  </p>
                </div>

                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar visita..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520] md:w-80"
                />
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px] border-collapse">
                    <thead className="bg-[#0B1F3A] text-white">
                      <tr>
                        <th className="px-5 py-4 text-left text-xs font-black uppercase">
                          Visitante
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-black uppercase">
                          RUT
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-black uppercase">
                          Depto
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-black uppercase">
                          Motivo
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-black uppercase">
                          Ingreso
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-black uppercase">
                          Salida
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
                            colSpan={8}
                            className="px-5 py-10 text-center font-bold text-[#0B1F3A]"
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
                            <td className="px-5 py-4 font-bold text-[#0B1F3A]">
                              {visita.nombre_visitante}
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-500">
                              {visita.rut_visitante || "-"}
                            </td>

                            <td className="px-5 py-4 text-sm font-bold text-slate-600">
                              {obtenerNumeroDepartamento(
                                visita.departamento_id
                              )}
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-500">
                              {visita.motivo || "-"}
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-500">
                              {formatearFecha(visita.hora_ingreso)}
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-500">
                              {formatearFecha(visita.hora_salida)}
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-black ${
                                  visita.estado === "DENTRO"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {visita.estado}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex flex-wrap gap-2">
                                {visita.estado === "DENTRO" && (
                                  <button
                                    onClick={() => marcarSalida(visita)}
                                    className="rounded-lg bg-green-50 px-3 py-2 text-xs font-bold text-green-700 transition hover:bg-green-100"
                                  >
                                    Marcar salida
                                  </button>
                                )}

                                <button
                                  onClick={() => eliminarVisita(visita)}
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
                            colSpan={8}
                            className="px-5 py-10 text-center text-slate-500"
                          >
                            No se encontraron visitas.
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