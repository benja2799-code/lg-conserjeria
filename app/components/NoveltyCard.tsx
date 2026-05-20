type Novedad = {
  id?: string;
  tipo?: string | null;
  titulo: string;
  descripcion?: string | null;
  registrado_por?: string | null;
  turno?: string | null;
  estado?: string | null;
  fecha_registro?: string | null;
  fecha_cierre?: string | null;
  observacion_cierre?: string | null;
};

type NoveltyCardProps = {
  novedad: Novedad;
  onCerrar: (id?: string) => void;
  onDelete: (id?: string) => void;
};

export default function NoveltyCard({
  novedad,
  onCerrar,
  onDelete,
}: NoveltyCardProps) {
  const abierta = novedad.estado === "ABIERTA";

  const fechaRegistro = novedad.fecha_registro
    ? new Date(novedad.fecha_registro).toLocaleString("es-CL")
    : "Sin registro";

  const fechaCierre = novedad.fecha_cierre
    ? new Date(novedad.fecha_cierre).toLocaleString("es-CL")
    : "Pendiente";

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-[#D4AF37]">
            {novedad.tipo || "NOVEDAD"}
          </p>

          <h3 className="text-xl font-bold text-[#061A33]">
            {novedad.titulo}
          </h3>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            abierta
              ? "bg-yellow-100 text-yellow-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {novedad.estado || "ABIERTA"}
        </span>
      </div>

      <div className="space-y-2 text-sm text-slate-600">
        <p>
          <strong>Descripción:</strong>{" "}
          {novedad.descripcion || "Sin descripción"}
        </p>

        <p>
          <strong>Registrado por:</strong>{" "}
          {novedad.registrado_por || "No registrado"}
        </p>

        <p>
          <strong>Turno:</strong> {novedad.turno || "No indicado"}
        </p>

        <p>
          <strong>Fecha registro:</strong> {fechaRegistro}
        </p>

        <p>
          <strong>Fecha cierre:</strong> {fechaCierre}
        </p>

        <p>
          <strong>Observación cierre:</strong>{" "}
          {novedad.observacion_cierre || "Sin observación"}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between gap-2">
        {abierta && (
          <button
            onClick={() => onCerrar(novedad.id)}
            className="rounded-lg bg-green-50 px-3 py-2 text-sm font-semibold text-green-700 hover:bg-green-100"
          >
            Cerrar novedad
          </button>
        )}

        <button
          onClick={() => onDelete(novedad.id)}
          className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}