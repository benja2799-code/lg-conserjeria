type Encomienda = {
  id?: string;
  departamento_id?: string | null;
  departamento_numero?: string | null;
  destinatario?: string | null;
  empresa?: string | null;
  descripcion?: string | null;
  recibido_por?: string | null;
  entregado_a?: string | null;
  fecha_recepcion?: string | null;
  fecha_entrega?: string | null;
  estado?: string | null;
  observacion?: string | null;
};

type PackageCardProps = {
  encomienda: Encomienda;
  onEntregar: (id?: string) => void;
  onDelete: (id?: string) => void;
};

export default function PackageCard({
  encomienda,
  onEntregar,
  onDelete,
}: PackageCardProps) {
  const pendiente = encomienda.estado === "PENDIENTE";

  const fechaRecepcion = encomienda.fecha_recepcion
    ? new Date(encomienda.fecha_recepcion).toLocaleString("es-CL")
    : "Sin registro";

  const fechaEntrega = encomienda.fecha_entrega
    ? new Date(encomienda.fecha_entrega).toLocaleString("es-CL")
    : "Pendiente";

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-[#D4AF37]">
            Encomienda
          </p>
          <h3 className="text-xl font-bold text-[#061A33]">
            {encomienda.destinatario || "Sin destinatario"}
          </h3>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            pendiente
              ? "bg-yellow-100 text-yellow-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {encomienda.estado || "PENDIENTE"}
        </span>
      </div>

      <div className="space-y-2 text-sm text-slate-600">
        <p>
          <strong>Departamento:</strong>{" "}
          {encomienda.departamento_numero || "Sin asignar"}
        </p>

        <p>
          <strong>Empresa:</strong> {encomienda.empresa || "No registrada"}
        </p>

        <p>
          <strong>Descripción:</strong>{" "}
          {encomienda.descripcion || "Sin descripción"}
        </p>

        <p>
          <strong>Recibido por:</strong>{" "}
          {encomienda.recibido_por || "No registrado"}
        </p>

        <p>
          <strong>Entregado a:</strong>{" "}
          {encomienda.entregado_a || "Pendiente"}
        </p>

        <p>
          <strong>Recepción:</strong> {fechaRecepcion}
        </p>

        <p>
          <strong>Entrega:</strong> {fechaEntrega}
        </p>

        <p>
          <strong>Observación:</strong>{" "}
          {encomienda.observacion || "Sin observación"}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between gap-2">
        {pendiente && (
          <button
            onClick={() => onEntregar(encomienda.id)}
            className="rounded-lg bg-green-50 px-3 py-2 text-sm font-semibold text-green-700 hover:bg-green-100"
          >
            Marcar entregada
          </button>
        )}

        <button
          onClick={() => onDelete(encomienda.id)}
          className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}