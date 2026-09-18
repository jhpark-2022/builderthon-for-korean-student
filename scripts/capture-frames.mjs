// 홈 프레임 캡처 (2026-09-18, 감사 반영 브리프 11.6~7). Chrome headless + CDP(웹소켓)만 씁니다.
// 쓰기: node scripts/capture-frames.mjs <url> <outDir> <width> <height> <dpr> <locale ko|en> [step=850] [canvasOnly=0|1] [mobile=0|1]
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [url, outDir, w, h, dpr, locale, stepArg = "850", canvasOnly = "0", mobile = "0"] = process.argv.slice(2);
const W = +w, H = +h, DPR = +dpr, STEP = +stepArg;
mkdirSync(outDir, { recursive: true });
const port = 9333 + Math.floor(Math.random() * 500);
const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
  "--headless=new", `--remote-debugging-port=${port}`, "--no-first-run", "--no-default-browser-check",
  `--window-size=${W},${H}`, "--hide-scrollbars", "--use-gl=angle", "--enable-unsafe-swiftshader",
  `--user-data-dir=/tmp/naru-capture-${port}`, "about:blank",
], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ws, id = 0; const pending = new Map();
const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
try {
  let target;
  for (let i = 0; i < 40 && !target; i++) { await sleep(250); try { const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); target = list.find((t) => t.type === "page"); } catch {} }
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); } };
  await send("Page.enable"); await send("Runtime.enable");
  // REDUCE=1: prefers-reduced-motion 에뮬레이션(배경 정지). /2026-08 전후 픽셀 비교처럼 잡음이 없어야 할 때.
  if (process.env.REDUCE === "1") await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: DPR, mobile: mobile === "1" });
  if (mobile === "1") await send("Emulation.setTouchEmulationEnabled", { enabled: true });
  await send("Page.addScriptToEvaluateOnNewDocument", { source: `try{localStorage.setItem("builderthon.locale","${locale}")}catch(e){}` });
  await send("Page.navigate", { url });
  await sleep(4000);
  const evalJs = async (expr) => (await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true })).result.value;
  // 전체를 한 번 훑어 리빌·이미지를 깨웁니다.
  await evalJs(`(async()=>{const s=(ms)=>new Promise(r=>setTimeout(r,ms));for(let y=0;y<document.documentElement.scrollHeight;y+=600){window.scrollTo(0,y);await s(40)}window.scrollTo(0,0);await s(300);return 1})()`);
  if (canvasOnly === "1") await evalJs(`document.querySelectorAll("main, header, footer").forEach(e=>e.style.visibility="hidden"); 1`);
  const total = await evalJs("document.documentElement.scrollHeight");
  const meta = { url, locale, W, H, DPR, total, frames: [] };
  const ys = []; for (let y = 0; y < total; y += STEP) ys.push(y);
  for (const y of ys) {
    await evalJs(`window.scrollTo(0, ${y}); 1`);
    await sleep(2500);
    const shot = await send("Page.captureScreenshot", { format: "png" });
    const name = `s${y}.png`; writeFileSync(join(outDir, name), Buffer.from(shot.data, "base64")); meta.frames.push(name);
  }
  const sizes = await evalJs(`JSON.stringify(Object.fromEntries(["top","december","gains","record","naru","join","closing"].map(id=>{const e=document.getElementById(id);return [id, e?Math.round(e.getBoundingClientRect().height):null]})))`);
  meta.sections = JSON.parse(sizes);
  writeFileSync(join(outDir, "meta.json"), JSON.stringify(meta, null, 2));
  console.log(JSON.stringify({ total, frames: meta.frames.length, sections: meta.sections }));
} finally { try { ws?.close(); } catch {} chrome.kill("SIGKILL"); }
