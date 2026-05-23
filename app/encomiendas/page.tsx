"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import StatsCard from "../components/StatsCard";
import { supabase } from "../lib/supabase";
import { registrarEvento } from "../lib/registrarEvento";

type Encomienda = {
  id: string;
  departamento_numero: string | null;
  destinatario: string | null;
  empresa: string | null;
  descripcion: string | null;
  recibido_por: string | null;
  entregado_a: string | null;
  observacion: string | null;
  estado: string;
  created_at: string;
};

export default function EncomiendasPage() {
  const [encomiendas, setEncomiendas] = useState<Encomienda[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  const [departamentoNumero, setDepartamentoNumero] = useState("");
  const [destinatario, setDestinatario] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [recibidoPor, setRecibidoPor] = useState("");
  const [observacion, setObservacion] = useState("");

  const cargarEncomiendas = async () => {
    setCargando(true);

    const { data, error } = await supabase
      .from("encomiendas")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al cargar encomiendas:", error);
      alert(`Error al cargar encomiendas: ${error.message}`);
      setCargando(false);
      return;
    }

    setEncomiendas((data || []) as Encomienda[]);
    setCargando(false);
  };

  useEffect(() => {
    cargarEncomiendas();
  }, []);

  const limpiarFormulario = () => {
    setDepartamentoNumero("");
    setDestinatario("");
    setEmpresa("");
    setDescripcion("");
    setRecibidoPor("");
    setObservacion("");
  };

  const registrarEncomienda = async () => {
    if (!departamentoNumero.trim()) {
      alert("Debes ingresar el número de departamento.");
      return;
    }

    if (!destinatario.trim()) {
      alert("Debes ingresar el destinatario.");
      return;
    }

    const { data, error } = await supabase
      .from("encomiendas")
      .insert({
        departamento_numero: departamentoNumero.trim(),
        destinatario: destinatario.trim(),
        empresa: empresa.trim() || null,
        descripcion: descripcion.trim() || null,
        recibido_por: recibidoPor.trim() || null,
        entregado_a: null,
        observacion: observacion.trim() || null,
        estado: "PENDIENTE",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error al registrar encomienda:", error);
      alert(`Error al registrar encomienda: ${error.message}`);
      return;
    }

    await registrarEvento({
      modulo: "Encomiendas",
      accion: "Registrar encomienda",
      descripcion: `Se registró una encomienda para el departamento ${departamentoNumero.trim()}, destinatario ${destinatario.trim()}.`,
      referencia_id: data?.id || null,
      referencia_tabla: "encomiendas",
    });

    limpiarFormulario();
    await cargarEncomiendas();

    alert("Encomienda registrada correctamente.");
  };

  const entregarEncomienda = async (encomienda: Encomienda) => {
    const entregadoA = prompt(
      "Ingrese el nombre de quien retira la encomienda:"
    );

    if (!entregadoA || !entregadoA.trim()) {
      alert("Debes ingresar el nombre de quien retira.");
      return;
    }

    const confirmar = confirm(
      `¿Deseas marcar como entregada la encomienda del departamento ${
        encomienda.departamento_numero || "N/A"
      }?`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("encomiendas")
      .update({
        estado: "ENTREGADA",
        entregado_a: entregadoA.trim(),
      })
      .eq("id", encomienda.id);

    if (error) {
      console.error("Error al entregar encomienda:", error);
      alert(`Error al entregar encomienda: ${error.message}`);
      return;
    }

    await registrarEvento({
      modulo: "Encomiendas",
      accion: "Entregar encomienda",
      descripcion: `Se entregó una encomienda del departamento ${
        encomienda.departamento_numero || "N/A"
      } a ${entregadoA.trim()}.`,
      referencia_id: encomienda.id,
      referencia_tabla: "encomiendas",
    });

    await cargarEncomiendas();
  };

  const eliminarEncomienda = async (encomienda: Encomienda) => {
    const confirmar = confirm(
      `¿Deseas eliminar la encomienda del departamento ${
        encomienda.departamento_numero || "N/A"
      }?`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("encomiendas")
      .delete()
      .eq("id", encomienda.id);

    if (error) {
      console.error("Error al eliminar encomienda:", error);
      alert(`Error al eliminar encomienda: ${error.message}`);
      return;
    }

    await registrarEvento({
      modulo: "Encomiendas",
      accion: "Eliminar encomienda",
      descripcion: `Se eliminó una encomienda del departamento ${
        encomienda.departamento_numero || "N/A"
      }.`,
      referencia_id: encomienda.id,
      referencia_tabla: "encomiendas",
    });

    await cargarEncomiendas();
  };

  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return "-";

    return new Date(fecha).toLocaleString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const encomiendasFiltradas = useMemo(() => {
    const texto = busqueda.toLowerCase();

    return encomiendas.filter((encomienda) => {
      return (
        (encomienda.departamento_numero || "")
          .toLowerCase()
          .includes(texto) ||
        (encomienda.destinatario || "").toLowerCase().includes(texto) ||
        (encomienda.empresa || "").toLowerCase().includes(texto) ||
        (encomienda.descripcion || "").toLowerCase().includes(texto) ||
        (encomienda.recibido_por || "").toLowerCase().includes(texto) ||
        (encomienda.entregado_a || "").toLowerCase().includes(texto) ||
        (encomienda.observacion || "").toLowerCase().includes(texto) ||
        encomienda.estado.toLowerCase().includes(texto)
      );
    });
  }, [encomiendas, busqueda]);

  const encomiendasPendientes = encomiendas.filter(
    (encomienda) => encomienda.estado === "PENDIENTE"
  );

  const encomiendasEntregadas = encomiendas.filter(
    (encomienda) => encomienda.estado === "ENTREGADA"
  );

  return (
    <main className="min-h-screen bg-[#F4F6F9] text-[#0B1220]">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="flex min-h-screen flex-1 flex-col">
          <Header />

          <div className="flex-1 p-8">
            <div className="mb-8">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.25em] text-[#D9A520]">
                Control de paquetes
              </p>

              <h1 className="text-4xl font-black text-[#0B1F3A]">
                Encomiendas
              </h1>

              <p className="mt-2 max-w-2xl text-slate-500">
                Registra la recepción, entrega y seguimiento de encomiendas del
                edificio.
              </p>

              <div className="mt-4 h-1 w-16 rounded-full bg-[#D9A520]" />
            </div>

            <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-4">
              <StatsCard
                title="Total"
                value={String(encomiendas.length)}
                description="Registros generales"
                highlighted
              />

              <StatsCard
                title="Pendientes"
                value={String(encomiendasPendientes.length)}
                description="Por entregar"
              />

              <StatsCard
                title="Entregadas"
                value={String(encomiendasEntregadas.length)}
                description="Cerradas"
              />

              <StatsCard
                title="Resultado"
                value={String(encomiendasFiltradas.length)}
                description="Registros filtrados"
              />
            </div>

            <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-2xl font-black text-[#0B1F3A]">
                  Registrar encomienda
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Cada registro creado aquí quedará automáticamente en el
                  Registro general del sistema.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                    Departamento
                  </label>

                  <input
                    value={departamentoNumero}
                    onChange={(e) => setDepartamentoNumero(e.target.value)}
                    placeholder="Ej: 1204"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                    Destinatario
                  </label>

                  <input
                    value={destinatario}
                    onChange={(e) => setDestinatario(e.target.value)}
                    placeholder="Ej: Juan Pérez"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                    Empresa / courier
                  </label>

                  <input
                    value={empresa}
                    onChange={(e) => setEmpresa(e.target.value)}
                    placeholder="Ej: Chilexpress, Starken, Mercado Libre"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                    Descripción
                  </label>

                  <input
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Ej: Caja mediana, sobre, paquete pequeño"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                    Recibido por
                  </label>

                  <input
                    value={recibidoPor}
                    onChange={(e) => setRecibidoPor(e.target.value)}
                    placeholder="Ej: Conserjería"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520]"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-bold text-[#0B1F3A]">
                  Observación
                </label>

                <textarea
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                  placeholder="Ej: Paquete frágil, se avisa por teléfono, requiere firma, etc."
                  className="min-h-[90px] w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520]"
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={registrarEncomienda}
                  className="rounded-xl bg-[#0B1F3A] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#163B73]"
                >
                  Registrar encomienda
                </button>

                <button
                  onClick={limpiarFormulario}
                  className="rounded-xl border border-slate-200 bg-[#F8FAFC] px-5 py-3 text-sm font-bold text-[#0B1F3A] transition hover:bg-slate-100"
                >
                  Limpiar
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-black text-[#0B1F3A]">
                    Registro de encomiendas
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Listado de encomiendas pendientes y entregadas.
                  </p>
                </div>

                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar encomienda..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#D9A520] md:w-80"
                />
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px] border-collapse">
                    <thead className="bg-[#0B1F3A] text-white">
                      <tr>
                        <th className="px-5 py-4 text-left text-xs font-black uppercase">
                          Fecha
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-black uppercase">
                          Depto
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-black uppercase">
                          Destinatario
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-black uppercase">
                          Empresa
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-black uppercase">
                          Descripción
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-black uppercase">
                          Entregado a
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-black uppercase">
                          Estado
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-black uppercase">
                          Acciones
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {cargando ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="px-5 py-10 text-center font-bold text-[#0B1F3A]"
                          >
                            Cargando encomiendas...
                          </td>
                        </tr>
                      ) : encomiendasFiltradas.length > 0 ? (
                        encomiendasFiltradas.map((encomienda) => (
                          <tr
                            key={encomienda.id}
                            className="border-b border-slate-100 hover:bg-[#F8FAFC]"
                          >
                            <td className="px-5 py-4 text-sm text-slate-500">
                              {formatearFecha(encomienda.created_at)}
                            </td>

                            <td className="px-5 py-4 text-sm font-bold text-[#0B1F3A]">
                              {encomienda.departamento_numero || "-"}
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-600">
                              {encomienda.destinatario || "-"}
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-500">
                              {encomienda.empresa || "-"}
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-500">
                              {encomienda.descripcion || "-"}
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-500">
                              {encomienda.entregado_a || "-"}
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-black ${
                                  encomienda.estado === "PENDIENTE"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-green-100 text-green-700"
                                }`}
                              >
                                {encomienda.estado}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex flex-wrap gap-2">
                                {encomienda.estado === "PENDIENTE" && (
                                  <button
                                    onClick={() =>
                                      entregarEncomienda(encomienda)
                                    }
                                    className="rounded-lg bg-green-50 px-3 py-2 text-xs font-bold text-green-700 transition hover:bg-green-100"
                                  >
                                    Entregar
                                  </button>
                                )}

                                <button
                                  onClick={() =>
                                    eliminarEncomienda(encomienda)
                                  }
                                  className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
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
                            colSpan={8}
                            className="px-5 py-10 text-center text-slate-500"
                          >
                            No se encontraron encomiendas.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
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