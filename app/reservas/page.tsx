"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import StatsCard from "../components/StatsCard";
import { supabase } from "../lib/supabase";
import { registrarEvento } from "../lib/registrarEvento";

type Reserva = {
  id: string;
  espacio: string | null;
  departamento_numero: string | null;
  responsable: string | null;
  fecha_reserva: string | null;
  hora_inicio: string | null;
  hora_termino: string | null;
  observacion: string | null;
  estado: string;
  created_at: string;
};

export default function ReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  const [espacio, setEspacio] = useState("Sala multiuso");
  const [departamentoNumero, setDepartamentoNumero] = useState("");
  const [responsable, setResponsable] = useState("");
  const [fechaReserva, setFechaReserva] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaTermino, setHoraTermino] = useState("");
  const [observacion, setObservacion] = useState("");

  const cargarReservas = async () => {
    setCargando(true);

    const { data, error } = await supabase
      .from("reservas")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al cargar reservas:", error);
      alert(`Error al cargar reservas: ${error.message}`);
      setCargando(false);
      return;
    }

    setReservas((data || []) as Reserva[]);
    setCargando(false);
  };

  useEffect(() => {
    cargarReservas();
  }, []);

  const limpiarFormulario = () => {
    setEspacio("Sala multiuso");
    setDepartamentoNumero("");
    setResponsable("");
    setFechaReserva("");
    setHoraInicio("");
    setHoraTermino("");
    setObservacion("");
  };

  const registrarReserva = async () => {
    if (!espacio.trim()) {
      alert("Debes seleccionar o ingresar el espacio común.");
      return;
    }

    if (!departamentoNumero.trim()) {
      alert("Debes ingresar el número de departamento.");
      return;
    }

    if (!responsable.trim()) {
      alert("Debes ingresar el responsable de la reserva.");
      return;
    }

    if (!fechaReserva) {
      alert("Debes ingresar la fecha de reserva.");
      return;
    }

    if (!horaInicio || !horaTermino) {
      alert("Debes ingresar hora de inicio y término.");
      return;
    }

    const { data, error } = await supabase
      .from("reservas")
      .insert({
        espacio: espacio.trim(),
        departamento_numero: departamentoNumero.trim(),
        responsable: responsable.trim(),
        fecha_reserva: fechaReserva,
        hora_inicio: horaInicio,
        hora_termino: horaTermino,
        observacion: observacion.trim() || null,
        estado: "ACTIVA",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error al registrar reserva:", error);
      alert(`Error al registrar reserva: ${error.message}`);
      return;
    }

    await registrarEvento({
      modulo: "Reservas",
      accion: "Crear reserva",
      descripcion: `Se registró una reserva de ${espacio.trim()} para el departamento ${departamentoNumero.trim()}, responsable ${responsable.trim()}, fecha ${fechaReserva} desde ${horaInicio} hasta ${horaTermino}.`,
      referencia_id: data?.id || null,
      referencia_tabla: "reservas",
    });

    limpiarFormulario();
    await cargarReservas();

    alert("Reserva registrada correctamente.");
  };

  const cancelarReserva = async (reserva: Reserva) => {
    const confirmar = confirm(
      `¿Deseas cancelar la reserva de ${reserva.espacio || "espacio común"}?`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("reservas")
      .update({
        estado: "CANCELADA",
      })
      .eq("id", reserva.id);

    if (error) {
      console.error("Error al cancelar reserva:", error);
      alert(`Error al cancelar reserva: ${error.message}`);
      return;
    }

    await registrarEvento({
      modulo: "Reservas",
      accion: "Cancelar reserva",
      descripcion: `Se canceló la reserva de ${
        reserva.espacio || "espacio común"
      } del departamento ${reserva.departamento_numero || "N/A"}.`,
      referencia_id: reserva.id,
      referencia_tabla: "reservas",
    });

    await cargarReservas();
  };

  const eliminarReserva = async (reserva: Reserva) => {
    const confirmar = confirm(
      `¿Deseas eliminar la reserva de ${reserva.espacio || "espacio común"}?`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("reservas")
      .delete()
      .eq("id", reserva.id);

    if (error) {
      console.error("Error al eliminar reserva:", error);
      alert(`Error al eliminar reserva: ${error.message}`);
      return;
    }

    await registrarEvento({
      modulo: "Reservas",
      accion: "Eliminar reserva",
      descripcion: `Se eliminó una reserva de ${
        reserva.espacio || "espacio común"
      } del departamento ${reserva.departamento_numero || "N/A"}.`,
      referencia_id: reserva.id,
      referencia_tabla: "reservas",
    });

    await cargarReservas();
  };

  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return "-";

    return new Date(fecha).toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatearFechaHora = (fecha: string | null) => {
    if (!fecha) return "-";

    return new Date(fecha).toLocaleString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const reservasFiltradas = useMemo(() => {
    const texto = busqueda.toLowerCase();

    return reservas.filter((reserva) => {
      return (
        (reserva.espacio || "").toLowerCase().includes(texto) ||
        (reserva.departamento_numero || "").toLowerCase().includes(texto) ||
        (reserva.responsable || "").toLowerCase().includes(texto) ||
        (reserva.fecha_reserva || "").toLowerCase().includes(texto) ||
        (reserva.hora_inicio || "").toLowerCase().includes(texto) ||
        (reserva.hora_termino || "").toLowerCase().includes(texto) ||
        (reserva.observacion || "").toLowerCase().includes(texto) ||
        reserva.estado.toLowerCase().includes(texto)
      );
    });
  }, [reservas, busqueda]);

  const reservasActivas = reservas.filter(
    (reserva) => reserva.estado === "ACTIVA"
  );

  const reservasCanceladas = reservas.filter(
    (reserva) => reserva.estado === "CANCELADA"
  );

  const hoyISO = new Date().toISOString().split("T")[0];

  const reservasHoy = reservas.filter(
    (reserva) => reserva.fecha_reserva === hoyISO
  );

  return (
    <main className="min-h-screen bg-[#F4F6F9] text-[#0B1220]">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="flex min-h-screen flex-1 flex-col">
          <Header />

          <div className="flex-1 p-8">
            <div className="mb-8">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.25em] text-[#D9A520]">
                Espacios comunes
              </p>

              <h1 className="text-4xl font-black text-[#0B1F3A]">
                Reservas
              </h1>

              <p className="mt-2 max-w-2xl text-slate-500">
                Administra reservas de sala multiuso, quincho, gimnasio u otros
                espacios comunes del edificio.
              </p>

              <div className="mt-4 h-1 w-16 rounded-full bg-[#D9A520]" />
            </div>

            <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-4">
              <StatsCard
                title="Total"
                value={String(reservas.length)}
                description="Reservas registradas"
                highlighted
              />

              <StatsCard
                title="Activas"
                value={String(reservasActivas.length)}
                description="Reservas vigentes"
              />

              <StatsCard
                title="Hoy"
                value={String(reservasHoy.length)}
                description="Programadas hoy"
              />

              <StatsCard
                title="Canceladas"
                value={String(reservasCanceladas.length)}
                description="Reservas anuladas"
              />
            </div>

            <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-2xl font-black text-[#0B1F3A]">
                  Registrar reserva
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Cada reserva creada quedará automáticamente en el Registro
                  general del sistema.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                    Espacio común
                  </label>

                  <select
                    value={espacio}
                    onChange={(e) => setEspacio(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520]"
                  >
                    <option value="Sala multiuso">Sala multiuso</option>
                    <option value="Quincho">Quincho</option>
                    <option value="Gimnasio">Gimnasio</option>
                    <option value="Piscina">Piscina</option>
                    <option value="Terraza">Terraza</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                    Departamento
                  </label>

                  <input
                    value={departamentoNumero}
                    onChange={(e) => setDepartamentoNumero(e.target.value)}
                    placeholder="Ej: 1204"
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
                    placeholder="Ej: Juan Pérez"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                    Fecha reserva
                  </label>

                  <input
                    type="date"
                    value={fechaReserva}
                    onChange={(e) => setFechaReserva(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                    Hora inicio
                  </label>

                  <input
                    type="time"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                    Hora término
                  </label>

                  <input
                    type="time"
                    value={horaTermino}
                    onChange={(e) => setHoraTermino(e.target.value)}
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
                  placeholder="Ej: Reserva para cumpleaños, reunión familiar, uso de quincho, etc."
                  className="min-h-[90px] w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520]"
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={registrarReserva}
                  className="rounded-xl bg-[#0B1F3A] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#163B73]"
                >
                  Registrar reserva
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
                    Registro de reservas
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Listado de reservas activas, canceladas e históricas.
                  </p>
                </div>

                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar reserva..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520] md:w-80"
                />
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px] border-collapse">
                    <thead className="bg-[#0B1F3A] text-white">
                      <tr>
                        <th className="px-5 py-4 text-left text-xs font-black uppercase">
                          Creación
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-black uppercase">
                          Espacio
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-black uppercase">
                          Depto
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-black uppercase">
                          Responsable
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-black uppercase">
                          Fecha
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-black uppercase">
                          Horario
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
                            Cargando reservas...
                          </td>
                        </tr>
                      ) : reservasFiltradas.length > 0 ? (
                        reservasFiltradas.map((reserva) => (
                          <tr
                            key={reserva.id}
                            className="border-b border-slate-100 hover:bg-[#F8FAFC]"
                          >
                            <td className="px-5 py-4 text-sm text-slate-500">
                              {formatearFechaHora(reserva.created_at)}
                            </td>

                            <td className="px-5 py-4 font-bold text-[#0B1F3A]">
                              {reserva.espacio || "-"}
                            </td>

                            <td className="px-5 py-4 text-sm font-bold text-slate-600">
                              {reserva.departamento_numero || "-"}
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-500">
                              {reserva.responsable || "-"}
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-500">
                              {formatearFecha(reserva.fecha_reserva)}
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-500">
                              {reserva.hora_inicio || "--:--"} -{" "}
                              {reserva.hora_termino || "--:--"}
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-black ${
                                  reserva.estado === "ACTIVA"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {reserva.estado}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex flex-wrap gap-2">
                                {reserva.estado === "ACTIVA" && (
                                  <button
                                    onClick={() => cancelarReserva(reserva)}
                                    className="rounded-lg bg-yellow-50 px-3 py-2 text-xs font-bold text-yellow-700 transition hover:bg-yellow-100"
                                  >
                                    Cancelar
                                  </button>
                                )}

                                <button
                                  onClick={() => eliminarReserva(reserva)}
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
                            No se encontraron reservas.
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