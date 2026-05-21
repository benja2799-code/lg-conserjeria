"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import StatsCard from "./components/StatsCard";
import { supabase } from "./lib/supabase";


const accesos = [
  {
    titulo: "Departamentos",
    descripcion: "Administrar unidades, residentes asociados y propietarios.",
    href: "/departamentos",
    etiqueta: "Gestión",
  },
  {
    titulo: "Residentes",
    descripcion: "Registro de residentes, contactos y datos personales.",
    href: "/residentes",
    etiqueta: "Personas",
  },
  {
    titulo: "Vehículos",
    descripcion: "Control de vehículos asociados a departamentos.",
    href: "/vehiculos",
    etiqueta: "Control",
  },
  {
    titulo: "Visitas",
    descripcion: "Registro de ingreso y salida de visitantes.",
    href: "/visitas",
    etiqueta: "Acceso",
  },
  {
    titulo: "Historial visitas",
    descripcion: "Consulta histórica de ingresos y salidas.",
    href: "/historial-visitas",
    etiqueta: "Historial",
  },
  {
    titulo: "Encomiendas",
    descripcion: "Recepción, entrega e historial de paquetes.",
    href: "/encomiendas",
    etiqueta: "Registro",
  },
  {
    titulo: "Libro de novedades",
    descripcion: "Registro de incidentes, rondas y observaciones.",
    href: "/novedades",
    etiqueta: "Turno",
  },
  {
    titulo: "Reservas",
    descripcion: "Control de espacios comunes del edificio.",
    href: "/reservas",
    etiqueta: "Espacios",
  },
  {
    titulo: "Configuración",
    descripcion: "Datos generales del edificio y conserjería.",
    href: "/configuracion",
    etiqueta: "Sistema",
  },
];

const actividadReciente = [
  {
    texto: "Visita registrada para departamento 302",
    hora: "10:24",
    color: "bg-[#0B1F3A]",
  },
  {
    texto: "Encomienda recibida para departamento 304",
    hora: "09:58",
    color: "bg-[#D9A520]",
  },
  {
    texto: "Reserva de espacio común registrada",
    hora: "09:30",
    color: "bg-[#163B73]",
  },
  {
    texto: "Novedad registrada en libro de turno",
    hora: "09:15",
    color: "bg-red-500",
  },
];

export default function Home() {
    const [visitasHoy, setVisitasHoy] = useState(0);
  const [encomiendasPendientes, setEncomiendasPendientes] = useState(0);
  const [reservasHoy, setReservasHoy] = useState(0);
  const [incidentesAbiertos, setIncidentesAbiertos] = useState(0);
  const [turnoActual, setTurnoActual] = useState("08:00 - 20:00");

  const cargarIndicadores = async () => {
    const hoy = new Date();
    const inicioDia = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate(),
      0,
      0,
      0
    ).toISOString();

    const finDia = new Date(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate(),
      23,
      59,
      59
    ).toISOString();

    const fechaHoy = hoy.toISOString().split("T")[0];

    const { count: totalVisitas } = await supabase
      .from("visitas")
      .select("*", { count: "exact", head: true })
      .gte("hora_ingreso", inicioDia)
      .lte("hora_ingreso", finDia);

    const { count: totalEncomiendas } = await supabase
      .from("encomiendas")
      .select("*", { count: "exact", head: true })
      .eq("estado", "PENDIENTE");

    const { count: totalReservas } = await supabase
      .from("reservas")
      .select("*", { count: "exact", head: true })
      .eq("fecha_reserva", fechaHoy)
      .eq("estado", "RESERVADA");

    const { count: totalIncidentes } = await supabase
      .from("novedades")
      .select("*", { count: "exact", head: true })
      .eq("tipo", "INCIDENTE")
      .eq("estado", "ABIERTA");

    setVisitasHoy(totalVisitas || 0);
    setEncomiendasPendientes(totalEncomiendas || 0);
    setReservasHoy(totalReservas || 0);
    setIncidentesAbiertos(totalIncidentes || 0);
  };

  useEffect(() => {
    cargarIndicadores();

    const configuracionGuardada = localStorage.getItem("configuracion");

    if (configuracionGuardada) {
      const configuracion = JSON.parse(configuracionGuardada);
      setTurnoActual(configuracion.turno || "08:00 - 20:00");
    }
  }, []);
  return (
    <main className="min-h-screen bg-[#F4F6F9] text-[#0B1220]">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="flex-1">
          <Header />

          <div className="p-8">
            <div className="mb-8 flex items-start justify-between gap-6">
              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-[0.25em] text-[#D9A520]">
                  Panel de control
                </p>

                <h1 className="text-4xl font-black text-[#0B1F3A]">
                  ¡Buenos días!
                </h1>

                <p className="mt-2 max-w-2xl text-slate-500">
                  Aquí tienes un resumen general de la operación diaria del
                  sistema de conserjería.
                </p>

                <div className="mt-4 h-1 w-16 rounded-full bg-[#D9A520]" />
              </div>

              <Link
                href="/visitas"
                className="rounded-xl bg-[#0B1F3A] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#163B73]"
              >
                + Registrar visita
              </Link>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-5">
              <StatsCard
  title="Visitas hoy"
  value={String(visitasHoy)}
  description="Registradas hoy"
  highlighted
/>

<StatsCard
  title="Encomiendas"
  value={String(encomiendasPendientes)}
  description="Pendientes"
/>

<StatsCard
  title="Reservas"
  value={String(reservasHoy)}
  description="Programadas hoy"
/>

<StatsCard
  title="Incidentes"
  value={String(incidentesAbiertos)}
  description="Abiertos"
/>

<StatsCard
  title="Turno actual"
  value={turnoActual.split(" - ")[0] || turnoActual}
  description={
    turnoActual.includes(" - ")
      ? `Hasta ${turnoActual.split(" - ")[1]}`
      : "Turno configurado"
  }
/>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-1">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-sm font-black uppercase tracking-wide text-[#0B1F3A]">
                    Actividad reciente
                  </h2>

                  <span className="rounded-full bg-[#F4F6F9] px-3 py-1 text-xs font-bold text-slate-500">
                    Hoy
                  </span>
                </div>

                <div className="space-y-4">
                  {actividadReciente.map((item) => (
                    <div
                      key={item.texto}
                      className="flex items-start justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-1 h-3 w-3 rounded-full ${item.color}`}
                        />

                        <p className="text-sm leading-relaxed text-slate-600">
                          {item.texto}
                        </p>
                      </div>

                      <span className="text-xs font-semibold text-slate-400">
                        {item.hora}
                      </span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/historial-visitas"
                  className="mt-6 inline-block text-sm font-bold text-[#0B1F3A]"
                >
                  Ver todas las actividades →
                </Link>
              </section>

              {/* RESUMEN SEMANAL SIMPLE */}
<section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
  <div className="mb-5 flex items-start justify-between gap-4">
    <div>
      <h2 className="text-sm font-black uppercase tracking-wide text-[#0B1F3A]">
        Resumen semanal
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Actividad acumulada durante la semana.
      </p>
    </div>

    <span className="rounded-xl border border-slate-200 bg-[#F8FAFC] px-3 py-2 text-xs font-bold text-slate-500">
      Esta semana
    </span>
  </div>

  <div className="mb-6 rounded-2xl bg-[#0B1F3A] p-5 text-white">
    <p className="text-xs font-bold uppercase tracking-wide text-[#D9A520]">
      Total de eventos
    </p>

    <div className="mt-2 flex items-end justify-between">
      <div>
        <h3 className="text-4xl font-black">209</h3>
        <p className="text-sm text-slate-300">
          registros operativos esta semana
        </p>
      </div>

      <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
        Semana normal
      </div>
    </div>
  </div>

  <div className="space-y-5">
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#0B1F3A]" />
          <p className="text-sm font-bold text-[#0B1F3A]">Visitas</p>
        </div>

        <p className="text-sm font-black text-[#0B1F3A]">126</p>
      </div>

      <div className="h-3 rounded-full bg-slate-100">
        <div className="h-3 w-[80%] rounded-full bg-[#0B1F3A]" />
      </div>
    </div>

    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#D9A520]" />
          <p className="text-sm font-bold text-[#0B1F3A]">Encomiendas</p>
        </div>

        <p className="text-sm font-black text-[#0B1F3A]">54</p>
      </div>

      <div className="h-3 rounded-full bg-slate-100">
        <div className="h-3 w-[45%] rounded-full bg-[#D9A520]" />
      </div>
    </div>

    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#163B73]" />
          <p className="text-sm font-bold text-[#0B1F3A]">Reservas</p>
        </div>

        <p className="text-sm font-black text-[#0B1F3A]">21</p>
      </div>

      <div className="h-3 rounded-full bg-slate-100">
        <div className="h-3 w-[28%] rounded-full bg-[#163B73]" />
      </div>
    </div>

    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-500" />
          <p className="text-sm font-bold text-[#0B1F3A]">Incidentes</p>
        </div>

        <p className="text-sm font-black text-[#0B1F3A]">8</p>
      </div>

      <div className="h-3 rounded-full bg-slate-100">
        <div className="h-3 w-[12%] rounded-full bg-red-500" />
      </div>
    </div>
  </div>

  
</section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-sm font-black uppercase tracking-wide text-[#0B1F3A]">
                  Estado general
                </h2>

                <div className="flex items-center justify-center">
                  <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full border-[18px] border-[#0B1F3A] bg-white shadow-inner">
                    <span className="text-3xl font-black text-[#0B1F3A]">
                      30
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      eventos hoy
                    </span>
                  </div>
                </div>

                <div className="mt-6 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Visitas</span>
                    <strong className="text-[#0B1F3A]">18</strong>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Encomiendas</span>
                    <strong className="text-[#0B1F3A]">7</strong>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Reservas</span>
                    <strong className="text-[#0B1F3A]">3</strong>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Incidentes</span>
                    <strong className="text-[#0B1F3A]">2</strong>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-green-100 bg-green-50 p-4">
                  <p className="font-bold text-green-700">Todo en orden</p>
                  <p className="text-sm text-green-600">
                    No hay alertas críticas en este momento.
                  </p>
                </div>
              </section>
            </div>
<section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
  <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div>
      <p className="mb-1 text-xs font-black uppercase tracking-[0.2em] text-[#D9A520]">
        Accesos principales
      </p>

      <h2 className="text-2xl font-black text-[#0B1F3A]">
        Gestión del sistema
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Ingresa rápidamente a los módulos operativos de conserjería.
      </p>
    </div>

    <Link
      href="/configuracion"
      className="w-fit rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-3 text-sm font-bold text-[#0B1F3A] transition hover:bg-slate-100"
    >
      Configurar sistema →
    </Link>
  </div>

  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
    {accesos.map((acceso, index) => (
      <Link
        key={acceso.href}
        href={acceso.href}
        className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#D9A520] hover:shadow-md"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0B1F3A] text-sm font-black text-white shadow-md group-hover:bg-[#D9A520]">
            {String(index + 1).padStart(2, "0")}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-wide text-[#D9A520]">
              {acceso.etiqueta}
            </p>

            <h3 className="mt-1 truncate text-xl font-black text-[#0B1F3A]">
              {acceso.titulo}
            </h3>

            <p className="mt-3 min-h-[42px] text-sm leading-relaxed text-slate-500">
              {acceso.descripcion}
            </p>

            <div className="mt-5 flex items-center justify-between">
              <span className="rounded-full bg-[#F4F6F9] px-3 py-1 text-xs font-bold text-slate-500">
                Módulo activo
              </span>

              <span className="text-sm font-black text-[#0B1F3A] transition group-hover:translate-x-1">
                Entrar →
              </span>
            </div>
          </div>
        </div>
      </Link>
    ))}
  </div>
</section>
            
          </div>

          <footer className="mt-8 flex items-center justify-between bg-[#0B1F3A] px-8 py-4 text-sm text-white">
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