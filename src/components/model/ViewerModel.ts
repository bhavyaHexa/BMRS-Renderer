import * as THREE from 'three'
import { ViewerMaterial, DEFAULT_MATERIAL_PROFILE } from './ViewerMaterial'
import type { MaterialProfile } from './ViewerMaterial'

export type { MaterialProfile }
export { DEFAULT_MATERIAL_PROFILE }

export class ViewerModel {
  public currentModel: THREE.Object3D | null = null
  public viewerMaterial: ViewerMaterial

  constructor() {
    this.viewerMaterial = new ViewerMaterial()
  }

  public createCustomStudioMaterial(profile?: MaterialProfile): THREE.MeshPhysicalMaterial {
    return this.viewerMaterial.createCustomStudioMaterial(profile)
  }

  public setModel(modelGroup: THREE.Object3D, box: THREE.Box3): void {
    this.disposeCurrentModel()

    this.currentModel = modelGroup

    // Center model bounding box dead-center at origin (0, 0, 0)
    if (!box.isEmpty()) {
      const center = new THREE.Vector3()
      box.getCenter(center)

      this.currentModel.position.x = -center.x
      this.currentModel.position.y = -center.y
      this.currentModel.position.z = -center.z
    }

    const material = this.viewerMaterial.getMaterial()

    // Traverse model: Discard embedded GLB materials & assign custom Three.js Physical material
    this.currentModel.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        mesh.castShadow = true
        mesh.receiveShadow = true

        // Recompute vertex normals for smooth CAD surface shading & specular reflections
        if (mesh.geometry) {
          mesh.geometry.computeVertexNormals()
          // Ensure uv2 exists for Ambient Occlusion map if standard uv exists
          if (mesh.geometry.attributes.uv && !mesh.geometry.attributes.uv2) {
            mesh.geometry.setAttribute('uv2', mesh.geometry.attributes.uv)
          }
        }

        // Dispose & discard embedded GLB materials
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => this.viewerMaterial.disposeMaterial(mat))
          } else {
            this.viewerMaterial.disposeMaterial(mesh.material)
          }
        }

        // Apply custom Three.js Physical material
        mesh.material = material
      }
    })
  }

  public setModelColor(colorOrProfile: string | MaterialProfile | null): void {
    this.viewerMaterial.updateProfile(colorOrProfile)
  }

  public async setTextureMap(
    mapType: 'albedo' | 'normal' | 'roughness' | 'metalness' | 'ao',
    file: File | null
  ): Promise<void> {
    await this.viewerMaterial.setTextureMap(mapType, file)
    if (this.currentModel) {
      this.currentModel.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh
          if (mesh.geometry && mesh.geometry.attributes.uv && !mesh.geometry.attributes.uv2) {
            mesh.geometry.setAttribute('uv2', mesh.geometry.attributes.uv)
          }
        }
      })
    }
  }

  public setTextureRepeat(repeatX: number, repeatY: number): void {
    this.viewerMaterial.setTextureRepeat(repeatX, repeatY)
  }

  public clearAllTextures(): void {
    this.viewerMaterial.clearAllTextures()
  }

  public toggleWireframe(): boolean {
    return this.viewerMaterial.toggleWireframe()
  }

  public isWireframe(): boolean {
    return this.viewerMaterial.isWireframe()
  }

  public disposeCurrentModel(): void {
    if (!this.currentModel) return

    this.currentModel.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        if (mesh.geometry) {
          mesh.geometry.dispose()
        }
      }
    })

    this.viewerMaterial.disposeMaterial()

    if (this.currentModel.parent) {
      this.currentModel.parent.remove(this.currentModel)
    }
    this.currentModel = null
  }
}

