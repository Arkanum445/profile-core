const form = document.getElementById("profileForm");

const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");

const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const btnLoad = document.getElementById("btnLoad");
const btnClear = document.getElementById("btnClear");

const preview = document.getElementById("preview");
const navStatus = document.getElementById("navStatus");

const loveChips = document.getElementById("loveChips");
const loveHidden = document.getElementById("lenguajes");

const STORAGE_KEY = "profile-core:aurora-rose:v1";

let step = 1;
const total = 4;
let selected = [];

function $(sel){ return document.querySelector(sel); }
function status(msg){ if (navStatus) navStatus.textContent = msg || ""; }

function setStep(next) {
  step = Math.max(1, Math.min(total, next));

  document.querySelectorAll(".step").forEach(s => {
    const n = Number(s.dataset.step);
    s.classList.toggle("is-active", n === step);
  });

  const pct = Math.round((step / total) * 100);
  progressFill.style.width = `${pct}%`;
  progressText.textContent = `Paso ${step} / ${total}`;

  btnPrev.style.visibility = step === 1 ? "hidden" : "visible";
  btnNext.style.display = step === total ? "none" : "inline-flex";
}

function validateStep1() {
  const nombre = String(form.nombre?.value || "").trim();
  const msgEl = document.querySelector('[data-for="nombre"]');
  if (!nombre) {
    if (msgEl) msgEl.textContent = "Este campo es obligatorio.";
    form.nombre?.focus();
    return false;
  }
  if (msgEl) msgEl.textContent = "";
  return true;
}

loveChips?.addEventListener("click", (e) => {
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

btnPrev.addEventListener("click", () => {
  status("");
  setStep(step - 1);
});

btnNext.addEventListener("click", () => {
  status("");
  if (step === 1 && !validateStep1()) return;
  setStep(step + 1);
});

function collect() {
  const fd = new FormData(form);
  const obj = {};
  for (const [k, v] of fd.entries()) obj[k] = String(v || "").trim();
  obj.lenguajes = loveHidden.value || "";
  obj._savedAt = new Date().toISOString();
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
  status("");

  if (!validateStep1()) {
    setStep(1);
    return;
  }

  const data = collect();
  saveLocal(data);
  showPreview(data);
  status("Guardado.");
});

btnLoad.addEventListener("click", () => {
  const data = loadLocal();
  if (!data) {
    status("No hay datos guardados.");
    return;
  }
  fill(data);
  showPreview(data);
  status("Cargado.");
});

btnClear.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  preview.classList.add("is-hidden");
  preview.textContent = "";
  status("Local data cleared.");
});

setStep(1);

const existing = loadLocal();
if (existing) {
  fill(existing);
  showPreview(existing);
}
