"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import StatsCard from "../components/StatsCard";
import { puedeEditarConfiguracion } from "../lib/permisos";

export default function ConfiguracionPage() {
  const [nombreEdificio, setNombreEdificio] = useState("Edificio Los Alerces");
  const [direccion, setDireccion] = useState("Av. Alemania 1234, Temuco");
  const [conserje, setConserje] = useState("Giovanny Troncoso");
  const [turno, setTurno] = useState("08:00 - 20:00");
  const [telefono, setTelefono] = useState("+56 9 1234 5678");
  const [correo, setCorreo] = useState("administracion@edificio.cl");

  const [autorizado, setAutorizado] = useState<boolean | null>(null);

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
    }
  }, []);

  const guardarConfiguracion = () => {
    const nuevaConfiguracion = {
      nombreEdificio,
      direccion,
      conserje,
      turno,
      telefono,
      correo,
    };

    localStorage.setItem("configuracion", JSON.stringify(nuevaConfiguracion));

    alert("Configuración guardada correctamente");

    window.location.reload();
  };

  if (autorizado === null) {
    return (
      <main className="min-h-screen bg-[#F4F6F9] text-[#0B1220]">
        <div className="flex min-h-screen">
          <Sidebar />

          <section className="flex min-h-screen flex-1 flex-col">
            <Header />

            <div className="flex-1 p-8">
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <p className="font-bold text-[#0B1F3A]">
                  Verificando permisos...
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

  if (!autorizado) {
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
                  Solo Administrador y Supervisor pueden ingresar a la
                  configuración del sistema.
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
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-[0.25em] text-[#D9A520]">
                  Control conserjería
                </p>

                <h1 className="text-4xl font-black text-[#0B1F3A]">
                  Configuración
                </h1>

                <p className="mt-2 max-w-2xl text-slate-500">
                  Datos generales del edificio y operación de conserjería.
                </p>

                <div className="mt-4 h-1 w-16 rounded-full bg-[#D9A520]" />
              </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">
              <StatsCard
                title="Edificio"
                value={nombreEdificio}
                description="Nombre configurado"
                highlighted
              />

              <StatsCard
                title="Turno actual"
                value={turno}
                description="Horario operativo"
              />

              <StatsCard
                title="Contacto"
                value={telefono}
                description="Administración"
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-6">
                <p className="mb-1 text-xs font-black uppercase tracking-[0.2em] text-[#D9A520]">
                  Ajustes generales
                </p>

                <h2 className="text-2xl font-black text-[#0B1F3A]">
                  Datos del sistema
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Esta información se mostrará en el encabezado y menú lateral
                  del sistema.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                    Nombre del edificio
                  </label>
                  <input
                    type="text"
                    value={nombreEdificio}
                    onChange={(e) => setNombreEdificio(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#D9A520] focus:ring-4 focus:ring-[#D9A520]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#D9A520] focus:ring-4 focus:ring-[#D9A520]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                    Conserje en turno
                  </label>
                  <input
                    type="text"
                    value={conserje}
                    onChange={(e) => setConserje(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#D9A520] focus:ring-4 focus:ring-[#D9A520]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                    Turno
                  </label>
                  <select
                    value={turno}
                    onChange={(e) => setTurno(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#D9A520] focus:ring-4 focus:ring-[#D9A520]/10"
                  >
                    <option value="08:00 - 20:00">08:00 - 20:00</option>
                    <option value="20:00 - 08:00">20:00 - 08:00</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                    Teléfono administración
                  </label>
                  <input
                    type="text"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#D9A520] focus:ring-4 focus:ring-[#D9A520]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                    Correo administración
                  </label>
                  <input
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#D9A520] focus:ring-4 focus:ring-[#D9A520]/10"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={guardarConfiguracion}
                  className="rounded-xl bg-[#0B1F3A] px-6 py-3 font-bold text-white shadow-md transition hover:bg-[#163B73]"
                >
                  Guardar configuración
                </button>
              </div>
            </div>
          </div>

          <footer className="mt-auto flex items-center justify-between bg-[#0B1F3A] px-8 py-4 text-sm text-white">
            <p>
              © 2026 Control Conserjería. Todos los derechos reservados.
            </p>
            <p>Versión 1.0.0</p>
          </footer>
        </section>
      </div>
    </main>
  );
}