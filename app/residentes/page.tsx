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

type Residente = {
  id: string;
  departamento_id: string | null;
  nombre: string;
  rut: string | null;
  telefono: string | null;
  correo: string | null;
  tipo_residente: string | null;
  estado: string | null;
  contacto_emergencia: string | null;
  telefono_emergencia: string | null;
  observacion: string | null;
  created_at: string | null;
};

export default function ResidentesPage() {
  const [residentes, setResidentes] = useState<Residente[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [departamentoId, setDepartamentoId] = useState("");
  const [nombre, setNombre] = useState("");
  const [rut, setRut] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [tipoResidente, setTipoResidente] = useState("PROPIETARIO");
  const [estado, setEstado] = useState("ACTIVO");
  const [contactoEmergencia, setContactoEmergencia] = useState("");
  const [telefonoEmergencia, setTelefonoEmergencia] = useState("");
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

  const cargarResidentes = async () => {
    setCargando(true);

    const { data, error } = await supabase
      .from("residentes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al cargar residentes:", error);
      alert(`Error al cargar residentes: ${error.message}`);
      setCargando(false);
      return;
    }

    setResidentes((data || []) as Residente[]);
    setCargando(false);
  };

  useEffect(() => {
    cargarDepartamentos();
    cargarResidentes();
  }, []);

  const obtenerNumeroDepartamento = (id: string | null) => {
    if (!id) return "-";

    const departamento = departamentos.find((depto) => depto.id === id);

    return departamento?.numero || "-";
  };

  const limpiarFormulario = () => {
    setDepartamentoId("");
    setNombre("");
    setRut("");
    setTelefono("");
    setCorreo("");
    setTipoResidente("PROPIETARIO");
    setEstado("ACTIVO");
    setContactoEmergencia("");
    setTelefonoEmergencia("");
    setObservacion("");
  };

  const abrirFormulario = () => {
    setMostrarFormulario(true);

    setTimeout(() => {
      const form = document.getElementById("formulario-residente");
      form?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const cerrarFormulario = () => {
    limpiarFormulario();
    setMostrarFormulario(false);
  };

  const registrarResidente = async () => {
    if (!nombre.trim()) {
      alert("Debes ingresar el nombre del residente.");
      return;
    }

    if (!departamentoId) {
      alert("Debes seleccionar un departamento.");
      return;
    }

    const { data, error } = await supabase
      .from("residentes")
      .insert({
        departamento_id: departamentoId,
        nombre: nombre.trim(),
        rut: rut.trim() || null,
        telefono: telefono.trim() || null,
        correo: correo.trim() || null,
        tipo_residente: tipoResidente,
        estado,
        contacto_emergencia: contactoEmergencia.trim() || null,
        telefono_emergencia: telefonoEmergencia.trim() || null,
        observacion: observacion.trim() || null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error al registrar residente:", error);
      alert(`Error al registrar residente: ${error.message}`);
      return;
    }

    const departamentoNumero = obtenerNumeroDepartamento(departamentoId);

    await registrarEvento({
      modulo: "Residentes",
      accion: "Crear residente",
      descripcion: `Se registró el residente ${nombre.trim()} en el departamento ${departamentoNumero}.`,
      referencia_id: data?.id || null,
      referencia_tabla: "residentes",
    });

    limpiarFormulario();
    setMostrarFormulario(false);
    await cargarResidentes();

    alert("Residente registrado correctamente.");
  };

  const cambiarEstadoResidente = async (residente: Residente) => {
    const estadoActual = residente.estado || "ACTIVO";
    const nuevoEstado = estadoActual === "ACTIVO" ? "INACTIVO" : "ACTIVO";

    const confirmar = confirm(
      `¿Deseas cambiar el estado de ${residente.nombre} a ${nuevoEstado}?`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("residentes")
      .update({
        estado: nuevoEstado,
      })
      .eq("id", residente.id);

    if (error) {
      console.error("Error al cambiar estado:", error);
      alert(`Error al cambiar estado: ${error.message}`);
      return;
    }

    await registrarEvento({
      modulo: "Residentes",
      accion: "Cambiar estado residente",
      descripcion: `Se cambió el estado del residente ${residente.nombre} a ${nuevoEstado}.`,
      referencia_id: residente.id,
      referencia_tabla: "residentes",
    });

    await cargarResidentes();
  };

  const eliminarResidente = async (residente: Residente) => {
    const confirmar = confirm(
      `¿Deseas eliminar al residente ${residente.nombre}?`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("residentes")
      .delete()
      .eq("id", residente.id);

    if (error) {
      console.error("Error al eliminar residente:", error);
      alert(`Error al eliminar residente: ${error.message}`);
      return;
    }

    await registrarEvento({
      modulo: "Residentes",
      accion: "Eliminar residente",
      descripcion: `Se eliminó el residente ${residente.nombre}.`,
      referencia_id: residente.id,
      referencia_tabla: "residentes",
    });

    await cargarResidentes();
  };

  const residentesFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase();

    return residentes.filter((residente) => {
      const numeroDepto = obtenerNumeroDepartamento(
        residente.departamento_id
      ).toLowerCase();

      return (
        residente.nombre.toLowerCase().includes(texto) ||
        (residente.rut || "").toLowerCase().includes(texto) ||
        (residente.telefono || "").toLowerCase().includes(texto) ||
        (residente.correo || "").toLowerCase().includes(texto) ||
        (residente.tipo_residente || "").toLowerCase().includes(texto) ||
        (residente.estado || "").toLowerCase().includes(texto) ||
        (residente.contacto_emergencia || "").toLowerCase().includes(texto) ||
        numeroDepto.includes(texto)
      );
    });
  }, [residentes, busqueda, departamentos]);

  const residentesActivos = residentes.filter(
    (residente) => residente.estado === "ACTIVO"
  );

  const residentesInactivos = residentes.filter(
    (residente) => residente.estado === "INACTIVO"
  );

  const propietarios = residentes.filter(
    (residente) => residente.tipo_residente === "PROPIETARIO"
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
                  Administración de residentes
                </p>

                <h1 className="text-4xl font-black text-[#0B1F3A]">
                  Residentes
                </h1>

                <p className="mt-2 max-w-2xl text-slate-500">
                  Administra residentes, propietarios, arrendatarios y datos de
                  contacto asociados a cada departamento.
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
                {mostrarFormulario ? "Cerrar formulario" : "+ Nuevo residente"}
              </button>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-4">
              <StatsCard
                title="Total"
                value={String(residentes.length)}
                description="Residentes registrados"
                highlighted
              />

              <StatsCard
                title="Activos"
                value={String(residentesActivos.length)}
                description="Residentes vigentes"
              />

              <StatsCard
                title="Inactivos"
                value={String(residentesInactivos.length)}
                description="Residentes no vigentes"
              />

              <StatsCard
                title="Propietarios"
                value={String(propietarios.length)}
                description="Tipo propietario"
              />
            </div>

            {mostrarFormulario && (
              <section
                id="formulario-residente"
                className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-[#0B1F3A]">
                      Nuevo residente
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Completa los datos para agregar un residente al sistema.
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
                    label="Nombre completo"
                    value={nombre}
                    onChange={setNombre}
                    placeholder="Ej: Juan Pérez Soto"
                  />

                  <Campo
                    label="RUT"
                    value={rut}
                    onChange={setRut}
                    placeholder="Ej: 12.345.678-9"
                  />

                  <Campo
                    label="Teléfono"
                    value={telefono}
                    onChange={setTelefono}
                    placeholder="Ej: +56 9 1234 5678"
                  />

                  <Campo
                    label="Correo"
                    value={correo}
                    onChange={setCorreo}
                    placeholder="Ej: residente@correo.cl"
                  />

                  <div>
                    <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                      Tipo residente
                    </label>

                    <select
                      value={tipoResidente}
                      onChange={(e) => setTipoResidente(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520]"
                    >
                      <option value="PROPIETARIO">Propietario</option>
                      <option value="ARRENDATARIO">Arrendatario</option>
                      <option value="FAMILIAR">Familiar</option>
                      <option value="OTRO">Otro</option>
                    </select>
                  </div>

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

                  <Campo
                    label="Contacto emergencia"
                    value={contactoEmergencia}
                    onChange={setContactoEmergencia}
                    placeholder="Ej: María Soto"
                  />

                  <Campo
                    label="Teléfono emergencia"
                    value={telefonoEmergencia}
                    onChange={setTelefonoEmergencia}
                    placeholder="Ej: +56 9 8765 4321"
                  />
                </div>

                <div className="mt-4">
                  <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                    Observación
                  </label>

                  <textarea
                    value={observacion}
                    onChange={(e) => setObservacion(e.target.value)}
                    placeholder="Ej: Residente principal, adulto mayor, contacto preferente, etc."
                    className="min-h-[90px] w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520]"
                  />
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    onClick={registrarResidente}
                    className="rounded-xl bg-[#0B1F3A] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#163B73]"
                  >
                    Guardar residente
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
                    Listado de residentes
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Personas registradas actualmente en el edificio.
                  </p>
                </div>

                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar residente..."
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
                      <th className="w-[20%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Nombre
                      </th>
                      <th className="w-[16%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        RUT
                      </th>
                      <th className="w-[20%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Contacto
                      </th>
                      <th className="w-[13%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Tipo
                      </th>
                      <th className="w-[9%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Estado
                      </th>
                      <th className="w-[10%] px-3 py-3 text-left text-[11px] font-black uppercase">
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
                          Cargando residentes...
                        </td>
                      </tr>
                    ) : residentesFiltrados.length > 0 ? (
                      residentesFiltrados.map((residente) => (
                        <tr
                          key={residente.id}
                          className="border-b border-slate-100 hover:bg-[#F8FAFC]"
                        >
                          <td className="px-3 py-3 align-top">
                            <p className="truncate text-sm font-black text-[#0B1F3A]">
                              {obtenerNumeroDepartamento(
                                residente.departamento_id
                              )}
                            </p>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <p className="truncate text-xs font-bold text-slate-700">
                              {residente.nombre}
                            </p>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <p className="truncate text-xs text-slate-500">
                              {residente.rut || "-"}
                            </p>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold text-slate-600">
                                {residente.telefono || "-"}
                              </p>
                              <p className="truncate text-[11px] text-slate-400">
                                {residente.correo || "-"}
                              </p>
                            </div>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <span className="inline-flex max-w-full rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-600">
                              {residente.tipo_residente || "-"}
                            </span>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <span
                              className={`inline-flex max-w-full rounded-full px-2.5 py-1 text-[10px] font-black ${
                                residente.estado === "ACTIVO"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {residente.estado || "-"}
                            </span>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <div className="flex flex-col gap-1.5">
                              <button
                                onClick={() =>
                                  cambiarEstadoResidente(residente)
                                }
                                className="rounded-lg bg-blue-50 px-2 py-1.5 text-[11px] font-bold text-blue-700 transition hover:bg-blue-100"
                              >
                                Estado
                              </button>

                              <button
                                onClick={() => eliminarResidente(residente)}
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
                          No se encontraron residentes.
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