type Vehiculo = {
  id?: string;
  departamento_id?: string | null;
  residente_id?: string | null;
  patente: string;
  marca?: string | null;
  modelo?: string | null;
  color?: string | null;
  tipo?: string | null;
  observacion?: string | null;
  departamento_numero?: string | null;
  residente_nombre?: string | null;
};

type VehicleCardProps = {
  vehiculo: Vehiculo;
  onEdit: (vehiculo: Vehiculo) => void;
  onDelete: (id?: string) => void;
};

export default function VehicleCard({
  vehiculo,
  onEdit,
  onDelete,
}: VehicleCardProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-[#D4AF37]">
            Vehículo
          </p>
          <h3 className="text-2xl font-bold text-[#061A33]">
            {vehiculo.patente}
          </h3>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-[#061A33]">
          {vehiculo.tipo || "AUTO"}
        </span>
      </div>

      <div className="space-y-2 text-sm text-slate-600">
        <p>
          <strong>Departamento:</strong>{" "}
          {vehiculo.departamento_numero || "Sin asignar"}
        </p>

        <p>
          <strong>Residente:</strong>{" "}
          {vehiculo.residente_nombre || "Sin asignar"}
        </p>

        <p>
          <strong>Marca:</strong> {vehiculo.marca || "No registrada"}
        </p>

        <p>
          <strong>Modelo:</strong> {vehiculo.modelo || "No registrado"}
        </p>

        <p>
          <strong>Color:</strong> {vehiculo.color || "No registrado"}
        </p>

        <p>
          <strong>Observación:</strong>{" "}
          {vehiculo.observacion || "Sin observación"}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between gap-2">
        <button
          onClick={() => onEdit(vehiculo)}
          className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-[#061A33] hover:bg-slate-200"
        >
          Editar
        </button>

        <button
          onClick={() => onDelete(vehiculo.id)}
          className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}