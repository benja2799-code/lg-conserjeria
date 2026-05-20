"use client";
import Header from "../components/Header";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import StatsCard from "../components/StatsCard";

export default function ConfiguracionPage() {
  const [nombreEdificio, setNombreEdificio] = useState("Edificio Los Alerces");
  const [direccion, setDireccion] = useState("Av. Alemania 1234, Temuco");
  const [conserje, setConserje] = useState("Giovanny Troncoso");
  const [turno, setTurno] = useState("08:00 - 20:00");
  const [telefono, setTelefono] = useState("+56 9 1234 5678");
  const [correo, setCorreo] = useState("administracion@edificio.cl");

  const guardarConfiguracion = () => {
    localStorage.setItem(
      "configuracion",
      JSON.stringify({
        nombreEdificio,
        direccion,
        conserje,
        turno,
        telefono,
        correo,
      })
    );

    alert("Configuración guardada correctamente");
  };

  return (
    <main className="min-h-screen bg-[#F4F6F9] text-[#0B1220]">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="flex-1">
          <Header />
          <div className="p-8">
            <div className="mb-6">
              <h1 className="text-4xl font-bold">Configuración</h1>
              <p className="mt-1 text-slate-500">
                Datos generales del edificio y operación de conserjería.
              </p>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">
              <StatsCard
                title="Edificio"
                value={nombreEdificio}
                description="Nombre configurado"
              />

              <StatsCard
                title="Turno actual"
                value={turno}
                description="Horario operativo"
                highlighted
              />

              <StatsCard
                title="Contacto"
                value={telefono}
                description="Administración"
              />
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-2xl font-bold text-[#061A33]">
                Datos del sistema
              </h2>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold">
                    Nombre del edificio
                  </label>
                  <input
                    type="text"
                    value={nombreEdificio}
                    onChange={(e) => setNombreEdificio(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold">
                    Conserje en turno
                  </label>
                  <input
                    type="text"
                    value={conserje}
                    onChange={(e) => setConserje(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold">
                    Turno
                  </label>
                  <select
                    value={turno}
                    onChange={(e) => setTurno(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D4AF37]"
                  >
                    <option value="08:00 - 20:00">08:00 - 20:00</option>
                    <option value="20:00 - 08:00">20:00 - 08:00</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold">
                    Teléfono administración
                  </label>
                  <input
                    type="text"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold">
                    Correo administración
                  </label>
                  <input
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={guardarConfiguracion}
                  className="rounded-xl bg-[#061A33] px-6 py-3 font-semibold text-white shadow hover:bg-[#0A2547]"
                >
                  Guardar configuración
                </button>
              </div>
            </div>
          </div>

          <footer className="mt-8 flex items-center justify-between bg-[#061A33] px-8 py-4 text-sm text-white">
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