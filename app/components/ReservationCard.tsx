type Reserva = {
  id?: string;
  departamento_id?: string | null;
  departamento_numero?: string | null;
  espacio: string;
  reservado_por: string;
  fecha_reserva: string;
  hora_inicio: string;
  hora_termino: string;
  estado?: string | null;
  observacion?: string | null;
};

type ReservationCardProps = {
  reserva: Reserva;
  onCancelar: (id?: string) => void;
  onDelete: (id?: string) => void;
};

export default function ReservationCard({
  reserva,
  onCancelar,
  onDelete,
}: ReservationCardProps) {
  const activa = reserva.estado === "RESERVADA";

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-[#D4AF37]">
            Reserva
          </p>

          <h3 className="text-xl font-bold text-[#061A33]">
            {reserva.espacio}
          </h3>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            activa
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {reserva.estado || "RESERVADA"}
        </span>
      </div>

      <div className="space-y-2 text-sm text-slate-600">
        <p>
          <strong>Departamento:</strong>{" "}
          {reserva.departamento_numero || "Sin asignar"}
        </p>

        <p>
          <strong>Reservado por:</strong> {reserva.reservado_por}
        </p>

        <p>
          <strong>Fecha:</strong> {reserva.fecha_reserva}
        </p>

        <p>
          <strong>Horario:</strong> {reserva.hora_inicio} -{" "}
          {reserva.hora_termino}
        </p>

        <p>
          <strong>Observación:</strong>{" "}
          {reserva.observacion || "Sin observación"}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between gap-2">
        {activa && (
          <button
            onClick={() => onCancelar(reserva.id)}
            className="rounded-lg bg-yellow-50 px-3 py-2 text-sm font-semibold text-yellow-700 hover:bg-yellow-100"
          >
            Cancelar reserva
          </button>
        )}

        <button
          onClick={() => onDelete(reserva.id)}
          className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}