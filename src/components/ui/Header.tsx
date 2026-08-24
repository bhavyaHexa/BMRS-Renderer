import React from 'react'

interface HeaderProps {
  fileName?: string
  currentRoute: string
  onNavigate: (path: string) => void
  onOpenFileClick: () => void
  onDownloadGlb?: () => void
  showTexturePanel?: boolean
  onToggleTexturePanel?: () => void
}

export const Header: React.FC<HeaderProps> = ({
  fileName,
  currentRoute,
  onNavigate,
  onOpenFileClick,
  onDownloadGlb,
  showTexturePanel,
  onToggleTexturePanel,
}) => {
  const isCylinderRoute = currentRoute === '/cylinder'

  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex flex-wrap items-center justify-between px-6 py-3.5 bg-white/85 backdrop-blur-md border-b border-slate-200/80 text-slate-800 shadow-sm select-none gap-3">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
            />
          </svg>
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-wide text-slate-900 leading-tight">
            STEP / GLB 3D Viewer
          </h1>
          <p className="text-xs text-slate-500 font-medium">Modular Three.js Studio</p>
        </div>
      </div>

      {/* Navigation Routes */}
      <nav className="flex items-center p-1 bg-slate-100/90 border border-slate-200/80 rounded-xl">
        <button
          onClick={() => onNavigate('/')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            !isCylinderRoute
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Viewer</span>
        </button>

        <button
          onClick={() => onNavigate('/cylinder')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            isCylinderRoute
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-sm shadow-blue-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span>/cylinder (Cylinder GLB)</span>
        </button>
      </nav>

      {/* Action Controls */}
      <div className="flex items-center gap-2.5">
        {fileName ? (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="truncate max-w-[150px]">{fileName}</span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-500 font-medium shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Ready for drop</span>
          </div>
        )}

        {onToggleTexturePanel && (
          <button
            onClick={onToggleTexturePanel}
            title="Toggle PBR Texture Maps Drag & Drop Panel"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium text-xs transition-all cursor-pointer border ${
              showTexturePanel
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-md shadow-indigo-600/20'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>PBR Textures</span>
          </button>
        )}

        {onDownloadGlb && (
          <button
            onClick={onDownloadGlb}
            title="Download Cylinder GLB File"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-medium text-xs transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download GLB</span>
          </button>
        )}

        <button
          onClick={onOpenFileClick}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-medium text-xs transition-all shadow-md shadow-cyan-600/20 hover:shadow-cyan-500/30 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>Open File</span>
        </button>
      </div>
    </header>
  )
}

