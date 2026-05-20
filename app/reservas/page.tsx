"use client";
import Header from "../components/Header";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import StatsCard from "../components/StatsCard";
import ReservationCard from "../components/ReservationCard";
import NewReservationModal from "../components/NewReservationModal";
import { supabase } from "../lib/supabase";

type Departamento = {
  id?: string;
  numero: string;
};

type Reserva = {
  id?: string;
  departamento_id?: string | null;
  departamento_numero?: string | null;
  espacio: string;
  reservado_por: string;
  fecha_reserva: string;
  hora_inicio: string;
  hora_termino: string;
  estado?: string | null;
  observacion?: string | null;
};

export default function ReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("TODOS");
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

  const cargarReservas = async () => {
    setCargando(true);

    const { data, error } = await supabase
      .from("reservas")
      .select(
        `
        id,
        departamento_id,
        espacio,
        reservado_por,
        fecha_reserva,
        hora_inicio,
        hora_termino,
        estado,
        observacion,
        departamentos (
          numero
        )
      `
      )
      .order("fecha_reserva", { ascending: true });

    if (error) {
      console.error(error);
      alert(`Error al cargar reservas: ${error.message}`);
      setCargando(false);
      return;
    }

    const reservasNormalizadas = (data || []).map((item: any) => ({
      id: item.id,
      departamento_id: item.departamento_id,
      espacio: item.espacio,
      reservado_por: item.reservado_por,
      fecha_reserva: item.fecha_reserva,
      hora_inicio: item.hora_inicio,
      hora_termino: item.hora_termino,
      estado: item.estado,
      observacion: item.observacion,
      departamento_numero: item.departamentos?.numero || null,
    }));

    setReservas(reservasNormalizadas);
    setCargando(false);
  };

  useEffect(() => {
    cargarDepartamentos();
    cargarReservas();
  }, []);

  const reservasFiltradas = reservas.filter((reserva) => {
    const texto = busqueda.toLowerCase();

    const coincideBusqueda =
      reserva.espacio.toLowerCase().includes(texto) ||
      reserva.reservado_por.toLowerCase().includes(texto) ||
      (reserva.departamento_numero || "").toLowerCase().includes(texto) ||
      (reserva.estado || "").toLowerCase().includes(texto) ||
      (reserva.observacion || "").toLowerCase().includes(texto);

    const coincideEstado =
      estadoFiltro === "TODOS" || reserva.estado === estadoFiltro;

    return coincideBusqueda && coincideEstado;
  });

  const reservadas = reservas.filter((r) => r.estado === "RESERVADA");
  const canceladas = reservas.filter((r) => r.estado === "CANCELADA");

  const guardarReserva = async (reserva: Reserva) => {
    const { error } = await supabase.from("reservas").insert({
      departamento_id: reserva.departamento_id,
      espacio: reserva.espacio,
      reservado_por: reserva.reservado_por,
      fecha_reserva: reserva.fecha_reserva,
      hora_inicio: reserva.hora_inicio,
      hora_termino: reserva.hora_termino,
      observacion: reserva.observacion,
      estado: "RESERVADA",
    });

    if (error) {
      console.error(error);
      alert(`Error al crear reserva: ${error.message}`);
      return;
    }

    setModalAbierto(false);
    cargarReservas();
  };

  const cancelarReserva = async (id?: string) => {
    if (!id) return;

    const confirmar = confirm("¿Seguro que deseas cancelar esta reserva?");

    if (!confirmar) return;

    const { error } = await supabase
      .from("reservas")
      .update({
        estado: "CANCELADA",
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert(`Error al cancelar reserva: ${error.message}`);
      return;
    }

    cargarReservas();
  };

  const eliminarReserva = async (id?: string) => {
    if (!id) return;

    const confirmar = confirm("¿Seguro que deseas eliminar esta reserva?");

    if (!confirmar) return;

    const { error } = await supabase.from("reservas").delete().eq("id", id);

    if (error) {
      console.error(error);
      alert(`Error al eliminar reserva: ${error.message}`);
      return;
    }

    cargarReservas();
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
                <h1 className="text-4xl font-bold">Reserva de espacios</h1>
                <p className="mt-1 text-slate-500">
                  Control de reservas de espacios comunes del edificio.
                </p>
              </div>

              <button
                onClick={() => setModalAbierto(true)}
                className="rounded-xl bg-[#061A33] px-6 py-3 font-semibold text-white shadow hover:bg-[#0A2547]"
              >
                + Nueva Reserva
              </button>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-4">
              <StatsCard
                title="Total reservas"
                value={String(reservas.length)}
                description="Registros históricos"
              />

              <StatsCard
                title="Reservadas"
                value={String(reservadas.length)}
                description="Activas"
                highlighted
              />

              <StatsCard
                title="Canceladas"
                value={String(canceladas.length)}
                description="No vigentes"
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
                placeholder="Buscar espacio, departamento, responsable o estado..."
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#D4AF37]"
              />

              <select
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#D4AF37]"
              >
                <option value="TODOS">Estado: Todos</option>
                <option value="RESERVADA">RESERVADA</option>
                <option value="CANCELADA">CANCELADA</option>
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
              Resultados encontrados: {reservasFiltradas.length}
            </div>

            {cargando ? (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                Cargando reservas...
              </div>
            ) : reservasFiltradas.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                {reservasFiltradas.map((reserva) => (
                  <ReservationCard
                    key={reserva.id}
                    reserva={reserva}
                    onCancelar={cancelarReserva}
                    onDelete={eliminarReserva}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                <h3 className="text-xl font-bold">Sin reservas</h3>
                <p className="mt-2 text-slate-500">
                  No se encontraron reservas registradas.
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

      <NewReservationModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onSave={guardarReserva}
        departamentos={departamentos}
      />
    </main>
  );
}