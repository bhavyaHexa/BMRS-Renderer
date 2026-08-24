import { useState, useRef, useEffect, useCallback } from "react";
import { Leva } from "leva";
import { ViewerCanvas } from "./components/canvas/ViewerCanvas";
import type { ViewerCanvasRef } from "./components/canvas/ViewerCanvas";
import { ModelLoader } from "./components/model/ModelLoader";
import type { LoadedModelResult } from "./components/model/ModelLoader";
import { Header } from "./components/ui/Header";
import { DropZone } from "./components/ui/DropZone";
import { ModelInfoOverlay } from "./components/ui/ModelInfoOverlay";
import { Toolbar } from "./components/ui/Toolbar";
import { MaterialLevaControls } from "./components/ui/MaterialLevaControls";
import { CylinderSizeControls } from "./components/ui/CylinderSizeControls";
import type { CylinderParams } from "./components/ui/CylinderSizeControls";
import { TextureLoaderPanel } from "./components/ui/TextureLoaderPanel";

function App() {
  const [loadedModel, setLoadedModel] = useState<LoadedModelResult | null>(
    null,
  );
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string>(
    window.location.pathname,
  );
  const [showTexturePanel, setShowTexturePanel] = useState<boolean>(true);
  const [cylinderParams, setCylinderParams] = useState<CylinderParams>({
    radiusTop: 1,
    radiusBottom: 1,
    height: 3,
    radialSegments: 32,
  });

  const viewerCanvasRef = useRef<ViewerCanvasRef>(null);
  const modelLoaderRef = useRef<ModelLoader>(new ModelLoader());
  const dragCounterRef = useRef(0);

  // Generate Cylinder GLB on demand
  const loadCylinderModel = useCallback(
    async (params: CylinderParams = cylinderParams) => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const { modelResult } =
          await modelLoaderRef.current.generateCylinderGlb(
            params.radiusTop,
            params.radiusBottom,
            params.height,
            params.radialSegments,
          );
        setLoadedModel(modelResult);
      } catch (err: unknown) {
        console.error("Error generating cylinder GLB:", err);
        const message =
          err instanceof Error
            ? err.message
            : "Failed to generate cylinder GLB.";
        setErrorMsg(message);
      } finally {
        setIsLoading(false);
      }
    },
    [cylinderParams],
  );

  const handleCylinderParamsChange = (newParams: CylinderParams) => {
    setCylinderParams(newParams);
    if (currentPath === "/cylinder") {
      loadCylinderModel(newParams);
    }
  };

  // Route & URL change listeners
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (currentPath === "/cylinder") {
      loadCylinderModel(cylinderParams);
    }
  }, [currentPath, loadCylinderModel]);

  const handleNavigate = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
      setCurrentPath(path);
    }
    if (path === "/") {
      setLoadedModel(null);
      setErrorMsg(null);
    }
  };

  const handleDownloadGlb = () => {
    if (loadedModel?.glbBuffer) {
      modelLoaderRef.current.downloadGlbBuffer(
        loadedModel.glbBuffer,
        loadedModel.metadata.fileName || "cylinder.glb",
      );
    }
  };

  // Load File Handler
  const handleFile = async (file: File) => {
    if (
      !file.name.toLowerCase().endsWith(".glb") &&
      !file.name.toLowerCase().endsWith(".gltf")
    ) {
      setErrorMsg("Please select a valid .glb or .gltf 3D file.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const buffer = await file.arrayBuffer();
      const result = await modelLoaderRef.current.loadFromBuffer(
        buffer,
        file.name,
        file.size,
      );
      setLoadedModel(result);
    } catch (err: unknown) {
      console.error("Error loading GLB:", err);
      const message =
        err instanceof Error ? err.message : "Failed to parse GLB file.";
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  // File drop & selection handlers
  const handleFileDrop = (file: File) => {
    setIsDraggingOver(false);
    dragCounterRef.current = 0;
    handleFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  // Window-level Drag & Drop detection for seamless drag-over experience
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current++;
      if (
        e.dataTransfer &&
        e.dataTransfer.items &&
        e.dataTransfer.items.length > 0
      ) {
        setIsDraggingOver(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current--;
      if (dragCounterRef.current === 0) {
        setIsDraggingOver(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current = 0;
      setIsDraggingOver(false);
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        handleFile(file);
      }
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, []);

  const triggerOpenFileDialog = () => {
    const hiddenInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    if (hiddenInput) {
      hiddenInput.value = "";
      hiddenInput.click();
    }
  };

  return (
    <div className="relative w-screen h-screen bg-white text-slate-800 overflow-hidden font-sans">
      {/* Floating Leva GUI Panel Config */}
      <Leva
        titleBar={{ title: "⚙️ 3D Material Controls" }}
        theme={{
          colors: {
            accent1: "#8b5cf6",
          },
        }}
      />

      {/* Real-time Material Leva Control Integration */}
      <MaterialLevaControls
        onUpdateMaterial={(profile) =>
          viewerCanvasRef.current?.setModelColor(profile)
        }
        onToggleWireframe={() => viewerCanvasRef.current?.toggleWireframe()}
      />

      {/* Top Navigation Header */}
      <Header
        fileName={loadedModel?.metadata.fileName}
        currentRoute={currentPath}
        onNavigate={handleNavigate}
        onOpenFileClick={triggerOpenFileDialog}
        onDownloadGlb={
          loadedModel?.glbBuffer ? handleDownloadGlb : undefined
        }
        showTexturePanel={showTexturePanel}
        onToggleTexturePanel={() => setShowTexturePanel((prev) => !prev)}
      />

      {/* Floating PBR Texture Loader Panel */}
      {showTexturePanel && (
        <TextureLoaderPanel
          onSetTextureMap={async (type, file) => {
            await viewerCanvasRef.current?.setTextureMap(type, file);
          }}
          onSetTextureRepeat={(x, y) => {
            viewerCanvasRef.current?.setTextureRepeat(x, y);
          }}
          onClearAllTextures={() => {
            viewerCanvasRef.current?.clearAllTextures();
          }}
          onClose={() => setShowTexturePanel(false)}
        />
      )}

      {/* Floating Interactive Cylinder Size Controls on /cylinder Route */}
      {currentPath === "/cylinder" && (
        <CylinderSizeControls
          params={cylinderParams}
          onChange={handleCylinderParamsChange}
        />
      )}

      {/* Main 3D Three.js Viewport */}
      <ViewerCanvas ref={viewerCanvasRef} loadedModel={loadedModel} />

      {/* Drag & Drop Zone Overlay & File Inputs */}
      <DropZone
        isDraggingOver={isDraggingOver}
        hasModelLoaded={Boolean(loadedModel)}
        isLoading={isLoading}
        errorMsg={errorMsg}
        onFileDrop={handleFileDrop}
        onFileSelect={handleFileSelect}
      />

      {/* Model Metadata Overlay HUD */}
      {loadedModel && <ModelInfoOverlay metadata={loadedModel.metadata} />}

      {/* Bottom Control Toolbar */}
      {loadedModel && (
        <Toolbar
          key={loadedModel.metadata.fileName}
          onResetCamera={() => viewerCanvasRef.current?.resetCamera()}
          onToggleGrid={() => viewerCanvasRef.current?.toggleGrid()}
          onToggleWireframe={() => viewerCanvasRef.current?.toggleWireframe()}
          onOpenFileClick={triggerOpenFileDialog}
          onUpdateLighting={(key, env, exp) =>
            viewerCanvasRef.current?.updateLighting(key, env, exp)
          }
          onSetModelColor={(colorOrProfile) =>
            viewerCanvasRef.current?.setModelColor(colorOrProfile)
          }
        />
      )}
    </div>
  );
}

export default App;
