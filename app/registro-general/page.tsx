"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { supabase } from "../lib/supabase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type RegistroSistema = {
  id: string;
  modulo: string | null;
  accion: string | null;
  descripcion: string | null;
  usuario: string | null;
  created_at: string | null;
};

export default function RegistroGeneralPage() {
  const [registros, setRegistros] = useState<RegistroSistema[]>([]);
  const [cargando, setCargando] = useState(true);
  const [descargando, setDescargando] = useState(false);

  const cargarRegistros = async () => {
    setCargando(true);

    const { data, error } = await supabase
      .from("registro_sistema")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al cargar registro general:", error);
      alert(`Error al cargar registro general: ${error.message}`);
      setCargando(false);
      return;
    }

    setRegistros((data || []) as RegistroSistema[]);
    setCargando(false);
  };

  useEffect(() => {
    cargarRegistros();
  }, []);

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

  const registrosPorModulo = useMemo(() => {
    const grupos: Record<string, RegistroSistema[]> = {};

    registros.forEach((registro) => {
      const modulo = registro.modulo || "Sin módulo";

      if (!grupos[modulo]) {
        grupos[modulo] = [];
      }

      grupos[modulo].push(registro);
    });

    return grupos;
  }, [registros]);

  const modulosOrdenados = useMemo(() => {
    return Object.keys(registrosPorModulo).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [registrosPorModulo]);

  const ultimoRegistro = registros[0];

  const descargarPDF = async () => {
    if (registros.length === 0) {
      alert("No existen registros para descargar.");
      return;
    }

    setDescargando(true);

    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const fechaEmision = new Date().toLocaleString("es-CL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const margenX = 12;
      let y = 16;

      doc.setFillColor(11, 31, 58);
      doc.rect(0, 0, pageWidth, 32, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(17);
      doc.text("REGISTRO GENERAL DEL SISTEMA", margenX, 13);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text(
        "Historial completo de acciones operativas registradas",
        margenX,
        21
      );

      doc.setDrawColor(217, 165, 32);
      doc.setLineWidth(1.2);
      doc.line(margenX, 27, margenX + 42, 27);

      y = 42;

      doc.setTextColor(11, 31, 58);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("RESUMEN DEL REPORTE", margenX, y);

      y += 7;

      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margenX, y, 82, 16, 3, 3, "F");
      doc.roundedRect(margenX + 88, y, 82, 16, 3, 3, "F");
      doc.roundedRect(margenX + 176, y, 82, 16, 3, 3, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("TOTAL REGISTROS", margenX + 5, y + 6);
      doc.text("MÓDULOS", margenX + 93, y + 6);
      doc.text("FECHA EMISIÓN", margenX + 181, y + 6);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(11, 31, 58);
      doc.text(String(registros.length), margenX + 5, y + 12);
      doc.text(String(modulosOrdenados.length), margenX + 93, y + 12);
      doc.text(fechaEmision, margenX + 181, y + 12);

      y += 27;

      modulosOrdenados.forEach((modulo) => {
        const registrosModulo = registrosPorModulo[modulo];

        if (y > pageHeight - 45) {
          doc.addPage();
          y = 18;
        }

        doc.setFillColor(11, 31, 58);
        doc.roundedRect(margenX, y - 5, pageWidth - margenX * 2, 9, 2, 2, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text(
          `${modulo.toUpperCase()} (${registrosModulo.length})`,
          margenX + 3,
          y + 1
        );

        y += 7;

        autoTable(doc, {
          startY: y,
          head: [["Fecha", "Acción", "Descripción completa", "Usuario"]],
          body: registrosModulo.map((registro) => [
            formatearFecha(registro.created_at),
            registro.accion || "-",
            registro.descripcion || "-",
            registro.usuario || "Administrador",
          ]),
          theme: "grid",
          margin: {
            left: margenX,
            right: margenX,
          },
          tableWidth: "auto",
          styles: {
            font: "helvetica",
            fontSize: 7.1,
            cellPadding: 2.2,
            overflow: "linebreak",
            valign: "top",
            lineColor: [226, 232, 240],
            lineWidth: 0.15,
            textColor: [30, 41, 59],
          },
          headStyles: {
            fillColor: [241, 245, 249],
            textColor: [11, 31, 58],
            fontStyle: "bold",
            fontSize: 7.4,
            halign: "left",
          },
          alternateRowStyles: {
            fillColor: [250, 252, 255],
          },
          columnStyles: {
            0: {
              cellWidth: 41,
              overflow: "linebreak",
            },
            1: {
              cellWidth: 43,
              overflow: "linebreak",
            },
            2: {
              cellWidth: 155,
              overflow: "linebreak",
            },
            3: {
              cellWidth: 32,
              overflow: "linebreak",
            },
          },
          rowPageBreak: "avoid",
          didDrawPage: () => {
            const pageNumber = doc.getNumberOfPages();

            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.5);
            doc.setTextColor(120, 120, 120);
            doc.text(
              `Página ${pageNumber}`,
              pageWidth - margenX - 18,
              pageHeight - 8
            );
          },
        });

        y = (doc as any).lastAutoTable.finalY + 11;
      });

      doc.save(
        `registro-general-sistema-${new Date().toISOString().split("T")[0]}.pdf`
      );
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Ocurrió un error al generar el PDF.");
    } finally {
      setDescargando(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F4F6F9] text-[#0B1220]">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden">
          <Header />

          <div className="min-w-0 flex-1 overflow-x-hidden p-8">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0">
                <p className="mb-2 text-xs font-black uppercase tracking-[0.25em] text-[#D9A520]">
                  Auditoría del sistema
                </p>

                <h1 className="text-4xl font-black text-[#0B1F3A]">
                  Registro general
                </h1>

                <p className="mt-2 max-w-2xl text-slate-500">
                  Consulta y descarga el historial completo de acciones
                  registradas en el sistema.
                </p>

                <div className="mt-4 h-1 w-16 rounded-full bg-[#D9A520]" />
              </div>

              <button
                type="button"
                onClick={cargarRegistros}
                className="w-fit rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#0B1F3A] shadow-sm transition hover:bg-slate-50"
              >
                Actualizar
              </button>
            </div>

            <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-4">
              <MiniCard
                titulo="Total registros"
                valor={String(registros.length)}
                texto="Acciones guardadas"
                destacado
              />

              <MiniCard
                titulo="Módulos"
                valor={String(modulosOrdenados.length)}
                texto="Áreas registradas"
              />

              <MiniCard
                titulo="Estado"
                valor={cargando ? "..." : "Listo"}
                texto="Sincronizado"
              />

              <MiniCard
                titulo="Último evento"
                valor={ultimoRegistro?.modulo || "-"}
                texto={ultimoRegistro?.accion || "Sin registros"}
              />
            </section>

            <section className="mb-8 rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B1F3A] text-white shadow-sm">
                    <PdfIcon />
                  </div>

                  <h2 className="text-2xl font-black text-[#0B1F3A]">
                    Descargar reporte completo
                  </h2>

                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500">
                    El PDF se genera en formato horizontal, separado por módulo
                    y con descripciones completas usando salto de línea
                    automático.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={descargarPDF}
                  disabled={cargando || descargando || registros.length === 0}
                  className="rounded-2xl bg-[#0B1F3A] px-7 py-4 text-sm font-black text-white shadow-md transition hover:bg-[#163B73] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {descargando ? "Generando PDF..." : "Descargar PDF"}
                </button>
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <h2 className="text-xl font-black text-[#0B1F3A]">
                    Vista previa
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Últimos 20 registros cargados desde Supabase.
                  </p>
                </div>

                <div className="rounded-full bg-[#F8FAFC] px-4 py-2 text-xs font-bold text-slate-500">
                  {registros.length} registros disponibles
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full table-fixed border-collapse text-sm">
                  <thead className="bg-[#0B1F3A] text-white">
                    <tr>
                      <th className="w-[15%] px-4 py-3 text-left text-[11px] font-black uppercase">
                        Fecha
                      </th>
                      <th className="w-[14%] px-4 py-3 text-left text-[11px] font-black uppercase">
                        Módulo
                      </th>
                      <th className="w-[16%] px-4 py-3 text-left text-[11px] font-black uppercase">
                        Acción
                      </th>
                      <th className="w-[43%] px-4 py-3 text-left text-[11px] font-black uppercase">
                        Descripción
                      </th>
                      <th className="w-[12%] px-4 py-3 text-left text-[11px] font-black uppercase">
                        Usuario
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {cargando ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-10 text-center text-sm font-bold text-[#0B1F3A]"
                        >
                          Cargando registro general...
                        </td>
                      </tr>
                    ) : registros.length > 0 ? (
                      registros.slice(0, 20).map((registro) => (
                        <tr
                          key={registro.id}
                          className="border-b border-slate-100 hover:bg-[#F8FAFC]"
                        >
                          <td className="px-4 py-4 align-top text-xs text-slate-500">
                            {formatearFecha(registro.created_at)}
                          </td>

                          <td className="px-4 py-4 align-top">
                            <span className="inline-flex max-w-full rounded-full bg-[#F1F5F9] px-3 py-1 text-[11px] font-black text-[#0B1F3A]">
                              <span className="truncate">
                                {registro.modulo || "-"}
                              </span>
                            </span>
                          </td>

                          <td className="px-4 py-4 align-top text-xs font-bold text-slate-600">
                            <p className="break-words">
                              {registro.accion || "-"}
                            </p>
                          </td>

                          <td className="px-4 py-4 align-top">
                            <p className="whitespace-normal break-words text-xs leading-relaxed text-slate-600">
                              {registro.descripcion || "-"}
                            </p>
                          </td>

                          <td className="px-4 py-4 align-top text-xs text-slate-500">
                            <p className="truncate">
                              {registro.usuario || "Administrador"}
                            </p>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-10 text-center text-sm text-slate-500"
                        >
                          No existen registros guardados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
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

function MiniCard({
  titulo,
  valor,
  texto,
  destacado = false,
}: {
  titulo: string;
  valor: string;
  texto: string;
  destacado?: boolean;
}) {
  return (
    <div
      className={`min-w-0 overflow-hidden rounded-3xl border p-5 shadow-sm ${
        destacado
          ? "border-[#0B1F3A] bg-[#0B1F3A] text-white"
          : "border-slate-200 bg-white text-[#0B1F3A]"
      }`}
    >
      <p
        className={`truncate text-[11px] font-black uppercase tracking-[0.22em] ${
          destacado ? "text-[#D9A520]" : "text-slate-400"
        }`}
      >
        {titulo}
      </p>

      <p className="mt-3 max-w-full truncate text-2xl font-black leading-tight">
        {valor}
      </p>

      <p
        className={`mt-1 max-w-full truncate text-xs ${
          destacado ? "text-slate-300" : "text-slate-500"
        }`}
      >
        {texto}
      </p>
    </div>
  );
}

function PdfIcon() {
  return (
    <svg
      className="h-7 w-7"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M7 3h7l5 5v13H7z" />
      <path d="M14 3v6h5" />
      <path d="M9 13h6" />
      <path d="M9 17h4" />
    </svg>
  );
}