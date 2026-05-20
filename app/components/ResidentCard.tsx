type Residente = {
  id?: string;
  departamento_id?: string | null;
  nombre: string;
  rut?: string | null;
  telefono?: string | null;
  email?: string | null;
  tipo?: string | null;
  departamento_numero?: string | null;
};

type ResidentCardProps = {
  residente: Residente;
  onEdit: (residente: Residente) => void;
  onDelete: (id?: string) => void;
};

export default function ResidentCard({
  residente,
  onEdit,
  onDelete,
}: ResidentCardProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-[#D4AF37]">
            Residente
          </p>
          <h3 className="text-xl font-bold text-[#061A33]">
            {residente.nombre}
          </h3>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-[#061A33]">
          {residente.tipo || "RESIDENTE"}
        </span>
      </div>

      <div className="space-y-2 text-sm text-slate-600">
        <p>
          <strong>Departamento:</strong>{" "}
          {residente.departamento_numero || "Sin asignar"}
        </p>

        <p>
          <strong>RUT:</strong> {residente.rut || "No registrado"}
        </p>

        <p>
          <strong>Teléfono:</strong> {residente.telefono || "No registrado"}
        </p>

        <p>
          <strong>Email:</strong> {residente.email || "No registrado"}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between gap-2">
        <button
          onClick={() => onEdit(residente)}
          className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-[#061A33] hover:bg-slate-200"
        >
          Editar
        </button>

        <button
          onClick={() => onDelete(residente.id)}
          className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}