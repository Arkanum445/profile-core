const form = document.getElementById("profileForm");

const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");

const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const btnLoad = document.getElementById("btnLoad");
const btnClear = document.getElementById("btnClear");

const btnView = document.getElementById("btnView");
const btnEdit = document.getElementById("btnEdit");
const btnDebug = document.getElementById("btnDebug");

const prettyView = document.getElementById("prettyView");
const tiles = document.getElementById("tiles");
const preview = document.getElementById("preview");

const navStatus = document.getElementById("navStatus");

const loveChips = document.getElementById("loveChips");
const loveHidden = document.getElementById("lenguajes");

const STORAGE_KEY = "profile-core:pretty:v1";

let step = 1;
const total = 4;
let selected = [];
let debugOn = false;

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

function saveLocal(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadLocal() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function v(x){
  const s = String(x || "").trim();
  return s ? s : "—";
}

function renderTiles(data){
  const groups = [
    { title: "Identidad", items: [
      ["Nombre / Apodo", v(data.nombre)],
      ["Cumpleaños", v(data.cumple)],
      ["Color favorito", v(data.colorFav)],
      ["Estado", v(data.mood)],
      ["Frase", v(data.frase)]
    ]},
    { title: "Preferencias", items: [
      ["Comidas favoritas", v(data.comidas)],
      ["No le gusta", v(data.noComidas)],
      ["Bebidas", v(data.bebidas)],
      ["Postres", v(data.postres)],
      ["Música", v(data.musica)],
      ["Series / Películas", v(data.series)]
    ]},
    { title: "Relación", items: [
      ["Lenguajes", v(data.lenguajes)],
      ["Cuando estoy mal, necesito", v(data.triste)],
      ["Me siento cuidada cuando", v(data.amada)],
      ["Plan ideal", v(data.citaIdeal)]
    ]},
    { title: "Límites", items: [
      ["Incomoda", v(data.incomoda)],
      ["Evitar", v(data.evitar)],
      ["Meta", v(data.sueno)],
      ["Notas", v(data.extra)]
    ]}
  ];

  tiles.innerHTML = "";
  for (const g of groups){
    const div = document.createElement("div");
    div.className = "tile";
    const h3 = document.createElement("h3");
    h3.textContent = g.title;

    const body = document.createElement("p");
    body.textContent = g.items.map(([k,val]) => `${k}: ${val}`).join("\n");

    div.appendChild(h3);
    div.appendChild(body);
    tiles.appendChild(div);
  }
}

function showPretty(data){
  if (!data) return;

  prettyView.classList.remove("is-hidden");
  renderTiles(data);

  preview.textContent = JSON.stringify(data, null, 2);
  preview.classList.toggle("is-hidden", !debugOn);
}

function hidePretty(){
  prettyView.classList.add("is-hidden");
}

btnView.addEventListener("click", () => {
  const data = loadLocal();
  if (!data) { status("No hay datos guardados."); return; }
  showPretty(data);
  status("");
});

btnEdit.addEventListener("click", () => {
  hidePretty();
  status("");
});

btnDebug.addEventListener("click", () => {
  debugOn = !debugOn;
  preview.classList.toggle("is-hidden", !debugOn);
});

btnLoad.addEventListener("click", () => {
  const data = loadLocal();
  if (!data) { status("No hay datos guardados."); return; }
  fill(data);
  showPretty(data);
  status("Cargado.");
});

btnClear.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  tiles.innerHTML = "";
  preview.textContent = "";
  hidePretty();
  status("Borrado.");
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  status("");

  if (!validateStep1()) {
    setStep(1);
    return;
  }

  const data = collect();
  saveLocal(data);
  showPretty(data);
  status("Guardado.");
});

setStep(1);

const existing = loadLocal();
if (existing) {
  fill(existing);
  showPretty(existing);
}
