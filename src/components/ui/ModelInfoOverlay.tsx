import React, { useState } from 'react'
import type { ModelMetadata } from '../model/ModelLoader'

interface ModelInfoOverlayProps {
  metadata: ModelMetadata | null
}

export const ModelInfoOverlay: React.FC<ModelInfoOverlayProps> = ({ metadata }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  if (!metadata) return null

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  return (
    <div className="absolute top-20 left-6 z-20 select-none transition-all">
      <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl overflow-hidden w-72 text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-semibold text-xs text-slate-900 uppercase tracking-wider">Model Stats</span>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <svg
              className={`w-4 h-4 transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Content */}
        {!isCollapsed && (
          <div className="p-4 space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Filename</span>
              <span className="font-medium text-slate-900 break-all">{metadata.fileName}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">File Size</span>
                <span className="font-mono text-cyan-700 font-semibold">{metadata.fileSizeFormatted}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Meshes</span>
                <span className="font-mono text-slate-700">{formatNumber(metadata.meshCount)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Vertices</span>
                <span className="font-mono text-slate-700">{formatNumber(metadata.vertexCount)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Triangles</span>
                <span className="font-mono text-slate-700">{formatNumber(metadata.triangleCount)}</span>
              </div>
            </div>

            <div className="pt-1 border-t border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Dimensions (X × Y × Z)</span>
              <span className="font-mono text-emerald-600 font-medium">
                {metadata.dimensions.x} × {metadata.dimensions.y} × {metadata.dimensions.z} units
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
