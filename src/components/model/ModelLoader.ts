import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

export interface ModelMetadata {
  fileName: string;
  fileSizeFormatted: string;
  vertexCount: number;
  triangleCount: number;
  meshCount: number;
  materialCount: number;
  dimensions: {
    x: number;
    y: number;
    z: number;
  };
}

export interface LoadedModelResult {
  gltf: GLTF;
  metadata: ModelMetadata;
  boundingBox: THREE.Box3;
  glbBuffer?: ArrayBuffer;
}

export class ModelLoader {
  private loader: GLTFLoader;

  constructor() {
    this.loader = new GLTFLoader();
  }

  public async generateCylinderGlb(
    radiusTop: number = 1,
    radiusBottom: number = 1,
    height: number = 3,
    radialSegments: number = 32,
  ): Promise<{
    modelResult: LoadedModelResult;
    glbBuffer: ArrayBuffer;
  }> {
    // 1. Define geometry: (radiusTop, radiusBottom, height, radialSegments)
    const geometry = new THREE.CylinderGeometry(
      radiusTop,
      radiusBottom,
      height,
      radialSegments,
    );
    // Orient cylinder horizontally (lying flat along X-axis)
    geometry.rotateZ(Math.PI / 2);

    // 2. Define material
    const material = new THREE.MeshStandardMaterial({ color: 0x0077ff });

    // 3. Create mesh and add to scene
    const cylinder = new THREE.Mesh(geometry, material);
    cylinder.name = "CylinderMesh";

    const scene = new THREE.Scene();
    scene.add(cylinder);

    const exporter = new GLTFExporter();
    return new Promise((resolve, reject) => {
      exporter.parse(
        scene,
        async (gltf) => {
          try {
            let buffer: ArrayBuffer;
            if (gltf instanceof ArrayBuffer) {
              buffer = gltf;
            } else {
              const jsonString = JSON.stringify(gltf);
              const encoder = new TextEncoder();
              buffer = encoder.encode(jsonString).buffer;
            }
            const modelResult = await this.loadFromBuffer(
              buffer,
              "cylinder.glb",
              buffer.byteLength,
            );
            modelResult.glbBuffer = buffer;
            resolve({ modelResult, glbBuffer: buffer });
          } catch (err) {
            reject(err);
          }
        },
        (error) => {
          reject(error);
        },
        { binary: true },
      );
    });
  }

  public downloadGlbBuffer(
    buffer: ArrayBuffer,
    fileName: string = "cylinder.glb",
  ) {
    const blob = new Blob([buffer], { type: "model/gltf-binary" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  public async loadFromBuffer(
    buffer: ArrayBuffer,
    fileName: string,
    fileSizeBytes: number,
  ): Promise<LoadedModelResult> {
    return new Promise((resolve, reject) => {
      this.loader.parse(
        buffer,
        "",
        (gltf: GLTF) => {
          const result = this.processLoadedGltf(gltf, fileName, fileSizeBytes);
          resolve(result);
        },
        (error) => {
          reject(error);
        },
      );
    });
  }

  public async loadFromUrl(
    url: string,
    fileName: string,
  ): Promise<LoadedModelResult> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (gltf: GLTF) => {
          const result = this.processLoadedGltf(gltf, fileName, 0);
          resolve(result);
        },
        undefined,
        (error) => {
          reject(error);
        },
      );
    });
  }

  private processLoadedGltf(
    gltf: GLTF,
    fileName: string,
    fileSizeBytes: number,
  ): LoadedModelResult {
    let vertexCount = 0;
    let triangleCount = 0;
    let meshCount = 0;
    const materialsSet = new Set<THREE.Material>();

    // Configure shadows and extract stats
    gltf.scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        meshCount++;

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const geometry = mesh.geometry;
        if (geometry) {
          // Recompute vertex normals for accurate CAD surface normals right after geometry loading
          geometry.computeVertexNormals();
          console.log(
            `[ModelLoader] Computed vertex normals for mesh: "${mesh.name || "Mesh"}"`,
            {
              vertexCount: geometry.attributes.position?.count,
              hasNormals: Boolean(geometry.attributes.normal),
            },
          );

          const posAttr = geometry.attributes.position;
          if (posAttr) {
            vertexCount += posAttr.count;
          }
          if (geometry.index) {
            triangleCount += geometry.index.count / 3;
          } else if (posAttr) {
            triangleCount += posAttr.count / 3;
          }
        }

        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((mat) => materialsSet.add(mat));
        } else if (mesh.material) {
          materialsSet.add(mesh.material);
        }
      }
    });

    // Compute bounding box
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const size = new THREE.Vector3();
    if (!box.isEmpty()) {
      box.getSize(size);
    }

    const metadata: ModelMetadata = {
      fileName,
      fileSizeFormatted: this.formatBytes(fileSizeBytes),
      vertexCount,
      triangleCount: Math.floor(triangleCount),
      meshCount,
      materialCount: materialsSet.size,
      dimensions: {
        x: Number(size.x.toFixed(2)),
        y: Number(size.y.toFixed(2)),
        z: Number(size.z.toFixed(2)),
      },
    };

    return {
      gltf,
      metadata,
      boundingBox: box,
    };
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return "Unknown";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}
