export default function StatChip({ icon, value, color = '' }) {
  if (!value) return null
  return (
    <span className={`stat-chip ${color}`}>
      {icon && <span className="mr-1">{icon}</span>}
      {value}
    </span>
  )
}
