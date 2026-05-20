"use client";

import Header from "../components/Header";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import StatsCard from "../components/StatsCard";
import VisitCard from "../components/VisitCard";
import NewVisitModal from "../components/NewVisitModal";
import { supabase } from "../lib/supabase";

type Departamento = {
  id?: string;
  numero: string;
};

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

export default function VisitasPage() {
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);

  const cargarDepartamentos = async () => {
    const { data, error } = await supabase
      .from("departamentos")
      .select("id, numero")
      .order("numero", { ascending: true });

    if (error) {
      console.error(error);
      alert(`Error al cargar departamentos: ${error.message}`);
      return;
    }

    setDepartamentos(data || []);
  };

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
      alert(`Error al cargar visitas: ${error.message}`);
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
    cargarDepartamentos();
    cargarVisitas();
  }, []);

  const visitasFiltradas = visitas.filter((visita) => {
    const texto = busqueda.toLowerCase();

    return (
      visita.nombre_visitante.toLowerCase().includes(texto) ||
      (visita.rut_visitante || "").toLowerCase().includes(texto) ||
      (visita.motivo || "").toLowerCase().includes(texto) ||
      (visita.autorizado_por || "").toLowerCase().includes(texto) ||
      (visita.patente || "").toLowerCase().includes(texto) ||
      (visita.departamento_numero || "").toLowerCase().includes(texto) ||
      (visita.estado || "").toLowerCase().includes(texto)
    );
  });

  const visitasDentro = visitas.filter((visita) => visita.estado === "DENTRO");
  const visitasSalieron = visitas.filter((visita) => visita.estado === "SALIÓ");

  const guardarVisita = async (visita: Visita) => {
    const { error } = await supabase.from("visitas").insert({
      departamento_id: visita.departamento_id,
      nombre_visitante: visita.nombre_visitante,
      rut_visitante: visita.rut_visitante,
      motivo: visita.motivo,
      autorizado_por: visita.autorizado_por,
      patente: visita.patente,
      observacion: visita.observacion,
      estado: "DENTRO",
      hora_ingreso: new Date().toISOString(),
    });

    if (error) {
      console.error(error);
      alert(`Error al crear visita: ${error.message}`);
      return;
    }

    setModalAbierto(false);
    cargarVisitas();
  };

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
          <Header />

          <div className="p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold">Visitas</h1>
                <p className="mt-1 text-slate-500">
                  Registro de ingreso, salida y control de visitantes.
                </p>
              </div>

              <button
                onClick={() => setModalAbierto(true)}
                className="rounded-xl bg-[#061A33] px-6 py-3 font-semibold text-white shadow hover:bg-[#0A2547]"
              >
                + Nueva Visita
              </button>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-4">
              <StatsCard
                title="Visitas registradas"
                value={String(visitas.length)}
                description="Total histórico"
              />

              <StatsCard
                title="Dentro del edificio"
                value={String(visitasDentro.length)}
                description="Visitas activas"
                highlighted
              />

              <StatsCard
                title="Salidas registradas"
                value={String(visitasSalieron.length)}
                description="Visitas finalizadas"
              />

              <StatsCard
                title="Departamentos"
                value={String(departamentos.length)}
                description="Disponibles"
              />
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar visitante, RUT, patente, departamento o estado..."
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#D4AF37]"
              />

              <select className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#D4AF37]">
                <option>Todos los departamentos</option>
              </select>

              <select className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#D4AF37]">
                <option>Estado: Todos</option>
                <option>DENTRO</option>
                <option>SALIÓ</option>
              </select>
            </div>

            <div className="mb-4 text-sm text-slate-500">
              Resultados encontrados: {visitasFiltradas.length}
            </div>

            {cargando ? (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                Cargando visitas...
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
                <h3 className="text-xl font-bold">Sin visitas</h3>
                <p className="mt-2 text-slate-500">
                  No se encontraron visitas registradas.
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

      <NewVisitModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onSave={guardarVisita}
        departamentos={departamentos}
      />
    </main>
  );
}