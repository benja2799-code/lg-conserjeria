"use client";

import { useState } from "react";

type Novedad = {
  tipo?: string | null;
  titulo: string;
  descripcion?: string | null;
  registrado_por?: string | null;
  turno?: string | null;
};

type NewNoveltyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (novedad: Novedad) => void;
};

export default function NewNoveltyModal({
  isOpen,
  onClose,
  onSave,
}: NewNoveltyModalProps) {
  const [tipo, setTipo] = useState("NOVEDAD");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [registradoPor, setRegistradoPor] = useState("");
  const [turno, setTurno] = useState("08:00 - 20:00");

  if (!isOpen) return null;

  const limpiarFormulario = () => {
    setTipo("NOVEDAD");
    setTitulo("");
    setDescripcion("");
    setRegistradoPor("");
    setTurno("08:00 - 20:00");
  };

  const guardarNovedad = () => {
    if (!titulo.trim()) {
      alert("Debes ingresar un título para la novedad");
      return;
    }

    onSave({
      tipo,
      titulo,
      descripcion,
      registrado_por: registradoPor,
      turno,
    });

    limpiarFormulario();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#061A33]">
              Nueva Novedad
            </h2>
            <p className="text-sm text-slate-500">
              Registra una novedad, incidente u observación del turno.
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
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D4AF37]"
          >
            <option value="NOVEDAD">NOVEDAD</option>
            <option value="INCIDENTE">INCIDENTE</option>
            <option value="RONDA">RONDA</option>
            <option value="RECLAMO">RECLAMO</option>
            <option value="EMERGENCIA">EMERGENCIA</option>
            <option value="CAMBIO DE TURNO">CAMBIO DE TURNO</option>
          </select>

          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Título de la novedad"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D4AF37]"
          />

          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Descripción detallada"
            rows={4}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D4AF37]"
          />

          <input
            type="text"
            value={registradoPor}
            onChange={(e) => setRegistradoPor(e.target.value)}
            placeholder="Registrado por"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D4AF37]"
          />

          <select
            value={turno}
            onChange={(e) => setTurno(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D4AF37]"
          >
            <option value="08:00 - 20:00">08:00 - 20:00</option>
            <option value="20:00 - 08:00">20:00 - 08:00</option>
            <option value="Otro">Otro</option>
          </select>

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
              onClick={guardarNovedad}
              className="rounded-xl bg-[#061A33] px-5 py-3 font-semibold text-white hover:bg-[#0A2547]"
            >
              Guardar novedad
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}