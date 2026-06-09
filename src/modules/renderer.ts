export function initRenderer(): HTMLElement {
  const panel = document.createElement('div');
  panel.id = 'test-panel';
  panel.style.cssText = `
    position: fixed; top: 10px; right: 10px;
    background: rgba(26, 26, 46, 0.95); color: #e0e0e0;
    padding: 16px; border-radius: 8px; font-family: monospace;
    font-size: 12px; max-width: 400px; max-height: 80vh;
    overflow-y: auto; z-index: 9999; border: 1px solid #333;
  `;
  panel.innerHTML = `<h3 style="margin:0 0 10px 0;color:#00ff88;">TS Test Panel</h3><div id="test-results">Initializing...</div>`;
  document.body.appendChild(panel);
  return panel;
}

export function appendResult(result: { name: string; status: string; message: string }): void {
  const container = document.getElementById('test-results');
  if (!container) return;
  const div = document.createElement('div');
  div.style.cssText = `margin: 6px 0; padding: 8px; border-left: 3px solid ${result.status === 'success' ? '#00ff88' : '#ff4444'}; background: rgba(255,255,255,0.05);`;
  div.innerHTML = `<strong>${result.name}</strong><br/>${result.message}`;
  container.appendChild(div);
}
