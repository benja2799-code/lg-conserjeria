export default function Sidebar() {
  return (
    <aside className="w-72 bg-[#061A33] text-white">
      <div className="p-6">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#D4AF37]">LG</h1>
          <p className="text-sm font-semibold">LG Seguridad SPA</p>
          <p className="text-xs text-slate-300">y Diseño</p>
        </div>

        <nav className="space-y-2">
          <div className="rounded-xl bg-white/10 px-4 py-3 font-semibold">
            Inicio
          </div>

          <p className="pt-4 text-xs font-semibold uppercase text-[#D4AF37]">
            Control conserjería
          </p>

          <div className="rounded-xl px-4 py-3 text-slate-200 hover:bg-white/10">
            Libro de novedades
          </div>

          <div className="rounded-xl px-4 py-3 text-slate-200 hover:bg-white/10">
            Visitas
          </div>

          <div className="rounded-xl px-4 py-3 text-slate-200 hover:bg-white/10">
            Historial visitas
          </div>

          <div className="rounded-xl px-4 py-3 text-slate-200 hover:bg-white/10">
            Encomiendas
          </div>

          <div className="rounded-xl px-4 py-3 text-slate-200 hover:bg-white/10">
            Reserva espacios
          </div>

          <div className="rounded-xl bg-white px-4 py-3 font-semibold text-[#061A33]">
            Departamentos
          </div>

          <div className="rounded-xl px-4 py-3 text-slate-200 hover:bg-white/10">
            Residentes
          </div>

          <div className="rounded-xl px-4 py-3 text-slate-200 hover:bg-white/10">
            Vehículos
          </div>

          <div className="rounded-xl px-4 py-3 text-slate-200 hover:bg-white/10">
            Configuración
          </div>
        </nav>
      </div>
    </aside>
  );
}