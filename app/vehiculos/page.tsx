"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import StatsCard from "../components/StatsCard";
import { supabase } from "../lib/supabase";
import { registrarEvento } from "../lib/registrarEvento";

type Departamento = {
  id: string;
  numero: string;
};

type Vehiculo = {
  id: string;
  departamento_id: string | null;
  patente: string;
  marca: string | null;
  modelo: string | null;
  color: string | null;
  propietario: string | null;
  tipo_vehiculo: string | null;
  estacionamiento: string | null;
  estado: string | null;
  observacion: string | null;
  created_at: string | null;
};

export default function VehiculosPage() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [departamentoId, setDepartamentoId] = useState("");
  const [patente, setPatente] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [color, setColor] = useState("");
  const [propietario, setPropietario] = useState("");
  const [tipoVehiculo, setTipoVehiculo] = useState("AUTO");
  const [estacionamiento, setEstacionamiento] = useState("");
  const [estado, setEstado] = useState("ACTIVO");
  const [observacion, setObservacion] = useState("");

  const cargarDepartamentos = async () => {
    const { data, error } = await supabase
      .from("departamentos")
      .select("id, numero")
      .order("numero", { ascending: true });

    if (error) {
      console.error("Error al cargar departamentos:", error);
      return;
    }

    setDepartamentos(data || []);
  };

  const cargarVehiculos = async () => {
    setCargando(true);

    const { data, error } = await supabase
      .from("vehiculos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al cargar vehículos:", error);
      alert(`Error al cargar vehículos: ${error.message}`);
      setCargando(false);
      return;
    }

    setVehiculos((data || []) as Vehiculo[]);
    setCargando(false);
  };

  useEffect(() => {
    cargarDepartamentos();
    cargarVehiculos();
  }, []);

  const obtenerNumeroDepartamento = (id: string | null) => {
    if (!id) return "-";

    const departamento = departamentos.find((depto) => depto.id === id);

    return departamento?.numero || "-";
  };

  const limpiarFormulario = () => {
    setDepartamentoId("");
    setPatente("");
    setMarca("");
    setModelo("");
    setColor("");
    setPropietario("");
    setTipoVehiculo("AUTO");
    setEstacionamiento("");
    setEstado("ACTIVO");
    setObservacion("");
  };

  const abrirFormulario = () => {
    setMostrarFormulario(true);

    setTimeout(() => {
      const form = document.getElementById("formulario-vehiculo");
      form?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const cerrarFormulario = () => {
    limpiarFormulario();
    setMostrarFormulario(false);
  };

  const registrarVehiculo = async () => {
    if (!patente.trim()) {
      alert("Debes ingresar la patente del vehículo.");
      return;
    }

    if (!departamentoId) {
      alert("Debes seleccionar un departamento.");
      return;
    }

    const existe = vehiculos.some(
      (vehiculo) =>
        vehiculo.patente.toLowerCase() === patente.trim().toLowerCase()
    );

    if (existe) {
      alert("Ya existe un vehículo registrado con esa patente.");
      return;
    }

    const { data, error } = await supabase
      .from("vehiculos")
      .insert({
        departamento_id: departamentoId,
        patente: patente.trim().toUpperCase(),
        marca: marca.trim() || null,
        modelo: modelo.trim() || null,
        color: color.trim() || null,
        propietario: propietario.trim() || null,
        tipo_vehiculo: tipoVehiculo,
        estacionamiento: estacionamiento.trim() || null,
        estado,
        observacion: observacion.trim() || null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error al registrar vehículo:", error);
      alert(`Error al registrar vehículo: ${error.message}`);
      return;
    }

    const departamentoNumero = obtenerNumeroDepartamento(departamentoId);

    await registrarEvento({
      modulo: "Vehículos",
      accion: "Crear vehículo",
      descripcion: `Se registró el vehículo patente ${patente
        .trim()
        .toUpperCase()} asociado al departamento ${departamentoNumero}.`,
      referencia_id: data?.id || null,
      referencia_tabla: "vehiculos",
    });

    limpiarFormulario();
    setMostrarFormulario(false);
    await cargarVehiculos();

    alert("Vehículo registrado correctamente.");
  };

  const cambiarEstadoVehiculo = async (vehiculo: Vehiculo) => {
    const estadoActual = vehiculo.estado || "ACTIVO";
    const nuevoEstado = estadoActual === "ACTIVO" ? "INACTIVO" : "ACTIVO";

    const confirmar = confirm(
      `¿Deseas cambiar el estado del vehículo ${vehiculo.patente} a ${nuevoEstado}?`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("vehiculos")
      .update({
        estado: nuevoEstado,
      })
      .eq("id", vehiculo.id);

    if (error) {
      console.error("Error al cambiar estado:", error);
      alert(`Error al cambiar estado: ${error.message}`);
      return;
    }

    await registrarEvento({
      modulo: "Vehículos",
      accion: "Cambiar estado vehículo",
      descripcion: `Se cambió el estado del vehículo ${vehiculo.patente} a ${nuevoEstado}.`,
      referencia_id: vehiculo.id,
      referencia_tabla: "vehiculos",
    });

    await cargarVehiculos();
  };

  const eliminarVehiculo = async (vehiculo: Vehiculo) => {
    const confirmar = confirm(
      `¿Deseas eliminar el vehículo patente ${vehiculo.patente}?`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("vehiculos")
      .delete()
      .eq("id", vehiculo.id);

    if (error) {
      console.error("Error al eliminar vehículo:", error);
      alert(`Error al eliminar vehículo: ${error.message}`);
      return;
    }

    await registrarEvento({
      modulo: "Vehículos",
      accion: "Eliminar vehículo",
      descripcion: `Se eliminó el vehículo patente ${vehiculo.patente}.`,
      referencia_id: vehiculo.id,
      referencia_tabla: "vehiculos",
    });

    await cargarVehiculos();
  };

  const vehiculosFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase();

    return vehiculos.filter((vehiculo) => {
      const numeroDepto = obtenerNumeroDepartamento(
        vehiculo.departamento_id
      ).toLowerCase();

      return (
        vehiculo.patente.toLowerCase().includes(texto) ||
        (vehiculo.marca || "").toLowerCase().includes(texto) ||
        (vehiculo.modelo || "").toLowerCase().includes(texto) ||
        (vehiculo.color || "").toLowerCase().includes(texto) ||
        (vehiculo.propietario || "").toLowerCase().includes(texto) ||
        (vehiculo.tipo_vehiculo || "").toLowerCase().includes(texto) ||
        (vehiculo.estacionamiento || "").toLowerCase().includes(texto) ||
        (vehiculo.estado || "").toLowerCase().includes(texto) ||
        numeroDepto.includes(texto)
      );
    });
  }, [vehiculos, busqueda, departamentos]);

  const vehiculosActivos = vehiculos.filter(
    (vehiculo) => vehiculo.estado === "ACTIVO"
  );

  const vehiculosInactivos = vehiculos.filter(
    (vehiculo) => vehiculo.estado === "INACTIVO"
  );

  const autos = vehiculos.filter((vehiculo) => vehiculo.tipo_vehiculo === "AUTO");

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
                  Control vehicular
                </p>

                <h1 className="text-4xl font-black text-[#0B1F3A]">
                  Vehículos
                </h1>

                <p className="mt-2 max-w-2xl text-slate-500">
                  Administra vehículos asociados a departamentos, propietarios y
                  estacionamientos del edificio.
                </p>

                <div className="mt-4 h-1 w-16 rounded-full bg-[#D9A520]" />
              </div>

              <button
                onClick={mostrarFormulario ? cerrarFormulario : abrirFormulario}
                className={`w-fit rounded-xl px-5 py-3 text-sm font-bold shadow-md transition ${
                  mostrarFormulario
                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                    : "bg-[#0B1F3A] text-white hover:bg-[#163B73]"
                }`}
              >
                {mostrarFormulario ? "Cerrar formulario" : "+ Nuevo vehículo"}
              </button>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-4">
              <StatsCard
                title="Total"
                value={String(vehiculos.length)}
                description="Vehículos registrados"
                highlighted
              />

              <StatsCard
                title="Activos"
                value={String(vehiculosActivos.length)}
                description="Vehículos vigentes"
              />

              <StatsCard
                title="Inactivos"
                value={String(vehiculosInactivos.length)}
                description="Vehículos no vigentes"
              />

              <StatsCard
                title="Autos"
                value={String(autos.length)}
                description="Tipo automóvil"
              />
            </div>

            {mostrarFormulario && (
              <section
                id="formulario-vehiculo"
                className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-[#0B1F3A]">
                      Nuevo vehículo
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Completa los datos para agregar un vehículo al sistema.
                    </p>
                  </div>

                  <button
                    onClick={cerrarFormulario}
                    className="w-fit rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-2 text-sm font-bold text-[#0B1F3A] transition hover:bg-slate-100"
                  >
                    Cancelar
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                      Departamento
                    </label>

                    <select
                      value={departamentoId}
                      onChange={(e) => setDepartamentoId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520]"
                    >
                      <option value="">Seleccionar departamento</option>

                      {departamentos.map((departamento) => (
                        <option key={departamento.id} value={departamento.id}>
                          Depto {departamento.numero}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Campo
                    label="Patente"
                    value={patente}
                    onChange={setPatente}
                    placeholder="Ej: AB-CD-12"
                  />

                  <Campo
                    label="Marca"
                    value={marca}
                    onChange={setMarca}
                    placeholder="Ej: Toyota"
                  />

                  <Campo
                    label="Modelo"
                    value={modelo}
                    onChange={setModelo}
                    placeholder="Ej: Corolla"
                  />

                  <Campo
                    label="Color"
                    value={color}
                    onChange={setColor}
                    placeholder="Ej: Blanco"
                  />

                  <Campo
                    label="Propietario"
                    value={propietario}
                    onChange={setPropietario}
                    placeholder="Ej: Juan Pérez"
                  />

                  <div>
                    <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                      Tipo vehículo
                    </label>

                    <select
                      value={tipoVehiculo}
                      onChange={(e) => setTipoVehiculo(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520]"
                    >
                      <option value="AUTO">Auto</option>
                      <option value="CAMIONETA">Camioneta</option>
                      <option value="MOTO">Moto</option>
                      <option value="BICICLETA">Bicicleta</option>
                      <option value="OTRO">Otro</option>
                    </select>
                  </div>

                  <Campo
                    label="Estacionamiento"
                    value={estacionamiento}
                    onChange={setEstacionamiento}
                    placeholder="Ej: E-12"
                  />

                  <div>
                    <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                      Estado
                    </label>

                    <select
                      value={estado}
                      onChange={(e) => setEstado(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520]"
                    >
                      <option value="ACTIVO">Activo</option>
                      <option value="INACTIVO">Inactivo</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                    Observación
                  </label>

                  <textarea
                    value={observacion}
                    onChange={(e) => setObservacion(e.target.value)}
                    placeholder="Ej: Vehículo de uso frecuente, estacionamiento asignado, autorizado por administración, etc."
                    className="min-h-[90px] w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520]"
                  />
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    onClick={registrarVehiculo}
                    className="rounded-xl bg-[#0B1F3A] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#163B73]"
                  >
                    Guardar vehículo
                  </button>

                  <button
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
                    Listado de vehículos
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Vehículos registrados actualmente en el edificio.
                  </p>
                </div>

                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar vehículo..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#D9A520] md:w-72"
                />
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full table-fixed border-collapse text-sm">
                  <thead className="bg-[#0B1F3A] text-white">
                    <tr>
                      <th className="w-[12%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Depto
                      </th>
                      <th className="w-[14%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Patente
                      </th>
                      <th className="w-[20%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Vehículo
                      </th>
                      <th className="w-[18%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Propietario
                      </th>
                      <th className="w-[12%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Estac.
                      </th>
                      <th className="w-[12%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Estado
                      </th>
                      <th className="w-[12%] px-3 py-3 text-left text-[11px] font-black uppercase">
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
                          Cargando vehículos...
                        </td>
                      </tr>
                    ) : vehiculosFiltrados.length > 0 ? (
                      vehiculosFiltrados.map((vehiculo) => (
                        <tr
                          key={vehiculo.id}
                          className="border-b border-slate-100 hover:bg-[#F8FAFC]"
                        >
                          <td className="px-3 py-3 align-top">
                            <p className="truncate text-sm font-black text-[#0B1F3A]">
                              {obtenerNumeroDepartamento(vehiculo.departamento_id)}
                            </p>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <p className="truncate text-xs font-black text-slate-700">
                              {vehiculo.patente}
                            </p>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-slate-700">
                                {vehiculo.marca || "-"} {vehiculo.modelo || ""}
                              </p>
                              <p className="truncate text-[11px] text-slate-400">
                                {vehiculo.color || "-"} ·{" "}
                                {vehiculo.tipo_vehiculo || "-"}
                              </p>
                            </div>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <p className="truncate text-xs text-slate-500">
                              {vehiculo.propietario || "-"}
                            </p>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <p className="truncate text-xs font-bold text-slate-600">
                              {vehiculo.estacionamiento || "-"}
                            </p>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <span
                              className={`inline-flex max-w-full rounded-full px-2.5 py-1 text-[10px] font-black ${
                                vehiculo.estado === "ACTIVO"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {vehiculo.estado || "-"}
                            </span>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <div className="flex flex-col gap-1.5">
                              <button
                                onClick={() => cambiarEstadoVehiculo(vehiculo)}
                                className="rounded-lg bg-blue-50 px-2 py-1.5 text-[11px] font-bold text-blue-700 transition hover:bg-blue-100"
                              >
                                Estado
                              </button>

                              <button
                                onClick={() => eliminarVehiculo(vehiculo)}
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
                          No se encontraron vehículos.
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