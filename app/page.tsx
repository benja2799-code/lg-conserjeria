"use client";

import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import StatsCard from "./components/StatsCard";
import DepartmentCard from "./components/DepartmentCard";
import NewDepartmentModal from "./components/NewDepartmentModal";
import { supabase } from "./lib/supabase";

type Departamento = {
  id?: string;
  numero: string;
  tipo: string;
  residentes: string[] | string | null;
};

const normalizarResidentes = (
  residentes: string[] | string | null
): string[] => {
  if (Array.isArray(residentes)) {
    return residentes;
  }

  if (typeof residentes === "string" && residentes.trim() !== "") {
    return residentes
      .replace("{", "")
      .replace("}", "")
      .replaceAll('"', "")
      .split(",")
      .map((residente) => residente.trim())
      .filter((residente) => residente !== "");
  }

  return [];
};

export default function Home() {
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [departamentoEditar, setDepartamentoEditar] =
    useState<Departamento | null>(null);

  const [listaDepartamentos, setListaDepartamentos] = useState<Departamento[]>(
    []
  );

  const [cargando, setCargando] = useState(true);

  const cargarDepartamentos = async () => {
    setCargando(true);

    const { data, error } = await supabase
      .from("departamentos")
      .select("*")
      .order("numero", { ascending: true });

    if (error) {
      console.error(error);
      alert(`Error al cargar departamentos: ${error.message}`);
      setCargando(false);
      return;
    }

    const departamentosNormalizados = (data || []).map((depto) => ({
      id: depto.id,
      numero: depto.numero,
      tipo: depto.tipo,
      residentes: normalizarResidentes(depto.residentes),
    }));

    setListaDepartamentos(departamentosNormalizados);
    setCargando(false);
  };

  useEffect(() => {
    cargarDepartamentos();
  }, []);

  const departamentosFiltrados = listaDepartamentos.filter((depto) => {
    const textoBusqueda = busqueda.toLowerCase();

    const residentesArray = normalizarResidentes(depto.residentes);

    return (
      depto.numero.toLowerCase().includes(textoBusqueda) ||
      depto.tipo.toLowerCase().includes(textoBusqueda) ||
      residentesArray.some((residente) =>
        residente.toLowerCase().includes(textoBusqueda)
      )
    );
  });

  const guardarDepartamento = async (departamento: Departamento) => {
    const residentesArray = normalizarResidentes(departamento.residentes);

    if (departamento.id) {
      const { error } = await supabase
        .from("departamentos")
        .update({
          numero: departamento.numero,
          tipo: departamento.tipo,
          residentes: residentesArray,
        })
        .eq("id", departamento.id);

      if (error) {
        console.error(error);
        alert(`Error al editar departamento: ${error.message}`);
        return;
      }
    } else {
      const { error } = await supabase.from("departamentos").insert({
        numero: departamento.numero,
        tipo: departamento.tipo,
        residentes: residentesArray,
      });

      if (error) {
        console.error(error);
        alert(`Error al crear departamento: ${error.message}`);
        return;
      }
    }

    setModalAbierto(false);
    setDepartamentoEditar(null);
    cargarDepartamentos();
  };

  const eliminarDepartamento = async (id?: string) => {
    if (!id) return;

    const confirmar = confirm("¿Seguro que deseas eliminar este departamento?");

    if (!confirmar) return;

    const { error } = await supabase.from("departamentos").delete().eq("id", id);

    if (error) {
      console.error(error);
      alert(`Error al eliminar departamento: ${error.message}`);
      return;
    }

    cargarDepartamentos();
  };

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
                title="Departamentos"
                value={String(listaDepartamentos.length)}
                description="Registrados"
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

            {cargando ? (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                Cargando departamentos...
              </div>
            ) : departamentosFiltrados.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                {departamentosFiltrados.map((depto) => (
                  <DepartmentCard
                    key={depto.id}
                    id={depto.id}
                    numero={depto.numero}
                    tipo={depto.tipo}
                    residentes={normalizarResidentes(depto.residentes)}
                    onDelete={eliminarDepartamento}
                    onEdit={(departamento) => {
                      setDepartamentoEditar({
                        ...departamento,
                        residentes: normalizarResidentes(
                          departamento.residentes
                        ),
                      });
                      setModalAbierto(true);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                <h3 className="text-xl font-bold">Sin resultados</h3>
                <p className="mt-2 text-slate-500">
                  No se encontraron departamentos registrados.
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
        departamentoEditar={
          departamentoEditar
            ? {
                ...departamentoEditar,
                residentes: normalizarResidentes(
                  departamentoEditar.residentes
                ),
              }
            : null
        }
        onSave={guardarDepartamento}
      />
    </main>
  );
}