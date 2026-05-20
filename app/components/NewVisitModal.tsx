"use client";

import { useState } from "react";

type Departamento = {
  id?: string;
  numero: string;
};

type Visita = {
  departamento_id?: string | null;
  nombre_visitante: string;
  rut_visitante?: string | null;
  motivo?: string | null;
  autorizado_por?: string | null;
  patente?: string | null;
  observacion?: string | null;
};

type NewVisitModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (visita: Visita) => void;
  departamentos: Departamento[];
};

export default function NewVisitModal({
  isOpen,
  onClose,
  onSave,
  departamentos,
}: NewVisitModalProps) {
  const [departamentoId, setDepartamentoId] = useState("");
  const [nombreVisitante, setNombreVisitante] = useState("");
  const [rutVisitante, setRutVisitante] = useState("");
  const [motivo, setMotivo] = useState("");
  const [autorizadoPor, setAutorizadoPor] = useState("");
  const [patente, setPatente] = useState("");
  const [observacion, setObservacion] = useState("");

  if (!isOpen) return null;

  const limpiarFormulario = () => {
    setDepartamentoId("");
    setNombreVisitante("");
    setRutVisitante("");
    setMotivo("");
    setAutorizadoPor("");
    setPatente("");
    setObservacion("");
  };

  const guardarVisita = () => {
    if (!nombreVisitante.trim()) {
      alert("Debes ingresar el nombre del visitante");
      return;
    }

    onSave({
      departamento_id: departamentoId || null,
      nombre_visitante: nombreVisitante,
      rut_visitante: rutVisitante,
      motivo,
      autorizado_por: autorizadoPor,
      patente: patente.toUpperCase(),
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
              Nueva Visita
            </h2>
            <p className="text-sm text-slate-500">
              Registra el ingreso de un visitante al edificio.
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
          <div>
            <label className="mb-1 block text-sm font-semibold">
              Departamento
            </label>
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
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">
              Nombre visitante
            </label>
            <input
              type="text"
              value={nombreVisitante}
              onChange={(e) => setNombreVisitante(e.target.value)}
              placeholder="Ej: Juan Pérez"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              type="text"
              value={rutVisitante}
              onChange={(e) => setRutVisitante(e.target.value)}
              placeholder="RUT visitante"
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D4AF37]"
            />

            <input
              type="text"
              value={patente}
              onChange={(e) => setPatente(e.target.value)}
              placeholder="Patente si corresponde"
              className="rounded-xl border border-slate-200 px-4 py-3 uppercase outline-none focus:border-[#D4AF37]"
            />
          </div>

          <input
            type="text"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Motivo de visita"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D4AF37]"
          />

          <input
            type="text"
            value={autorizadoPor}
            onChange={(e) => setAutorizadoPor(e.target.value)}
            placeholder="Autorizado por"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D4AF37]"
          />

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
              onClick={guardarVisita}
              className="rounded-xl bg-[#061A33] px-5 py-3 font-semibold text-white hover:bg-[#0A2547]"
            >
              Guardar visita
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}