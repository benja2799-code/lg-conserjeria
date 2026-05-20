"use client";

import { useEffect, useState } from "react";


import Sidebar from "./components/Sidebar";
import StatsCard from "./components/StatsCard";
import DepartmentCard from "./components/DepartmentCard";
import NewDepartmentModal from "./components/NewDepartmentModal";
import { departamentos as departamentosIniciales } from "./data/departamentos";


export default function Home() {
 const [busqueda, setBusqueda] = useState("");
const [modalAbierto, setModalAbierto] = useState(false);
const [listaDepartamentos, setListaDepartamentos] = useState(
  departamentosIniciales
);
const [departamentoEditar, setDepartamentoEditar] = useState<{
  numero: string;
  tipo: string;
  residentes: string[];
} | null>(null);

useEffect(() => {
  const departamentosGuardados = localStorage.getItem("departamentos");

  if (departamentosGuardados) {
    setListaDepartamentos(JSON.parse(departamentosGuardados));
  }
}, []);

useEffect(() => {
  localStorage.setItem(
    "departamentos",
    JSON.stringify(listaDepartamentos)
  );
}, [listaDepartamentos]);

const eliminarDepartamento = (numero: string) => {
  const confirmar = confirm(
    `¿Seguro que deseas eliminar el departamento ${numero}?`
  );

  if (!confirmar) return;

  setListaDepartamentos(
    listaDepartamentos.filter((depto) => depto.numero !== numero)
  );
};


  const departamentosFiltrados = listaDepartamentos.filter((depto) => {
    const textoBusqueda = busqueda.toLowerCase();

    return (
      depto.numero.toLowerCase().includes(textoBusqueda) ||
      depto.tipo.toLowerCase().includes(textoBusqueda) ||
      depto.residentes.some((residente) =>
        residente.toLowerCase().includes(textoBusqueda)
      )
    );
  });

  return (
    <main className="min-h-screen bg-[#F4F6F9] text-[#0B1220]">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="flex-1">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5">
            <div>
              <h2 className="text-xl font-bold">Conserjería</h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold">Giovanny Troncoso</p>
                <p className="text-sm text-slate-500">Conserje en turno</p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#061A33] text-white">
                G
              </div>
            </div>
          </header>

          <div className="p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold">Departamentos</h1>
                <p className="mt-1 text-slate-500">
                  Administración y control de departamentos y residentes.
                </p>
              </div>

              <button
  onClick={() => {
    setDepartamentoEditar(null);
    setModalAbierto(true);
  }}
  className="rounded-xl bg-[#061A33] px-6 py-3 font-semibold text-white shadow hover:bg-[#0A2547]"
>
  + Nuevo Departamento
</button>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-5">
              <StatsCard
                title="Visitas hoy"
                value="18"
                description="↑ 12% vs ayer"
                highlighted
              />

              <StatsCard
                title="Encomiendas pendientes"
                value="7"
                description="Ver detalles →"
              />

              <StatsCard
                title="Reservas hoy"
                value="3"
                description="Ver calendario →"
              />

              <StatsCard
                title="Incidentes abiertos"
                value="2"
                description="Ver detalles →"
              />

              <StatsCard
                title="Turno actual"
                value="08:00 - 20:00"
                description="Quedan 6h 27m"
              />
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar departamento, residente o propietario..."
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#D4AF37]"
              />

              <select className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#D4AF37]">
                <option>Todos los edificios</option>
                <option>Edificio A</option>
                <option>Edificio B</option>
              </select>

              <select className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#D4AF37]">
                <option>Estado: Todos</option>
                <option>Propietario</option>
                <option>Arrendado</option>
              </select>
            </div>

            <div className="mb-4 text-sm text-slate-500">
              Resultados encontrados: {departamentosFiltrados.length}
            </div>

            {departamentosFiltrados.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                {departamentosFiltrados.map((depto) => (
                 <DepartmentCard
  key={depto.numero}
  numero={depto.numero}
  tipo={depto.tipo}
  residentes={depto.residentes}
  onDelete={eliminarDepartamento}
  onEdit={(departamento) => {
    setDepartamentoEditar(departamento);
    setModalAbierto(true);
  }}
/>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                <h3 className="text-xl font-bold">Sin resultados</h3>
                <p className="mt-2 text-slate-500">
                  No se encontraron departamentos con esa búsqueda.
                </p>
              </div>
            )}
          </div>

          <footer className="mt-8 flex items-center justify-between bg-[#061A33] px-8 py-4 text-sm text-white">
            <p>
              © 2026 LG Seguridad SPA y Diseño. Todos los derechos reservados.
            </p>
            <p>Versión 1.0.0</p>
          </footer>
        </section>
      </div>
      <NewDepartmentModal
  isOpen={modalAbierto}
  onClose={() => {
    setModalAbierto(false);
    setDepartamentoEditar(null);
  }}
  departamentoEditar={departamentoEditar}
  onSave={(departamentoGuardado) => {
    if (departamentoEditar) {
      setListaDepartamentos(
        listaDepartamentos.map((depto) =>
          depto.numero === departamentoEditar.numero
            ? departamentoGuardado
            : depto
        )
      );
    } else {
      setListaDepartamentos([departamentoGuardado, ...listaDepartamentos]);
    }
  }}
/>


    </main>
  );
}