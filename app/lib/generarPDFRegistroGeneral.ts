import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type RegistroGeneral = {
  id: string;
  tipo: string;
  descripcion: string;
  responsable: string;
  fecha: string;
  estado: string;
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

const cargarLogo = async () => {
  try {
    const response = await fetch("/logo_LG.png");
    const blob = await response.blob();

    return await new Promise<string>((resolve) => {
      const reader = new FileReader();

      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

export async function generarPDFRegistroGeneral(registros: RegistroGeneral[]) {
  if (registros.length === 0) {
    alert("No hay registros para generar PDF.");
    return;
  }

  const doc = new jsPDF("p", "mm", "a4");

  const azul = [11, 31, 58] as [number, number, number];
  const dorado = [217, 165, 32] as [number, number, number];
  const grisClaro = [244, 246, 249] as [number, number, number];

  const logo = await cargarLogo();

  doc.setFillColor(...azul);
  doc.rect(0, 0, 210, 32, "F");

  if (logo) {
    doc.addImage(logo, "PNG", 14, 7, 18, 18);
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("REGISTRO GENERAL DEL SISTEMA", 105, 14, { align: "center" });

  doc.setFontSize(10);
  doc.text("CONTROL OPERACIONAL DE CONSERJERÍA", 105, 23, {
    align: "center",
  });

  doc.setTextColor(0, 0, 0);

  doc.setFillColor(...grisClaro);
  doc.roundedRect(14, 40, 182, 26, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...dorado);
  doc.text("RESUMEN DEL REGISTRO", 20, 49);

  doc.setTextColor(...azul);
  doc.setFontSize(10);
  doc.text("TOTAL REGISTROS:", 20, 58);
  doc.text("FECHA EMISIÓN:", 110, 58);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(40, 40, 40);
  doc.text(String(registros.length), 58, 58);
  doc.text(new Date().toLocaleString("es-CL"), 145, 58);

  const filas = registros.map((registro) => [
    formatearFecha(registro.fecha),
    registro.tipo,
    registro.descripcion,
    registro.responsable,
    registro.estado,
  ]);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...azul);
  doc.text("DETALLE DE MOVIMIENTOS", 105, 78, { align: "center" });

  autoTable(doc, {
    startY: 85,
    head: [["Fecha", "Tipo", "Descripción", "Responsable", "Estado"]],
    body: filas,
    theme: "grid",
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      valign: "middle",
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: azul,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    alternateRowStyles: {
      fillColor: grisClaro,
    },
    columnStyles: {
      0: { cellWidth: 33 },
      1: { cellWidth: 28 },
      2: { cellWidth: 62 },
      3: { cellWidth: 35 },
      4: { cellWidth: 24 },
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 15;

  if (finalY < 265) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...azul);

    doc.text("FIRMA RESPONSABLE:", 20, finalY);
    doc.line(20, finalY + 18, 90, finalY + 18);

    doc.text("FIRMA SUPERVISOR:", 120, finalY);
    doc.line(120, finalY + 18, 190, finalY + 18);
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);

  doc.text(
    `Documento generado automáticamente el ${new Date().toLocaleString(
      "es-CL"
    )}`,
    105,
    287,
    { align: "center" }
  );

  doc.save(
    `registro-general-${new Date().toISOString().slice(0, 10)}.pdf`
  );
}