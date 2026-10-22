"use strict";
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const onboardingPrompt = "You are joining TALOS in the private siemens_healthineers team repository. Your task now is complete project onboarding: read the research, learn the branding, inspect the current project and report your understanding. This is a complete assignment. Do not ask me to supply a separate task.\n\n1. Read README.md and any applicable AGENTS.md/local instructions. Run git status --short and identify the current branch. Preserve all teammate changes and untracked files. Run git fetch origin once. Do not switch branches, merge, reset or overwrite files just to read the guides. If repository access or a required branch is unavailable, report the exact blocker rather than guessing.\n\n2. Read the complete research from origin/research. Start with:\ngit show origin/research:docs/research/START_HERE.md\ngit show origin/research:docs/research/SIEMENS_C2_MASTER_RESEARCH.md\ngit show origin/research:docs/research/SIEMENS_C2_SLIDE_REFERENCE.md\nUse git ls-tree -r --name-only origin/research -- docs/research to discover any additional tracked Markdown research files and read them with git show origin/research:<path>. Read every section, using bounded chunks when needed so tool-output limits do not silently skip content. Read each file once; do not automatically crawl every external paper or archive.\n\n3. Read all branding guidance from origin/branding. Start with:\ngit show origin/branding:docs/design/START_HERE.md\ngit show origin/branding:docs/design/README.md\nUse git ls-tree -r --name-only origin/branding -- docs/design to discover and read every tracked Markdown file there with git show origin/branding:<path>. This onboarding explicitly requires the full research and design guidance; short-brief-only defaults apply to later focused tasks. Also inspect origin/branding:web/team-guide/README.md and the manual's index.html, styles.css and app.js to understand the implemented design and motion.\n\n4. Inspect the current local project structure and relevant code without assuming the research inventory is current. Distinguish organizer requirements, proposals, implemented features and unverified results. Learn the five-stage learning pipeline, acceptance evidence, iterative V-model/DevOps workflow, model compatibility and evaluation/release rules. Follow current user decisions and organizer instructions over older proposals. Use TALOS branding consistently: the implemented team manual is dark charcoal/copper with editorial typography and purposeful free native motion; the proposed operational workbench is a distinct surface. Preserve reduced-motion support, pause controls, responsive layouts and truthful states. Follow the documented confidentiality, tool/data authorization and MIT/Apache dependency rules. Keep private data and assets out of public services and commits.\n\n5. Finish by giving a concise onboarding report: files/branch revisions actually read; your understanding of the pipeline and definition of done; branding/motion rules you will follow; what exists versus what is proposed; and concrete blockers or contradictions. Do not claim unread files or unrun checks as completed. Do not start unrelated implementation, training, package installation or deployment during onboarding. If I already assigned a separate implementation task in this conversation, apply what you learned and continue it; otherwise conclude that onboarding is complete and you are ready. No placeholder needs filling in.";
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
