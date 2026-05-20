"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import StatsCard from "../components/StatsCard";
import VehicleCard from "../components/VehicleCard";
import NewVehicleModal from "../components/NewVehicleModal";
import { supabase } from "../lib/supabase";

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
  departamento_numero?: string | null;
  residente_nombre?: string | null;
};

export default function VehiculosPage() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [residentes, setResidentes] = useState<Residente[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [vehiculoEditar, setVehiculoEditar] = useState<Vehiculo | null>(null);
  const [cargando, setCargando] = useState(true);

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

  const cargarResidentes = async () => {
    const { data, error } = await supabase
      .from("residentes")
      .select("id, nombre, departamento_id")
      .order("nombre", { ascending: true });

    if (error) {
      console.error(error);
      alert(`Error al cargar residentes: ${error.message}`);
      return;
    }

    setResidentes(data || []);
  };

  const cargarVehiculos = async () => {
    setCargando(true);

    const { data, error } = await supabase
      .from("vehiculos")
      .select(
        `
        id,
        departamento_id,
        residente_id,
        patente,
        marca,
        modelo,
        color,
        tipo,
        observacion,
        departamentos (
          numero
        ),
        residentes (
          nombre
        )
      `
      )
      .order("patente", { ascending: true });

    if (error) {
      console.error(error);
      alert(`Error al cargar vehículos: ${error.message}`);
      setCargando(false);
      return;
    }

    const vehiculosNormalizados = (data || []).map((item: any) => ({
      id: item.id,
      departamento_id: item.departamento_id,
      residente_id: item.residente_id,
      patente: item.patente,
      marca: item.marca,
      modelo: item.modelo,
      color: item.color,
      tipo: item.tipo,
      observacion: item.observacion,
      departamento_numero: item.departamentos?.numero || null,
      residente_nombre: item.residentes?.nombre || null,
    }));

    setVehiculos(vehiculosNormalizados);
    setCargando(false);
  };

  useEffect(() => {
    cargarDepartamentos();
    cargarResidentes();
    cargarVehiculos();
  }, []);

  const vehiculosFiltrados = vehiculos.filter((vehiculo) => {
    const texto = busqueda.toLowerCase();

    return (
      vehiculo.patente.toLowerCase().includes(texto) ||
      (vehiculo.marca || "").toLowerCase().includes(texto) ||
      (vehiculo.modelo || "").toLowerCase().includes(texto) ||
      (vehiculo.color || "").toLowerCase().includes(texto) ||
      (vehiculo.tipo || "").toLowerCase().includes(texto) ||
      (vehiculo.departamento_numero || "").toLowerCase().includes(texto) ||
      (vehiculo.residente_nombre || "").toLowerCase().includes(texto)
    );
  });

  const guardarVehiculo = async (vehiculo: Vehiculo) => {
    if (vehiculo.id) {
      const { error } = await supabase
        .from("vehiculos")
        .update({
          departamento_id: vehiculo.departamento_id,
          residente_id: vehiculo.residente_id,
          patente: vehiculo.patente,
          marca: vehiculo.marca,
          modelo: vehiculo.modelo,
          color: vehiculo.color,
          tipo: vehiculo.tipo,
          observacion: vehiculo.observacion,
        })
        .eq("id", vehiculo.id);

      if (error) {
        console.error(error);
        alert(`Error al editar vehículo: ${error.message}`);
        return;
      }
    } else {
      const { error } = await supabase.from("vehiculos").insert({
        departamento_id: vehiculo.departamento_id,
        residente_id: vehiculo.residente_id,
        patente: vehiculo.patente,
        marca: vehiculo.marca,
        modelo: vehiculo.modelo,
        color: vehiculo.color,
        tipo: vehiculo.tipo,
        observacion: vehiculo.observacion,
      });

      if (error) {
        console.error(error);
        alert(`Error al crear vehículo: ${error.message}`);
        return;
      }
    }

    setModalAbierto(false);
    setVehiculoEditar(null);
    cargarVehiculos();
  };

  const eliminarVehiculo = async (id?: string) => {
    if (!id) return;

    const confirmar = confirm("¿Seguro que deseas eliminar este vehículo?");

    if (!confirmar) return;

    const { error } = await supabase.from("vehiculos").delete().eq("id", id);

    if (error) {
      console.error(error);
      alert(`Error al eliminar vehículo: ${error.message}`);
      return;
    }

    cargarVehiculos();
  };

  return (
    <main className="min-h-screen bg-[#F4F6F9] text-[#0B1220]">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="flex-1">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5">
            <div>
              <h2 className="text-xl font-bold">Conserjería</h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold">Giovanny Troncoso</p>
                <p className="text-sm text-slate-500">Conserje en turno</p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#061A33] text-white">
                G
              </div>
            </div>
          </header>

          <div className="p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold">Vehículos</h1>
                <p className="mt-1 text-slate-500">
                  Registro y control de vehículos asociados a departamentos y residentes.
                </p>
              </div>

              <button
                onClick={() => {
                  setVehiculoEditar(null);
                  setModalAbierto(true);
                }}
                className="rounded-xl bg-[#061A33] px-6 py-3 font-semibold text-white shadow hover:bg-[#0A2547]"
              >
                + Nuevo Vehículo
              </button>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-4">
              <StatsCard
                title="Total vehículos"
                value={String(vehiculos.length)}
                description="Registrados"
              />

              <StatsCard
                title="Autos"
                value={String(vehiculos.filter((v) => v.tipo === "AUTO").length)}
                description="Vehículos tipo auto"
              />

              <StatsCard
                title="Motos"
                value={String(vehiculos.filter((v) => v.tipo === "MOTO").length)}
                description="Vehículos tipo moto"
              />

              <StatsCard
                title="Asignados"
                value={String(
                  vehiculos.filter((v) => v.departamento_id || v.residente_id)
                    .length
                )}
                description="Con residente o departamento"
              />
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar patente, marca, modelo, residente o departamento..."
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#D4AF37]"
              />

              <select className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#D4AF37]">
                <option>Todos los departamentos</option>
              </select>

              <select className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#D4AF37]">
                <option>Tipo: Todos</option>
                <option>Auto</option>
                <option>Camioneta</option>
                <option>Moto</option>
                <option>Bicicleta</option>
              </select>
            </div>

            <div className="mb-4 text-sm text-slate-500">
              Resultados encontrados: {vehiculosFiltrados.length}
            </div>

            {cargando ? (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                Cargando vehículos...
              </div>
            ) : vehiculosFiltrados.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                {vehiculosFiltrados.map((vehiculo) => (
                  <VehicleCard
                    key={vehiculo.id}
                    vehiculo={vehiculo}
                    onEdit={(vehiculo) => {
                      setVehiculoEditar(vehiculo);
                      setModalAbierto(true);
                    }}
                    onDelete={eliminarVehiculo}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                <h3 className="text-xl font-bold">Sin vehículos</h3>
                <p className="mt-2 text-slate-500">
                  No se encontraron vehículos registrados.
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

      <NewVehicleModal
        isOpen={modalAbierto}
        onClose={() => {
          setModalAbierto(false);
          setVehiculoEditar(null);
        }}
        onSave={guardarVehiculo}
        vehiculoEditar={vehiculoEditar}
        departamentos={departamentos}
        residentes={residentes}
      />
    </main>
  );
}