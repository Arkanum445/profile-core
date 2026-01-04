const form = document.getElementById("profileForm");

const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");

const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const btnSave = document.getElementById("btnSave");

const btnLoad = document.getElementById("btnLoad");
const preview = document.getElementById("preview");

const saveStatus = document.getElementById("saveStatus");
const navStatus = document.getElementById("navStatus");

const loveChips = document.getElementById("loveChips");
const loveHidden = document.getElementById("lenguajes");

const STORAGE_KEY = "profile-core:v1";

let currentStep = 1;
const totalSteps = 4;

let selected = [];

function setStatus(el, msg) {
  if (!el) return;
  el.textContent = msg || "";
}

function setStep(n) {
  currentStep = Math.max(1, Math.min(totalSteps, n));

  document.querySelectorAll(".step").forEach(s => {
    const step = Number(s.dataset.step);
    s.classList.toggle("is-hidden", step !== currentStep);
  });

  const pct = Math.round((currentStep / totalSteps) * 100);
  progressFill.style.width = `${pct}%`;
  progressText.textContent = `Step ${currentStep} of ${totalSteps}`;

  btnPrev.disabled = currentStep === 1;

  const isLast = currentStep === totalSteps;
  btnNext.classList.toggle("is-hidden", isLast);
  btnSave.classList.toggle("is-hidden", !isLast);
}

btnPrev.addEventListener("click", () => setStep(currentStep - 1));
btnNext.addEventListener("click", () => setStep(currentStep + 1));

loveChips.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;

  const val = chip.dataset.val;
  const i = selected.indexOf(val);

  if (i >= 0) {
    selected.splice(i, 1);
    chip.classList.remove("active");
  } else {
    if (selected.length >= 2) return;
    selected.push(val);
    chip.classList.add("active");
  }

  loveHidden.value = selected.join(" | ");
});

function collect() {
  const fd = new FormData(form);
  const obj = {};
  for (const [k, v] of fd.entries()) obj[k] = String(v || "").trim();
  obj.lenguajes = loveHidden.value || "";
  return obj;
}

function fill(data) {
  if (!data) return;

  for (const [k, v] of Object.entries(data)) {
    const el = form.querySelector(`[name="${k}"]`);
    if (el && el.type !== "hidden") el.value = v ?? "";
  }

  const raw = String(data.lenguajes || "")
    .split("|")
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 2);

  selected = raw;
  loveHidden.value = selected.join(" | ");

  document.querySelectorAll(".chip").forEach(c => {
    c.classList.toggle("active", selected.includes(c.dataset.val));
  });
}

function showPreview(data) {
  if (!data) return;
  preview.classList.remove("is-hidden");
  preview.textContent = JSON.stringify(data, null, 2);
}

function saveLocal(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadLocal() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  setStatus(navStatus, "");

  const nombre = String(form.nombre?.value || "").trim();
  if (!nombre) {
    setStatus(navStatus, "Name / Alias is required.");
    setStep(1);
    form.nombre?.focus();
    return;
  }

  const data = collect();
  saveLocal(data);

  if (saveStatus) saveStatus.textContent = "Saved locally. Cloud sync will be added in the next phase.";
  setStatus(navStatus, "Saved.");
  showPreview(data);
});

btnLoad.addEventListener("click", () => {
  const data = loadLocal();
  if (!data) {
    setStatus(navStatus, "No local data found.");
    return;
  }
  fill(data);
  setStatus(navStatus, "Loaded.");
  showPreview(data);
});

setStep(1);

const existing = loadLocal();
if (existing) {
  fill(existing);
  showPreview(existing);
}
