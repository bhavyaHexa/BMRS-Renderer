import React, { useRef } from 'react'

interface DropZoneProps {
  isDraggingOver: boolean
  hasModelLoaded: boolean
  isLoading: boolean
  errorMsg: string | null
  onFileDrop: (file: File) => void
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const DropZone: React.FC<DropZoneProps> = ({
  isDraggingOver,
  hasModelLoaded,
  isLoading,
  errorMsg,
  onFileDrop,
  onFileSelect,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (file.name.endsWith('.glb') || file.name.endsWith('.gltf')) {
        onFileDrop(file)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
      fileInputRef.current.click()
    }
  }

  // Active Drag Hover Overlay
  if (isDraggingOver) {
    return (
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-cyan-950/70 backdrop-blur-md border-4 border-dashed border-cyan-400 p-8 transition-all animate-pulse"
      >
        <div className="w-24 h-24 rounded-full bg-cyan-500/20 flex items-center justify-center mb-6 border border-cyan-400/50 shadow-2xl shadow-cyan-500/30">
          <svg
            className="w-12 h-12 text-cyan-300 animate-bounce"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-wide mb-2">
          Drop your GLB / GLTF file here
        </h2>
        <p className="text-cyan-200 text-sm font-medium">
          Release to parse and render 3D model instantly
        </p>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm pointer-events-none">
        <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-900 font-medium text-lg tracking-wide">Loading 3D Model...</p>
        <p className="text-slate-500 text-xs mt-1">Parsing geometry, textures & scene graph</p>
      </div>
    )
  }

  // Initial Empty State (When no model is loaded yet)
  if (!hasModelLoaded) {
    return (
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 select-none bg-white/70 backdrop-blur-xs"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".glb,.gltf"
          className="hidden"
          onChange={onFileSelect}
        />

        <div className="max-w-md w-full p-8 rounded-2xl bg-white border border-slate-200 shadow-2xl backdrop-blur-xl text-center transition-all hover:border-slate-300">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-6 shadow-inner text-cyan-600">
            <svg
              className="w-10 h-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">No 3D Model Loaded</h2>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            Drag & drop a <code className="text-cyan-700 bg-slate-100 px-1.5 py-0.5 rounded text-xs font-semibold">.glb</code> or{' '}
            <code className="text-cyan-700 bg-slate-100 px-1.5 py-0.5 rounded text-xs font-semibold">.gltf</code> file anywhere on screen to inspect in 3D studio.
          </p>

          {errorMsg && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs text-left">
              <span className="font-semibold block mb-0.5">Error Loading File:</span>
              {errorMsg}
            </div>
          )}

          <button
            onClick={triggerFileInput}
            className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-[0.99] text-white font-semibold text-sm shadow-lg shadow-cyan-600/25 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            <span>Select GLB File</span>
          </button>
        </div>
      </div>
    )
  }

  // Hidden file input element maintained for toolbar/header clicks when model IS loaded
  return (
    <input
      ref={fileInputRef}
      type="file"
      accept=".glb,.gltf"
      className="hidden"
      onChange={onFileSelect}
    />
  )
}
