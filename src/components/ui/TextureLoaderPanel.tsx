import React, { useState, useRef } from 'react'

export type TextureMapType = 'albedo' | 'normal' | 'roughness' | 'metalness' | 'ao'

export interface TextureSlot {
  type: TextureMapType
  label: string
  subtitle: string
  color: string
  file: File | null
  previewUrl: string | null
}

interface TextureLoaderPanelProps {
  onSetTextureMap: (type: TextureMapType, file: File | null) => Promise<void>
  onSetTextureRepeat: (repeatX: number, repeatY: number) => void
  onClearAllTextures: () => void
  onClose?: () => void
}

const SLOT_CONFIGS: { type: TextureMapType; label: string; subtitle: string; color: string }[] = [
  {
    type: 'albedo',
    label: 'Albedo / Base Color',
    subtitle: 'Diffuse base color map (sRGB)',
    color: 'from-amber-500 to-orange-500',
  },
  {
    type: 'normal',
    label: 'Normal Map',
    subtitle: 'Surface bump & fine detail',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    type: 'roughness',
    label: 'Roughness Map',
    subtitle: 'Micro-surface glossiness',
    color: 'from-slate-600 to-slate-800',
  },
  {
    type: 'metalness',
    label: 'Metalness Map',
    subtitle: 'Metallic vs dielectric mask',
    color: 'from-cyan-500 to-teal-600',
  },
  {
    type: 'ao',
    label: 'Ambient Occlusion (AO)',
    subtitle: 'Crease shadow & contact shadows',
    color: 'from-purple-600 to-slate-900',
  },
]

export const TextureLoaderPanel: React.FC<TextureLoaderPanelProps> = ({
  onSetTextureMap,
  onSetTextureRepeat,
  onClearAllTextures,
  onClose,
}) => {
  const [slots, setSlots] = useState<Record<TextureMapType, { file: File | null; previewUrl: string | null }>>({
    albedo: { file: null, previewUrl: null },
    normal: { file: null, previewUrl: null },
    roughness: { file: null, previewUrl: null },
    metalness: { file: null, previewUrl: null },
    ao: { file: null, previewUrl: null },
  })

  const [repeatX, setRepeatX] = useState(1)
  const [repeatY, setRepeatY] = useState(1)
  const [lockRepeat, setLockRepeat] = useState(true)
  const [isGlobalDragging, setIsGlobalDragging] = useState(false)
  const [activeDragSlot, setActiveDragSlot] = useState<TextureMapType | null>(null)

  const fileInputRefs = useRef<Record<TextureMapType, HTMLInputElement | null>>({
    albedo: null,
    normal: null,
    roughness: null,
    metalness: null,
    ao: null,
  })

  const handleApplyFileToSlot = async (type: TextureMapType, file: File | null) => {
    // Revoke old object URL
    if (slots[type].previewUrl) {
      URL.revokeObjectURL(slots[type].previewUrl!)
    }

    const previewUrl = file ? URL.createObjectURL(file) : null
    setSlots((prev) => ({
      ...prev,
      [type]: { file, previewUrl },
    }))

    await onSetTextureMap(type, file)
  }

  const handleSlotFileSelect = (type: TextureMapType, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleApplyFileToSlot(type, e.target.files[0])
    }
  }

  // Auto detect multi-file drop
  const autoDetectAndAssignFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    for (const file of fileArray) {
      const name = file.name.toLowerCase()
      if (name.includes('albedo') || name.includes('color') || name.includes('diffuse') || name.includes('base')) {
        await handleApplyFileToSlot('albedo', file)
      } else if (name.includes('normal') || name.includes('nrm') || name.includes('nor')) {
        await handleApplyFileToSlot('normal', file)
      } else if (name.includes('roughness') || name.includes('rgh') || name.includes('rough')) {
        await handleApplyFileToSlot('roughness', file)
      } else if (name.includes('metalness') || name.includes('metallic') || name.includes('metal')) {
        await handleApplyFileToSlot('metalness', file)
      } else if (name.includes('ao') || name.includes('occlusion') || name.includes('ambient')) {
        await handleApplyFileToSlot('ao', file)
      }
    }
  }

  const handleRepeatChange = (x: number, y: number) => {
    const newX = Math.max(0.1, Math.min(20, Number(x.toFixed(1))))
    const newY = Math.max(0.1, Math.min(20, Number(y.toFixed(1))))
    setRepeatX(newX)
    setRepeatY(lockRepeat ? newX : newY)
    onSetTextureRepeat(newX, lockRepeat ? newX : newY)
  }

  const handleClearAll = () => {
    Object.keys(slots).forEach((key) => {
      const slotKey = key as TextureMapType
      if (slots[slotKey].previewUrl) {
        URL.revokeObjectURL(slots[slotKey].previewUrl!)
      }
    })

    setSlots({
      albedo: { file: null, previewUrl: null },
      normal: { file: null, previewUrl: null },
      roughness: { file: null, previewUrl: null },
      metalness: { file: null, previewUrl: null },
      ao: { file: null, previewUrl: null },
    })

    onClearAllTextures()
  }

  return (
    <div className="absolute top-20 left-6 z-30 w-96 max-w-[calc(100vw-3rem)] rounded-2xl bg-white/95 border border-slate-200 shadow-2xl backdrop-blur-md text-slate-800 text-xs overflow-hidden select-none animate-in fade-in slide-in-from-left-2">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-900 to-indigo-950 text-white font-bold">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-500 text-white flex items-center justify-center shadow-md">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wide">PBR Texture Drag & Drop</h2>
            <p className="text-[10px] text-slate-300 font-normal">Albedo, Normal, Roughness, Metalness & AO</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      {/* Content Container */}
      <div className="p-4 space-y-4 max-h-[calc(100vh-10rem)] overflow-y-auto">
        {/* Global Multi-Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setIsGlobalDragging(true)
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            setIsGlobalDragging(false)
          }}
          onDrop={(e) => {
            e.preventDefault()
            setIsGlobalDragging(false)
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              autoDetectAndAssignFiles(e.dataTransfer.files)
            }
          }}
          className={`p-3 rounded-xl border-2 border-dashed transition-all text-center cursor-pointer ${
            isGlobalDragging
              ? 'border-cyan-500 bg-cyan-50/80 scale-[1.01]'
              : 'border-slate-300 hover:border-cyan-400 bg-slate-50/80'
          }`}
        >
          <div className="flex items-center justify-center gap-2 text-cyan-700 font-semibold text-[11px]">
            <svg className="w-4 h-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>Drag & Drop Texture Maps Package Here</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Drop multiple map images at once (Auto-matches `albedo`, `normal`, `roughness`, `metalness`, `ao`)
          </p>
        </div>

        {/* 5 Texture Map Slots */}
        <div className="space-y-2.5">
          {SLOT_CONFIGS.map((slot) => {
            const currentSlot = slots[slot.type]
            const isDraggingThisSlot = activeDragSlot === slot.type

            return (
              <div
                key={slot.type}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setActiveDragSlot(slot.type)
                }}
                onDragLeave={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (activeDragSlot === slot.type) setActiveDragSlot(null)
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setActiveDragSlot(null)
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    handleApplyFileToSlot(slot.type, e.dataTransfer.files[0])
                  }
                }}
                onClick={() => fileInputRefs.current[slot.type]?.click()}
                className={`relative flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isDraggingThisSlot
                    ? 'border-cyan-500 ring-2 ring-cyan-300 bg-cyan-50/90'
                    : currentSlot.file
                    ? 'border-slate-300 bg-white shadow-xs'
                    : 'border-slate-200 hover:border-slate-400 bg-slate-50/60'
                }`}
              >
                {/* Hidden File Input */}
                <input
                  ref={(el) => {
                    fileInputRefs.current[slot.type] = el
                  }}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={(e) => handleSlotFileSelect(slot.type, e)}
                />

                {/* Left Info & Icon */}
                <div className="flex items-center gap-3 min-w-0">
                  {currentSlot.previewUrl ? (
                    <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-slate-300 bg-slate-100 flex-shrink-0 shadow-inner">
                      <img
                        src={currentSlot.previewUrl}
                        alt={slot.label}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className={`w-11 h-11 rounded-lg bg-gradient-to-br ${slot.color} text-white flex items-center justify-center flex-shrink-0 shadow-sm`}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-xs truncate">{slot.label}</h3>
                    <p className="text-[10px] text-slate-500 truncate">
                      {currentSlot.file ? currentSlot.file.name : slot.subtitle}
                    </p>
                  </div>
                </div>

                {/* Right Action */}
                <div className="flex items-center gap-2">
                  {currentSlot.file ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleApplyFileToSlot(slot.type, null)
                      }}
                      className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors cursor-pointer"
                      title="Clear Texture Map"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  ) : (
                    <span className="px-2 py-1 rounded-md bg-slate-200/80 text-slate-600 text-[10px] font-medium">
                      Drop / Click
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* UV Tiling / Repeat Controls */}
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Texture UV Tiling / Repeat
            </span>
            <button
              onClick={() => {
                setLockRepeat((prev) => !prev)
                if (!lockRepeat) handleRepeatChange(repeatX, repeatX)
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-medium border cursor-pointer ${
                lockRepeat
                  ? 'bg-indigo-100 border-indigo-300 text-indigo-800'
                  : 'bg-slate-200 border-slate-300 text-slate-600'
              }`}
            >
              {lockRepeat ? '🔒 Uniform' : '🔓 U/V Split'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <div className="flex justify-between text-[10px] text-slate-600 mb-1">
                <span>Repeat U (Horizontal):</span>
                <span className="font-mono font-bold text-slate-800">{repeatX.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="10.0"
                step="0.5"
                value={repeatX}
                onChange={(e) => handleRepeatChange(parseFloat(e.target.value), repeatY)}
                className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-slate-600 mb-1">
                <span>Repeat V (Vertical):</span>
                <span className="font-mono font-bold text-slate-800">{repeatY.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="10.0"
                step="0.5"
                value={repeatY}
                disabled={lockRepeat}
                onChange={(e) => handleRepeatChange(repeatX, parseFloat(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Clear All Textures */}
        <button
          onClick={handleClearAll}
          className="w-full py-2 rounded-xl bg-slate-100 hover:bg-red-50 hover:border-red-200 border border-slate-200 text-slate-700 hover:text-red-600 font-medium transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>Clear All PBR Textures</span>
        </button>
      </div>
    </div>
  )
}
