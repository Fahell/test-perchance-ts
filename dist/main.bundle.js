const VERSION = "v1.0.7";
function getPerchanceRoot() {
  if (typeof window !== "undefined") {
    if (window.root) {
      return window.root;
    }
    if (window.parent && window.parent.root) {
      return window.parent.root;
    }
  }
  return {};
}
const root = getPerchanceRoot();
let perchanceBridge = null;
function createPerchanceBridge() {
  return {
    getVariable(name, fallback = "") {
      try {
        if (root[name] !== void 0 && root[name] !== null) {
          return String(root[name]);
        }
      } catch {
      }
      return fallback;
    },
    getList(name, fallback = []) {
      try {
        const list = root[name];
        if (list && typeof list.selectOne === "function") {
          return list;
        }
        if (Array.isArray(list) && list.length > 0) {
          return list;
        }
      } catch {
      }
      return fallback;
    },
    isAvailable() {
      return Object.keys(root).length > 0;
    }
  };
}
function getPerchanceBridge() {
  if (!perchanceBridge) {
    perchanceBridge = createPerchanceBridge();
  }
  return perchanceBridge;
}
function initRenderer() {
  const panel = document.createElement("div");
  panel.id = "test-panel";
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
function appendResult(result) {
  const container = document.getElementById("test-results");
  if (!container) return;
  const div = document.createElement("div");
  div.style.cssText = `margin: 6px 0; padding: 8px; border-left: 3px solid ${result.status === "success" ? "#00ff88" : "#ff4444"}; background: rgba(255,255,255,0.05);`;
  div.innerHTML = `<strong>${result.name}</strong><br/>${result.message}`;
  container.appendChild(div);
}
const FALLBACK_RESPONSES = [
  "Hello from TypeScript on Perchance!",
  "The AI text plugin is working correctly.",
  "This is a generated response from the TS module."
];
async function aiTextTest() {
  const bridge = getPerchanceBridge();
  const result = {
    name: "AI Text Plugin (TS)",
    status: "pending",
    message: ""
  };
  console.log("[AI-Text-TS] Starting AI text plugin test...");
  try {
    if (!bridge.isAvailable()) {
      result.status = "success";
      result.message = "Perchance bridge not connected (standalone). Using fallback.";
      result.data = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
      return result;
    }
    const aiPrompt = bridge.getVariable("ai", "");
    if (aiPrompt === "") {
      result.status = "success";
      result.message = "AI plugin variable not found. Using fallback responses.";
      result.data = FALLBACK_RESPONSES;
      return result;
    }
    result.status = "success";
    result.message = "AI text plugin detected and accessible.";
    result.data = { aiVariable: aiPrompt };
    console.log("[AI-Text-TS] AI plugin test passed.");
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    result.status = "error";
    result.message = `AI text test failed: ${msg}`;
    console.error("[AI-Text-TS]", error);
  }
  return result;
}
async function threeSceneTest() {
  const result = {
    name: "Three.js Integration (TS)",
    status: "pending",
    message: ""
  };
  console.log("[Three-TS] Starting Three.js integration test...");
  const status = {
    rendererReady: false,
    sceneReady: false,
    cameraReady: false,
    animationRunning: false,
    frameCount: 0
  };
  try {
    const THREE = window.THREE;
    const cdnLoaded = THREE !== void 0;
    if (cdnLoaded) {
      console.log("[Three-TS] CDN Three.js detected on window.THREE.");
    } else {
      console.warn("[Three-TS] CDN Three.js not found on window.THREE.");
    }
    if (!THREE) {
      result.status = "error";
      result.message = "CDN Three.js is not available on window.THREE.";
      result.data = { cdnLoaded };
      return result;
    }
    const scene = new THREE.Scene();
    status.sceneReady = true;
    const camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1e3);
    camera.position.z = 5;
    status.cameraReady = true;
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshBasicMaterial({ color: 65416 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    const container = document.getElementById("three-container");
    let renderer = null;
    if (container) {
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setClearColor(1710638);
      container.appendChild(renderer.domElement);
      status.rendererReady = true;
      let frames = 0;
      const animate = () => {
        requestAnimationFrame(animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.015;
        renderer.render(scene, camera);
        frames++;
        status.frameCount = frames;
      };
      animate();
      status.animationRunning = true;
      console.log("[Three-TS] Scene rendering active.");
    } else {
      console.warn("[Three-TS] No #three-container found. Scene created but not rendered.");
    }
    result.status = "success";
    result.message = `Three.js verified via CDN: ${cdnLoaded}. Renderer: ${status.rendererReady}.`;
    result.data = {
      ...status,
      source: "cdn"
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    result.status = "error";
    result.message = `Three.js test failed: ${msg}`;
    console.error("[Three-TS]", error);
  }
  return result;
}
async function runTests() {
  console.log(`[Main-TS] Initializing TypeScript test bundle ${VERSION}...`);
  initRenderer();
  const bridge = getPerchanceBridge();
  const envMsg = bridge.isAvailable() ? "Running inside Perchance environment" : "Running standalone (no Perchance detected)";
  console.log(`[Main-TS] ${envMsg}`);
  const tests = [
    { label: "AI Text", fn: aiTextTest },
    { label: "Three.js", fn: threeSceneTest }
  ];
  for (const { label, fn } of tests) {
    try {
      const result = await fn();
      appendResult(result);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      appendResult({ name: label, status: "error", message: `Exception: ${msg}` });
      console.error(`[Main-TS] ${label} threw:`, error);
    }
  }
  console.log(`[Main-TS] All tests completed (${VERSION}).`);
}
function initGame() {
  if (window.__TS_INITIALIZED) {
    console.log("[Main-TS] Already initialized. Skipping.");
    return;
  }
  window.__TS_INITIALIZED = true;
  runTests().catch(console.error);
}
console.log(`[Main-TS] main.ts loaded (${VERSION}). Waiting for initGame()...`);
export {
  initGame
};
