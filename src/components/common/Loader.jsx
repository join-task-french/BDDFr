export default function Loader({ progress = 0 }) {
  return (
    <div className="fixed inset-0 bg-tactical-bg flex flex-col items-center justify-center z-50">
      <div className="w-16 h-16 border-4 border-tactical-border border-t-shd rounded-full animate-spin mb-6" />
      <p className="text-shd text-sm uppercase tracking-[0.3em] font-bold animate-pulse">
        Connexion au réseau SHD...
      </p>
      {progress > 0 && (
        <div className="w-48 h-1 bg-tactical-border rounded mt-4 overflow-hidden">
          <div
            className="h-full bg-shd transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}

