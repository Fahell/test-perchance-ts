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
        if ((window as unknown as Record<string, unknown>).perchance !== undefined) {
          const pc = (window as unknown as Record<string, unknown>).perchance as {
            getVariable: (n: string) => string | undefined;
          };
          const val = pc.getVariable?.(name);
          if (val !== undefined && val !== null) {
            return String(val);
          }
        }
      } catch {
        // Perchance not available
      }
      return fallback;
    },
    getList(name: string, fallback: string[] = []): string[] {
      try {
        if ((window as unknown as Record<string, unknown>).perchance !== undefined) {
          const pc = (window as unknown as Record<string, unknown>).perchance as {
            getList: (n: string) => string[] | undefined;
          };
          const list = pc.getList?.(name);
          if (Array.isArray(list) && list.length > 0) {
            return list;
          }
        }
      } catch {
        // Perchance not available
      }
      return fallback;
    },
    isAvailable(): boolean {
      return (window as unknown as Record<string, unknown>).perchance !== undefined;
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
