"use client";

import { useState } from "react";

type Departamento = {
  id?: string;
  numero: string;
};

type Reserva = {
  departamento_id?: string | null;
  espacio: string;
  reservado_por: string;
  fecha_reserva: string;
  hora_inicio: string;
  hora_termino: string;
  observacion?: string | null;
};

type NewReservationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reserva: Reserva) => void;
  departamentos: Departamento[];
};

export default function NewReservationModal({
  isOpen,
  onClose,
  onSave,
  departamentos,
}: NewReservationModalProps) {
  const [departamentoId, setDepartamentoId] = useState("");
  const [espacio, setEspacio] = useState("Quincho");
  const [reservadoPor, setReservadoPor] = useState("");
  const [fechaReserva, setFechaReserva] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaTermino, setHoraTermino] = useState("");
  const [observacion, setObservacion] = useState("");

  if (!isOpen) return null;

  const limpiarFormulario = () => {
    setDepartamentoId("");
    setEspacio("Quincho");
    setReservadoPor("");
    setFechaReserva("");
    setHoraInicio("");
    setHoraTermino("");
    setObservacion("");
  };

  const guardarReserva = () => {
    if (!reservadoPor.trim()) {
      alert("Debes ingresar quién reserva");
      return;
    }

    if (!fechaReserva || !horaInicio || !horaTermino) {
      alert("Debes ingresar fecha, hora de inicio y hora de término");
      return;
    }

    onSave({
      departamento_id: departamentoId || null,
      espacio,
      reservado_por: reservadoPor,
      fecha_reserva: fechaReserva,
      hora_inicio: horaInicio,
      hora_termino: horaTermino,
      observacion,
    });

    limpiarFormulario();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#061A33]">
              Nueva Reserva
            </h2>
            <p className="text-sm text-slate-500">
              Registra la reserva de un espacio común.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 hover:bg-slate-200"
          >
            X
          </button>
        </div>

        <form className="space-y-4">
          <select
            value={departamentoId}
            onChange={(e) => setDepartamentoId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D4AF37]"
          >
            <option value="">Seleccionar departamento</option>
            {departamentos.map((depto) => (
              <option key={depto.id} value={depto.id}>
                Depto {depto.numero}
              </option>
            ))}
          </select>

          <select
            value={espacio}
            onChange={(e) => setEspacio(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D4AF37]"
          >
            <option value="Quincho">Quincho</option>
            <option value="Sala multiuso">Sala multiuso</option>
            <option value="Estacionamiento visita">
              Estacionamiento visita
            </option>
            <option value="Gimnasio">Gimnasio</option>
            <option value="Piscina">Piscina</option>
            <option value="Otro">Otro</option>
          </select>

          <input
            type="text"
            value={reservadoPor}
            onChange={(e) => setReservadoPor(e.target.value)}
            placeholder="Reservado por"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D4AF37]"
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <input
              type="date"
              value={fechaReserva}
              onChange={(e) => setFechaReserva(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D4AF37]"
            />

            <input
              type="time"
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D4AF37]"
            />

            <input
              type="time"
              value={horaTermino}
              onChange={(e) => setHoraTermino(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D4AF37]"
            />
          </div>

          <textarea
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            placeholder="Observación"
            rows={3}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D4AF37]"
          />

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={guardarReserva}
              className="rounded-xl bg-[#061A33] px-5 py-3 font-semibold text-white hover:bg-[#0A2547]"
            >
              Guardar reserva
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}