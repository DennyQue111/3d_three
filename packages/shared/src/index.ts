export type Vector3 = [number, number, number]

export interface LightConfig {
  id: string
  name: string
  type: 'directional' | 'point'
  intensity: number
  color: string
  position: Vector3
}

export interface CameraConfig {
  id: string
  name: string
  position: Vector3
}

export interface SceneProject {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  scene: {
    modelName: string
    modelRotationY: number
    modelScale: number
    lights: LightConfig[]
    cameras: CameraConfig[]
  }
}
