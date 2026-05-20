"use client";

import { useEffect, useState } from "react";

type Departamento = {
  id?: string;
  numero: string;
};

type Residente = {
  id?: string;
  departamento_id?: string | null;
  nombre: string;
  rut?: string | null;
  telefono?: string | null;
  email?: string | null;
  tipo?: string | null;
};

type NewResidentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (residente: Residente) => void;
  residenteEditar?: Residente | null;
  departamentos: Departamento[];
};

export default function NewResidentModal({
  isOpen,
  onClose,
  onSave,
  residenteEditar,
  departamentos,
}: NewResidentModalProps) {
  const [nombre, setNombre] = useState("");
  const [rut, setRut] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [tipo, setTipo] = useState("RESIDENTE");
  const [departamentoId, setDepartamentoId] = useState("");

  useEffect(() => {
    if (residenteEditar) {
      setNombre(residenteEditar.nombre || "");
      setRut(residenteEditar.rut || "");
      setTelefono(residenteEditar.telefono || "");
      setEmail(residenteEditar.email || "");
      setTipo(residenteEditar.tipo || "RESIDENTE");
      setDepartamentoId(residenteEditar.departamento_id || "");
    } else {
      setNombre("");
      setRut("");
      setTelefono("");
      setEmail("");
      setTipo("RESIDENTE");
      setDepartamentoId("");
    }
  }, [residenteEditar, isOpen]);

  if (!isOpen) return null;

  const guardarResidente = () => {
    if (!nombre.trim()) {
      alert("Debes ingresar el nombre del residente");
      return;
    }

    onSave({
      id: residenteEditar?.id,
      nombre,
      rut,
      telefono,
      email,
      tipo,
      departamento_id: departamentoId || null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#061A33]">
              {residenteEditar ? "Editar Residente" : "Nuevo Residente"}
            </h2>
            <p className="text-sm text-slate-500">
              Ingresa los datos principales del residente.
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
            <label className="mb-1 block text-sm font-semibold">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Benjamín Jacobs"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D4AF37]"
            />
          </div>

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
            <label className="mb-1 block text-sm font-semibold">RUT</label>
            <input
              type="text"
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              placeholder="Ej: 12.345.678-9"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">
              Teléfono
            </label>
            <input
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Ej: +56 9 1234 5678"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.cl"
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
              <option value="RESIDENTE">RESIDENTE</option>
              <option value="PROPIETARIO">PROPIETARIO</option>
              <option value="ARRENDATARIO">ARRENDATARIO</option>
            </select>
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
              onClick={guardarResidente}
              className="rounded-xl bg-[#061A33] px-5 py-3 font-semibold text-white hover:bg-[#0A2547]"
            >
              {residenteEditar ? "Guardar cambios" : "Guardar residente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}