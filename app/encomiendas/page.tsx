"use client";
import Header from "../components/Header";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import StatsCard from "../components/StatsCard";
import PackageCard from "../components/PackageCard";
import NewPackageModal from "../components/NewPackageModal";
import { supabase } from "../lib/supabase";

type Departamento = {
  id?: string;
  numero: string;
};

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

export default function EncomiendasPage() {
  const [encomiendas, setEncomiendas] = useState<Encomienda[]>([]);
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
      alert(`Error al cargar encomiendas: ${error.message}`);
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
    cargarDepartamentos();
    cargarEncomiendas();
  }, []);

  const encomiendasFiltradas = encomiendas.filter((encomienda) => {
    const texto = busqueda.toLowerCase();

    return (
      (encomienda.destinatario || "").toLowerCase().includes(texto) ||
      (encomienda.empresa || "").toLowerCase().includes(texto) ||
      (encomienda.descripcion || "").toLowerCase().includes(texto) ||
      (encomienda.recibido_por || "").toLowerCase().includes(texto) ||
      (encomienda.entregado_a || "").toLowerCase().includes(texto) ||
      (encomienda.departamento_numero || "").toLowerCase().includes(texto) ||
      (encomienda.estado || "").toLowerCase().includes(texto)
    );
  });

  const pendientes = encomiendas.filter((e) => e.estado === "PENDIENTE");
  const entregadas = encomiendas.filter((e) => e.estado === "ENTREGADA");

  const guardarEncomienda = async (encomienda: Encomienda) => {
    const { error } = await supabase.from("encomiendas").insert({
      departamento_id: encomienda.departamento_id,
      destinatario: encomienda.destinatario,
      empresa: encomienda.empresa,
      descripcion: encomienda.descripcion,
      recibido_por: encomienda.recibido_por,
      observacion: encomienda.observacion,
      estado: "PENDIENTE",
      fecha_recepcion: new Date().toISOString(),
    });

    if (error) {
      console.error(error);
      alert(`Error al crear encomienda: ${error.message}`);
      return;
    }

    setModalAbierto(false);
    cargarEncomiendas();
  };

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
                <h1 className="text-4xl font-bold">Encomiendas</h1>
                <p className="mt-1 text-slate-500">
                  Registro, control y entrega de encomiendas del edificio.
                </p>
              </div>

              <button
                onClick={() => setModalAbierto(true)}
                className="rounded-xl bg-[#061A33] px-6 py-3 font-semibold text-white shadow hover:bg-[#0A2547]"
              >
                + Nueva Encomienda
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
                placeholder="Buscar destinatario, empresa, departamento o estado..."
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#D4AF37]"
              />

              <select className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#D4AF37]">
                <option>Todos los departamentos</option>
              </select>

              <select className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#D4AF37]">
                <option>Estado: Todos</option>
                <option>Pendiente</option>
                <option>Entregada</option>
              </select>
            </div>

            <div className="mb-4 text-sm text-slate-500">
              Resultados encontrados: {encomiendasFiltradas.length}
            </div>

            {cargando ? (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                Cargando encomiendas...
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
                <h3 className="text-xl font-bold">Sin encomiendas</h3>
                <p className="mt-2 text-slate-500">
                  No se encontraron encomiendas registradas.
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

      <NewPackageModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onSave={guardarEncomienda}
        departamentos={departamentos}
      />
    </main>
  );
}