import { useState, useMemo, useEffect, useRef } from 'react'
import { Reorder } from 'framer-motion'

export function useSortPanel({ options, value, defaultSort, onChange }) {
    const [open, setOpen] = useState(false)

    if (!options || options.length === 0) return { button: null, panel: null }

    const fullLayers = useMemo(() => {
        const current = Array.isArray(value) && value.length > 0 ? value : defaultSort
        const result = current.filter(l => options.some(o => o.id === l.id))

        options.forEach(opt => {
            if (!result.some(l => l.id === opt.id)) {
                result.push({ id: opt.id, desc: false })
            }
        })
        return result
    }, [value, defaultSort, options])

    const [localLayers, setLocalLayers] = useState(fullLayers)
    const localLayersRef = useRef(localLayers)

    useEffect(() => {
        setLocalLayers(fullLayers)
    }, [fullLayers])

    useEffect(() => {
        localLayersRef.current = localLayers
    }, [localLayers])

    const isModified = JSON.stringify(fullLayers) !== JSON.stringify(defaultSort)

    const updateLayerDirection = (index) => {
        const newLayers = [...localLayers]
        newLayers[index] = { ...newLayers[index], desc: !newLayers[index].desc }
        onChange(newLayers)
    }

    const getOptionConfig = (id) => options.find(o => o.id === id) || {}

    const button = (
        <button
            onClick={() => setOpen(!open)}
            className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-bold uppercase tracking-widest border transition-all ${
                isModified || open
                    ? 'bg-shd/20 text-shd border-shd/40'
                    : 'bg-tactical-panel text-gray-400 border-tactical-border hover:border-gray-500 hover:text-gray-300'
            }`}
        >
            <svg className={"w-4 h-4 " + (isModified ? 'text-shd ' : '')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            <span>Tri{isModified ? '*' : ''}</span>

            <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </button>
    )

    const panel = open ? (
        <div className="bg-tactical-panel border border-tactical-border rounded-lg p-4 animate-fade-in w-full">
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-tactical-border/50">
                <span className="text-xs text-gray-500 uppercase tracking-widest font-bold py-1">
                  Priorité de tri (haut en bas)
                </span>
                {isModified && (
                    <button
                        onClick={() => { onChange(defaultSort); }}
                        className="text-xs text-red-400 hover:text-red-300 uppercase tracking-widest font-bold bg-red-500/10 px-2 py-1 rounded transition-colors"
                    >
                        Réinitialiser
                    </button>
                )}
            </div>

            <Reorder.Group
                axis="y"
                values={localLayers}
                onReorder={setLocalLayers}
                className="flex flex-col select-none md:max-w-md"
            >
                {localLayers.map((layer, index) => {
                    const optionConfig = getOptionConfig(layer.id)
                    const ascLabel = optionConfig.ascLabel || 'A-Z'
                    const descLabel = optionConfig.descLabel || 'Z-A'
                    const hideDirection = optionConfig.hideDirection === true

                    return (
                        <Reorder.Item
                            key={layer.id}
                            value={layer}
                            onDragEnd={() => {
                                onChange(localLayersRef.current)
                            }}
                            className="relative py-1"
                        >
                            <div className="relative flex items-center gap-3 p-2 rounded border border-tactical-border/50 bg-black/20 hover:border-gray-500 transition-colors cursor-grab active:cursor-grabbing">
                                <div className="text-gray-500 px-1 hover:text-shd flex flex-col gap-[2px]">
                                    <div className="w-1 h-1 bg-current rounded-full"></div>
                                    <div className="w-1 h-1 bg-current rounded-full"></div>
                                    <div className="w-1 h-1 bg-current rounded-full"></div>
                                </div>

                                <div className="flex-1 text-sm font-bold text-gray-200 uppercase tracking-wider truncate">
                                    {optionConfig.label || layer.id}
                                </div>

                                {!hideDirection && (
                                    <button
                                        onPointerDown={(e) => e.stopPropagation()}
                                        onClick={(e) => { e.stopPropagation(); updateLayerDirection(index) }}
                                        className={`px-2 py-1 rounded text-xs font-bold border transition-colors min-w-12.5 text-center cursor-pointer shrink-0 whitespace-nowrap pointer-events-auto ${
                                            layer.desc ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                        }`}
                                    >
                                        {layer.desc ? descLabel : ascLabel}
                                    </button>
                                )}
                            </div>
                        </Reorder.Item>
                    )
                })}
            </Reorder.Group>
        </div>
    ) : null

    return { button, panel }
}