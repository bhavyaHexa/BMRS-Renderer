import React, { useEffect } from 'react'
import { useControls, folder, button } from 'leva'
import type { MaterialProfile } from '../model/ViewerMaterial'
import { DEFAULT_MATERIAL_PROFILE } from '../model/ViewerMaterial'

interface MaterialLevaControlsProps {
  onUpdateMaterial: (profile: MaterialProfile) => void
  onToggleWireframe?: () => void
}

export const MaterialLevaControls: React.FC<MaterialLevaControlsProps> = ({
  onUpdateMaterial,
  onToggleWireframe,
}) => {
  // Leva controls panel
  const [values, set] = useControls(() => ({
    '🎨 Color & Material Setup': folder(
      {
        color: {
          value: DEFAULT_MATERIAL_PROFILE.color,
          label: 'Base Color',
        },
        wireframe: {
          value: false,
          label: 'Wireframe Mode',
          onChange: () => {
            if (onToggleWireframe) {
              onToggleWireframe()
            }
          },
        },
      },
      { collapsed: false }
    ),

    '⚡ Physical Parameters (PBR)': folder(
      {
        metalness: {
          value: DEFAULT_MATERIAL_PROFILE.metalness,
          min: 0,
          max: 1,
          step: 0.01,
          label: 'Metalness',
        },
        roughness: {
          value: DEFAULT_MATERIAL_PROFILE.roughness,
          min: 0,
          max: 1,
          step: 0.01,
          label: 'Roughness',
        },
        clearcoat: {
          value: DEFAULT_MATERIAL_PROFILE.clearcoat ?? 0.08,
          min: 0,
          max: 1,
          step: 0.01,
          label: 'Clearcoat',
        },
        clearcoatRoughness: {
          value: DEFAULT_MATERIAL_PROFILE.clearcoatRoughness ?? 0.2,
          min: 0,
          max: 1,
          step: 0.01,
          label: 'Clearcoat Roughness',
        },
        reflectivity: {
          value: DEFAULT_MATERIAL_PROFILE.reflectivity ?? 0.95,
          min: 0,
          max: 1,
          step: 0.01,
          label: 'Reflectivity',
        },
        envMapIntensity: {
          value: DEFAULT_MATERIAL_PROFILE.envMapIntensity ?? 1.2,
          min: 0,
          max: 3,
          step: 0.1,
          label: 'Env Intensity',
        },
      },
      { collapsed: false }
    ),

    '🌈 Color Palette Presets': folder(
      {
        'Machined Brass Gold': button(() =>
          set({
            color: '#cca43b',
            metalness: 0.94,
            roughness: 0.28,
            clearcoat: 0.08,
            clearcoatRoughness: 0.2,
            reflectivity: 0.95,
          })
        ),
        'Rich Amber Gold': button(() =>
          set({
            color: '#de992a',
            metalness: 0.92,
            roughness: 0.25,
            clearcoat: 0.1,
            clearcoatRoughness: 0.15,
            reflectivity: 0.9,
          })
        ),
        'Rose Gold': button(() =>
          set({
            color: '#b76e79',
            metalness: 0.9,
            roughness: 0.2,
            clearcoat: 0.15,
            clearcoatRoughness: 0.1,
            reflectivity: 0.9,
          })
        ),
        'Polished Chrome': button(() =>
          set({
            color: '#f8fafc',
            metalness: 0.98,
            roughness: 0.04,
            clearcoat: 0.5,
            clearcoatRoughness: 0.02,
            reflectivity: 1.0,
          })
        ),
        'Industrial Steel': button(() =>
          set({
            color: '#cbd5e1',
            metalness: 0.9,
            roughness: 0.24,
            clearcoat: 0.1,
            clearcoatRoughness: 0.1,
            reflectivity: 0.9,
          })
        ),
        'Matte Carbon': button(() =>
          set({
            color: '#1e293b',
            metalness: 0.08,
            roughness: 0.45,
            clearcoat: 0.15,
            clearcoatRoughness: 0.2,
            reflectivity: 0.5,
          })
        ),
        'Precision Red': button(() =>
          set({
            color: '#dc2626',
            metalness: 0.05,
            roughness: 0.12,
            clearcoat: 0.8,
            clearcoatRoughness: 0.05,
            reflectivity: 0.7,
          })
        ),
        'Cyber Cyan': button(() =>
          set({
            color: '#0284c7',
            metalness: 0.75,
            roughness: 0.2,
            clearcoat: 0.3,
            clearcoatRoughness: 0.1,
            reflectivity: 0.8,
          })
        ),
        'Emerald Green': button(() =>
          set({
            color: '#059669',
            metalness: 0.8,
            roughness: 0.22,
            clearcoat: 0.3,
            clearcoatRoughness: 0.1,
            reflectivity: 0.8,
          })
        ),
      },
      { collapsed: true }
    ),
  }))

  useEffect(() => {
    onUpdateMaterial({
      color: values.color,
      metalness: values.metalness,
      roughness: values.roughness,
      clearcoat: values.clearcoat,
      clearcoatRoughness: values.clearcoatRoughness,
      reflectivity: values.reflectivity,
      envMapIntensity: values.envMapIntensity,
    })
  }, [values, onUpdateMaterial])

  return null
}
