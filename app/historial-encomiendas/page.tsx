"use client";
import Header from "../components/Header";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import StatsCard from "../components/StatsCard";
import PackageCard from "../components/PackageCard";
import { supabase } from "../lib/supabase";

type Encomienda = {
  id?: string;
  departamento_id?: string | null;
  departamento_numero?: string | null;
  destinatario?: string | null;
  empresa?: string | null;
  descripcion?: string | null;
  recibido_por?: string | null;
  entregado_a?: string | null;
  fecha_recepcion?: string | null;
  fecha_entrega?: string | null;
  estado?: string | null;
  observacion?: string | null;
};

export default function HistorialEncomiendasPage() {
  const [encomiendas, setEncomiendas] = useState<Encomienda[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("TODOS");
  const [cargando, setCargando] = useState(true);

  const cargarEncomiendas = async () => {
    setCargando(true);

    const { data, error } = await supabase
      .from("encomiendas")
      .select(
        `
        id,
        departamento_id,
        destinatario,
        empresa,
        descripcion,
        recibido_por,
        entregado_a,
        fecha_recepcion,
        fecha_entrega,
        estado,
        observacion,
        departamentos (
          numero
        )
      `
      )
      .order("fecha_recepcion", { ascending: false });

    if (error) {
      console.error(error);
      alert(`Error al cargar historial de encomiendas: ${error.message}`);
      setCargando(false);
      return;
    }

    const encomiendasNormalizadas = (data || []).map((item: any) => ({
      id: item.id,
      departamento_id: item.departamento_id,
      destinatario: item.destinatario,
      empresa: item.empresa,
      descripcion: item.descripcion,
      recibido_por: item.recibido_por,
      entregado_a: item.entregado_a,
      fecha_recepcion: item.fecha_recepcion,
      fecha_entrega: item.fecha_entrega,
      estado: item.estado,
      observacion: item.observacion,
      departamento_numero: item.departamentos?.numero || null,
    }));

    setEncomiendas(encomiendasNormalizadas);
    setCargando(false);
  };

  useEffect(() => {
    cargarEncomiendas();
  }, []);

  const encomiendasFiltradas = encomiendas.filter((encomienda) => {
    const texto = busqueda.toLowerCase();

    const coincideBusqueda =
      (encomienda.destinatario || "").toLowerCase().includes(texto) ||
      (encomienda.empresa || "").toLowerCase().includes(texto) ||
      (encomienda.descripcion || "").toLowerCase().includes(texto) ||
      (encomienda.recibido_por || "").toLowerCase().includes(texto) ||
      (encomienda.entregado_a || "").toLowerCase().includes(texto) ||
      (encomienda.departamento_numero || "").toLowerCase().includes(texto) ||
      (encomienda.estado || "").toLowerCase().includes(texto);

    const coincideEstado =
      estadoFiltro === "TODOS" || encomienda.estado === estadoFiltro;

    return coincideBusqueda && coincideEstado;
  });

  const pendientes = encomiendas.filter((e) => e.estado === "PENDIENTE");
  const entregadas = encomiendas.filter((e) => e.estado === "ENTREGADA");

  const marcarEntregada = async (id?: string) => {
    if (!id) return;

    const entregadoA = prompt("¿A quién se entregó la encomienda?");

    if (!entregadoA) return;

    const { error } = await supabase
      .from("encomiendas")
      .update({
        estado: "ENTREGADA",
        entregado_a: entregadoA,
        fecha_entrega: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert(`Error al entregar encomienda: ${error.message}`);
      return;
    }

    cargarEncomiendas();
  };

  const eliminarEncomienda = async (id?: string) => {
    if (!id) return;

    const confirmar = confirm("¿Seguro que deseas eliminar esta encomienda?");

    if (!confirmar) return;

    const { error } = await supabase.from("encomiendas").delete().eq("id", id);

    if (error) {
      console.error(error);
      alert(`Error al eliminar encomienda: ${error.message}`);
      return;
    }

    cargarEncomiendas();
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
                <h1 className="text-4xl font-bold">Historial de encomiendas</h1>
                <p className="mt-1 text-slate-500">
                  Consulta completa de encomiendas recibidas, pendientes y entregadas.
                </p>
              </div>

              <button
                onClick={cargarEncomiendas}
                className="rounded-xl bg-[#061A33] px-6 py-3 font-semibold text-white shadow hover:bg-[#0A2547]"
              >
                Actualizar historial
              </button>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-4">
              <StatsCard
                title="Total encomiendas"
                value={String(encomiendas.length)}
                description="Registros históricos"
              />

              <StatsCard
                title="Pendientes"
                value={String(pendientes.length)}
                description="Por entregar"
                highlighted
              />

              <StatsCard
                title="Entregadas"
                value={String(entregadas.length)}
                description="Finalizadas"
              />

              <StatsCard
                title="Resultados"
                value={String(encomiendasFiltradas.length)}
                description="Según filtros"
              />
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar destinatario, empresa, departamento o estado..."
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#D4AF37]"
              />

              <select
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#D4AF37]"
              >
                <option value="TODOS">Estado: Todos</option>
                <option value="PENDIENTE">PENDIENTE</option>
                <option value="ENTREGADA">ENTREGADA</option>
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
              Resultados encontrados: {encomiendasFiltradas.length}
            </div>

            {cargando ? (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                Cargando historial de encomiendas...
              </div>
            ) : encomiendasFiltradas.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                {encomiendasFiltradas.map((encomienda) => (
                  <PackageCard
                    key={encomienda.id}
                    encomienda={encomienda}
                    onEntregar={marcarEntregada}
                    onDelete={eliminarEncomienda}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                <h3 className="text-xl font-bold">Sin registros</h3>
                <p className="mt-2 text-slate-500">
                  No se encontraron encomiendas con los filtros aplicados.
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