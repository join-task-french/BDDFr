export default function MobileOverlay({ open, onClick }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 bg-black/70 z-20 md:hidden"
      onClick={onClick}
    />
  )
}

