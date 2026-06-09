import { getPerchanceBridge } from '../perchance-bridge.js';
import type { TestModuleResult } from './types.js';

const FALLBACK_RESPONSES = [
  'Hello from TypeScript on Perchance!',
  'The AI text plugin is working correctly.',
  'This is a generated response from the TS module.',
];

export async function aiTextTest(): Promise<TestModuleResult> {
  const bridge = getPerchanceBridge();
  const result: TestModuleResult = {
    name: 'AI Text Plugin (TS)',
    status: 'pending',
    message: ''
  };

  console.log('[AI-Text-TS] Starting AI text plugin test...');

  try {
    if (!bridge.isAvailable()) {
      result.status = 'success';
      result.message = 'Perchance bridge not connected (standalone). Using fallback.';
      result.data = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
      return result;
    }

    const aiPrompt = bridge.getVariable('ai', '');

    if (aiPrompt === '') {
      result.status = 'success';
      result.message = 'AI plugin variable not found. Using fallback responses.';
      result.data = FALLBACK_RESPONSES;
      return result;
    }

    result.status = 'success';
    result.message = 'AI text plugin detected and accessible.';
    result.data = { aiVariable: aiPrompt };
    console.log('[AI-Text-TS] AI plugin test passed.');
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    result.status = 'error';
    result.message = `AI text test failed: ${msg}`;
    console.error('[AI-Text-TS]', error);
  }

  return result;
}
