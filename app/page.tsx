import Link from "next/link";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import StatsCard from "./components/StatsCard";

const accesos = [
  {
    titulo: "Departamentos",
    descripcion: "Administrar unidades, residentes asociados y propietarios.",
    href: "/departamentos",
  },
  {
    titulo: "Residentes",
    descripcion: "Registro de residentes, contactos y datos personales.",
    href: "/residentes",
  },
  {
    titulo: "Vehículos",
    descripcion: "Control de vehículos asociados a departamentos.",
    href: "/vehiculos",
  },
  {
    titulo: "Visitas",
    descripcion: "Registro de ingreso y salida de visitantes.",
    href: "/visitas",
  },
  {
    titulo: "Historial visitas",
    descripcion: "Consulta histórica de ingresos y salidas.",
    href: "/historial-visitas",
  },
  {
    titulo: "Encomiendas",
    descripcion: "Recepción, entrega e historial de paquetes.",
    href: "/encomiendas",
  },
  {
    titulo: "Libro de novedades",
    descripcion: "Registro de incidentes, rondas y observaciones.",
    href: "/novedades",
  },
  {
    titulo: "Reservas",
    descripcion: "Control de espacios comunes del edificio.",
    href: "/reservas",
  },
  {
    titulo: "Configuración",
    descripcion: "Datos generales del edificio y conserjería.",
    href: "/configuracion",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F4F6F9] text-[#0B1220]">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="flex-1">
          <Header />

          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold">Panel principal</h1>
              <p className="mt-1 text-slate-500">
                Acceso rápido a los módulos del sistema de conserjería.
              </p>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-4">
              <StatsCard
                title="Módulos activos"
                value="9"
                description="Sistema operativo"
                highlighted
              />

              <StatsCard
                title="Control diario"
                value="Online"
                description="Conserjería activa"
              />

              <StatsCard
                title="Base de datos"
                value="Supabase"
                description="Conectada"
              />

              <StatsCard
                title="Versión"
                value="1.0"
                description="MVP funcional"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              {accesos.map((acceso) => (
                <Link
                  key={acceso.href}
                  href={acceso.href}
                  className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <p className="text-xs font-semibold uppercase text-[#D4AF37]">
                    Módulo
                  </p>

                  <h2 className="mt-2 text-xl font-bold text-[#061A33]">
                    {acceso.titulo}
                  </h2>

                  <p className="mt-3 text-sm leading-relaxed text-slate-500">
                    {acceso.descripcion}
                  </p>

                  <p className="mt-5 text-sm font-semibold text-[#061A33]">
                    Entrar →
                  </p>
                </Link>
              ))}
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