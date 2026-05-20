type Visita = {
  id?: string;
  departamento_id?: string | null;
  departamento_numero?: string | null;
  nombre_visitante: string;
  rut_visitante?: string | null;
  motivo?: string | null;
  autorizado_por?: string | null;
  patente?: string | null;
  hora_ingreso?: string | null;
  hora_salida?: string | null;
  estado?: string | null;
  observacion?: string | null;
};

type VisitCardProps = {
  visita: Visita;
  onSalida: (id?: string) => void;
  onDelete: (id?: string) => void;
};

export default function VisitCard({ visita, onSalida, onDelete }: VisitCardProps) {
  const horaIngreso = visita.hora_ingreso
    ? new Date(visita.hora_ingreso).toLocaleString("es-CL")
    : "Sin registro";

  const horaSalida = visita.hora_salida
    ? new Date(visita.hora_salida).toLocaleString("es-CL")
    : "Pendiente";

  const dentro = visita.estado === "DENTRO";

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-[#D4AF37]">
            Visitante
          </p>
          <h3 className="text-xl font-bold text-[#061A33]">
            {visita.nombre_visitante}
          </h3>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            dentro
              ? "bg-green-100 text-green-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {visita.estado || "DENTRO"}
        </span>
      </div>

      <div className="space-y-2 text-sm text-slate-600">
        <p>
          <strong>Departamento:</strong>{" "}
          {visita.departamento_numero || "Sin asignar"}
        </p>

        <p>
          <strong>RUT:</strong> {visita.rut_visitante || "No registrado"}
        </p>

        <p>
          <strong>Motivo:</strong> {visita.motivo || "No registrado"}
        </p>

        <p>
          <strong>Autoriza:</strong> {visita.autorizado_por || "No registrado"}
        </p>

        <p>
          <strong>Patente:</strong> {visita.patente || "No aplica"}
        </p>

        <p>
          <strong>Ingreso:</strong> {horaIngreso}
        </p>

        <p>
          <strong>Salida:</strong> {horaSalida}
        </p>

        <p>
          <strong>Observación:</strong> {visita.observacion || "Sin observación"}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between gap-2">
        {dentro && (
          <button
            onClick={() => onSalida(visita.id)}
            className="rounded-lg bg-green-50 px-3 py-2 text-sm font-semibold text-green-700 hover:bg-green-100"
          >
            Marcar salida
          </button>
        )}

        <button
          onClick={() => onDelete(visita.id)}
          className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}