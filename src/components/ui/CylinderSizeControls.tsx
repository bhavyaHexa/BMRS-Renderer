import React, { useState } from 'react'

export interface CylinderParams {
  radiusTop: number
  radiusBottom: number
  height: number
  radialSegments: number
}

interface CylinderSizeControlsProps {
  params: CylinderParams
  onChange: (params: CylinderParams) => void
}

export const CylinderSizeControls: React.FC<CylinderSizeControlsProps> = ({
  params,
  onChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [lockRadius, setLockRadius] = useState(true)

  // Update uniform radius
  const handleUniformRadiusChange = (newRadius: number) => {
    const r = Math.max(0.05, Math.min(20, Number(newRadius.toFixed(2))))
    onChange({
      ...params,
      radiusTop: r,
      radiusBottom: r,
    })
  }

  const handleTopRadiusChange = (rTop: number) => {
    const topVal = Math.max(0.05, Math.min(20, Number(rTop.toFixed(2))))
    onChange({
      ...params,
      radiusTop: topVal,
      radiusBottom: lockRadius ? topVal : params.radiusBottom,
    })
  }

  const handleBottomRadiusChange = (rBot: number) => {
    const botVal = Math.max(0.05, Math.min(20, Number(rBot.toFixed(2))))
    onChange({
      ...params,
      radiusBottom: botVal,
      radiusTop: lockRadius ? botVal : params.radiusTop,
    })
  }

  const handleHeightChange = (h: number) => {
    const heightVal = Math.max(0.1, Math.min(50, Number(h.toFixed(2))))
    onChange({
      ...params,
      height: heightVal,
    })
  }

  const handleSegmentsChange = (seg: number) => {
    const segVal = Math.max(6, Math.min(128, Math.round(seg)))
    onChange({
      ...params,
      radialSegments: segVal,
    })
  }

  const applyPreset = (rTop: number, rBot: number, h: number, seg: number = 32) => {
    onChange({
      radiusTop: rTop,
      radiusBottom: rBot,
      height: h,
      radialSegments: seg,
    })
  }

  // Calculate volume: V = (1/3) * PI * h * (r1^2 + r1*r2 + r2^2)
  const volume = (
    (1 / 3) *
    Math.PI *
    params.height *
    (params.radiusTop ** 2 + params.radiusTop * params.radiusBottom + params.radiusBottom ** 2)
  ).toFixed(2)

  return (
    <div className="absolute top-20 right-6 z-30 w-80 max-w-[calc(100vw-3rem)] rounded-2xl bg-white/95 border border-slate-200/90 shadow-2xl backdrop-blur-md text-slate-800 text-xs overflow-hidden select-none transition-all">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-slate-200/80 font-bold text-slate-900">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-mono text-[10px]">
            3D
          </div>
          <span>Cylinder Size Controls</span>
        </div>
        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          className="p-1 rounded-lg hover:bg-slate-200/60 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          title={isExpanded ? 'Minimize Panel' : 'Expand Panel'}
        >
          <svg
            className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
          {/* Main Radius Control */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6" />
                </svg>
                Radius (Increase / Decrease)
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setLockRadius((prev) => !prev)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium border cursor-pointer transition-colors ${
                    lockRadius
                      ? 'bg-blue-100 border-blue-300 text-blue-800'
                      : 'bg-slate-200 border-slate-300 text-slate-600'
                  }`}
                  title={lockRadius ? 'Top & Bottom Radius Locked' : 'Independent Top/Bottom Radius'}
                >
                  {lockRadius ? '🔒 Uniform' : '🔓 Tapered'}
                </button>
                <span className="font-mono font-bold text-blue-700 text-sm ml-1">
                  {params.radiusTop === params.radiusBottom
                    ? `${params.radiusTop.toFixed(2)}`
                    : `${params.radiusTop.toFixed(2)} / ${params.radiusBottom.toFixed(2)}`}
                </span>
              </div>
            </div>

            {lockRadius ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUniformRadiusChange(params.radiusTop - 0.25)}
                  className="w-7 h-7 rounded-lg bg-slate-200 hover:bg-slate-300 active:bg-slate-400 font-bold text-slate-700 text-sm flex items-center justify-center cursor-pointer shadow-xs"
                  title="Decrease Radius (-0.25)"
                >
                  -
                </button>
                <input
                  type="range"
                  min="0.1"
                  max="10.0"
                  step="0.1"
                  value={params.radiusTop}
                  onChange={(e) => handleUniformRadiusChange(parseFloat(e.target.value))}
                  className="flex-1 accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <button
                  onClick={() => handleUniformRadiusChange(params.radiusTop + 0.25)}
                  className="w-7 h-7 rounded-lg bg-slate-200 hover:bg-slate-300 active:bg-slate-400 font-bold text-slate-700 text-sm flex items-center justify-center cursor-pointer shadow-xs"
                  title="Increase Radius (+0.25)"
                >
                  +
                </button>
              </div>
            ) : (
              <div className="space-y-2 pt-1 border-t border-slate-200/60">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                    <span>Top Radius:</span>
                    <span className="font-mono font-semibold text-slate-800">{params.radiusTop.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="10.0"
                    step="0.1"
                    value={params.radiusTop}
                    onChange={(e) => handleTopRadiusChange(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                    <span>Bottom Radius:</span>
                    <span className="font-mono font-semibold text-slate-800">{params.radiusBottom.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="10.0"
                    step="0.1"
                    value={params.radiusBottom}
                    onChange={(e) => handleBottomRadiusChange(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Height / Length Control */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Length / Height
              </span>
              <span className="font-mono font-bold text-cyan-700 text-sm">
                {params.height.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleHeightChange(params.height - 0.5)}
                className="w-7 h-7 rounded-lg bg-slate-200 hover:bg-slate-300 active:bg-slate-400 font-bold text-slate-700 text-sm flex items-center justify-center cursor-pointer shadow-xs"
                title="Decrease Height (-0.5)"
              >
                -
              </button>
              <input
                type="range"
                min="0.5"
                max="20.0"
                step="0.5"
                value={params.height}
                onChange={(e) => handleHeightChange(parseFloat(e.target.value))}
                className="flex-1 accent-cyan-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <button
                onClick={() => handleHeightChange(params.height + 0.5)}
                className="w-7 h-7 rounded-lg bg-slate-200 hover:bg-slate-300 active:bg-slate-400 font-bold text-slate-700 text-sm flex items-center justify-center cursor-pointer shadow-xs"
                title="Increase Height (+0.5)"
              >
                +
              </button>
            </div>
          </div>

          {/* Radial Segments Smoothness */}
          <div>
            <div className="flex justify-between text-slate-600 mb-1">
              <span className="font-medium text-slate-700">Surface Smoothness (Segments)</span>
              <span className="font-mono font-semibold text-slate-900">{params.radialSegments} seg</span>
            </div>
            <input
              type="range"
              min="8"
              max="64"
              step="4"
              value={params.radialSegments}
              onChange={(e) => handleSegmentsChange(parseInt(e.target.value, 10))}
              className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
          </div>

          {/* Quick Presets */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-slate-500 font-medium mb-1.5 text-[11px]">Quick Size Presets:</div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => applyPreset(1, 1, 3)}
                className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-[11px] font-medium cursor-pointer transition-colors"
              >
                Default (1x3)
              </button>
              <button
                onClick={() => applyPreset(0.5, 0.5, 2)}
                className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-[11px] font-medium cursor-pointer transition-colors"
              >
                Small (0.5x2)
              </button>
              <button
                onClick={() => applyPreset(2, 2, 5)}
                className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-[11px] font-medium cursor-pointer transition-colors"
              >
                Large (2x5)
              </button>
              <button
                onClick={() => applyPreset(0.25, 0.25, 6)}
                className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-[11px] font-medium cursor-pointer transition-colors"
              >
                Thin Rod
              </button>
              <button
                onClick={() => applyPreset(2.5, 2.5, 0.6)}
                className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-[11px] font-medium cursor-pointer transition-colors"
              >
                Disk / Wheel
              </button>
              <button
                onClick={() => applyPreset(0.2, 1.8, 4)}
                className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-[11px] font-medium cursor-pointer transition-colors"
              >
                Cone / Taper
              </button>
            </div>
          </div>

          {/* Geometry Statistics Summary */}
          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Volume: <strong className="text-slate-800">{volume} u³</strong></span>
            <span>Radial: <strong className="text-slate-800">{params.radialSegments} pts</strong></span>
          </div>
        </div>
      )}
    </div>
  )
}
