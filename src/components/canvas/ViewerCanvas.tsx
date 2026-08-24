import { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react'
import * as THREE from 'three'
import { ViewerCamera } from '../camera/ViewerCamera'
import { ViewerLights } from '../lights/ViewerLights'
import { ViewerModel } from '../model/ViewerModel'
import type { MaterialProfile } from '../model/ViewerMaterial'
import type { LoadedModelResult } from '../model/ModelLoader'
import { HotspotsOverlay } from '../ui/HotspotsOverlay'
import type { Hotspot } from '../ui/HotspotsOverlay'

export interface ViewerCanvasRef {
  resetCamera: () => void
  toggleGrid: () => boolean
  toggleWireframe: () => boolean
  updateLighting: (keyIntensity: number, envIntensity: number, exposure: number) => void
  setModelColor: (colorOrProfile: MaterialProfile | string | null) => void
  setTextureMap: (
    mapType: 'albedo' | 'normal' | 'roughness' | 'metalness' | 'ao',
    file: File | null
  ) => Promise<void>
  setTextureRepeat: (repeatX: number, repeatY: number) => void
  clearAllTextures: () => void
}

interface ViewerCanvasProps {
  loadedModel: LoadedModelResult | null
}

export const ViewerCanvas = forwardRef<ViewerCanvasRef, ViewerCanvasProps>(
  ({ loadedModel }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const viewerCameraRef = useRef<ViewerCamera | null>(null)
    const viewerLightsRef = useRef<ViewerLights | null>(null)
    const viewerModelRef = useRef<ViewerModel | null>(null)
    const sceneRef = useRef<THREE.Scene | null>(null)
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
    const gridRef = useRef<THREE.GridHelper | null>(null)
    const shadowPlaneRef = useRef<THREE.Mesh | null>(null)
    const [gridVisible, setGridVisible] = useState(true)

    const [hotspots, setHotspots] = useState<Hotspot[]>([])

    // Expose control methods via ref
    useImperativeHandle(ref, () => ({
      resetCamera: () => {
        if (viewerCameraRef.current) {
          viewerCameraRef.current.resetCamera()
        }
      },
      toggleGrid: () => {
        setGridVisible((prev) => {
          const next = !prev
          if (gridRef.current) gridRef.current.visible = next
          if (shadowPlaneRef.current) shadowPlaneRef.current.visible = next
          return next
        })
        return !gridVisible
      },
      toggleWireframe: () => {
        if (viewerModelRef.current) {
          return viewerModelRef.current.toggleWireframe()
        }
        return false
      },
      updateLighting: (keyIntensity: number, envIntensity: number, exposure: number) => {
        if (viewerLightsRef.current && sceneRef.current) {
          viewerLightsRef.current.setLightIntensity(keyIntensity)
          viewerLightsRef.current.setEnvironmentIntensity(sceneRef.current, envIntensity)
        }
        if (rendererRef.current) {
          rendererRef.current.toneMappingExposure = exposure
        }
      },
      setModelColor: (colorOrProfile: MaterialProfile | string | null) => {
        if (viewerModelRef.current) {
          viewerModelRef.current.setModelColor(colorOrProfile)
        }
      },
      setTextureMap: async (
        mapType: 'albedo' | 'normal' | 'roughness' | 'metalness' | 'ao',
        file: File | null
      ) => {
        if (viewerModelRef.current) {
          await viewerModelRef.current.setTextureMap(mapType, file)
        }
      },
      setTextureRepeat: (repeatX: number, repeatY: number) => {
        if (viewerModelRef.current) {
          viewerModelRef.current.setTextureRepeat(repeatX, repeatY)
        }
      },
      clearAllTextures: () => {
        if (viewerModelRef.current) {
          viewerModelRef.current.clearAllTextures()
        }
      },
    }))

    useEffect(() => {
      const container = containerRef.current
      if (!container) return

      const width = container.clientWidth || window.innerWidth
      const height = container.clientHeight || window.innerHeight

      // 1. Scene
      const scene = new THREE.Scene()
      scene.background = null // Transparent to show CAD engineering grid background
      sceneRef.current = scene

      // 2. WebGL Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(width, height)
      renderer.setClearColor(0x000000, 0)
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 0.9
      renderer.outputColorSpace = THREE.SRGBColorSpace
      rendererRef.current = renderer
      container.appendChild(renderer.domElement)

      // 3. Camera & Controls
      const viewerCamera = new ViewerCamera(container, width, height)
      viewerCameraRef.current = viewerCamera

      // 4. Lights & City Environment Mapping
      const viewerLights = new ViewerLights()
      viewerLightsRef.current = viewerLights
      scene.add(viewerLights.group)
      viewerLights.setupCityEnvironment(scene, renderer)

      // 5. Model Manager
      const viewerModel = new ViewerModel()
      viewerModelRef.current = viewerModel

      // 6. Grid Helper & Shadow Ground Plane (Clean light theme)
      const grid = new THREE.GridHelper(40, 40, 0x0284c7, 0xe2e8f0)
      grid.position.y = -0.001
      gridRef.current = grid
      scene.add(grid)

      const planeGeo = new THREE.PlaneGeometry(100, 100)
      const planeMat = new THREE.ShadowMaterial({ opacity: 0.15 })
      const shadowPlane = new THREE.Mesh(planeGeo, planeMat)
      shadowPlane.rotation.x = -Math.PI / 2
      shadowPlane.position.y = -0.01
      shadowPlane.receiveShadow = true
      shadowPlaneRef.current = shadowPlane
      scene.add(shadowPlane)

      // 7. Animation Frame Loop
      let animationFrameId: number
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate)
        viewerCamera.update()
        renderer.render(scene, viewerCamera.camera)

        // Animation loop
      }
      animate()

      // 8. Resize Observer
      const handleResize = () => {
        if (!container) return
        const w = container.clientWidth
        const h = container.clientHeight
        viewerCamera.updateAspect(w, h)
        renderer.setSize(w, h)
      }

      const resizeObserver = new ResizeObserver(handleResize)
      resizeObserver.observe(container)

      // Cleanup
      return () => {
        cancelAnimationFrame(animationFrameId)
        resizeObserver.disconnect()
        viewerCamera.dispose()
        viewerLights.dispose()
        viewerModel.disposeCurrentModel()
        renderer.dispose()
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement)
        }
      }
    }, [])

    const loadedModelRef = useRef(loadedModel)
    useEffect(() => {
      loadedModelRef.current = loadedModel
    }, [loadedModel])

    // Handle GLB model changes
    useEffect(() => {
      if (!sceneRef.current || !viewerModelRef.current || !viewerCameraRef.current || !viewerLightsRef.current) return

      if (loadedModel) {
        const scene = sceneRef.current
        const modelManager = viewerModelRef.current
        const cameraManager = viewerCameraRef.current
        const lightsManager = viewerLightsRef.current

        // Set model in manager
        modelManager.setModel(loadedModel.gltf.scene, loadedModel.boundingBox)
        
        if (modelManager.currentModel) {
          scene.add(modelManager.currentModel)

          // Adjust light shadow frustum & camera framing
          lightsManager.updateLightBoundsForModel(loadedModel.boundingBox)
          cameraManager.fitCameraToModel(modelManager.currentModel)
        }
      } else {
        setHotspots([])
      }
    }, [loadedModel])

    return (
      <div className="w-full h-full relative">
        <div
          ref={containerRef}
          className="w-full h-full cursor-grab active:cursor-grabbing outline-none"
        />
        {loadedModel && <HotspotsOverlay hotspots={hotspots} />}
      </div>
    )
  }
)

ViewerCanvas.displayName = 'ViewerCanvas'
