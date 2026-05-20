"use client";

import { useState } from "react";

type Departamento = {
  numero: string;
  tipo: string;
  residentes: string[];
};

type NewDepartmentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (departamento: Departamento) => void;
};

export default function NewDepartmentModal({
  isOpen,
  onClose,
  onSave,
}: NewDepartmentModalProps) {
  const [numero, setNumero] = useState("");
  const [tipo, setTipo] = useState("PROPIETARIO");
  const [residentesTexto, setResidentesTexto] = useState("");

  if (!isOpen) return null;

  const guardarDepartamento = () => {
    if (!numero.trim()) {
      alert("Debes ingresar el número de departamento");
      return;
    }

    const residentes = residentesTexto
      .split("\n")
      .map((residente) => residente.trim())
      .filter((residente) => residente !== "");

    onSave({
      numero,
      tipo,
      residentes,
    });

    setNumero("");
    setTipo("PROPIETARIO");
    setResidentesTexto("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#061A33]">
              Nuevo Departamento
            </h2>
            <p className="text-sm text-slate-500">
              Ingresa los datos principales de la unidad.
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
              Número de departamento
            </label>
            <input
              type="text"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              placeholder="Ej: 310"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D4AF37]"
            >
              <option value="PROPIETARIO">PROPIETARIO</option>
              <option value="ARRENDADO">ARRENDADO</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">
              Residentes
            </label>
            <textarea
              value={residentesTexto}
              onChange={(e) => setResidentesTexto(e.target.value)}
              placeholder="Escribe un residente por línea"
              rows={4}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D4AF37]"
            />
          </div>

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
              onClick={guardarDepartamento}
              className="rounded-xl bg-[#061A33] px-5 py-3 font-semibold text-white hover:bg-[#0A2547]"
            >
              Guardar departamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}