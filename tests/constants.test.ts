import { describe, it, expect } from 'vitest';
import { VERSION, CDN_BASE, BUNDLE_PATH } from '../src/constants';

describe('Constants', () => {
  it('should export a valid version string', () => {
    expect(VERSION).toMatch(/^v\d+\.\d+\.\d+$/);
  });

  it('should construct CDN_BASE from version', () => {
    expect(CDN_BASE).toContain(VERSION.replace('v', ''));
    expect(CDN_BASE).toContain('jsdelivr');
  });

  it('should construct BUNDLE_PATH from CDN_BASE', () => {
    expect(BUNDLE_PATH).toBe(`${CDN_BASE}/dist/main.bundle.js`);
  });
});
