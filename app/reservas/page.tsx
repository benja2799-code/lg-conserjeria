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
  estado: string | null;
  created_at: string | null;
};

export default function ReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

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

  const cerrarFormulario = () => {
    limpiarFormulario();
    setMostrarFormulario(false);
  };

  const registrarReserva = async () => {
    if (!espacio.trim()) {
      alert("Debes seleccionar el espacio común.");
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

    if (horaTermino <= horaInicio) {
      alert("La hora de término debe ser mayor a la hora de inicio.");
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
      descripcion: `Se registró una reserva de ${espacio.trim()} para el departamento ${departamentoNumero.trim()}, responsable ${responsable.trim()}, fecha ${fechaReserva}, horario ${horaInicio} - ${horaTermino}.`,
      referencia_id: data?.id || null,
      referencia_tabla: "reservas",
    });

    limpiarFormulario();
    setMostrarFormulario(false);
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

  const formatearFechaReserva = (fecha: string | null) => {
    if (!fecha) return "-";

    return new Date(`${fecha}T00:00:00`).toLocaleDateString("es-CL", {
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
        (reserva.estado || "").toLowerCase().includes(texto)
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

        <section className="flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden">
          <Header />

          <div className="min-w-0 flex-1 overflow-x-hidden p-8">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-[0.25em] text-[#D9A520]">
                  Espacios comunes
                </p>

                <h1 className="text-4xl font-black text-[#0B1F3A]">
                  Reserva de espacios
                </h1>

                <p className="mt-2 max-w-2xl text-slate-500">
                  Administra reservas de sala multiuso, quincho, gimnasio,
                  piscina u otros espacios comunes del edificio.
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
                {mostrarFormulario ? "Cerrar formulario" : "+ Nueva reserva"}
              </button>
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

            {mostrarFormulario && (
              <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-[#0B1F3A]">
                      Nueva reserva
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Completa los datos para registrar una reserva de espacio
                      común.
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

                  <Campo
                    label="Departamento"
                    value={departamentoNumero}
                    onChange={setDepartamentoNumero}
                    placeholder="Ej: 1204"
                  />

                  <Campo
                    label="Responsable"
                    value={responsable}
                    onChange={setResponsable}
                    placeholder="Ej: Juan Pérez"
                  />

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
                    type="button"
                    onClick={registrarReserva}
                    className="rounded-xl bg-[#0B1F3A] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#163B73]"
                  >
                    Guardar reserva
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
                    Listado de reservas
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Reservas registradas actualmente en el sistema.
                  </p>
                </div>

                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar reserva..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#D9A520] md:w-72"
                />
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full table-fixed border-collapse text-sm">
                  <thead className="bg-[#0B1F3A] text-white">
                    <tr>
                      <th className="w-[16%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Espacio
                      </th>
                      <th className="w-[9%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Depto
                      </th>
                      <th className="w-[17%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Responsable
                      </th>
                      <th className="w-[14%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Fecha
                      </th>
                      <th className="w-[14%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Horario
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
                          Cargando reservas...
                        </td>
                      </tr>
                    ) : reservasFiltradas.length > 0 ? (
                      reservasFiltradas.map((reserva) => (
                        <tr
                          key={reserva.id}
                          className="border-b border-slate-100 hover:bg-[#F8FAFC]"
                        >
                          <td className="px-3 py-3 align-top">
                            <div className="min-w-0">
                              <p className="truncate text-xs font-black text-[#0B1F3A]">
                                {reserva.espacio || "-"}
                              </p>
                              <p className="truncate text-[11px] text-slate-400">
                                Creada: {formatearFechaHora(reserva.created_at)}
                              </p>
                            </div>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <p className="truncate text-sm font-black text-[#0B1F3A]">
                              {reserva.departamento_numero || "-"}
                            </p>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <p className="truncate text-xs font-bold text-slate-700">
                              {reserva.responsable || "-"}
                            </p>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <p className="text-xs text-slate-500">
                              {formatearFechaReserva(reserva.fecha_reserva)}
                            </p>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <p className="text-xs font-bold text-slate-600">
                              {reserva.hora_inicio || "--:--"} -{" "}
                              {reserva.hora_termino || "--:--"}
                            </p>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <span
                              className={`inline-flex max-w-full rounded-full px-2.5 py-1 text-[10px] font-black ${
                                reserva.estado === "ACTIVA"
                                  ? "bg-green-100 text-green-700"
                                  : reserva.estado === "CANCELADA"
                                  ? "bg-slate-100 text-slate-500"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {reserva.estado || "-"}
                            </span>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <div className="flex flex-col gap-1.5">
                              {reserva.estado === "ACTIVA" && (
                                <button
                                  type="button"
                                  onClick={() => cancelarReserva(reserva)}
                                  className="rounded-lg bg-yellow-50 px-2 py-1.5 text-[11px] font-bold text-yellow-700 transition hover:bg-yellow-100"
                                >
                                  Cancelar
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => eliminarReserva(reserva)}
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
                          No se encontraron reservas.
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