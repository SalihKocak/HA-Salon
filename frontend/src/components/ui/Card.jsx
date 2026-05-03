export default function Card({ children, className = '', onClick }) {
  return (
    <div
      className={`
        bg-[#1a1a1a] border border-neutral-800 rounded-xl p-6
        ${onClick ? 'cursor-pointer hover:border-neutral-600 transition-colors' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function StatCard({ icon, title, value, subtitle, color = 'rose' }) {
  const colorMap = {
    rose: 'text-rose-500 bg-rose-500/10',
    emerald: 'text-emerald-500 bg-emerald-500/10',
    blue: 'text-blue-500 bg-blue-500/10',
    amber: 'text-amber-500 bg-amber-500/10',
    violet: 'text-violet-500 bg-violet-500/10',
    cyan: 'text-cyan-500 bg-cyan-500/10',
  };

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-neutral-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-neutral-100">{value}</p>
          {subtitle && <p className="text-neutral-500 text-xs">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}
