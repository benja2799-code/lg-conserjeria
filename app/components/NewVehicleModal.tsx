"use client";

import { useEffect, useState } from "react";

type Departamento = {
  id?: string;
  numero: string;
};

type Residente = {
  id?: string;
  nombre: string;
  departamento_id?: string | null;
};

type Vehiculo = {
  id?: string;
  departamento_id?: string | null;
  residente_id?: string | null;
  patente: string;
  marca?: string | null;
  modelo?: string | null;
  color?: string | null;
  tipo?: string | null;
  observacion?: string | null;
};

type NewVehicleModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehiculo: Vehiculo) => void;
  vehiculoEditar?: Vehiculo | null;
  departamentos: Departamento[];
  residentes: Residente[];
};

export default function NewVehicleModal({
  isOpen,
  onClose,
  onSave,
  vehiculoEditar,
  departamentos,
  residentes,
}: NewVehicleModalProps) {
  const [patente, setPatente] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [color, setColor] = useState("");
  const [tipo, setTipo] = useState("AUTO");
  const [observacion, setObservacion] = useState("");
  const [departamentoId, setDepartamentoId] = useState("");
  const [residenteId, setResidenteId] = useState("");

  useEffect(() => {
    if (vehiculoEditar) {
      setPatente(vehiculoEditar.patente || "");
      setMarca(vehiculoEditar.marca || "");
      setModelo(vehiculoEditar.modelo || "");
      setColor(vehiculoEditar.color || "");
      setTipo(vehiculoEditar.tipo || "AUTO");
      setObservacion(vehiculoEditar.observacion || "");
      setDepartamentoId(vehiculoEditar.departamento_id || "");
      setResidenteId(vehiculoEditar.residente_id || "");
    } else {
      setPatente("");
      setMarca("");
      setModelo("");
      setColor("");
      setTipo("AUTO");
      setObservacion("");
      setDepartamentoId("");
      setResidenteId("");
    }
  }, [vehiculoEditar, isOpen]);

  if (!isOpen) return null;

  const residentesFiltrados = departamentoId
    ? residentes.filter((residente) => residente.departamento_id === departamentoId)
    : residentes;

  const guardarVehiculo = () => {
    if (!patente.trim()) {
      alert("Debes ingresar la patente del vehículo");
      return;
    }

    onSave({
      id: vehiculoEditar?.id,
      patente: patente.toUpperCase(),
      marca,
      modelo,
      color,
      tipo,
      observacion,
      departamento_id: departamentoId || null,
      residente_id: residenteId || null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#061A33]">
              {vehiculoEditar ? "Editar Vehículo" : "Nuevo Vehículo"}
            </h2>
            <p className="text-sm text-slate-500">
              Ingresa los datos principales del vehículo.
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
            <label className="mb-1 block text-sm font-semibold">Patente</label>
            <input
              type="text"
              value={patente}
              onChange={(e) => setPatente(e.target.value)}
              placeholder="Ej: ABCD12"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 uppercase outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">
              Departamento
            </label>
            <select
              value={departamentoId}
              onChange={(e) => {
                setDepartamentoId(e.target.value);
                setResidenteId("");
              }}
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
              Residente asociado
            </label>
            <select
              value={residenteId}
              onChange={(e) => setResidenteId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D4AF37]"
            >
              <option value="">Seleccionar residente</option>
              {residentesFiltrados.map((residente) => (
                <option key={residente.id} value={residente.id}>
                  {residente.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              type="text"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              placeholder="Marca"
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D4AF37]"
            />

            <input
              type="text"
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              placeholder="Modelo"
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D4AF37]"
            />

            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="Color"
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D4AF37]"
            />

            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D4AF37]"
            >
              <option value="AUTO">AUTO</option>
              <option value="CAMIONETA">CAMIONETA</option>
              <option value="MOTO">MOTO</option>
              <option value="BICICLETA">BICICLETA</option>
              <option value="OTRO">OTRO</option>
            </select>
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
              onClick={guardarVehiculo}
              className="rounded-xl bg-[#061A33] px-5 py-3 font-semibold text-white hover:bg-[#0A2547]"
            >
              {vehiculoEditar ? "Guardar cambios" : "Guardar vehículo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}