import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDataLoader } from '../hooks/useDataLoader'
import { decodeBuild, resolveBuild } from '../utils/buildShare'
import Loader from '../components/common/Loader'
import { GameIcon, resolveAsset, GEAR_SLOT_ICONS_IMG } from '../components/common/GameAssets'

function ItemMini({ item, ensemble, slot }) {
  const isWeapon = slot.startsWith('w') || slot === 'sa'
  
  // Résolution d'icône
  let icon = null
  if (isWeapon) {
    icon = resolveAsset(item?.slug) || resolveAsset(item?.type?.replace(' ', '_').toLowerCase())
  } else {
    icon = resolveAsset(ensemble?.icon) || GEAR_SLOT_ICONS_IMG[slot]
  }

  const name = item?.nom || ''
  const isExotic = item?.qualite === 'exotique' || item?.type === 'exotique' || item?.estExotique
  
  return (
    <div className="flex items-center gap-2 min-w-0" title={name || slot}>
      <div className={`shrink-0 w-8 h-8 flex items-center justify-center rounded bg-black/40 border ${item ? (isExotic ? 'border-orange-500/50 bg-orange-500/5' : 'border-white/10') : 'border-white/5 opacity-20'}`}>
        <GameIcon 
          src={icon} 
          size="w-5 h-5" 
          color={isExotic ? 'text-orange-500' : 'text-gray-400'} 
        />
      </div>
      <div className="flex flex-col min-w-0 leading-tight">
        <span className={`text-[10px] font-bold uppercase truncate ${item ? (isExotic ? 'text-orange-400' : 'text-gray-200') : 'text-gray-600'}`}>
          {name || '-'}
        </span>
        {ensemble?.nom && !isWeapon && (
           <span className="text-[8px] text-gray-500 truncate uppercase tracking-tighter">
             {ensemble.nom}
           </span>
        )}
        {isWeapon && item?.type && (
           <span className="text-[8px] text-gray-500 truncate uppercase tracking-tighter">
             {item.type.replace('_', ' ')}
           </span>
        )}
      </div>
    </div>
  )
}

export default function BuildLibraryPage() {
  const { data, loading, error, progress } = useDataLoader()
  const navigate = useNavigate()
  const [localBuilds, setLocalBuilds] = useState([])

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('div2_builds_v2') || '[]')
      setLocalBuilds(Array.isArray(saved) ? saved : [])
    } catch (e) {
      console.error("Erreur de lecture du localStorage", e)
      setLocalBuilds([])
    }
  }, [])

  const handleDeleteLocal = (index) => {
    if (window.confirm('Supprimer ce build de votre bibliothèque locale ?')) {
      const newBuilds = [...localBuilds]
      newBuilds.splice(index, 1)
      setLocalBuilds(newBuilds)
      localStorage.setItem('div2_builds_v2', JSON.stringify(newBuilds))
    }
  }

  if (loading) return <Loader progress={progress} />
  if (error) return (
    <div className="p-8 text-center">
      <p className="text-red-500 mb-4">Une erreur est survenue lors du chargement des données : {error}</p>
      <button onClick={() => window.location.reload()} className="px-4 py-2 bg-shd text-white rounded">Réessayer</button>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white uppercase tracking-widest mb-1">
          Buildo<span className="text-shd">thèque</span>
        </h2>
        <p className="text-sm text-gray-500">Retrouvez vos configurations et les builds de la communauté</p>
      </div>

      <div className="space-y-12">
        {/* Section Local */}
        <section>
          <h3 className="text-sm font-bold text-shd uppercase tracking-widest mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-shd rounded-full animate-pulse" />
            Vos Builds Enregistrés
          </h3>
          {localBuilds.length === 0 ? (
            <div className="p-8 border border-dashed border-tactical-border rounded-lg text-center text-gray-500">
              Aucun build enregistré localement. Utilisez le Build Planner pour en créer un !
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {localBuilds.map((b, i) => (
                <BuildCard 
                  key={i} 
                  build={b} 
                  data={data} 
                  onView={() => navigate(`/planner?b=${b.encoded}`)}
                  onDelete={() => handleDeleteLocal(i)}
                  isLocal
                />
              ))}
            </div>
          )}
        </section>

        {/* Section Prédéfinis */}
        {data.builds && data.builds.length > 0 && (
          <section>
            <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full" />
              Builds Recommandés
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.builds.map((b, i) => (
                <BuildCard 
                  key={i} 
                  build={b} 
                  data={data} 
                  onView={() => navigate(`/planner?b=${b.encoded}`)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function BuildCard({ build, data, onView, onDelete, isLocal }) {
  const resolved = useMemo(() => {
    const compact = decodeBuild(build.encoded)
    return resolveBuild(compact, data)
  }, [build.encoded, data])

  if (!resolved) return null

  // Extraction des éléments clés pour la vue rapide
  const spec = resolved.specialWeapon?.specialisation || 'Inconnue'
  const weapons = resolved.weapons.filter(Boolean)
  const gearPieces = Object.values(resolved.gear).filter(Boolean)
  
  // Compter les marques d'équipement pour identifier le set principal
  const resolvedEnsembles = useMemo(() => {
    const res = {}
    Object.entries(resolved.gear).forEach(([slot, item]) => {
      if (item?.marque) {
        res[slot] = data.ensembles?.[item.marque] || 
                    Object.values(data.ensembles || {}).find(e => e.slug === item.marque)
      }
    })
    return res
  }, [resolved.gear, data.ensembles])

  const brands = gearPieces.reduce((acc, item) => {
    const ensemble = resolvedEnsembles[item.emplacement]
    const brandName = ensemble?.nom || item.nom
    acc[brandName] = (acc[brandName] || 0) + 1
    return acc
  }, {})
  const mainBrand = Object.entries(brands).sort((a, b) => b[1] - a[1])[0]?.[0]

  const statsCount = { offensif: 0, defensif: 0, utilitaire: 0 }

  // Utiliser les attributs résolus du build pour le compte des stats
  if (resolved.gearAttributes) {
    Object.values(resolved.gearAttributes).forEach(slotAttrs => {
      if (slotAttrs.essentiels) {
        slotAttrs.essentiels.forEach(a => {
          if (a && a.categorie) {
            const cat = a.categorie.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
            if (statsCount.hasOwnProperty(cat)) statsCount[cat] += 1
          }
        })
      }
    })
  }

  return (
    <div className="group bg-tactical-panel border border-tactical-border rounded-lg overflow-hidden hover:border-shd/50 transition-all flex flex-col h-full shadow-lg">
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="text-lg font-bold text-white uppercase tracking-wider group-hover:text-shd transition-colors line-clamp-1">
              {build.nom}
            </h4>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="text-blue-400">{spec}</span>
              <span className="text-gray-700">|</span>
              <div className="flex gap-1">
                <span className="text-red-500">{statsCount.offensif}</span>
                <span className="text-blue-500">{statsCount.defensif}</span>
                <span className="text-yellow-500">{statsCount.utilitaire}</span>
              </div>
            </div>
          </div>
          {isLocal && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="text-gray-600 hover:text-red-500 p-1 transition-colors"
              title="Supprimer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>

        <p className="text-sm text-gray-400 mb-6 line-clamp-2 h-10 italic">
          {build.description || "Aucune description fournie."}
        </p>

        {/* Vue Rapide Elements */}
        <div className="bg-black/20 p-3 rounded border border-white/5 space-y-4">
          {/* Ligne principale : Armes */}
          <div className="grid grid-cols-2 gap-3">
            <ItemMini item={resolved.weapons[0]} slot="w1" />
            <ItemMini item={resolved.weapons[1]} slot="w2" />
          </div>

          {/* Grille d'équipement (2 colonnes, 3 lignes) */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-white/5 pt-3">
            <ItemMini item={resolved.gear.masque} ensemble={resolvedEnsembles.masque} slot="masque" />
            <ItemMini item={resolved.gear.sac_a_dos} ensemble={resolvedEnsembles.sac_a_dos} slot="sac_a_dos" />
            
            <ItemMini item={resolved.gear.torse} ensemble={resolvedEnsembles.torse} slot="torse" />
            <ItemMini item={resolved.gear.gants} ensemble={resolvedEnsembles.gants} slot="gants" />

            <ItemMini item={resolved.gear.holster} ensemble={resolvedEnsembles.holster} slot="holster" />
            <ItemMini item={resolved.gear.genouilleres} ensemble={resolvedEnsembles.genouilleres} slot="genouilleres" />
          </div>
          
          <div className="flex items-center justify-between border-t border-white/5 pt-2">
            <ItemMini item={resolved.sidearm} slot="sa" />
            {mainBrand && (
              <span className="text-[10px] font-bold text-shd uppercase tracking-widest bg-shd/10 px-2 py-0.5 rounded">
                {mainBrand}
              </span>
            )}
          </div>
        </div>
      </div>

      <button 
        onClick={onView}
        className="w-full py-3 bg-tactical-bg hover:bg-shd/10 text-xs font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-shd border-t border-tactical-border transition-all flex items-center justify-center gap-2"
      >
        Consulter le build
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
    </div>
  )
}
