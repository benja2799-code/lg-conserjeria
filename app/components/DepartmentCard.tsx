type Departamento = {
  id?: string;
  numero: string;
  tipo: string;
  residentes: string[] | string | null;
};

type DepartmentCardProps = {
  id?: string;
  numero: string;
  tipo: string;
  residentes: string[] | string | null;
  onDelete: (id?: string) => void;
  onEdit: (departamento: Departamento) => void;
};

export default function DepartmentCard({
  id,
  numero,
  tipo,
  residentes,
  onDelete,
  onEdit,
}: DepartmentCardProps) {
  const residentesArray = Array.isArray(residentes)
    ? residentes
    : typeof residentes === "string" && residentes.length > 0
    ? residentes.split(",").map((r) => r.trim())
    : [];

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <div className="rounded-lg bg-[#061A33] px-4 py-2 text-white">
          <p className="text-xs font-semibold text-[#D4AF37]">DPTO</p>
          <h3 className="text-2xl font-bold">{numero}</h3>
        </div>

        <span
          className={`text-xs font-bold ${
            tipo === "ARRENDADO" ? "text-[#D4AF37]" : "text-[#061A33]"
          }`}
        >
          {tipo}
        </span>
      </div>

      <div>
        <h4 className="font-semibold text-[#061A33]">Residentes</h4>

        {residentesArray.length > 0 ? (
          <ul className="mt-3 space-y-1 text-sm text-slate-700">
            {residentesArray.map((residente) => (
              <li key={residente}>• {residente}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-slate-400">
            Sin residentes registrados
          </p>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between gap-2">
        <button
          onClick={() =>
            onEdit({
              id,
              numero,
              tipo,
              residentes: residentesArray,
            })
          }
          className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-[#061A33] hover:bg-slate-200"
        >
          Editar
        </button>

        <button
          onClick={() => onDelete(id)}
          className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}