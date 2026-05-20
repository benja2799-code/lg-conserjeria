type StatsCardProps = {
  title: string;
  value: string;
  description: string;
  highlighted?: boolean;
};

export default function StatsCard({
  title,
  value,
  description,
  highlighted = false,
}: StatsCardProps) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase text-slate-500">
        {title}
      </p>

      <h3 className="mt-2 text-3xl font-bold text-[#061A33]">{value}</h3>

      <p
        className={`mt-2 text-sm ${
          highlighted ? "text-[#D4AF37]" : "text-slate-500"
        }`}
      >
        {description}
      </p>
    </div>
  );
}