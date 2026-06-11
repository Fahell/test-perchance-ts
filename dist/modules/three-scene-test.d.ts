import type { TestModuleResult } from './types.js';
declare global {
    interface Window {
        THREE?: typeof import('three');
    }
}
export declare function threeSceneTest(): Promise<TestModuleResult>;
//# sourceMappingURL=three-scene-test.d.ts.map