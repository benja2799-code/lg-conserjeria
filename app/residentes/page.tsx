"use client";
import Header from "../components/Header";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import StatsCard from "../components/StatsCard";
import ResidentCard from "../components/ResidentCard";
import NewResidentModal from "../components/NewResidentModal";
import { supabase } from "../lib/supabase";

type Departamento = {
  id?: string;
  numero: string;
};

type Residente = {
  id?: string;
  departamento_id?: string | null;
  nombre: string;
  rut?: string | null;
  telefono?: string | null;
  email?: string | null;
  tipo?: string | null;
  departamento_numero?: string | null;
};

export default function ResidentesPage() {
  const [residentes, setResidentes] = useState<Residente[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [residenteEditar, setResidenteEditar] = useState<Residente | null>(
    null
  );
  const [cargando, setCargando] = useState(true);

  const cargarDepartamentos = async () => {
    const { data, error } = await supabase
      .from("departamentos")
      .select("id, numero")
      .order("numero", { ascending: true });

    if (error) {
      console.error(error);
      alert(`Error al cargar departamentos: ${error.message}`);
      return;
    }

    setDepartamentos(data || []);
  };

  const cargarResidentes = async () => {
    setCargando(true);

    const { data, error } = await supabase
      .from("residentes")
      .select(
        `
        id,
        departamento_id,
        nombre,
        rut,
        telefono,
        email,
        tipo,
        departamentos (
          numero
        )
      `
      )
      .order("nombre", { ascending: true });

    if (error) {
      console.error(error);
      alert(`Error al cargar residentes: ${error.message}`);
      setCargando(false);
      return;
    }

    const residentesNormalizados = (data || []).map((item: any) => ({
      id: item.id,
      departamento_id: item.departamento_id,
      nombre: item.nombre,
      rut: item.rut,
      telefono: item.telefono,
      email: item.email,
      tipo: item.tipo,
      departamento_numero: item.departamentos?.numero || null,
    }));

    setResidentes(residentesNormalizados);
    setCargando(false);
  };

  useEffect(() => {
    cargarDepartamentos();
    cargarResidentes();
  }, []);

  const residentesFiltrados = residentes.filter((residente) => {
    const texto = busqueda.toLowerCase();

    return (
      residente.nombre.toLowerCase().includes(texto) ||
      (residente.rut || "").toLowerCase().includes(texto) ||
      (residente.telefono || "").toLowerCase().includes(texto) ||
      (residente.email || "").toLowerCase().includes(texto) ||
      (residente.departamento_numero || "").toLowerCase().includes(texto)
    );
  });

  const guardarResidente = async (residente: Residente) => {
    if (residente.id) {
      const { error } = await supabase
        .from("residentes")
        .update({
          departamento_id: residente.departamento_id,
          nombre: residente.nombre,
          rut: residente.rut,
          telefono: residente.telefono,
          email: residente.email,
          tipo: residente.tipo,
        })
        .eq("id", residente.id);

      if (error) {
        console.error(error);
        alert(`Error al editar residente: ${error.message}`);
        return;
      }
    } else {
      const { error } = await supabase.from("residentes").insert({
        departamento_id: residente.departamento_id,
        nombre: residente.nombre,
        rut: residente.rut,
        telefono: residente.telefono,
        email: residente.email,
        tipo: residente.tipo,
      });

      if (error) {
        console.error(error);
        alert(`Error al crear residente: ${error.message}`);
        return;
      }
    }

    setModalAbierto(false);
    setResidenteEditar(null);
    cargarResidentes();
  };

  const eliminarResidente = async (id?: string) => {
    if (!id) return;

    const confirmar = confirm("¿Seguro que deseas eliminar este residente?");

    if (!confirmar) return;

    const { error } = await supabase.from("residentes").delete().eq("id", id);

    if (error) {
      console.error(error);
      alert(`Error al eliminar residente: ${error.message}`);
      return;
    }

    cargarResidentes();
  };

  return (
    <main className="min-h-screen bg-[#F4F6F9] text-[#0B1220]">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="flex-1">
          <Header />

          <div className="p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold">Residentes</h1>
                <p className="mt-1 text-slate-500">
                  Administración y control de residentes asociados a departamentos.
                </p>
              </div>

              <button
                onClick={() => {
                  setResidenteEditar(null);
                  setModalAbierto(true);
                }}
                className="rounded-xl bg-[#061A33] px-6 py-3 font-semibold text-white shadow hover:bg-[#0A2547]"
              >
                + Nuevo Residente
              </button>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-4">
              <StatsCard
                title="Total residentes"
                value={String(residentes.length)}
                description="Registrados"
              />

              <StatsCard
                title="Propietarios"
                value={String(
                  residentes.filter((r) => r.tipo === "PROPIETARIO").length
                )}
                description="Personas registradas"
              />

              <StatsCard
                title="Arrendatarios"
                value={String(
                  residentes.filter((r) => r.tipo === "ARRENDATARIO").length
                )}
                description="Personas registradas"
              />

              <StatsCard
                title="Contactos activos"
                value={String(
                  residentes.filter((r) => r.telefono || r.email).length
                )}
                description="Con teléfono o email"
              />
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar residente, RUT, teléfono o departamento..."
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#D4AF37]"
              />

              <select className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#D4AF37]">
                <option>Todos los departamentos</option>
              </select>

              <select className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#D4AF37]">
                <option>Tipo: Todos</option>
                <option>Propietario</option>
                <option>Arrendatario</option>
                <option>Residente</option>
              </select>
            </div>

            <div className="mb-4 text-sm text-slate-500">
              Resultados encontrados: {residentesFiltrados.length}
            </div>

            {cargando ? (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                Cargando residentes...
              </div>
            ) : residentesFiltrados.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                {residentesFiltrados.map((residente) => (
                  <ResidentCard
                    key={residente.id}
                    residente={residente}
                    onEdit={(residente) => {
                      setResidenteEditar(residente);
                      setModalAbierto(true);
                    }}
                    onDelete={eliminarResidente}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                <h3 className="text-xl font-bold">Sin residentes</h3>
                <p className="mt-2 text-slate-500">
                  No se encontraron residentes registrados.
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

      <NewResidentModal
        isOpen={modalAbierto}
        onClose={() => {
          setModalAbierto(false);
          setResidenteEditar(null);
        }}
        onSave={guardarResidente}
        residenteEditar={residenteEditar}
        departamentos={departamentos}
      />
    </main>
  );
}