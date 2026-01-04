const canvas = document.getElementById("fx");
const ctx = canvas.getContext("2d", { alpha: true });

let w = 0, h = 0, dpr = 1;

function resize() {
  dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
  w = Math.floor(window.innerWidth);
  h = Math.floor(window.innerHeight);
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resize, { passive: true });
resize();

function rand(a, b) { return a + Math.random() * (b - a); }

const hearts = [];
const sparks = [];

class Heart {
  constructor() { this.reset(true); }
  reset(initial=false) {
    this.x = rand(0, w);
    this.y = initial ? rand(0, h) : h + rand(30, 200);
    this.vy = rand(0.25, 0.65);
    this.vx = rand(-0.18, 0.18);
    this.size = rand(10, 18);
    this.alpha = rand(0.05, 0.14);
    this.phase = rand(0, Math.PI * 2);
  }
  update() {
    this.y -= this.vy;
    this.x += this.vx + Math.sin(this.phase) * 0.25;
    this.phase += 0.02;
    if (this.y < -40) this.reset(false);
  }
  draw() {
    const a = this.alpha;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.size / 18, this.size / 18);
    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.bezierCurveTo(0, -4, -10, -4, -10, 3);
    ctx.bezierCurveTo(-10, 12, 0, 15, 0, 22);
    ctx.bezierCurveTo(0, 15, 10, 12, 10, 3);
    ctx.bezierCurveTo(10, -4, 0, -4, 0, 5);
    ctx.closePath();
    ctx.fillStyle = `rgba(255, 92, 168, ${a})`;
    ctx.fill();
    ctx.restore();
  }
}

class Spark {
  constructor() { this.reset(true); }
  reset(initial=false) {
    this.x = rand(0, w);
    this.y = initial ? rand(0, h) : rand(h * 0.2, h * 0.9);
    this.r = rand(0.8, 2.0);
    this.alpha = rand(0.04, 0.12);
    this.vx = rand(-0.08, 0.08);
    this.vy = rand(-0.06, 0.06);
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < -20 || this.x > w + 20 || this.y < -20 || this.y > h + 20) this.reset(false);
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 208, 255, ${this.alpha})`;
    ctx.fill();
  }
}

for (let i = 0; i < 55; i++) hearts.push(new Heart());
for (let i = 0; i < 90; i++) sparks.push(new Spark());

let t = 0;

function petalPoint(a, k) {
  const r = 130 * Math.sin(k * a);
  return { x: r * Math.cos(a), y: r * Math.sin(a) };
}

function drawRose() {
  const cx = w * 0.5;
  const cy = h * 0.42;

  ctx.save();
  ctx.translate(cx, cy);

  ctx.beginPath();
  const k = 6;
  for (let a = 0; a < Math.PI * 2 + 0.03; a += 0.02) {
    const p = petalPoint(a + t, k);
    ctx.lineTo(p.x, p.y);
  }

  ctx.strokeStyle = "rgba(164, 112, 255, 0.22)";
  ctx.lineWidth = 1.25;
  ctx.stroke();

  ctx.beginPath();
  const k2 = 9;
  for (let a = 0; a < Math.PI * 2 + 0.03; a += 0.02) {
    const p = petalPoint(a - t * 0.7, k2);
    ctx.lineTo(p.x * 0.72, p.y * 0.72);
  }

  ctx.strokeStyle = "rgba(255, 92, 168, 0.16)";
  ctx.lineWidth = 1.0;
  ctx.stroke();

  ctx.restore();
}

function frame() {
  ctx.clearRect(0, 0, w, h);

  sparks.forEach(s => { s.update(); s.draw(); });
  hearts.forEach(hh => { hh.update(); hh.draw(); });

  drawRose();

  t += 0.0022;
  requestAnimationFrame(frame);
}

frame();
