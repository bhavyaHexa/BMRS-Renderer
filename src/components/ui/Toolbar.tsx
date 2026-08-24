import React, { useState } from 'react'
import type { MaterialProfile } from '../model/ViewerMaterial'

interface ToolbarProps {
  onResetCamera: () => void
  onToggleGrid: () => void
  onToggleWireframe: () => void
  onOpenFileClick: () => void
  onUpdateLighting?: (keyIntensity: number, envIntensity: number, exposure: number) => void
  onSetModelColor?: (colorOrProfile: MaterialProfile | string | null) => void
}

interface PresetItem {
  id: string
  label: string
  bg: string
  profile: MaterialProfile
}

const PRESET_MATERIALS: PresetItem[] = [
  {
    id: 'brass-gold',
    label: 'Machined Brass / Gold',
    bg: 'bg-yellow-500',
    profile: {
      color: '#cca43b',
      metalness: 0.94,
      roughness: 0.28,
      clearcoat: 0.08,
      clearcoatRoughness: 0.2,
      reflectivity: 0.95,
    },
  },
  {
    id: 'industrial-steel',
    label: 'Industrial Steel',
    bg: 'bg-slate-400',
    profile: {
      color: '#cbd5e1',
      metalness: 0.90,
      roughness: 0.24,
      clearcoat: 0.1,
      reflectivity: 0.9,
    },
  },
  {
    id: 'mirror-chrome',
    label: 'Polished Chrome',
    bg: 'bg-slate-200 border border-slate-400',
    profile: {
      color: '#f8fafc',
      metalness: 0.98,
      roughness: 0.04,
      clearcoat: 0.5,
      reflectivity: 1.0,
    },
  },
  {
    id: 'matte-carbon',
    label: 'Matte Carbon',
    bg: 'bg-slate-800',
    profile: {
      color: '#1e293b',
      metalness: 0.08,
      roughness: 0.45,
      clearcoat: 0.15,
      reflectivity: 0.5,
    },
  },
  {
    id: 'safety-orange',
    label: 'Safety Orange',
    bg: 'bg-orange-500',
    profile: {
      color: '#f97316',
      metalness: 0.03,
      roughness: 0.15,
      clearcoat: 0.7,
      clearcoatRoughness: 0.05,
      reflectivity: 0.6,
    },
  },
  {
    id: 'precision-red',
    label: 'Precision Red',
    bg: 'bg-red-600',
    profile: {
      color: '#dc2626',
      metalness: 0.05,
      roughness: 0.12,
      clearcoat: 0.8,
      clearcoatRoughness: 0.05,
      reflectivity: 0.7,
    },
  },
  {
    id: 'cyber-cyan',
    label: 'Cyber Cyan',
    bg: 'bg-sky-500',
    profile: {
      color: '#0284c7',
      metalness: 0.75,
      roughness: 0.20,
      clearcoat: 0.3,
      reflectivity: 0.8,
    },
  },
  {
    id: 'emerald-anodized',
    label: 'Emerald Green',
    bg: 'bg-emerald-600',
    profile: {
      color: '#059669',
      metalness: 0.80,
      roughness: 0.22,
      clearcoat: 0.3,
      reflectivity: 0.8,
    },
  },
  {
    id: 'pure-white-gloss',
    label: 'White Gloss',
    bg: 'bg-white border border-slate-300',
    profile: {
      color: '#ffffff',
      metalness: 0.02,
      roughness: 0.08,
      clearcoat: 0.9,
      clearcoatRoughness: 0.02,
      reflectivity: 0.9,
    },
  },
]

export const Toolbar: React.FC<ToolbarProps> = ({
  onResetCamera,
  onToggleGrid,
  onToggleWireframe,
  onOpenFileClick,
  onUpdateLighting,
  onSetModelColor,
}) => {
  const [gridActive, setGridActive] = useState(true)
  const [wireframeActive, setWireframeActive] = useState(false)
  const [showLightingMenu, setShowLightingMenu] = useState(false)
  const [showColorMenu, setShowColorMenu] = useState(false)
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>('brass-gold')
  const [customHex, setCustomHex] = useState<string>('#d97706')

  // Lighting sliders state
  const [keyIntensity, setKeyIntensity] = useState(1.0)
  const [envIntensity, setEnvIntensity] = useState(0.8)
  const [exposure, setExposure] = useState(0.9)

  const handleGridClick = () => {
    setGridActive((prev) => !prev)
    onToggleGrid()
  }

  const handleWireframeClick = () => {
    setWireframeActive((prev) => !prev)
    onToggleWireframe()
  }

  const handleKeyChange = (val: number) => {
    setKeyIntensity(val)
    if (onUpdateLighting) onUpdateLighting(val, envIntensity, exposure)
  }

  const handleEnvChange = (val: number) => {
    setEnvIntensity(val)
    if (onUpdateLighting) onUpdateLighting(keyIntensity, val, exposure)
  }

  const handleExposureChange = (val: number) => {
    setExposure(val)
    if (onUpdateLighting) onUpdateLighting(keyIntensity, envIntensity, val)
  }

  const handlePresetSelect = (preset: PresetItem | null) => {
    if (!preset) {
      setSelectedPresetId(null)
      if (onSetModelColor) onSetModelColor(null)
    } else {
      setSelectedPresetId(preset.id)
      setCustomHex(preset.profile.color)
      if (onSetModelColor) onSetModelColor(preset.profile)
    }
  }

  const handleCustomColorChange = (hex: string) => {
    setCustomHex(hex)
    setSelectedPresetId('custom')
    if (onSetModelColor) onSetModelColor(hex)
  }

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 select-none">
      {/* Lighting Control Popover Card */}
      {showLightingMenu && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-72 p-4 rounded-2xl bg-white/95 border border-slate-200 shadow-2xl backdrop-blur-md text-slate-800 text-xs mb-2 z-30 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-100 pb-2 mb-3">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Lighting & Environment Control
            </span>
            <button
              onClick={() => setShowLightingMenu(false)}
              className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            {/* Key Light Intensity */}
            <div>
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Direct Light Brightness</span>
                <span className="font-mono text-cyan-700 font-semibold">{keyIntensity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="4.0"
                step="0.1"
                value={keyIntensity}
                onChange={(e) => handleKeyChange(parseFloat(e.target.value))}
                className="w-full accent-cyan-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />
            </div>

            {/* Environment Reflection Intensity */}
            <div>
              <div className="flex justify-between text-slate-600 mb-1">
                <span>City Reflection Intensity</span>
                <span className="font-mono text-cyan-700 font-semibold">{envIntensity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="4.0"
                step="0.1"
                value={envIntensity}
                onChange={(e) => handleEnvChange(parseFloat(e.target.value))}
                className="w-full accent-cyan-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />
            </div>

            {/* Exposure */}
            <div>
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Tone Exposure</span>
                <span className="font-mono text-cyan-700 font-semibold">{exposure.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={exposure}
                onChange={(e) => handleExposureChange(parseFloat(e.target.value))}
                className="w-full accent-cyan-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Color Palette Popover Card */}
      {showColorMenu && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-84 p-4 rounded-2xl bg-white/95 border border-slate-200 shadow-2xl backdrop-blur-md text-slate-800 text-xs mb-2 z-30 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-100 pb-2 mb-3">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              PBR Material Presets
            </span>
            <button
              onClick={() => setShowColorMenu(false)}
              className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            {/* Presets Grid */}
            <div>
              <div className="text-slate-500 font-medium mb-2 flex justify-between items-center">
                <span>Select Material Finish:</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_MATERIALS.map((preset) => {
                  const isSelected = selectedPresetId === preset.id
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handlePresetSelect(preset)}
                      title={preset.label}
                      className={`group relative flex flex-col items-center gap-1 p-2 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-purple-600 ring-2 ring-purple-400/30 bg-purple-50/60 font-bold'
                          : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full ${preset.bg} shadow-inner flex items-center justify-center`}>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />}
                      </span>
                      <span className="text-[10px] font-medium text-slate-700 truncate w-full text-center">
                        {preset.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Quick Color Palette Swatches */}
            <div className="pt-2.5 border-t border-slate-100">
              <div className="text-slate-500 font-medium mb-2 flex justify-between items-center">
                <span>Quick Color Palette Swatches:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { name: 'Brass Gold', hex: '#cca43b' },
                  { name: 'Amber Gold', hex: '#de992a' },
                  { name: 'Rose Gold', hex: '#b76e79' },
                  { name: 'Chrome', hex: '#f8fafc' },
                  { name: 'Steel', hex: '#cbd5e1' },
                  { name: 'Carbon Black', hex: '#1e293b' },
                  { name: 'Precision Red', hex: '#dc2626' },
                  { name: 'Safety Orange', hex: '#f97316' },
                  { name: 'Cyber Cyan', hex: '#0284c7' },
                  { name: 'Emerald', hex: '#059669' },
                  { name: 'Royal Purple', hex: '#8b5cf6' },
                ].map((swatch) => (
                  <button
                    key={swatch.hex}
                    onClick={() => handleCustomColorChange(swatch.hex)}
                    title={`${swatch.name} (${swatch.hex})`}
                    className={`w-6 h-6 rounded-full border shadow-sm transition-transform hover:scale-110 cursor-pointer ${
                      customHex.toLowerCase() === swatch.hex.toLowerCase()
                        ? 'ring-2 ring-purple-600 scale-110 border-white'
                        : 'border-slate-300 hover:border-purple-400'
                    }`}
                    style={{ backgroundColor: swatch.hex }}
                  />
                ))}
              </div>
            </div>

            {/* Custom Color Picker Input */}
            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-slate-600 font-medium">Custom Color Picker:</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customHex}
                  onChange={(e) => handleCustomColorChange(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5 bg-white"
                />
                <span className="font-mono text-xs text-slate-700 font-semibold uppercase">
                  {customHex}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Toolbar Controls */}
      <div className="flex items-center gap-1.5 p-2 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-xl text-slate-700">
        {/* Reset Camera */}
        <button
          onClick={onResetCamera}
          title="Reset Camera View"
          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 active:bg-slate-200 text-slate-700 hover:text-slate-900 transition-all cursor-pointer text-xs font-medium"
        >
          <svg className="w-4 h-4 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <span className="hidden sm:inline">Reset View</span>
        </button>

        <div className="w-[1px] h-6 bg-slate-200 my-auto" />

        {/* Color Palette Menu */}
        <button
          onClick={() => {
            setShowColorMenu((prev) => !prev)
            setShowLightingMenu(false)
          }}
          title="Change Model Color Palette"
          className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all cursor-pointer text-xs font-medium ${
            showColorMenu
              ? 'bg-purple-50 border border-purple-300 text-purple-700'
              : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
          }`}
        >
          <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          <span className="hidden sm:inline">Material Presets</span>
        </button>

        {/* Lighting Adjust Menu */}
        <button
          onClick={() => {
            setShowLightingMenu((prev) => !prev)
            setShowColorMenu(false)
          }}
          title="Adjust Lighting Intensity"
          className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all cursor-pointer text-xs font-medium ${
            showLightingMenu
              ? 'bg-amber-50 border border-amber-300 text-amber-700'
              : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
          }`}
        >
          <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span className="hidden sm:inline">Lighting</span>
        </button>

        {/* Toggle Grid */}
        <button
          onClick={handleGridClick}
          title="Toggle Grid Ground"
          className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all cursor-pointer text-xs font-medium ${
            gridActive
              ? 'bg-cyan-50 border border-cyan-200 text-cyan-700'
              : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 10h16M4 14h16M4 18h16M6 4v16M10 4v16M14 4v16M18 4v16"
            />
          </svg>
          <span className="hidden sm:inline">Grid</span>
        </button>

        {/* Toggle Wireframe */}
        <button
          onClick={handleWireframeClick}
          title="Toggle Wireframe Mode"
          className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all cursor-pointer text-xs font-medium ${
            wireframeActive
              ? 'bg-cyan-50 border border-cyan-200 text-cyan-700'
              : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <span className="hidden sm:inline">Wireframe</span>
        </button>

        <div className="w-[1px] h-6 bg-slate-200 my-auto" />

        {/* Open New File */}
        <button
          onClick={onOpenFileClick}
          title="Load New GLB File"
          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-all cursor-pointer text-xs font-medium"
        >
          <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          <span className="hidden sm:inline">Change Model</span>
        </button>
      </div>
    </div>
  )
}
