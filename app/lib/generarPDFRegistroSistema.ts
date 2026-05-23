import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

export async function generarPDFRegistroSistema(
  registros: RegistroSistemaPDF[]
) {
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
  doc.rect(0, 0, 210, 34, "F");

  if (logo) {
    doc.addImage(logo, "PNG", 14, 7, 20, 20);
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("REGISTRO GENERAL DEL SISTEMA", 105, 14, {
    align: "center",
  });

  doc.setFontSize(9);
  doc.text("Auditoría completa de acciones por módulo", 105, 23, {
    align: "center",
  });

  doc.setTextColor(0, 0, 0);

  doc.setFillColor(...grisClaro);
  doc.roundedRect(14, 42, 182, 30, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...dorado);
  doc.text("RESUMEN DEL REGISTRO", 20, 51);

  doc.setTextColor(...azul);
  doc.setFontSize(10);
  doc.text("Total acciones:", 20, 61);
  doc.text("Fecha emisión:", 110, 61);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(40, 40, 40);
  doc.text(String(registros.length), 52, 61);
  doc.text(new Date().toLocaleString("es-CL"), 145, 61);

  let y = 84;

  const modulos = Array.from(new Set(registros.map((r) => r.modulo)));

  for (const modulo of modulos) {
    const registrosModulo = registros.filter((r) => r.modulo === modulo);

    if (y > 245) {
      doc.addPage();
      y = 25;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...azul);
    doc.text(`${modulo.toUpperCase()} (${registrosModulo.length})`, 14, y);

    const filas = registrosModulo.map((registro) => [
      formatearFecha(registro.created_at),
      registro.accion,
      registro.descripcion,
      registro.usuario_nombre || "-",
      registro.usuario_rol || "-",
    ]);

    autoTable(doc, {
      startY: y + 5,
      head: [["Fecha", "Acción", "Descripción", "Usuario", "Rol"]],
      body: filas,
      theme: "grid",
      styles: {
        fontSize: 7,
        cellPadding: 2,
        valign: "middle",
        lineColor: [220, 220, 220],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: azul,
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: grisClaro,
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 32 },
        2: { cellWidth: 70 },
        3: { cellWidth: 30 },
        4: { cellWidth: 20 },
      },
    });

    y = ((doc as any).lastAutoTable?.finalY || y + 20) + 12;
  }

  const finalY = y + 15;

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

  doc.save(`registro-general-sistema-${new Date().toISOString().slice(0, 10)}.pdf`);
}