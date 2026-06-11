interface PerchanceRoot {
  [key: string]: unknown;
  selectOne?: unknown;
  selectMany?: (n: number) => unknown[];
  joinItems?: (sep: string) => string;
}

function getPerchanceRoot(): PerchanceRoot | null {
  if (typeof window !== 'undefined') {
    if ((window as unknown as Record<string, unknown>).root) {
      return (window as unknown as Record<string, unknown>).root as PerchanceRoot;
    }
    if (window.parent && (window.parent as unknown as Record<string, unknown>).root) {
      return (window.parent as unknown as Record<string, unknown>).root as PerchanceRoot;
    }
  }
  return null;
}

const root = getPerchanceRoot();

interface PerchanceBridge {
  getVariable(name: string, fallback?: string): string;
  getList(name: string, fallback?: string[]): string[];
  isAvailable(): boolean;
}

let perchanceBridge: PerchanceBridge | null = null;

function createPerchanceBridge(): PerchanceBridge {
  return {
    getVariable(name: string, fallback: string = ''): string {
      try {
        if (root && root[name] !== undefined && root[name] !== null) {
          return String(root[name]);
        }
      } catch {
        // Perchance not available
      }
      return fallback;
    },
    getList(name: string, fallback: string[] = []): string[] {
      try {
        if (!root) return fallback;
      const list = root[name];
        if (list && typeof (list as PerchanceRoot).selectOne === 'function') {
          // It's a Perchance list object. Return it casted as string[] for compatibility,
          // though in reality it's an object with selectOne/selectMany methods.
          return list as unknown as string[];
        }
        if (Array.isArray(list) && list.length > 0) {
          return list as string[];
        }
      } catch {
        // Perchance not available
      }
      return fallback;
    },
    isAvailable(): boolean {
      return root !== null;
    }
  };
}

export function getPerchanceBridge(): PerchanceBridge {
  if (!perchanceBridge) {
    perchanceBridge = createPerchanceBridge();
  }
  return perchanceBridge;
}

export type { PerchanceBridge };
