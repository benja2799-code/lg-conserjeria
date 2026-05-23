import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Turno = {
  id: string;
  usuario_id: string | null;
  nombre_conserje: string;
  rol: string | null;
  tipo_turno: string;
  hora_inicio: string;
  hora_termino: string | null;
  estado: string;
  created_at: string;
};

const formatearFecha = (fecha: string | null) => {
  if (!fecha) return "-";

  return new Date(fecha).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatearHora = (fecha: string | null) => {
  if (!fecha) return "-";

  return new Date(fecha).toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const calcularHorasNumero = (inicio: string, termino: string | null) => {
  if (!termino) return 0;

  const inicioMs = new Date(inicio).getTime();
  const terminoMs = new Date(termino).getTime();

  const diferenciaMs = terminoMs - inicioMs;

  if (diferenciaMs <= 0) return 0;

  return diferenciaMs / 1000 / 60 / 60;
};

const calcularHorasTexto = (inicio: string, termino: string | null) => {
  if (!termino) return "En curso";

  const horas = calcularHorasNumero(inicio, termino);

  return `${horas.toFixed(1)} hrs.`;
};

const obtenerMesTexto = (fecha: string) => {
  return new Date(fecha).toLocaleDateString("es-CL", {
    month: "long",
    year: "numeric",
  });
};

const obtenerTipoTurno = (tipoTurno: string) => {
  if (tipoTurno.includes("20:00")) return "NOCTURNO";
  return "DIURNO";
};

const cargarLogo = async () => {
  try {
    const response = await fetch("/logo_LG.png");
    const blob = await response.blob();

    return await new Promise<string>((resolve) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        resolve(reader.result as string);
      };

      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

export async function generarPDFAsistencia(turnos: Turno[]) {
  if (turnos.length === 0) {
    alert("No hay registros para generar PDF.");
    return;
  }

  const turnosOrdenados = [...turnos].sort(
    (a, b) =>
      new Date(a.hora_inicio).getTime() - new Date(b.hora_inicio).getTime()
  );

  const primerTurno = turnosOrdenados[0];

  const nombreConserje = primerTurno.nombre_conserje || "Sin nombre";
  const rol = primerTurno.rol || "-";
  const mesTexto = obtenerMesTexto(primerTurno.hora_inicio).toUpperCase();

  const totalHoras = turnosOrdenados.reduce((total, turno) => {
    return total + calcularHorasNumero(turno.hora_inicio, turno.hora_termino);
  }, 0);

  const totalFinalizados = turnosOrdenados.filter(
    (turno) => turno.estado === "FINALIZADO"
  ).length;

  const totalActivos = turnosOrdenados.filter(
    (turno) => turno.estado === "ACTIVO"
  ).length;

  const doc = new jsPDF("p", "mm", "a4");

  const azul = [11, 31, 58] as [number, number, number];
  const dorado = [217, 165, 32] as [number, number, number];
  const grisClaro = [244, 246, 249] as [number, number, number];

  const logo = await cargarLogo();

  doc.setFillColor(...azul);
  doc.rect(0, 0, 210, 30, "F");

  if (logo) {
    doc.addImage(logo, "PNG", 14, 6, 18, 18);
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("PLANILLA DE ASISTENCIA", 105, 13, { align: "center" });

  doc.setFontSize(10);
  doc.text("CONTROL OPERACIONAL DE CONSERJERÍA", 105, 21, {
    align: "center",
  });

  doc.setTextColor(0, 0, 0);

  doc.setFillColor(...grisClaro);
  doc.roundedRect(14, 38, 182, 34, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...dorado);
  doc.text("DATOS DEL TURNO", 20, 47);

  doc.setTextColor(...azul);
  doc.setFontSize(10);

  doc.text("CONSERJE:", 20, 56);
  doc.text("ROL:", 20, 64);
  doc.text("MES:", 110, 56);
  doc.text("TOTAL HORAS:", 110, 64);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(40, 40, 40);

  doc.text(nombreConserje.toUpperCase(), 45, 56);
  doc.text(rol, 45, 64);
  doc.text(mesTexto, 132, 56);
  doc.text(`${totalHoras.toFixed(1)} hrs.`, 145, 64);

  const filas = turnosOrdenados.map((turno) => [
    formatearFecha(turno.hora_inicio),
    formatearHora(turno.hora_inicio),
    formatearHora(turno.hora_termino),
    obtenerTipoTurno(turno.tipo_turno),
    calcularHorasTexto(turno.hora_inicio, turno.hora_termino),
    turno.estado,
  ]);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...azul);
  doc.text("HORAS REGISTRADAS", 105, 84, { align: "center" });

  autoTable(doc, {
    startY: 90,
    head: [["Día", "Ingreso", "Salida", "Tipo", "Total horas", "Estado"]],
    body: filas,
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      halign: "center",
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
      0: { cellWidth: 28 },
      1: { cellWidth: 26 },
      2: { cellWidth: 26 },
      3: { cellWidth: 32 },
      4: { cellWidth: 32 },
      5: { cellWidth: 32 },
    },
  });

  let finalY = (doc as any).lastAutoTable.finalY + 12;

  if (finalY > 230) {
    doc.addPage();
    finalY = 25;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...azul);
  doc.text("RESUMEN DE HORAS", 105, finalY, { align: "center" });

  autoTable(doc, {
    startY: finalY + 6,
    head: [
      [
        "Total turnos",
        "Turnos finalizados",
        "Turnos activos",
        "Total horas realizadas",
      ],
    ],
    body: [
      [
        String(turnosOrdenados.length),
        String(totalFinalizados),
        String(totalActivos),
        `${totalHoras.toFixed(1)} hrs.`,
      ],
    ],
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: 3,
      halign: "center",
      valign: "middle",
    },
    headStyles: {
      fillColor: [230, 230, 230],
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
  });

  const firmaY = (doc as any).lastAutoTable.finalY + 25;

  if (firmaY > 260) {
    doc.addPage();
  }

  const yFirmaFinal = firmaY > 260 ? 40 : firmaY;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...azul);

  doc.text("FIRMA Y TIMBRE SUPERVISOR:", 18, yFirmaFinal);
  doc.line(18, yFirmaFinal + 18, 85, yFirmaFinal + 18);

  doc.text("FIRMA CONFORME CONSERJE:", 120, yFirmaFinal);
  doc.line(120, yFirmaFinal + 18, 190, yFirmaFinal + 18);

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

  const nombreArchivo = `planilla-asistencia-${nombreConserje
    .toLowerCase()
    .replaceAll(" ", "-")}-${mesTexto
    .toLowerCase()
    .replaceAll(" ", "-")}.pdf`;

  doc.save(nombreArchivo);
}