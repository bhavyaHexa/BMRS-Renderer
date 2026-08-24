import * as THREE from "three";

export interface MaterialProfile {
  color: string;
  metalness: number;
  roughness: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  reflectivity?: number;
  envMapIntensity?: number;
}

export const DEFAULT_MATERIAL_PROFILE: MaterialProfile = {
  color: "#de992a", // Machined Satin Brass / Gold (matched to reference photo)
  metalness: 1.0,
  roughness: 0.5,
  clearcoat: 0.08,
  clearcoatRoughness: 0.2,
  reflectivity: 0.95,
  envMapIntensity: 0.5,
};

export class ViewerMaterial {
  private activeProfile: MaterialProfile;
  private customMaterial: THREE.MeshPhysicalMaterial | null = null;
  private wireframeEnabled = false;

  private textureMapStore: {
    albedo?: THREE.Texture | null;
    normal?: THREE.Texture | null;
    roughness?: THREE.Texture | null;
    metalness?: THREE.Texture | null;
    ao?: THREE.Texture | null;
  } = {};

  private textureRepeat = { x: 1, y: 1 };
  private textureLoader = new THREE.TextureLoader();

  constructor(profile: MaterialProfile = DEFAULT_MATERIAL_PROFILE) {
    this.activeProfile = { ...profile };
  }

  public getMaterial(): THREE.MeshPhysicalMaterial {
    if (!this.customMaterial) {
      this.customMaterial = this.createCustomStudioMaterial(this.activeProfile);
    }
    return this.customMaterial;
  }

  public createCustomStudioMaterial(
    profile?: MaterialProfile,
  ): THREE.MeshPhysicalMaterial {
    const p = profile || this.activeProfile;
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(p.color),
      metalness: p.metalness,
      roughness: p.roughness,
      clearcoat: p.clearcoat ?? 0.3,
      clearcoatRoughness: p.clearcoatRoughness ?? 0.1,
      reflectivity: p.reflectivity ?? 0.9,
      envMapIntensity: p.envMapIntensity ?? 1.3,
      wireframe: this.wireframeEnabled,
      side: THREE.DoubleSide,
    });

    this.applyTexturesToMaterial(mat);
    return mat;
  }

  public async setTextureMap(
    mapType: "albedo" | "normal" | "roughness" | "metalness" | "ao",
    file: File | null,
  ): Promise<void> {
    const mat = this.getMaterial();

    if (!file) {
      // Remove existing texture map
      if (this.textureMapStore[mapType]) {
        this.textureMapStore[mapType]?.dispose();
        this.textureMapStore[mapType] = null;
      }
      this.assignTextureToMaterial(mat, mapType, null);
      mat.needsUpdate = true;
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        objectUrl,
        (texture) => {
          URL.revokeObjectURL(objectUrl);

          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set(this.textureRepeat.x, this.textureRepeat.y);

          if (mapType === "albedo") {
            texture.colorSpace = THREE.SRGBColorSpace;
          } else {
            texture.colorSpace = THREE.NoColorSpace;
          }

          if (this.textureMapStore[mapType]) {
            this.textureMapStore[mapType]?.dispose();
          }
          this.textureMapStore[mapType] = texture;

          this.assignTextureToMaterial(mat, mapType, texture);
          mat.needsUpdate = true;
          resolve();
        },
        undefined,
        (err) => {
          URL.revokeObjectURL(objectUrl);
          reject(err);
        },
      );
    });
  }

  public setTextureRepeat(repeatX: number, repeatY: number): void {
    this.textureRepeat = { x: repeatX, y: repeatY };
    Object.values(this.textureMapStore).forEach((tex) => {
      if (tex) {
        tex.repeat.set(repeatX, repeatY);
        tex.needsUpdate = true;
      }
    });

    if (this.customMaterial) {
      this.customMaterial.needsUpdate = true;
    }
  }

  public clearAllTextures(): void {
    const mat = this.getMaterial();
    (
      ["albedo", "normal", "roughness", "metalness", "ao"] as Array<
        keyof typeof this.textureMapStore
      >
    ).forEach((key) => {
      if (this.textureMapStore[key]) {
        this.textureMapStore[key]?.dispose();
        this.textureMapStore[key] = null;
      }
      this.assignTextureToMaterial(mat, key, null);
    });
    mat.needsUpdate = true;
  }

  private assignTextureToMaterial(
    mat: THREE.MeshPhysicalMaterial,
    mapType: "albedo" | "normal" | "roughness" | "metalness" | "ao",
    texture: THREE.Texture | null,
  ): void {
    switch (mapType) {
      case "albedo":
        mat.map = texture;
        // Reset base color tint to white if albedo texture present for pure colors
        if (texture) {
          mat.color.set("#ffffff");
        } else {
          mat.color.set(this.activeProfile.color);
        }
        break;
      case "normal":
        mat.normalMap = texture;
        if (texture) {
          mat.normalScale.set(1, 1);
        }
        break;
      case "roughness":
        mat.roughnessMap = texture;
        break;
      case "metalness":
        mat.metalnessMap = texture;
        break;
      case "ao":
        mat.aoMap = texture;
        if (texture) {
          mat.aoMapIntensity = 1.0;
        }
        break;
    }
  }

  private applyTexturesToMaterial(mat: THREE.MeshPhysicalMaterial): void {
    if (this.textureMapStore.albedo) {
      mat.map = this.textureMapStore.albedo;
      mat.color.set("#ffffff");
    }
    if (this.textureMapStore.normal) {
      mat.normalMap = this.textureMapStore.normal;
    }
    if (this.textureMapStore.roughness) {
      mat.roughnessMap = this.textureMapStore.roughness;
    }
    if (this.textureMapStore.metalness) {
      mat.metalnessMap = this.textureMapStore.metalness;
    }
    if (this.textureMapStore.ao) {
      mat.aoMap = this.textureMapStore.ao;
      mat.aoMapIntensity = 1.0;
    }
  }

  public updateProfile(
    colorOrProfile: string | MaterialProfile | null,
  ): MaterialProfile {
    if (!colorOrProfile) {
      this.activeProfile = { ...DEFAULT_MATERIAL_PROFILE };
    } else if (typeof colorOrProfile === "string") {
      this.activeProfile = {
        ...this.activeProfile,
        color: colorOrProfile,
        metalness: 0.15,
        roughness: 0.2,
        clearcoat: 0.6,
      };
    } else {
      this.activeProfile = { ...colorOrProfile };
    }

    if (this.customMaterial) {
      // Only set color tint if albedo map is not loaded
      if (!this.customMaterial.map) {
        this.customMaterial.color.set(this.activeProfile.color);
      }
      this.customMaterial.metalness = this.activeProfile.metalness;
      this.customMaterial.roughness = this.activeProfile.roughness;
      this.customMaterial.clearcoat = this.activeProfile.clearcoat ?? 0.3;
      this.customMaterial.clearcoatRoughness =
        this.activeProfile.clearcoatRoughness ?? 0.1;
      this.customMaterial.reflectivity = this.activeProfile.reflectivity ?? 0.9;
      this.customMaterial.envMapIntensity =
        this.activeProfile.envMapIntensity ?? 1.3;
      this.customMaterial.needsUpdate = true;
    }

    return this.activeProfile;
  }

  public setWireframe(enabled: boolean): boolean {
    this.wireframeEnabled = enabled;
    if (this.customMaterial) {
      this.customMaterial.wireframe = this.wireframeEnabled;
      this.customMaterial.needsUpdate = true;
    }
    return this.wireframeEnabled;
  }

  public toggleWireframe(): boolean {
    return this.setWireframe(!this.wireframeEnabled);
  }

  public isWireframe(): boolean {
    return this.wireframeEnabled;
  }

  public getActiveProfile(): MaterialProfile {
    return { ...this.activeProfile };
  }

  public disposeMaterial(material?: THREE.Material): void {
    const matToDispose = material || this.customMaterial;
    if (!matToDispose) return;

    matToDispose.dispose();

    // Dispose attached textures
    const matObj = matToDispose as unknown as Record<string, unknown>;
    for (const key of Object.keys(matObj)) {
      const value = matObj[key];
      if (
        value &&
        typeof value === "object" &&
        "isTexture" in value &&
        (value as THREE.Texture).isTexture
      ) {
        (value as THREE.Texture).dispose();
      }
    }

    if (!material || material === this.customMaterial) {
      this.customMaterial = null;
    }
  }
}
