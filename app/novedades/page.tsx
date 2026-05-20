"use client";
import Header from "../components/Header";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import StatsCard from "../components/StatsCard";
import NoveltyCard from "../components/NoveltyCard";
import NewNoveltyModal from "../components/NewNoveltyModal";
import { supabase } from "../lib/supabase";

type Novedad = {
  id?: string;
  tipo?: string | null;
  titulo: string;
  descripcion?: string | null;
  registrado_por?: string | null;
  turno?: string | null;
  estado?: string | null;
  fecha_registro?: string | null;
  fecha_cierre?: string | null;
  observacion_cierre?: string | null;
};

export default function NovedadesPage() {
  const [novedades, setNovedades] = useState<Novedad[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("TODOS");
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);

  const cargarNovedades = async () => {
    setCargando(true);

    const { data, error } = await supabase
      .from("novedades")
      .select("*")
      .order("fecha_registro", { ascending: false });

    if (error) {
      console.error(error);
      alert(`Error al cargar novedades: ${error.message}`);
      setCargando(false);
      return;
    }

    setNovedades(data || []);
    setCargando(false);
  };

  useEffect(() => {
    cargarNovedades();
  }, []);

  const novedadesFiltradas = novedades.filter((novedad) => {
    const texto = busqueda.toLowerCase();

    const coincideBusqueda =
      (novedad.tipo || "").toLowerCase().includes(texto) ||
      novedad.titulo.toLowerCase().includes(texto) ||
      (novedad.descripcion || "").toLowerCase().includes(texto) ||
      (novedad.registrado_por || "").toLowerCase().includes(texto) ||
      (novedad.turno || "").toLowerCase().includes(texto) ||
      (novedad.estado || "").toLowerCase().includes(texto);

    const coincideEstado =
      estadoFiltro === "TODOS" || novedad.estado === estadoFiltro;

    return coincideBusqueda && coincideEstado;
  });

  const abiertas = novedades.filter((n) => n.estado === "ABIERTA");
  const cerradas = novedades.filter((n) => n.estado === "CERRADA");
  const incidentes = novedades.filter((n) => n.tipo === "INCIDENTE");

  const guardarNovedad = async (novedad: Novedad) => {
    const { error } = await supabase.from("novedades").insert({
      tipo: novedad.tipo,
      titulo: novedad.titulo,
      descripcion: novedad.descripcion,
      registrado_por: novedad.registrado_por,
      turno: novedad.turno,
      estado: "ABIERTA",
      fecha_registro: new Date().toISOString(),
    });

    if (error) {
      console.error(error);
      alert(`Error al crear novedad: ${error.message}`);
      return;
    }

    setModalAbierto(false);
    cargarNovedades();
  };

  const cerrarNovedad = async (id?: string) => {
    if (!id) return;

    const observacion = prompt("Observación de cierre:");

    const { error } = await supabase
      .from("novedades")
      .update({
        estado: "CERRADA",
        fecha_cierre: new Date().toISOString(),
        observacion_cierre: observacion || "Cerrada sin observación",
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert(`Error al cerrar novedad: ${error.message}`);
      return;
    }

    cargarNovedades();
  };

  const eliminarNovedad = async (id?: string) => {
    if (!id) return;

    const confirmar = confirm("¿Seguro que deseas eliminar esta novedad?");

    if (!confirmar) return;

    const { error } = await supabase.from("novedades").delete().eq("id", id);

    if (error) {
      console.error(error);
      alert(`Error al eliminar novedad: ${error.message}`);
      return;
    }

    cargarNovedades();
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
                <h1 className="text-4xl font-bold">Libro de novedades</h1>
                <p className="mt-1 text-slate-500">
                  Registro operacional de novedades, incidentes y observaciones del turno.
                </p>
              </div>

              <button
                onClick={() => setModalAbierto(true)}
                className="rounded-xl bg-[#061A33] px-6 py-3 font-semibold text-white shadow hover:bg-[#0A2547]"
              >
                + Nueva Novedad
              </button>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-4">
              <StatsCard
                title="Total novedades"
                value={String(novedades.length)}
                description="Registros históricos"
              />

              <StatsCard
                title="Abiertas"
                value={String(abiertas.length)}
                description="Pendientes de cierre"
                highlighted
              />

              <StatsCard
                title="Cerradas"
                value={String(cerradas.length)}
                description="Finalizadas"
              />

              <StatsCard
                title="Incidentes"
                value={String(incidentes.length)}
                description="Registros críticos"
              />
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar título, tipo, descripción o responsable..."
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#D4AF37]"
              />

              <select
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#D4AF37]"
              >
                <option value="TODOS">Estado: Todos</option>
                <option value="ABIERTA">ABIERTA</option>
                <option value="CERRADA">CERRADA</option>
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
              Resultados encontrados: {novedadesFiltradas.length}
            </div>

            {cargando ? (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                Cargando novedades...
              </div>
            ) : novedadesFiltradas.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                {novedadesFiltradas.map((novedad) => (
                  <NoveltyCard
                    key={novedad.id}
                    novedad={novedad}
                    onCerrar={cerrarNovedad}
                    onDelete={eliminarNovedad}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                <h3 className="text-xl font-bold">Sin novedades</h3>
                <p className="mt-2 text-slate-500">
                  No se encontraron registros en el libro de novedades.
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

      <NewNoveltyModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onSave={guardarNovedad}
      />
    </main>
  );
}