"use strict";
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const prompts = {
  research: "Work in the private team repo. Check local instructions and git status; preserve teammates' changes. Run git fetch origin once, then git show origin/research:docs/research/START_HERE.md. Follow the brief; open only task-relevant details. If repo access is unavailable, say so. Implement and verify the smallest useful slice. My task is: ",
  branding: "Work in the private team repo. Check local instructions and git status; preserve teammates' changes. Run git fetch origin once, then git show origin/branding:docs/design/START_HERE.md. Follow the correct TALOS surface and open only task-relevant files. If repo access is unavailable, say so. Implement and verify the result. My task is: ",
  both: "Work in the private team repo. Check local instructions and git status; preserve teammates' changes. Run git fetch origin once. Read git show origin/research:docs/research/START_HERE.md and git show origin/branding:docs/design/START_HERE.md. Follow both briefs; open only task-relevant details, not full reports. If repo access is unavailable, say so. Implement and verify. My task is: "
};
const promptText = document.getElementById("prompt-text");
const copyButton = document.getElementById("copy-prompt");
const copyStatus = document.getElementById("copy-status");
let selectedPrompt = "research";
let copyReset;
function showPrompt(key) {
  selectedPrompt = key;
  promptText.textContent = prompts[key];
  document.getElementById("prompt-size").textContent = `${prompts[key].trim().split(/\s+/).length} WORDS`;
  document.querySelectorAll("[data-prompt]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.prompt === key)));
  clearTimeout(copyReset);
  copyButton.firstElementChild.textContent = "Copy prompt";
  copyStatus.textContent = "";
}
for (const button of document.querySelectorAll("[data-prompt]")) button.addEventListener("click", () => showPrompt(button.dataset.prompt));
copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(prompts[selectedPrompt]);
    copyButton.firstElementChild.textContent = "Copied";
    copyStatus.textContent = "Prompt copied. Append your task before sending.";
    copyReset = setTimeout(() => { copyButton.firstElementChild.textContent = "Copy prompt"; }, 2200);
  } catch {
    const range = document.createRange();
    range.selectNodeContents(promptText);
    const selection = getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    copyStatus.textContent = "The prompt is selected. Use your device's copy command.";
    copyButton.firstElementChild.textContent = "Text selected";
  }
});
showPrompt(selectedPrompt);

const stages = [
  ["DEFINE", "Agree on the smallest useful behavior and the evidence that would demonstrate it."],
  ["BUILD", "Implement one compatible slice. Version the dataset, configuration and dependencies."],
  ["VERIFY", "Replay the data and evaluate closed-loop rollouts against the original requirement."],
  ["RELEASE", "Version the complete checkpoint and its evidence. Promote only a qualified candidate."],
  ["LEARN", "Review the failures. Keep the incumbent if results regress. Choose one change for the next cycle."]
];
let currentStage = 0;
let loopRunning = !reducedMotion.matches;
let motionPaused = reducedMotion.matches;
let loopTime = 0;
let heroTime = 0;
let frame = 0;
let lastFrame = 0;
let heroVisible = true;
let loopVisible = false;
const loopPath = document.getElementById("loop-path");
const loopLength = loopPath.getTotalLength();
const playButton = document.getElementById("play");
const globalMotion = document.getElementById("motion-toggle");
const beacon = document.getElementById("beacon");
const halo = document.getElementById("beacon-halo");
const flow = document.querySelector(".loop-flow");
function showStage(index) {
  currentStage = index;
  document.querySelectorAll("[data-stage]").forEach(button => {
    const active = Number(button.dataset.stage) === index;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  document.getElementById("stage-count").textContent = `0${index + 1} / ${stages[index][0]}`;
  document.getElementById("stage-description").textContent = stages[index][1];
}
function updateLoop() {
  const progress = (loopTime % 16000) / 16000;
  const point = loopPath.getPointAtLength(progress * loopLength);
  for (const dot of [beacon, halo]) { dot.setAttribute("cx", point.x); dot.setAttribute("cy", point.y); }
  flow.style.strokeDashoffset = String(-loopTime / 90);
  const stage = Math.floor(progress * 5);
  if (stage !== currentStage) showStage(stage);
}
function syncControls() {
  const running = loopRunning && !motionPaused;
  playButton.setAttribute("aria-pressed", String(running));
  document.getElementById("play-label").textContent = running ? "Pause the loop" : "Play the loop";
  playButton.querySelector(".control-icon").textContent = running ? "Ⅱ" : "▷";
  globalMotion.setAttribute("aria-pressed", String(motionPaused));
  globalMotion.innerHTML = motionPaused ? 'RESUME MOTION <span aria-hidden="true">▷</span>' : 'PAUSE MOTION <span aria-hidden="true">Ⅱ</span>';
}
playButton.addEventListener("click", () => {
  if (motionPaused || !loopRunning) { motionPaused = false; loopRunning = true; } else loopRunning = false;
  syncControls(); schedule();
});
globalMotion.addEventListener("click", () => { motionPaused = !motionPaused; syncControls(); schedule(); });
for (const button of document.querySelectorAll("[data-stage]")) button.addEventListener("click", () => {
  loopRunning = false;
  loopTime = Number(button.dataset.stage) * 3200;
  showStage(Number(button.dataset.stage)); updateLoop(); syncControls();
});

const canvas = document.getElementById("sculpture");
const ctx = canvas.getContext("2d");
const points = [];
const ringCount = 100;
const tubeCount = 12;
for (let i = 0; i < ringCount; i++) {
  const t = i / ringCount * Math.PI * 2;
  const r = 1.55 + .48 * Math.cos(3 * t);
  const center = [r * Math.cos(2 * t), r * Math.sin(2 * t), .7 * Math.sin(3 * t)];
  const normal = [Math.cos(2 * t), Math.sin(2 * t), 0];
  const tangent = [-2 * r * Math.sin(2 * t) - 1.44 * Math.sin(3 * t) * Math.cos(2 * t), 2 * r * Math.cos(2 * t) - 1.44 * Math.sin(3 * t) * Math.sin(2 * t), 2.1 * Math.cos(3 * t)];
  const binormal = [-tangent[2] * normal[1], tangent[2] * normal[0], tangent[0] * normal[1] - tangent[1] * normal[0]];
  const length = Math.hypot(...binormal);
  for (let j = 0; j < tubeCount; j++) {
    const a = j / tubeCount * Math.PI * 2;
    points.push(center.map((v, k) => v + .27 * (normal[k] * Math.cos(a) + binormal[k] / length * Math.sin(a))));
  }
}
let width = 0;
let height = 0;
let pointerX = 0;
let pointerY = 0;
function resize() {
  const rect = canvas.getBoundingClientRect();
  width = rect.width; height = rect.height;
  const dpr = Math.min(devicePixelRatio || 1, 1.5);
  canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  if (ctx) { ctx.setTransform(dpr, 0, 0, dpr, 0, 0); drawSculpture(); }
}
function drawSculpture() {
  if (!ctx || !width || !height) return;
  const angle = heroTime * .00007 + .6 + pointerX;
  const tilt = .9 + pointerY;
  const cy = Math.cos(angle), sy = Math.sin(angle), cx = Math.cos(tilt), sx = Math.sin(tilt);
  const scale = Math.min(width / 5.4, height / 4.9);
  const projected = points.map(([x, y, z]) => {
    const a = x * cy + z * sy, b = z * cy - x * sy;
    const yy = y * cx - b * sx, zz = b * cx + y * sx;
    const perspective = 6 / (6 + zz);
    return [width / 2 + a * scale * perspective, height / 2 + yy * scale * perspective, zz];
  });
  const faces = [];
  for (let i = 0; i < ringCount; i++) for (let j = 0; j < tubeCount; j++) {
    const ids = [i * tubeCount + j, ((i + 1) % ringCount) * tubeCount + j, ((i + 1) % ringCount) * tubeCount + (j + 1) % tubeCount, i * tubeCount + (j + 1) % tubeCount];
    faces.push({ids, depth: ids.reduce((sum, k) => sum + projected[k][2], 0) / 4, j, i});
  }
  faces.sort((a, b) => b.depth - a.depth);
  ctx.clearRect(0, 0, width, height);
  for (const face of faces) {
    const light = .5 + .5 * Math.cos(face.j / tubeCount * Math.PI * 2 + angle + face.i * .04);
    const shine = light ** 5;
    ctx.beginPath();
    face.ids.forEach((id, k) => { const p = projected[id]; if (k === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); });
    ctx.closePath();
    ctx.fillStyle = `rgb(${22 + shine * 145},${23 + shine * 87},${23 + shine * 49})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(235,169,115,${.12 + light * .3})`;
    ctx.lineWidth = .45;
    ctx.stroke();
  }
  canvas.parentElement.classList.add("has-canvas");
}
function animate(time) {
  frame = 0;
  const delta = lastFrame ? Math.min(time - lastFrame, 50) : 0;
  if (time - lastFrame >= 32 || !lastFrame) {
    lastFrame = time;
    if (heroVisible) { heroTime += delta; drawSculpture(); }
    if (loopVisible && loopRunning) { loopTime += delta; updateLoop(); }
  }
  schedule();
}
function schedule() {
  if (!frame && !motionPaused && !document.hidden && (heroVisible || (loopVisible && loopRunning))) frame = requestAnimationFrame(animate);
}
if ("IntersectionObserver" in window) {
  const visibility = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.target.id === "top") heroVisible = entry.isIntersecting;
      if (entry.target.id === "workflow") loopVisible = entry.isIntersecting;
    }
    lastFrame = 0; schedule();
  });
  visibility.observe(document.getElementById("top")); visibility.observe(document.getElementById("workflow"));
  const reveal = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.remove("awaiting"); reveal.unobserve(entry.target); }
  }, {threshold: .08});
  if (!reducedMotion.matches) for (const element of document.querySelectorAll("[data-reveal]")) { element.classList.add("awaiting"); reveal.observe(element); }
}
if (!reducedMotion.matches) document.querySelectorAll(".hero-title>span").forEach((letter, index) => {
  letter.animate([{transform:"translateY(65px)",opacity:0},{transform:"translateY(0)",opacity:1}], {duration:850,delay:index * 65,easing:"cubic-bezier(.16,1,.3,1)",fill:"backwards"});
});
document.getElementById("top").addEventListener("pointermove", event => {
  if (motionPaused || reducedMotion.matches || event.pointerType === "touch") return;
  pointerX = (event.clientX / innerWidth - .5) * .16;
  pointerY = (event.clientY / innerHeight - .5) * .1;
});
window.addEventListener("resize", resize);
document.addEventListener("visibilitychange", () => { lastFrame = 0; schedule(); });
reducedMotion.addEventListener("change", () => {
  motionPaused = reducedMotion.matches;
  if (motionPaused) for (const animation of document.getAnimations()) animation.finish();
  for (const element of document.querySelectorAll(".awaiting")) element.classList.remove("awaiting");
  syncControls(); schedule();
});
resize(); updateLoop(); syncControls(); schedule();
