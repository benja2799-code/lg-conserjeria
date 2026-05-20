"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import StatsCard from "../components/StatsCard";
import VisitCard from "../components/VisitCard";
import { supabase } from "../lib/supabase";

type Visita = {
  id?: string;
  departamento_id?: string | null;
  departamento_numero?: string | null;
  nombre_visitante: string;
  rut_visitante?: string | null;
  motivo?: string | null;
  autorizado_por?: string | null;
  patente?: string | null;
  hora_ingreso?: string | null;
  hora_salida?: string | null;
  estado?: string | null;
  observacion?: string | null;
};

export default function HistorialVisitasPage() {
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("TODOS");
  const [cargando, setCargando] = useState(true);

  const cargarVisitas = async () => {
    setCargando(true);

    const { data, error } = await supabase
      .from("visitas")
      .select(
        `
        id,
        departamento_id,
        nombre_visitante,
        rut_visitante,
        motivo,
        autorizado_por,
        patente,
        hora_ingreso,
        hora_salida,
        estado,
        observacion,
        departamentos (
          numero
        )
      `
      )
      .order("hora_ingreso", { ascending: false });

    if (error) {
      console.error(error);
      alert(`Error al cargar historial de visitas: ${error.message}`);
      setCargando(false);
      return;
    }

    const visitasNormalizadas = (data || []).map((item: any) => ({
      id: item.id,
      departamento_id: item.departamento_id,
      nombre_visitante: item.nombre_visitante,
      rut_visitante: item.rut_visitante,
      motivo: item.motivo,
      autorizado_por: item.autorizado_por,
      patente: item.patente,
      hora_ingreso: item.hora_ingreso,
      hora_salida: item.hora_salida,
      estado: item.estado,
      observacion: item.observacion,
      departamento_numero: item.departamentos?.numero || null,
    }));

    setVisitas(visitasNormalizadas);
    setCargando(false);
  };

  useEffect(() => {
    cargarVisitas();
  }, []);

  const visitasFiltradas = visitas.filter((visita) => {
    const texto = busqueda.toLowerCase();

    const coincideBusqueda =
      visita.nombre_visitante.toLowerCase().includes(texto) ||
      (visita.rut_visitante || "").toLowerCase().includes(texto) ||
      (visita.motivo || "").toLowerCase().includes(texto) ||
      (visita.autorizado_por || "").toLowerCase().includes(texto) ||
      (visita.patente || "").toLowerCase().includes(texto) ||
      (visita.departamento_numero || "").toLowerCase().includes(texto) ||
      (visita.estado || "").toLowerCase().includes(texto);

    const coincideEstado =
      estadoFiltro === "TODOS" || visita.estado === estadoFiltro;

    return coincideBusqueda && coincideEstado;
  });

  const visitasDentro = visitas.filter((visita) => visita.estado === "DENTRO");
  const visitasSalieron = visitas.filter((visita) => visita.estado === "SALIÓ");

  const marcarSalida = async (id?: string) => {
    if (!id) return;

    const confirmar = confirm("¿Deseas marcar la salida de esta visita?");

    if (!confirmar) return;

    const { error } = await supabase
      .from("visitas")
      .update({
        estado: "SALIÓ",
        hora_salida: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert(`Error al marcar salida: ${error.message}`);
      return;
    }

    cargarVisitas();
  };

  const eliminarVisita = async (id?: string) => {
    if (!id) return;

    const confirmar = confirm("¿Seguro que deseas eliminar esta visita?");

    if (!confirmar) return;

    const { error } = await supabase.from("visitas").delete().eq("id", id);

    if (error) {
      console.error(error);
      alert(`Error al eliminar visita: ${error.message}`);
      return;
    }

    cargarVisitas();
  };

  return (
    <main className="min-h-screen bg-[#F4F6F9] text-[#0B1220]">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="flex-1">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5">
            <div>
              <h2 className="text-xl font-bold">Conserjería</h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold">Giovanny Troncoso</p>
                <p className="text-sm text-slate-500">Conserje en turno</p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#061A33] text-white">
                G
              </div>
            </div>
          </header>

          <div className="p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold">Historial de visitas</h1>
                <p className="mt-1 text-slate-500">
                  Consulta completa de ingresos, salidas y registros históricos.
                </p>
              </div>

              <button
                onClick={cargarVisitas}
                className="rounded-xl bg-[#061A33] px-6 py-3 font-semibold text-white shadow hover:bg-[#0A2547]"
              >
                Actualizar historial
              </button>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-4">
              <StatsCard
                title="Total visitas"
                value={String(visitas.length)}
                description="Registros históricos"
              />

              <StatsCard
                title="Dentro del edificio"
                value={String(visitasDentro.length)}
                description="Visitas activas"
                highlighted
              />

              <StatsCard
                title="Salieron"
                value={String(visitasSalieron.length)}
                description="Visitas finalizadas"
              />

              <StatsCard
                title="Resultados"
                value={String(visitasFiltradas.length)}
                description="Según filtros"
              />
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar visitante, RUT, patente, departamento..."
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#D4AF37]"
              />

              <select
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#D4AF37]"
              >
                <option value="TODOS">Estado: Todos</option>
                <option value="DENTRO">DENTRO</option>
                <option value="SALIÓ">SALIÓ</option>
              </select>

              <button
                onClick={() => {
                  setBusqueda("");
                  setEstadoFiltro("TODOS");
                }}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-600 hover:bg-slate-50"
              >
                Limpiar filtros
              </button>
            </div>

            <div className="mb-4 text-sm text-slate-500">
              Resultados encontrados: {visitasFiltradas.length}
            </div>

            {cargando ? (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                Cargando historial de visitas...
              </div>
            ) : visitasFiltradas.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                {visitasFiltradas.map((visita) => (
                  <VisitCard
                    key={visita.id}
                    visita={visita}
                    onSalida={marcarSalida}
                    onDelete={eliminarVisita}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                <h3 className="text-xl font-bold">Sin registros</h3>
                <p className="mt-2 text-slate-500">
                  No se encontraron visitas con los filtros aplicados.
                </p>
              </div>
            )}
          </div>

          <footer className="mt-8 flex items-center justify-between bg-[#061A33] px-8 py-4 text-sm text-white">
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