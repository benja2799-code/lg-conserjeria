"use client";

import { useState } from "react";

type Departamento = {
  id?: string;
  numero: string;
};

type Encomienda = {
  departamento_id?: string | null;
  destinatario?: string | null;
  empresa?: string | null;
  descripcion?: string | null;
  recibido_por?: string | null;
  observacion?: string | null;
};

type NewPackageModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (encomienda: Encomienda) => void;
  departamentos: Departamento[];
};

export default function NewPackageModal({
  isOpen,
  onClose,
  onSave,
  departamentos,
}: NewPackageModalProps) {
  const [departamentoId, setDepartamentoId] = useState("");
  const [destinatario, setDestinatario] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [recibidoPor, setRecibidoPor] = useState("");
  const [observacion, setObservacion] = useState("");

  if (!isOpen) return null;

  const limpiarFormulario = () => {
    setDepartamentoId("");
    setDestinatario("");
    setEmpresa("");
    setDescripcion("");
    setRecibidoPor("");
    setObservacion("");
  };

  const guardarEncomienda = () => {
    if (!destinatario.trim()) {
      alert("Debes ingresar el destinatario");
      return;
    }

    onSave({
      departamento_id: departamentoId || null,
      destinatario,
      empresa,
      descripcion,
      recibido_por: recibidoPor,
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
              Nueva Encomienda
            </h2>
            <p className="text-sm text-slate-500">
              Registra la recepción de una encomienda.
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

          <input
            type="text"
            value={destinatario}
            onChange={(e) => setDestinatario(e.target.value)}
            placeholder="Destinatario"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D4AF37]"
          />

          <input
            type="text"
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
            placeholder="Empresa de despacho"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D4AF37]"
          />

          <input
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Descripción de la encomienda"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D4AF37]"
          />

          <input
            type="text"
            value={recibidoPor}
            onChange={(e) => setRecibidoPor(e.target.value)}
            placeholder="Recibido por"
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
              onClick={guardarEncomienda}
              className="rounded-xl bg-[#061A33] px-5 py-3 font-semibold text-white hover:bg-[#0A2547]"
            >
              Guardar encomienda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}