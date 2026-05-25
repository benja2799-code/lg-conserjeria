"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import StatsCard from "../components/StatsCard";
import { supabase } from "../lib/supabase";
import { registrarEvento } from "../lib/registrarEvento";

type ConfiguracionSistema = {
  id: string;
  nombre_edificio: string | null;
  direccion: string | null;
  telefono_administracion: string | null;
  correo_administracion: string | null;
  administrador: string | null;
  horario_conserjeria: string | null;
  observacion: string | null;
  updated_at: string | null;
};

type ConserjeConfig = {
  id: string;
  nombre: string;
  rut: string | null;
  telefono_personal: string | null;
  telefono_emergencia: string | null;
  contacto_emergencia: string | null;
  parentesco_emergencia: string | null;
  fecha_ingreso: string | null;
  turno: string | null;
  estado: string | null;
  observacion: string | null;
  created_at: string | null;
};

export default function ConfiguracionPage() {
  const [cargando, setCargando] = useState(true);
  const [guardandoConfig, setGuardandoConfig] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormularioConserje, setMostrarFormularioConserje] =
    useState(false);

  const [configId] = useState("general");
  const [nombreEdificio, setNombreEdificio] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefonoAdministracion, setTelefonoAdministracion] = useState("");
  const [correoAdministracion, setCorreoAdministracion] = useState("");
  const [administrador, setAdministrador] = useState("");
  const [horarioConserjeria, setHorarioConserjeria] = useState("");
  const [observacionConfig, setObservacionConfig] = useState("");

  const [conserjes, setConserjes] = useState<ConserjeConfig[]>([]);
  const [nombreConserje, setNombreConserje] = useState("");
  const [rutConserje, setRutConserje] = useState("");
  const [telefonoPersonal, setTelefonoPersonal] = useState("");
  const [contactoEmergencia, setContactoEmergencia] = useState("");
  const [telefonoEmergencia, setTelefonoEmergencia] = useState("");
  const [parentescoEmergencia, setParentescoEmergencia] = useState("");
  const [fechaIngreso, setFechaIngreso] = useState("");
  const [turno, setTurno] = useState("08:00 - 20:00");
  const [estadoConserje, setEstadoConserje] = useState("ACTIVO");
  const [observacionConserje, setObservacionConserje] = useState("");

  const cargarConfiguracion = async () => {
    const { data, error } = await supabase
      .from("configuracion_sistema")
      .select("*")
      .eq("id", configId)
      .maybeSingle();

    if (error) {
      console.error("Error al cargar configuración:", error);
      return;
    }

    if (data) {
      const config = data as ConfiguracionSistema;

      setNombreEdificio(config.nombre_edificio || "");
      setDireccion(config.direccion || "");
      setTelefonoAdministracion(config.telefono_administracion || "");
      setCorreoAdministracion(config.correo_administracion || "");
      setAdministrador(config.administrador || "");
      setHorarioConserjeria(config.horario_conserjeria || "");
      setObservacionConfig(config.observacion || "");
    }
  };

  const cargarConserjes = async () => {
    const { data, error } = await supabase
      .from("conserjes_configuracion")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al cargar conserjes:", error);
      return;
    }

    setConserjes((data || []) as ConserjeConfig[]);
  };

  const cargarTodo = async () => {
    setCargando(true);
    await cargarConfiguracion();
    await cargarConserjes();
    setCargando(false);
  };

  useEffect(() => {
    cargarTodo();
  }, []);

  const guardarConfiguracion = async () => {
    setGuardandoConfig(true);

    const { error } = await supabase.from("configuracion_sistema").upsert({
      id: configId,
      nombre_edificio: nombreEdificio.trim() || null,
      direccion: direccion.trim() || null,
      telefono_administracion: telefonoAdministracion.trim() || null,
      correo_administracion: correoAdministracion.trim() || null,
      administrador: administrador.trim() || null,
      horario_conserjeria: horarioConserjeria.trim() || null,
      observacion: observacionConfig.trim() || null,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error al guardar configuración:", error);
      alert(`Error al guardar configuración: ${error.message}`);
      setGuardandoConfig(false);
      return;
    }

    await registrarEvento({
      modulo: "Configuración",
      accion: "Actualizar configuración",
      descripcion: `Se actualizaron los datos generales del edificio ${
        nombreEdificio.trim() || "sin nombre definido"
      }.`,
      referencia_id: configId,
      referencia_tabla: "configuracion_sistema",
    });

    setGuardandoConfig(false);
    alert("Configuración guardada correctamente.");
  };

  const limpiarFormularioConserje = () => {
    setNombreConserje("");
    setRutConserje("");
    setTelefonoPersonal("");
    setContactoEmergencia("");
    setTelefonoEmergencia("");
    setParentescoEmergencia("");
    setFechaIngreso("");
    setTurno("08:00 - 20:00");
    setEstadoConserje("ACTIVO");
    setObservacionConserje("");
  };

  const cerrarFormularioConserje = () => {
    limpiarFormularioConserje();
    setMostrarFormularioConserje(false);
  };

  const registrarConserje = async () => {
    if (!nombreConserje.trim()) {
      alert("Debes ingresar el nombre del conserje.");
      return;
    }

    const { data, error } = await supabase
      .from("conserjes_configuracion")
      .insert({
        nombre: nombreConserje.trim(),
        rut: rutConserje.trim() || null,
        telefono_personal: telefonoPersonal.trim() || null,
        contacto_emergencia: contactoEmergencia.trim() || null,
        telefono_emergencia: telefonoEmergencia.trim() || null,
        parentesco_emergencia: parentescoEmergencia.trim() || null,
        fecha_ingreso: fechaIngreso || null,
        turno,
        estado: estadoConserje,
        observacion: observacionConserje.trim() || null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error al registrar conserje:", error);
      alert(`Error al registrar conserje: ${error.message}`);
      return;
    }

    await registrarEvento({
      modulo: "Configuración",
      accion: "Registrar conserje",
      descripcion: `Se registró el conserje ${nombreConserje.trim()} en la configuración del sistema.`,
      referencia_id: data?.id || null,
      referencia_tabla: "conserjes_configuracion",
    });

    limpiarFormularioConserje();
    setMostrarFormularioConserje(false);
    await cargarConserjes();

    alert("Conserje registrado correctamente.");
  };

  const cambiarEstadoConserje = async (conserje: ConserjeConfig) => {
    const estadoActual = conserje.estado || "ACTIVO";
    const nuevoEstado = estadoActual === "ACTIVO" ? "INACTIVO" : "ACTIVO";

    const confirmar = confirm(
      `¿Deseas cambiar el estado de ${conserje.nombre} a ${nuevoEstado}?`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("conserjes_configuracion")
      .update({
        estado: nuevoEstado,
      })
      .eq("id", conserje.id);

    if (error) {
      console.error("Error al cambiar estado:", error);
      alert(`Error al cambiar estado: ${error.message}`);
      return;
    }

    await registrarEvento({
      modulo: "Configuración",
      accion: "Cambiar estado conserje",
      descripcion: `Se cambió el estado del conserje ${conserje.nombre} a ${nuevoEstado}.`,
      referencia_id: conserje.id,
      referencia_tabla: "conserjes_configuracion",
    });

    await cargarConserjes();
  };

  const eliminarConserje = async (conserje: ConserjeConfig) => {
    const confirmar = confirm(`¿Deseas eliminar al conserje ${conserje.nombre}?`);

    if (!confirmar) return;

    const { error } = await supabase
      .from("conserjes_configuracion")
      .delete()
      .eq("id", conserje.id);

    if (error) {
      console.error("Error al eliminar conserje:", error);
      alert(`Error al eliminar conserje: ${error.message}`);
      return;
    }

    await registrarEvento({
      modulo: "Configuración",
      accion: "Eliminar conserje",
      descripcion: `Se eliminó al conserje ${conserje.nombre} de la configuración.`,
      referencia_id: conserje.id,
      referencia_tabla: "conserjes_configuracion",
    });

    await cargarConserjes();
  };

  const calcularAntiguedad = (fecha: string | null) => {
    if (!fecha) return "-";

    const ingreso = new Date(`${fecha}T00:00:00`);
    const hoy = new Date();

    let años = hoy.getFullYear() - ingreso.getFullYear();
    let meses = hoy.getMonth() - ingreso.getMonth();

    if (meses < 0) {
      años -= 1;
      meses += 12;
    }

    if (años <= 0 && meses <= 0) return "Menos de 1 mes";
    if (años <= 0) return `${meses} mes(es)`;
    if (meses <= 0) return `${años} año(s)`;

    return `${años} año(s), ${meses} mes(es)`;
  };

  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return "-";

    return new Date(`${fecha}T00:00:00`).toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const conserjesFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase();

    return conserjes.filter((conserje) => {
      return (
        conserje.nombre.toLowerCase().includes(texto) ||
        (conserje.rut || "").toLowerCase().includes(texto) ||
        (conserje.telefono_personal || "").toLowerCase().includes(texto) ||
        (conserje.contacto_emergencia || "").toLowerCase().includes(texto) ||
        (conserje.telefono_emergencia || "").toLowerCase().includes(texto) ||
        (conserje.parentesco_emergencia || "").toLowerCase().includes(texto) ||
        (conserje.turno || "").toLowerCase().includes(texto) ||
        (conserje.estado || "").toLowerCase().includes(texto)
      );
    });
  }, [conserjes, busqueda]);

  const conserjesActivos = conserjes.filter(
    (conserje) => conserje.estado === "ACTIVO"
  );

  const conserjesInactivos = conserjes.filter(
    (conserje) => conserje.estado === "INACTIVO"
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
                  Ajustes generales
                </p>

                <h1 className="text-4xl font-black text-[#0B1F3A]">
                  Configuración
                </h1>

                <p className="mt-2 max-w-2xl text-slate-500">
                  Administra los datos principales del edificio, información de
                  administración y registro interno de conserjes.
                </p>

                <div className="mt-4 h-1 w-16 rounded-full bg-[#D9A520]" />
              </div>

              <button
                type="button"
                onClick={cargarTodo}
                className="w-fit rounded-xl bg-[#0B1F3A] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#163B73]"
              >
                Actualizar datos
              </button>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-4">
              <StatsCard
                title="Conserjes"
                value={String(conserjes.length)}
                description="Registrados"
                highlighted
              />

              <StatsCard
                title="Activos"
                value={String(conserjesActivos.length)}
                description="Disponibles"
              />

              <StatsCard
                title="Inactivos"
                value={String(conserjesInactivos.length)}
                description="No vigentes"
              />

              <StatsCard
                title="Sistema"
                value={nombreEdificio ? "OK" : "..."}
                description="Datos edificio"
              />
            </div>

            <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-2xl font-black text-[#0B1F3A]">
                  Datos del sistema
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Esta información se mostrará en el encabezado, menú lateral y
                  reportes del sistema.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Campo
                  label="Nombre del edificio"
                  value={nombreEdificio}
                  onChange={setNombreEdificio}
                  placeholder="Ej: Edificio Los Alerces"
                />

                <Campo
                  label="Dirección"
                  value={direccion}
                  onChange={setDireccion}
                  placeholder="Ej: Av. Alemania 1234, Temuco"
                />

                <Campo
                  label="Administrador"
                  value={administrador}
                  onChange={setAdministrador}
                  placeholder="Ej: Administración Central"
                />

                <Campo
                  label="Teléfono administración"
                  value={telefonoAdministracion}
                  onChange={setTelefonoAdministracion}
                  placeholder="Ej: +56 9 1234 5678"
                />

                <Campo
                  label="Correo administración"
                  value={correoAdministracion}
                  onChange={setCorreoAdministracion}
                  placeholder="Ej: administracion@edificio.cl"
                />

                <Campo
                  label="Horario conserjería"
                  value={horarioConserjeria}
                  onChange={setHorarioConserjeria}
                  placeholder="Ej: 24/7 o 08:00 - 20:00"
                />
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                  Observación general
                </label>

                <textarea
                  value={observacionConfig}
                  onChange={(e) => setObservacionConfig(e.target.value)}
                  placeholder="Ej: Instrucciones generales, datos importantes para administración o conserjería."
                  className="min-h-[90px] w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520]"
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={guardarConfiguracion}
                  disabled={guardandoConfig}
                  className="rounded-xl bg-[#0B1F3A] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#163B73] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {guardandoConfig ? "Guardando..." : "Guardar configuración"}
                </button>
              </div>
            </section>

            <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-black text-[#0B1F3A]">
                    Personal de conserjería
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Registra datos de contacto, emergencia, turno y antigüedad
                    del personal.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setMostrarFormularioConserje((actual) => !actual)
                  }
                  className={`w-fit rounded-xl px-5 py-3 text-sm font-bold shadow-md transition ${
                    mostrarFormularioConserje
                      ? "bg-red-50 text-red-600 hover:bg-red-100"
                      : "bg-[#0B1F3A] text-white hover:bg-[#163B73]"
                  }`}
                >
                  {mostrarFormularioConserje
                    ? "Cerrar formulario"
                    : "+ Nuevo conserje"}
                </button>
              </div>

              {mostrarFormularioConserje && (
                <div className="mb-6 rounded-2xl border border-slate-200 bg-[#F8FAFC] p-5">
                  <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-xl font-black text-[#0B1F3A]">
                        Nuevo conserje
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Completa los antecedentes personales y de emergencia.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={cerrarFormularioConserje}
                      className="w-fit rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-[#0B1F3A] transition hover:bg-slate-100"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Campo
                      label="Nombre completo"
                      value={nombreConserje}
                      onChange={setNombreConserje}
                      placeholder="Ej: Benjamín Castillo"
                    />

                    <Campo
                      label="RUT / Carnet"
                      value={rutConserje}
                      onChange={setRutConserje}
                      placeholder="Ej: 12.345.678-9"
                    />

                    <Campo
                      label="Teléfono personal"
                      value={telefonoPersonal}
                      onChange={setTelefonoPersonal}
                      placeholder="Ej: +56 9 1234 5678"
                    />

                    <div>
                      <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                        Fecha ingreso
                      </label>

                      <input
                        type="date"
                        value={fechaIngreso}
                        onChange={(e) => setFechaIngreso(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520]"
                      />
                    </div>

                    <Campo
                      label="Contacto emergencia"
                      value={contactoEmergencia}
                      onChange={setContactoEmergencia}
                      placeholder="Ej: María González"
                    />

                    <Campo
                      label="Teléfono emergencia"
                      value={telefonoEmergencia}
                      onChange={setTelefonoEmergencia}
                      placeholder="Ej: +56 9 8765 4321"
                    />

                    <Campo
                      label="Parentesco emergencia"
                      value={parentescoEmergencia}
                      onChange={setParentescoEmergencia}
                      placeholder="Ej: Madre, padre, pareja"
                    />

                    <div>
                      <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                        Turno
                      </label>

                      <select
                        value={turno}
                        onChange={(e) => setTurno(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520]"
                      >
                        <option value="08:00 - 20:00">08:00 - 20:00</option>
                        <option value="20:00 - 08:00">20:00 - 08:00</option>
                        <option value="Turno administrativo">
                          Turno administrativo
                        </option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                        Estado
                      </label>

                      <select
                        value={estadoConserje}
                        onChange={(e) => setEstadoConserje(e.target.value)}
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
                      value={observacionConserje}
                      onChange={(e) => setObservacionConserje(e.target.value)}
                      placeholder="Ej: Reemplazo, turno fijo, información administrativa importante."
                      className="min-h-[90px] w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520]"
                    />
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={registrarConserje}
                      className="rounded-xl bg-[#0B1F3A] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#163B73]"
                    >
                      Guardar conserje
                    </button>

                    <button
                      type="button"
                      onClick={limpiarFormularioConserje}
                      className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#0B1F3A] transition hover:bg-slate-100"
                    >
                      Limpiar
                    </button>
                  </div>
                </div>
              )}

              <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-black text-[#0B1F3A]">
                    Listado de conserjes
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Personal registrado actualmente en el sistema.
                  </p>
                </div>

                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar conserje..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#D9A520] md:w-72"
                />
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full table-fixed border-collapse text-sm">
                  <thead className="bg-[#0B1F3A] text-white">
                    <tr>
                      <th className="w-[18%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Conserje
                      </th>
                      <th className="w-[16%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Contacto
                      </th>
                      <th className="w-[20%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Emergencia
                      </th>
                      <th className="w-[14%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Ingreso
                      </th>
                      <th className="w-[12%] px-3 py-3 text-left text-[11px] font-black uppercase">
                        Turno
                      </th>
                      <th className="w-[10%] px-3 py-3 text-left text-[11px] font-black uppercase">
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
                          Cargando configuración...
                        </td>
                      </tr>
                    ) : conserjesFiltrados.length > 0 ? (
                      conserjesFiltrados.map((conserje) => (
                        <tr
                          key={conserje.id}
                          className="border-b border-slate-100 hover:bg-[#F8FAFC]"
                        >
                          <td className="px-3 py-3 align-top">
                            <div className="min-w-0">
                              <p className="truncate text-xs font-black text-[#0B1F3A]">
                                {conserje.nombre}
                              </p>
                              <p className="truncate text-[11px] text-slate-400">
                                RUT: {conserje.rut || "-"}
                              </p>
                            </div>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <p className="truncate text-xs text-slate-600">
                              {conserje.telefono_personal || "-"}
                            </p>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-slate-700">
                                {conserje.contacto_emergencia || "-"}
                              </p>
                              <p className="truncate text-[11px] text-slate-400">
                                {conserje.parentesco_emergencia || "-"} ·{" "}
                                {conserje.telefono_emergencia || "-"}
                              </p>
                            </div>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <div className="min-w-0">
                              <p className="truncate text-xs text-slate-600">
                                {formatearFecha(conserje.fecha_ingreso)}
                              </p>
                              <p className="truncate text-[11px] text-slate-400">
                                {calcularAntiguedad(conserje.fecha_ingreso)}
                              </p>
                            </div>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <p className="truncate text-xs text-slate-500">
                              {conserje.turno || "-"}
                            </p>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <span
                              className={`inline-flex max-w-full rounded-full px-2.5 py-1 text-[10px] font-black ${
                                conserje.estado === "ACTIVO"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {conserje.estado || "-"}
                            </span>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <div className="flex flex-col gap-1.5">
                              <button
                                type="button"
                                onClick={() => cambiarEstadoConserje(conserje)}
                                className="rounded-lg bg-blue-50 px-2 py-1.5 text-[11px] font-bold text-blue-700 transition hover:bg-blue-100"
                              >
                                Estado
                              </button>

                              <button
                                type="button"
                                onClick={() => eliminarConserje(conserje)}
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
                          No se encontraron conserjes registrados.
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