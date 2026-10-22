"use strict";
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const onboardingPrompt = "Initialize TALOS project context now and keep using its research and branding during all later work in this repository. This is a complete onboarding task; do not ask me to supply another task.\n\nRead README.md and applicable local instructions. Check git status --short, preserve teammate changes and untracked files, then run git fetch origin once. Read git show origin/main:AGENTS.md. If this feature branch predates the setup, add only missing AGENTS.md, CLAUDE.md and GEMINI.md from origin/main so future sessions can load the same rules. Reconcile existing instructions without discarding them. Do not switch branches, merge whole branches or overwrite code to load context.\n\nFollow AGENTS.md. The primary challenge specification is docs/problem description/Siemens Healthineers 2026 Hackathon C2.pdf: read all eight original pages during first onboarding; research and branding support it and never replace it. Use current official organizer clarifications for setup, schema and evaluation.\n\nLoad research from origin/research:docs/research and branding from origin/branding:docs/design using git show. During the first full onboarding, read every tracked Markdown document in those folders and inspect the implemented team manual on origin/branding. Follow the local review-receipt policy in AGENTS.md: record only reviewed file versions, never private document contents. On later sessions or phases, reload the short rules and relevant/changed sections; do not reread unchanged full reports or crawl external sources automatically. A previous receipt is not proof that you personally read a file.\n\nApply the agreed pipeline blueprint and the correct TALOS design surface, reuse existing work, and follow data, licensing, motion and verification rules. If repository/PDF access is missing, report the exact blocker rather than guessing. Finish with a brief report of reviewed references, core requirements, design rules and actual blockers. If an implementation task is already assigned, continue it using this guidance; otherwise finish onboarding without unrelated code changes, training, installation or deployment. Nothing needs filling in.";
const promptText = document.getElementById("prompt-text");
const copyButton = document.getElementById("copy-prompt");
const copyStatus = document.getElementById("copy-status");
let copyReset;
promptText.textContent = onboardingPrompt;
document.getElementById("prompt-size").textContent = `${onboardingPrompt.trim().split(/\s+/).length} WORDS`;
copyButton.addEventListener("click", async () => {
  clearTimeout(copyReset);
  try {
    await navigator.clipboard.writeText(onboardingPrompt);
    copyButton.firstElementChild.textContent = "Copied";
    copyStatus.textContent = "Complete onboarding prompt copied. Paste and send it as-is.";
    copyReset = setTimeout(() => { copyButton.firstElementChild.textContent = "Copy onboarding prompt"; }, 2200);
  } catch {
    const range = document.createRange();
    range.selectNodeContents(promptText);
    const selection = getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    copyStatus.textContent = "The complete prompt is selected. Use your device's copy command.";
    copyButton.firstElementChild.textContent = "Text selected";
  }
});

const stages = [
  ["PLAN", "Define the requirement, acceptance evidence and smallest useful implementation slice."],
  ["CODE", "Implement the slice using the agreed research, interfaces and TALOS design guidance."],
  ["BUILD", "Create a reproducible package with pinned dependencies, configuration and versioned artifacts."],
  ["TEST", "Check data contracts, cold reload and closed-loop rollout evidence against the requirement."],
  ["RELEASE", "Review the candidate and its evidence. Qualify the version or retain the incumbent."],
  ["DEPLOY", "Load the qualified policy into the approved simulator runtime and verify compatibility."],
  ["OPERATE", "Run the assigned task with the selected policy and record actual execution outcomes."],
  ["MONITOR", "Inspect failures, latency and regressions. Feed one evidence-backed change into the next plan."]
];
const cycleDuration = 24000;
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
  document.querySelectorAll("[data-segment]").forEach(segment => segment.classList.toggle("is-current", Number(segment.dataset.segment) === index));
  document.getElementById("stage-count").textContent = `0${index + 1} / ${stages[index][0]}`;
  document.getElementById("stage-description").textContent = stages[index][1];
}
function updateLoop() {
  const progress = (loopTime % cycleDuration) / cycleDuration;
  const point = loopPath.getPointAtLength(progress * loopLength);
  for (const dot of [beacon, halo]) { dot.setAttribute("cx", point.x); dot.setAttribute("cy", point.y); }
  flow.style.strokeDashoffset = String(-loopTime / 90);
  const stage = Math.floor(progress * stages.length);
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
  loopTime = Number(button.dataset.stage) * cycleDuration / stages.length;
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
    ctx.fillStyle = `rgb(${18 + shine * 127},${25 + shine * 145},${15 + shine * 39})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(217,255,67,${.14 + light * .38})`;
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
