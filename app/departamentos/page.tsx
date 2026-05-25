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
  piso: string | null;
  torre: string | null;
  propietario: string | null;
  telefono_propietario: string | null;
  correo_propietario: string | null;
  estado: string | null;
  observacion: string | null;
  created_at: string | null;
};

export default function DepartamentosPage() {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [numero, setNumero] = useState("");
  const [piso, setPiso] = useState("");
  const [torre, setTorre] = useState("");
  const [propietario, setPropietario] = useState("");
  const [telefonoPropietario, setTelefonoPropietario] = useState("");
  const [correoPropietario, setCorreoPropietario] = useState("");
  const [estado, setEstado] = useState("HABITADO");
  const [observacion, setObservacion] = useState("");

  const cargarDepartamentos = async () => {
    setCargando(true);

    const { data, error } = await supabase
      .from("departamentos")
      .select("*")
      .order("numero", { ascending: true });

    if (error) {
      console.error("Error al cargar departamentos:", error);
      alert(`Error al cargar departamentos: ${error.message}`);
      setCargando(false);
      return;
    }

    setDepartamentos((data || []) as Departamento[]);
    setCargando(false);
  };

  useEffect(() => {
    cargarDepartamentos();
  }, []);

  const limpiarFormulario = () => {
    setNumero("");
    setPiso("");
    setTorre("");
    setPropietario("");
    setTelefonoPropietario("");
    setCorreoPropietario("");
    setEstado("HABITADO");
    setObservacion("");
  };

  const abrirFormulario = () => {
    setMostrarFormulario(true);

    setTimeout(() => {
      const form = document.getElementById("formulario-departamento");
      form?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const cerrarFormulario = () => {
    limpiarFormulario();
    setMostrarFormulario(false);
  };

  const registrarDepartamento = async () => {
    if (!numero.trim()) {
      alert("Debes ingresar el número del departamento.");
      return;
    }

    const existe = departamentos.some(
      (departamento) =>
        departamento.numero.toLowerCase() === numero.trim().toLowerCase()
    );

    if (existe) {
      alert("Ya existe un departamento con ese número.");
      return;
    }

    const { data, error } = await supabase
      .from("departamentos")
      .insert({
        numero: numero.trim(),
        piso: piso.trim() || null,
        torre: torre.trim() || null,
        propietario: propietario.trim() || null,
        telefono_propietario: telefonoPropietario.trim() || null,
        correo_propietario: correoPropietario.trim() || null,
        estado,
        observacion: observacion.trim() || null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error al registrar departamento:", error);
      alert(`Error al registrar departamento: ${error.message}`);
      return;
    }

    await registrarEvento({
      modulo: "Departamentos",
      accion: "Crear departamento",
      descripcion: `Se registró el departamento ${numero.trim()}${
        propietario.trim() ? `, propietario ${propietario.trim()}` : ""
      }.`,
      referencia_id: data?.id || null,
      referencia_tabla: "departamentos",
    });

    limpiarFormulario();
    setMostrarFormulario(false);
    await cargarDepartamentos();

    alert("Departamento registrado correctamente.");
  };

  const cambiarEstadoDepartamento = async (departamento: Departamento) => {
    const estadoActual = departamento.estado || "HABITADO";

    let nuevoEstado = "HABITADO";

    if (estadoActual === "HABITADO") {
      nuevoEstado = "DESOCUPADO";
    } else if (estadoActual === "DESOCUPADO") {
      nuevoEstado = "MANTENCION";
    } else {
      nuevoEstado = "HABITADO";
    }

    const confirmar = confirm(
      `¿Deseas cambiar el estado del departamento ${departamento.numero} a ${nuevoEstado}?`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("departamentos")
      .update({
        estado: nuevoEstado,
      })
      .eq("id", departamento.id);

    if (error) {
      console.error("Error al cambiar estado:", error);
      alert(`Error al cambiar estado: ${error.message}`);
      return;
    }

    await registrarEvento({
      modulo: "Departamentos",
      accion: "Cambiar estado departamento",
      descripcion: `Se cambió el estado del departamento ${departamento.numero} a ${nuevoEstado}.`,
      referencia_id: departamento.id,
      referencia_tabla: "departamentos",
    });

    await cargarDepartamentos();
  };

  const eliminarDepartamento = async (departamento: Departamento) => {
    const confirmar = confirm(
      `¿Deseas eliminar el departamento ${departamento.numero}?`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("departamentos")
      .delete()
      .eq("id", departamento.id);

    if (error) {
      console.error("Error al eliminar departamento:", error);
      alert(`Error al eliminar departamento: ${error.message}`);
      return;
    }

    await registrarEvento({
      modulo: "Departamentos",
      accion: "Eliminar departamento",
      descripcion: `Se eliminó el departamento ${departamento.numero}.`,
      referencia_id: departamento.id,
      referencia_tabla: "departamentos",
    });

    await cargarDepartamentos();
  };

  const departamentosFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase();

    return departamentos.filter((departamento) => {
      return (
        departamento.numero.toLowerCase().includes(texto) ||
        (departamento.piso || "").toLowerCase().includes(texto) ||
        (departamento.torre || "").toLowerCase().includes(texto) ||
        (departamento.propietario || "").toLowerCase().includes(texto) ||
        (departamento.telefono_propietario || "")
          .toLowerCase()
          .includes(texto) ||
        (departamento.correo_propietario || "")
          .toLowerCase()
          .includes(texto) ||
        (departamento.observacion || "").toLowerCase().includes(texto) ||
        (departamento.estado || "").toLowerCase().includes(texto)
      );
    });
  }, [departamentos, busqueda]);

  const departamentosHabitados = departamentos.filter(
    (departamento) => departamento.estado === "HABITADO"
  );

  const departamentosDesocupados = departamentos.filter(
    (departamento) => departamento.estado === "DESOCUPADO"
  );

  const departamentosMantencion = departamentos.filter(
    (departamento) => departamento.estado === "MANTENCION"
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
                  Administración del edificio
                </p>

                <h1 className="text-4xl font-black text-[#0B1F3A]">
                  Departamentos
                </h1>

                <p className="mt-2 max-w-2xl text-slate-500">
                  Administra las unidades del edificio, propietarios, contacto y
                  estado operacional.
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
                {mostrarFormulario
                  ? "Cerrar formulario"
                  : "+ Nuevo departamento"}
              </button>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-4">
              <StatsCard
                title="Total"
                value={String(departamentos.length)}
                description="Departamentos registrados"
                highlighted
              />

              <StatsCard
                title="Habitados"
                value={String(departamentosHabitados.length)}
                description="Unidades ocupadas"
              />

              <StatsCard
                title="Desocupados"
                value={String(departamentosDesocupados.length)}
                description="Unidades disponibles"
              />

              <StatsCard
                title="Mantención"
                value={String(departamentosMantencion.length)}
                description="Unidades en revisión"
              />
            </div>

            {mostrarFormulario && (
              <section
                id="formulario-departamento"
                className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-[#0B1F3A]">
                      Nuevo departamento
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Completa los datos para agregar una nueva unidad al
                      edificio.
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
                  <Campo
                    label="Número departamento"
                    value={numero}
                    onChange={setNumero}
                    placeholder="Ej: 1204"
                  />

                  <Campo
                    label="Piso"
                    value={piso}
                    onChange={setPiso}
                    placeholder="Ej: 12"
                  />

                  <Campo
                    label="Torre"
                    value={torre}
                    onChange={setTorre}
                    placeholder="Ej: A"
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
                      <option value="HABITADO">Habitado</option>
                      <option value="DESOCUPADO">Desocupado</option>
                      <option value="MANTENCION">Mantención</option>
                    </select>
                  </div>

                  <Campo
                    label="Propietario"
                    value={propietario}
                    onChange={setPropietario}
                    placeholder="Ej: Juan Pérez"
                  />

                  <Campo
                    label="Teléfono propietario"
                    value={telefonoPropietario}
                    onChange={setTelefonoPropietario}
                    placeholder="Ej: +56 9 1234 5678"
                  />

                  <div className="md:col-span-2">
                    <Campo
                      label="Correo propietario"
                      value={correoPropietario}
                      onChange={setCorreoPropietario}
                      placeholder="Ej: propietario@correo.cl"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                    Observación
                  </label>

                  <textarea
                    value={observacion}
                    onChange={(e) => setObservacion(e.target.value)}
                    placeholder="Ej: Departamento arrendado, propietario no residente, en mantención, etc."
                    className="min-h-[90px] w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520]"
                  />
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    onClick={registrarDepartamento}
                    className="rounded-xl bg-[#0B1F3A] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#163B73]"
                  >
                    Guardar departamento
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
                    Listado de departamentos
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Unidades registradas actualmente en el edificio.
                  </p>
                </div>

                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar departamento..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#D9A520] md:w-72"
                />
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full table-fixed border-collapse text-sm">
                  <thead className="bg-[#0B1F3A] text-white">
                    <tr>
                      <th className="w-[11%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Depto
                      </th>
                      <th className="w-[8%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Piso
                      </th>
                      <th className="w-[8%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Torre
                      </th>
                      <th className="w-[20%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Propietario
                      </th>
                      <th className="w-[23%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Contacto
                      </th>
                      <th className="w-[14%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Estado
                      </th>
                      <th className="w-[16%] px-3 py-3 text-left text-[11px] font-black uppercase">
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
                          Cargando departamentos...
                        </td>
                      </tr>
                    ) : departamentosFiltrados.length > 0 ? (
                      departamentosFiltrados.map((departamento) => (
                        <tr
                          key={departamento.id}
                          className="border-b border-slate-100 hover:bg-[#F8FAFC]"
                        >
                          <td className="px-3 py-3 align-top">
                            <p className="truncate text-sm font-black text-[#0B1F3A]">
                              {departamento.numero}
                            </p>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <p className="truncate text-xs text-slate-500">
                              {departamento.piso || "-"}
                            </p>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <p className="truncate text-xs text-slate-500">
                              {departamento.torre || "-"}
                            </p>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <p className="truncate text-xs font-bold text-slate-700">
                              {departamento.propietario || "-"}
                            </p>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold text-slate-600">
                                {departamento.telefono_propietario || "-"}
                              </p>
                              <p className="truncate text-[11px] text-slate-400">
                                {departamento.correo_propietario || "-"}
                              </p>
                            </div>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <span
                              className={`inline-flex max-w-full rounded-full px-2.5 py-1 text-[10px] font-black ${
                                departamento.estado === "HABITADO"
                                  ? "bg-green-100 text-green-700"
                                  : departamento.estado === "DESOCUPADO"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {departamento.estado || "-"}
                            </span>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <div className="grid grid-cols-1 gap-1.5 xl:grid-cols-2">
                              <button
                                onClick={() =>
                                  cambiarEstadoDepartamento(departamento)
                                }
                                className="rounded-lg bg-blue-50 px-2 py-1.5 text-[11px] font-bold text-blue-700 transition hover:bg-blue-100"
                              >
                                Estado
                              </button>

                              <button
                                onClick={() =>
                                  eliminarDepartamento(departamento)
                                }
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
                          No se encontraron departamentos.
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