import * as THREE from 'three'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

export class ViewerLights {
  public group: THREE.Group
  public fillLight: THREE.DirectionalLight
  public rimLight: THREE.DirectionalLight
  public ambientLight: THREE.AmbientLight
  public hemiLight: THREE.HemisphereLight
  private pmremGenerator: THREE.PMREMGenerator | null = null

  constructor() {
    this.group = new THREE.Group()
    this.group.name = 'ViewerLightsGroup'

    // Ambient light - soft balanced baseline
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    this.group.add(this.ambientLight)

    // Hemisphere light for subtle sky/ground fill
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0xcbd5e1, 0.5)
    this.hemiLight.position.set(0, 50, 0)
    this.group.add(this.hemiLight)

    // Secondary Fill Light - soft directional light with shadow support
    this.fillLight = new THREE.DirectionalLight(0xe0f2fe, 0.6)
    this.fillLight.position.set(-20, 20, 20)
    this.fillLight.castShadow = true
    this.fillLight.shadow.mapSize.width = 2048
    this.fillLight.shadow.mapSize.height = 2048
    this.fillLight.shadow.camera.near = 0.5
    this.fillLight.shadow.camera.far = 100
    this.fillLight.shadow.bias = -0.0001

    const d = 20
    this.fillLight.shadow.camera.left = -d
    this.fillLight.shadow.camera.right = d
    this.fillLight.shadow.camera.top = d
    this.fillLight.shadow.camera.bottom = -d

    this.group.add(this.fillLight)

    // Rim Light
    this.rimLight = new THREE.DirectionalLight(0xffffff, 0.4)
    this.rimLight.position.set(0, 30, -30)
    this.group.add(this.rimLight)
  }

  public setupCityEnvironment(scene: THREE.Scene, renderer: THREE.WebGLRenderer): void {
    this.pmremGenerator = new THREE.PMREMGenerator(renderer)
    this.pmremGenerator.compileEquirectangularShader()

    // 1. RoomEnvironment with balanced reflection intensity
    const roomEnv = new RoomEnvironment()
    const defaultEnvMap = this.pmremGenerator.fromScene(roomEnv).texture
    scene.environment = defaultEnvMap
    if ('environmentIntensity' in scene) {
      scene.environmentIntensity = 0.8
    }

    // 2. Load City HDR map for realistic specular metallic sheen
    const rgbeLoader = new RGBELoader()
    const cityHdrUrl = 'https://raw.githubusercontent.com/pmndrs/drei-assets/456060a26bbeb8fdf79326f224b6d0822ee06e9f/hdri/city.hdr'

    rgbeLoader.load(
      cityHdrUrl,
      (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping
        if (this.pmremGenerator) {
          const envMap = this.pmremGenerator.fromEquirectangular(texture).texture
          scene.environment = envMap
          if ('environmentIntensity' in scene) {
            scene.environmentIntensity = 0.8
          }
          texture.dispose()
        }
      },
      undefined,
      (err) => {
        console.warn('Using RoomEnvironment fallback', err)
      }
    )
  }

  public setLightIntensity(keyIntensity: number): void {
    this.fillLight.intensity = keyIntensity * 0.6
    this.rimLight.intensity = keyIntensity * 0.4
    this.ambientLight.intensity = keyIntensity * 0.6
  }

  public setEnvironmentIntensity(scene: THREE.Scene, envIntensity: number): void {
    if ('environmentIntensity' in scene) {
      scene.environmentIntensity = envIntensity
    }
  }

  public updateLightBoundsForModel(modelBox: THREE.Box3): void {
    if (modelBox.isEmpty()) return

    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    modelBox.getSize(size)
    modelBox.getCenter(center)

    const maxDim = Math.max(size.x, size.y, size.z)

    // Reposition fill light relative to model center & bounding size
    this.fillLight.position.set(
      center.x - maxDim * 1.5,
      center.y + maxDim * 2.0,
      center.z + maxDim * 1.8
    )
    this.fillLight.target.position.copy(center)
    this.fillLight.target.updateMatrixWorld()

    // Adjust shadow camera frustum
    const shadowD = maxDim * 1.5
    this.fillLight.shadow.camera.left = -shadowD
    this.fillLight.shadow.camera.right = shadowD
    this.fillLight.shadow.camera.top = shadowD
    this.fillLight.shadow.camera.bottom = -shadowD
    this.fillLight.shadow.camera.near = 0.1
    this.fillLight.shadow.camera.far = maxDim * 10
    this.fillLight.shadow.camera.updateProjectionMatrix()
  }

  public dispose(): void {
    this.fillLight.dispose()
    this.rimLight.dispose()
    this.ambientLight.dispose()
    this.hemiLight.dispose()
    if (this.pmremGenerator) {
      this.pmremGenerator.dispose()
    }
  }
}
