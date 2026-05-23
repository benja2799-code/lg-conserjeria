"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { puedeEditarConfiguracion } from "../lib/permisos";

export default function ConfiguracionPage() {
  const [autorizado, setAutorizado] = useState<boolean | null>(null);

  const [nombreEdificio, setNombreEdificio] = useState("Edificio Los Alerces");
  const [direccion, setDireccion] = useState("Av. Alemania 1234, Temuco");
  const [conserje, setConserje] = useState("Giovanny Troncoso");
  const [turno, setTurno] = useState("08:00 - 20:00");
  const [telefono, setTelefono] = useState("+56 9 1234 5678");
  const [correo, setCorreo] = useState("administracion@edificio.cl");

  const [conserje1Nombre, setConserje1Nombre] = useState("");
  const [conserje1Rut, setConserje1Rut] = useState("");
  const [conserje1Cargo, setConserje1Cargo] = useState("Conserje diurno");
  const [conserje1FechaIngreso, setConserje1FechaIngreso] = useState("");
  const [conserje1Telefono, setConserje1Telefono] = useState("");
  const [conserje1EmergenciaNombre, setConserje1EmergenciaNombre] =
    useState("");
  const [conserje1EmergenciaParentesco, setConserje1EmergenciaParentesco] =
    useState("");
  const [conserje1EmergenciaTelefono, setConserje1EmergenciaTelefono] =
    useState("");
  const [conserje1Observacion, setConserje1Observacion] = useState("");

  const [conserje2Nombre, setConserje2Nombre] = useState("");
  const [conserje2Rut, setConserje2Rut] = useState("");
  const [conserje2Cargo, setConserje2Cargo] = useState("Conserje nocturno");
  const [conserje2FechaIngreso, setConserje2FechaIngreso] = useState("");
  const [conserje2Telefono, setConserje2Telefono] = useState("");
  const [conserje2EmergenciaNombre, setConserje2EmergenciaNombre] =
    useState("");
  const [conserje2EmergenciaParentesco, setConserje2EmergenciaParentesco] =
    useState("");
  const [conserje2EmergenciaTelefono, setConserje2EmergenciaTelefono] =
    useState("");
  const [conserje2Observacion, setConserje2Observacion] = useState("");

  const calcularTiempoEmpresa = (fechaIngreso: string) => {
    if (!fechaIngreso) return "Sin fecha registrada";

    const ingreso = new Date(fechaIngreso);
    const hoy = new Date();

    let años = hoy.getFullYear() - ingreso.getFullYear();
    let meses = hoy.getMonth() - ingreso.getMonth();

    if (meses < 0) {
      años--;
      meses += 12;
    }

    if (años <= 0 && meses <= 0) return "Menos de 1 mes";
    if (años <= 0) return `${meses} mes${meses === 1 ? "" : "es"}`;
    if (meses <= 0) return `${años} año${años === 1 ? "" : "s"}`;

    return `${años} año${años === 1 ? "" : "s"} y ${meses} mes${
      meses === 1 ? "" : "es"
    }`;
  };

  useEffect(() => {
    const tienePermiso = puedeEditarConfiguracion();

    if (!tienePermiso) {
      setAutorizado(false);
      return;
    }

    setAutorizado(true);

    const configuracionGuardada = localStorage.getItem("configuracion");

    if (configuracionGuardada) {
      const configuracion = JSON.parse(configuracionGuardada);

      setNombreEdificio(configuracion.nombreEdificio || "Edificio Los Alerces");
      setDireccion(configuracion.direccion || "Av. Alemania 1234, Temuco");
      setConserje(configuracion.conserje || "Giovanny Troncoso");
      setTurno(configuracion.turno || "08:00 - 20:00");
      setTelefono(configuracion.telefono || "+56 9 1234 5678");
      setCorreo(configuracion.correo || "administracion@edificio.cl");

      setConserje1Nombre(configuracion.conserje1Nombre || "");
      setConserje1Rut(configuracion.conserje1Rut || "");
      setConserje1Cargo(configuracion.conserje1Cargo || "Conserje diurno");
      setConserje1FechaIngreso(configuracion.conserje1FechaIngreso || "");
      setConserje1Telefono(configuracion.conserje1Telefono || "");
      setConserje1EmergenciaNombre(
        configuracion.conserje1EmergenciaNombre || ""
      );
      setConserje1EmergenciaParentesco(
        configuracion.conserje1EmergenciaParentesco || ""
      );
      setConserje1EmergenciaTelefono(
        configuracion.conserje1EmergenciaTelefono || ""
      );
      setConserje1Observacion(configuracion.conserje1Observacion || "");

      setConserje2Nombre(configuracion.conserje2Nombre || "");
      setConserje2Rut(configuracion.conserje2Rut || "");
      setConserje2Cargo(configuracion.conserje2Cargo || "Conserje nocturno");
      setConserje2FechaIngreso(configuracion.conserje2FechaIngreso || "");
      setConserje2Telefono(configuracion.conserje2Telefono || "");
      setConserje2EmergenciaNombre(
        configuracion.conserje2EmergenciaNombre || ""
      );
      setConserje2EmergenciaParentesco(
        configuracion.conserje2EmergenciaParentesco || ""
      );
      setConserje2EmergenciaTelefono(
        configuracion.conserje2EmergenciaTelefono || ""
      );
      setConserje2Observacion(configuracion.conserje2Observacion || "");
    }
  }, []);

  const guardarConfiguracion = () => {
    const configuracion = {
      nombreEdificio,
      direccion,
      conserje,
      turno,
      telefono,
      correo,

      conserje1Nombre,
      conserje1Rut,
      conserje1Cargo,
      conserje1FechaIngreso,
      conserje1Telefono,
      conserje1EmergenciaNombre,
      conserje1EmergenciaParentesco,
      conserje1EmergenciaTelefono,
      conserje1Observacion,

      conserje2Nombre,
      conserje2Rut,
      conserje2Cargo,
      conserje2FechaIngreso,
      conserje2Telefono,
      conserje2EmergenciaNombre,
      conserje2EmergenciaParentesco,
      conserje2EmergenciaTelefono,
      conserje2Observacion,
    };

    localStorage.setItem("configuracion", JSON.stringify(configuracion));

    window.dispatchEvent(new Event("storage"));

    alert("Configuración guardada correctamente.");
  };

  if (autorizado === null) {
    return (
      <main className="min-h-screen bg-[#F4F6F9] text-[#0B1220]">
        <div className="flex min-h-screen">
          <Sidebar />
          <section className="flex min-h-screen flex-1 flex-col">
            <Header />
            <div className="flex-1 p-8">
              <p className="font-bold text-[#0B1F3A]">Cargando...</p>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (autorizado === false) {
    return (
      <main className="min-h-screen bg-[#F4F6F9] text-[#0B1220]">
        <div className="flex min-h-screen">
          <Sidebar />

          <section className="flex min-h-screen flex-1 flex-col">
            <Header />

            <div className="flex-1 p-8">
              <div className="rounded-2xl border border-red-100 bg-white p-10 text-center shadow-sm">
                <p className="mb-2 text-xs font-black uppercase tracking-[0.25em] text-red-500">
                  Acceso restringido
                </p>

                <h1 className="text-3xl font-black text-[#0B1F3A]">
                  No tienes permisos para acceder
                </h1>

                <p className="mt-3 text-slate-500">
                  Solo Administrador y Supervisor pueden editar la configuración
                  del sistema.
                </p>
              </div>
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

  return (
    <main className="min-h-screen bg-[#F4F6F9] text-[#0B1220]">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="flex min-h-screen flex-1 flex-col">
          <Header />

          <div className="flex-1 p-8">
            <div className="mb-8">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.25em] text-[#D9A520]">
                Ajustes generales
              </p>

              <h1 className="text-4xl font-black text-[#0B1F3A]">
                Datos del sistema
              </h1>

              <p className="mt-2 max-w-2xl text-slate-500">
                Esta información se mostrará en el encabezado y menú lateral del
                sistema.
              </p>

              <div className="mt-4 h-1 w-16 rounded-full bg-[#D9A520]" />
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block font-bold text-[#0B1F3A]">
                    Nombre del edificio
                  </label>
                  <input
                    value={nombreEdificio}
                    onChange={(e) => setNombreEdificio(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520]"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-bold text-[#0B1F3A]">
                    Dirección
                  </label>
                  <input
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520]"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-bold text-[#0B1F3A]">
                    Conserje en turno
                  </label>
                  <input
                    value={conserje}
                    onChange={(e) => setConserje(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520]"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-bold text-[#0B1F3A]">
                    Turno
                  </label>
                  <select
                    value={turno}
                    onChange={(e) => setTurno(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520]"
                  >
                    <option value="08:00 - 20:00">08:00 - 20:00</option>
                    <option value="20:00 - 08:00">20:00 - 08:00</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block font-bold text-[#0B1F3A]">
                    Teléfono administración
                  </label>
                  <input
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520]"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-bold text-[#0B1F3A]">
                    Correo administración
                  </label>
                  <input
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520]"
                  />
                </div>
              </div>

              <div className="mt-10 border-t border-slate-200 pt-8">
                <div className="mb-6">
                  <p className="mb-2 text-xs font-black uppercase tracking-[0.25em] text-[#D9A520]">
                    Personal de conserjería
                  </p>

                  <h2 className="text-2xl font-black text-[#0B1F3A]">
                    Información de conserjes
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Registro interno de datos personales, contacto y emergencia
                    del personal.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-6">
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-[#D9A520]">
                          Conserje 1
                        </p>
                        <h3 className="text-xl font-black text-[#0B1F3A]">
                          Datos personales
                        </h3>
                      </div>

                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
                        {calcularTiempoEmpresa(conserje1FechaIngreso)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <InputConfig
                        label="Nombre completo"
                        value={conserje1Nombre}
                        onChange={setConserje1Nombre}
                        placeholder="Ej: Juan Pérez Soto"
                      />

                      <InputConfig
                        label="RUT / Carnet"
                        value={conserje1Rut}
                        onChange={setConserje1Rut}
                        placeholder="Ej: 12.345.678-9"
                      />

                      <InputConfig
                        label="Cargo"
                        value={conserje1Cargo}
                        onChange={setConserje1Cargo}
                        placeholder="Ej: Conserje diurno"
                      />

                      <InputConfig
                        label="Fecha de ingreso"
                        type="date"
                        value={conserje1FechaIngreso}
                        onChange={setConserje1FechaIngreso}
                      />

                      <InputConfig
                        label="Teléfono personal"
                        value={conserje1Telefono}
                        onChange={setConserje1Telefono}
                        placeholder="Ej: +56 9 1234 5678"
                      />

                      <InputConfig
                        label="Contacto emergencia"
                        value={conserje1EmergenciaNombre}
                        onChange={setConserje1EmergenciaNombre}
                        placeholder="Ej: María Soto"
                      />

                      <InputConfig
                        label="Parentesco"
                        value={conserje1EmergenciaParentesco}
                        onChange={setConserje1EmergenciaParentesco}
                        placeholder="Ej: Madre"
                      />

                      <InputConfig
                        label="Teléfono emergencia"
                        value={conserje1EmergenciaTelefono}
                        onChange={setConserje1EmergenciaTelefono}
                        placeholder="Ej: +56 9 8765 4321"
                      />
                    </div>

                    <div className="mt-4">
                      <label className="mb-2 block font-bold text-[#0B1F3A]">
                        Observaciones
                      </label>
                      <textarea
                        value={conserje1Observacion}
                        onChange={(e) =>
                          setConserje1Observacion(e.target.value)
                        }
                        className="min-h-[90px] w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520]"
                        placeholder="Información relevante del funcionario."
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-6">
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-[#D9A520]">
                          Conserje 2
                        </p>
                        <h3 className="text-xl font-black text-[#0B1F3A]">
                          Datos personales
                        </h3>
                      </div>

                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
                        {calcularTiempoEmpresa(conserje2FechaIngreso)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <InputConfig
                        label="Nombre completo"
                        value={conserje2Nombre}
                        onChange={setConserje2Nombre}
                        placeholder="Ej: Pedro González Muñoz"
                      />

                      <InputConfig
                        label="RUT / Carnet"
                        value={conserje2Rut}
                        onChange={setConserje2Rut}
                        placeholder="Ej: 11.111.111-1"
                      />

                      <InputConfig
                        label="Cargo"
                        value={conserje2Cargo}
                        onChange={setConserje2Cargo}
                        placeholder="Ej: Conserje nocturno"
                      />

                      <InputConfig
                        label="Fecha de ingreso"
                        type="date"
                        value={conserje2FechaIngreso}
                        onChange={setConserje2FechaIngreso}
                      />

                      <InputConfig
                        label="Teléfono personal"
                        value={conserje2Telefono}
                        onChange={setConserje2Telefono}
                        placeholder="Ej: +56 9 1234 5678"
                      />

                      <InputConfig
                        label="Contacto emergencia"
                        value={conserje2EmergenciaNombre}
                        onChange={setConserje2EmergenciaNombre}
                        placeholder="Ej: Carmen Muñoz"
                      />

                      <InputConfig
                        label="Parentesco"
                        value={conserje2EmergenciaParentesco}
                        onChange={setConserje2EmergenciaParentesco}
                        placeholder="Ej: Madre"
                      />

                      <InputConfig
                        label="Teléfono emergencia"
                        value={conserje2EmergenciaTelefono}
                        onChange={setConserje2EmergenciaTelefono}
                        placeholder="Ej: +56 9 8765 4321"
                      />
                    </div>

                    <div className="mt-4">
                      <label className="mb-2 block font-bold text-[#0B1F3A]">
                        Observaciones
                      </label>
                      <textarea
                        value={conserje2Observacion}
                        onChange={(e) =>
                          setConserje2Observacion(e.target.value)
                        }
                        className="min-h-[90px] w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520]"
                        placeholder="Información relevante del funcionario."
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={guardarConfiguracion}
                  className="rounded-xl bg-[#0B1F3A] px-6 py-4 text-sm font-bold text-white shadow-md transition hover:bg-[#163B73]"
                >
                  Guardar configuración
                </button>
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

type InputConfigProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
};

function InputConfig({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
}: InputConfigProps) {
  return (
    <div>
      <label className="mb-2 block font-bold text-[#0B1F3A]">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520]"
      />
    </div>
  );
}