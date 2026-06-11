interface PerchanceBridge {
    getVariable(name: string, fallback?: string): string;
    getList(name: string, fallback?: string[]): string[];
    isAvailable(): boolean;
}
export declare function getPerchanceBridge(): PerchanceBridge;
export type { PerchanceBridge };
//# sourceMappingURL=perchance-bridge.d.ts.map