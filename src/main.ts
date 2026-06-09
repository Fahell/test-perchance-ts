import { VERSION } from './constants.js';
import { getPerchanceBridge } from './perchance-bridge.js';
import { initRenderer, appendResult } from './modules/renderer.js';
import { aiTextTest } from './modules/ai-text-test.js';
import { threeSceneTest } from './modules/three-scene-test.js';

async function runTests(): Promise<void> {
  console.log(`[Main-TS] Initializing TypeScript test bundle ${VERSION}...`);
  initRenderer();
  const bridge = getPerchanceBridge();
  const envMsg = bridge.isAvailable() ? 'Running inside Perchance environment' : 'Running standalone (no Perchance detected)';
  console.log(`[Main-TS] ${envMsg}`);

  const tests = [
    { label: 'AI Text', fn: aiTextTest },
    { label: 'Three.js', fn: threeSceneTest }
  ];

  for (const { label, fn } of tests) {
    try {
      const result = await fn();
      appendResult(result);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      appendResult({ name: label, status: 'error', message: `Exception: ${msg}` });
      console.error(`[Main-TS] ${label} threw:`, error);
    }
  }
  console.log(`[Main-TS] All tests completed (${VERSION}).`);
}

export function initGame(): void {
  if ((window as unknown as Record<string, unknown>).__TS_INITIALIZED) {
    console.log('[Main-TS] Already initialized. Skipping.');
    return;
  }
  (window as unknown as Record<string, unknown>).__TS_INITIALIZED = true;
  runTests().catch(console.error);
}

console.log(`[Main-TS] main.ts loaded (${VERSION}). Waiting for initGame()...`);
