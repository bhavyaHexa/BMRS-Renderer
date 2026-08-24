import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export class ViewerCamera {
  public camera: THREE.PerspectiveCamera
  public controls: OrbitControls
  private defaultPosition = new THREE.Vector3(3, 2, 4)
  private defaultTarget = new THREE.Vector3(0, 0, 0)

  constructor(domElement: HTMLElement, width: number, height: number) {
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000)
    this.camera.position.copy(this.defaultPosition)

    this.controls = new OrbitControls(this.camera, domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.screenSpacePanning = true
    this.controls.minDistance = 0.1
    this.controls.maxDistance = 500
    this.controls.target.copy(this.defaultTarget)
    this.controls.update()
  }

  public updateAspect(width: number, height: number): void {
    if (height === 0) return
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }

  public update(): void {
    this.controls.update()
  }

  public fitCameraToModel(object: THREE.Object3D): void {
    const box = new THREE.Box3().setFromObject(object)
    if (box.isEmpty()) return

    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)

    const maxDim = Math.max(size.x, size.y, size.z)
    const fov = this.camera.fov * (Math.PI / 180)
    let cameraDistance = (maxDim / 2) / Math.tan(fov / 2)

    // Add extra padding factor
    cameraDistance *= 1.8

    // Update clipping planes relative to model size
    this.camera.near = Math.max(0.01, cameraDistance / 100)
    this.camera.far = Math.max(1000, cameraDistance * 100)
    this.camera.updateProjectionMatrix()

    // Store defaults for reset button (Target is dead center (0,0,0))
    this.defaultTarget.set(0, 0, 0)
    this.defaultPosition.set(
      0,
      cameraDistance * 0.3,
      cameraDistance * 1.5
    )

    this.camera.position.copy(this.defaultPosition)
    this.controls.target.copy(this.defaultTarget)
    this.controls.update()
  }

  public resetCamera(): void {
    this.camera.position.copy(this.defaultPosition)
    this.controls.target.copy(this.defaultTarget)
    this.controls.update()
  }

  public dispose(): void {
    this.controls.dispose()
  }
}
