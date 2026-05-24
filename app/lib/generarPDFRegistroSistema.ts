import jsPDF from "jspdf";

export type RegistroSistemaPDF = {
  id: string;
  modulo: string;
  accion: string;
  descripcion: string;
  usuario_nombre: string | null;
  usuario_rol: string | null;
  referencia_id: string | null;
  referencia_tabla: string | null;
  created_at: string;
};

const formatearFecha = (fecha: string) => {
  return new Date(fecha).toLocaleString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const cortarTexto = (texto: string, largo: number) => {
  if (!texto) return "-";
  return texto.length > largo ? `${texto.slice(0, largo)}...` : texto;
};

export function generarPDFRegistroSistema(registros: RegistroSistemaPDF[]) {
  try {
    if (!registros || registros.length === 0) {
      alert("No hay registros para descargar.");
      return;
    }

    const doc = new jsPDF("p", "mm", "a4");

    const azul: [number, number, number] = [11, 31, 58];
    const dorado: [number, number, number] = [217, 165, 32];
    const gris: [number, number, number] = [244, 246, 249];

    const margen = 14;
    let y = 0;

    doc.setFillColor(...azul);
    doc.rect(0, 0, 210, 32, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("REGISTRO GENERAL DEL SISTEMA", 105, 13, {
      align: "center",
    });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Historial completo de acciones registradas", 105, 21, {
      align: "center",
    });

    y = 42;

    doc.setFillColor(...gris);
    doc.roundedRect(margen, y, 182, 26, 3, 3, "F");

    doc.setTextColor(...dorado);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("RESUMEN", margen + 5, y + 8);

    doc.setTextColor(...azul);
    doc.setFontSize(10);
    doc.text(`Total de registros: ${registros.length}`, margen + 5, y + 17);

    doc.setFont("helvetica", "normal");
    doc.text(
      `Fecha emisión: ${new Date().toLocaleString("es-CL")}`,
      115,
      y + 17
    );

    y += 38;

    const modulos = Array.from(new Set(registros.map((r) => r.modulo))).sort();

    for (const modulo of modulos) {
      const registrosModulo = registros.filter((r) => r.modulo === modulo);

      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      doc.setTextColor(...azul);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(`${modulo.toUpperCase()} (${registrosModulo.length})`, margen, y);

      y += 6;

      doc.setFillColor(...azul);
      doc.rect(margen, y, 182, 8, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");

      doc.text("Fecha", margen + 2, y + 5);
      doc.text("Acción", margen + 36, y + 5);
      doc.text("Descripción", margen + 72, y + 5);
      doc.text("Usuario", margen + 150, y + 5);

      y += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);

      for (const registro of registrosModulo) {
        if (y > 275) {
          doc.addPage();
          y = 20;

          doc.setFillColor(...azul);
          doc.rect(margen, y, 182, 8, "F");

          doc.setTextColor(255, 255, 255);
          doc.setFont("helvetica", "bold");
          doc.text("Fecha", margen + 2, y + 5);
          doc.text("Acción", margen + 36, y + 5);
          doc.text("Descripción", margen + 72, y + 5);
          doc.text("Usuario", margen + 150, y + 5);

          y += 8;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7);
        }

        doc.setDrawColor(220, 220, 220);
        doc.rect(margen, y, 182, 9, "S");

        doc.setTextColor(40, 40, 40);

        doc.text(formatearFecha(registro.created_at), margen + 2, y + 6);
        doc.text(cortarTexto(registro.accion, 22), margen + 36, y + 6);
        doc.text(cortarTexto(registro.descripcion, 55), margen + 72, y + 6);
        doc.text(
          cortarTexto(registro.usuario_nombre || "-", 18),
          margen + 150,
          y + 6
        );

        y += 9;
      }

      y += 8;
    }

    const totalPaginas = doc.getNumberOfPages();

    for (let i = 1; i <= totalPaginas; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(`Página ${i} de ${totalPaginas}`, 105, 290, {
        align: "center",
      });
    }

    doc.save(
      `registro-general-sistema-${new Date().toISOString().slice(0, 10)}.pdf`
    );
  } catch (error) {
    console.error("Error al generar PDF:", error);
    alert("No se pudo generar el PDF del registro general.");
  }
}