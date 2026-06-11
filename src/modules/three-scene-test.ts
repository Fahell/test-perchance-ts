import type { TestModuleResult, ThreeSceneStatus } from './types.js';

declare global {
  interface Window {
    THREE?: typeof import('three');
  }
}

export async function threeSceneTest(): Promise<TestModuleResult> {
  const result: TestModuleResult = {
    name: 'Three.js Integration (TS)',
    status: 'pending',
    message: ''
  };

  console.log('[Three-TS] Starting Three.js integration test...');

  const status: ThreeSceneStatus = {
    rendererReady: false,
    sceneReady: false,
    cameraReady: false,
    animationRunning: false,
    frameCount: 0
  };

  try {
    // We rely on the CDN version loaded via window.THREE.
    // The dynamic import('three') was removed because 'three' is externalized in vite.config.ts,
    // which causes browsers to throw "Failed to resolve module specifier 'three'" without an import map.
    const THREE = window.THREE;
    const cdnLoaded = THREE !== undefined;

    if (cdnLoaded) {
      console.log('[Three-TS] CDN Three.js detected on window.THREE.');
    } else {
      console.warn('[Three-TS] CDN Three.js not found on window.THREE.');
    }

    if (!THREE) {
      result.status = 'error';
      result.message = 'CDN Three.js is not available on window.THREE.';
      result.data = { cdnLoaded };
      return result;
    }

    const scene = new THREE.Scene();
    status.sceneReady = true;

    const camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
    camera.position.z = 5;
    status.cameraReady = true;

    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    const container = document.getElementById('three-container');
    let renderer: THREE.WebGLRenderer | null = null;

    if (container) {
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setClearColor(0x1a1a2e);
      container.appendChild(renderer.domElement);
      status.rendererReady = true;

      let frames = 0;
      const animate = (): void => {
        requestAnimationFrame(animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.015;
        renderer!.render(scene, camera);
        frames++;
        status.frameCount = frames;
      };
      animate();
      status.animationRunning = true;
      console.log('[Three-TS] Scene rendering active.');
    } else {
      console.warn('[Three-TS] No #three-container found. Scene created but not rendered.');
    }

    result.status = 'success';
    result.message = `Three.js verified via CDN: ${cdnLoaded}. Renderer: ${status.rendererReady}.`;
    result.data = {
      ...status,
      source: 'cdn'
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    result.status = 'error';
    result.message = `Three.js test failed: ${msg}`;
    console.error('[Three-TS]', error);
  }

  return result;
}
