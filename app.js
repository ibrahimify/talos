"use strict";
const prompts = {
  research: "In the team repo, fetch origin once. Read only origin/research:docs/research/START_HERE.md first (use git show). For my task, open only relevant sections it points to; do not ingest the full report. Preserve teammates' changes. Implement and verify the smallest useful slice. My task is: ",
  branding: "In the team repo, fetch origin once. Read only origin/branding:docs/design/START_HERE.md first (use git show). Open only the design files needed for my task; do not read the whole branch. Reuse its tokens and motion rules, preserve teammates' changes, and verify the result. My task is: ",
  both: "In the team repo, fetch origin once. Use git show to read only docs/research/START_HERE.md from origin/research and docs/design/START_HERE.md from origin/branding. Follow their decisions; open only task-relevant details. Skip full reports, archives and unrelated files. Preserve teammates' changes and verify the smallest useful slice. My task is: "
};
const promptText = document.getElementById("prompt-text");
const copyButton = document.getElementById("copy-prompt");
const status = document.getElementById("copy-status");
let selectedPrompt = "research";
let copyReset;
function showPrompt(key) {
  selectedPrompt = key;
  promptText.textContent = prompts[key];
  document.getElementById("prompt-size").textContent = `${prompts[key].trim().split(/\s+/).length} WORDS`;
  document.querySelectorAll("[data-prompt]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.prompt === key)));
  clearTimeout(copyReset);
  copyButton.textContent = "Copy prompt ⧉";
  status.textContent = "";
}
document.querySelectorAll("[data-prompt]").forEach(button => button.addEventListener("click", () => showPrompt(button.dataset.prompt)));
copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(prompts[selectedPrompt]);
    copyButton.textContent = "Copied ✓";
    status.textContent = "Prompt copied. Append your task before sending.";
    copyReset = setTimeout(() => { copyButton.textContent = "Copy prompt ⧉"; }, 2200);
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(promptText);
    selection.removeAllRanges();
    selection.addRange(range);
    status.textContent = "Copy is unavailable. The prompt is selected; use your device's copy command.";
    copyButton.textContent = "Select & copy text";
  }
});
showPrompt(selectedPrompt);

const stages = [
  ["DEFINE", "Agree on the smallest useful behavior and the evidence that would demonstrate it."],
  ["BUILD", "Implement one compatible slice. Record the dataset version, configuration and dependencies."],
  ["VERIFY", "Replay data and evaluate closed-loop rollouts. Check the result against the original requirement."],
  ["RELEASE", "Version the complete checkpoint and evaluation evidence. Promote only a qualified candidate."],
  ["LEARN", "Review failures, keep the incumbent if results regress, and choose one change for the next cycle."]
];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const playButton = document.getElementById("play");
let currentStage = 0;
let timer = null;
function showStage(index) {
  currentStage = index;
  document.querySelectorAll("[data-stage]").forEach(button => {
    const active = Number(button.dataset.stage) === index;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  document.getElementById("stage-count").textContent = `0${index + 1} / ${stages[index][0]}`;
  document.getElementById("stage-description").textContent = stages[index][1];
  document.getElementById("progress").style.width = `${index * 25}%`;
}
function pause() {
  clearInterval(timer);
  timer = null;
  playButton.textContent = "Play workflow ▷";
  playButton.setAttribute("aria-pressed", "false");
}
playButton.addEventListener("click", () => {
  if (timer) { pause(); return; }
  showStage((currentStage + 1) % stages.length);
  timer = setInterval(() => showStage((currentStage + 1) % stages.length), 2800);
  playButton.textContent = "Pause workflow Ⅱ";
  playButton.setAttribute("aria-pressed", "true");
});
document.querySelectorAll("[data-stage]").forEach(button => button.addEventListener("click", () => { pause(); showStage(Number(button.dataset.stage)); }));
document.addEventListener("visibilitychange", () => { if (document.hidden) pause(); });
reducedMotion.addEventListener("change", pause);
