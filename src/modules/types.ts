export interface TestModuleResult {
  name: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  data?: unknown;
}

export interface ThreeSceneStatus {
  rendererReady: boolean;
  sceneReady: boolean;
  cameraReady: boolean;
  animationRunning: boolean;
  frameCount: number;
}
