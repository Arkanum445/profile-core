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
const glows = [];

class Glow {
  constructor(){ this.reset(true); }
  reset(initial=false){
    this.x = rand(0, w);
    this.y = rand(0, h);
    this.r = rand(120, 260);
    this.a = rand(0.035, 0.08);
    this.vx = rand(-0.05, 0.05);
    this.vy = rand(-0.05, 0.05);
  }
  update(){
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < -300 || this.x > w + 300 || this.y < -300 || this.y > h + 300) this.reset(false);
  }
  draw(){
    const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
    g.addColorStop(0, `rgba(255, 96, 168, ${this.a})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0,0,w,h);
  }
}

class Heart {
  constructor(){ this.reset(true); }
  reset(initial=false){
    this.x = rand(0, w);
    this.y = initial ? rand(0, h) : h + rand(40, 220);
    this.vy = rand(0.25, 0.60);
    this.vx = rand(-0.12, 0.12);
    this.size = rand(10, 16);
    this.alpha = rand(0.05, 0.12);
    this.phase = rand(0, Math.PI * 2);
  }
  update(){
    this.y -= this.vy;
    this.x += this.vx + Math.sin(this.phase) * 0.22;
    this.phase += 0.02;
    if (this.y < -40) this.reset(false);
  }
  draw(){
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
    ctx.fillStyle = `rgba(255, 96, 168, ${this.alpha})`;
    ctx.fill();
    ctx.restore();
  }
}

for (let i=0;i<5;i++) glows.push(new Glow());
for (let i=0;i<40;i++) hearts.push(new Heart());

let t = 0;

function petal(a, k){
  const r = 120 * Math.sin(k * a);
  return { x: r * Math.cos(a), y: r * Math.sin(a) };
}

function drawRose(){
  const cx = w * 0.5;
  const cy = h * 0.40;

  ctx.save();
  ctx.translate(cx, cy);

  ctx.beginPath();
  const k = 7;
  for (let a = 0; a < Math.PI * 2 + 0.03; a += 0.02) {
    const p = petal(a + t, k);
    ctx.lineTo(p.x, p.y);
  }
  ctx.strokeStyle = "rgba(255, 230, 198, 0.10)";
  ctx.lineWidth = 1.1;
  ctx.stroke();

  ctx.beginPath();
  const k2 = 10;
  for (let a = 0; a < Math.PI * 2 + 0.03; a += 0.02) {
    const p = petal(a - t * 0.65, k2);
    ctx.lineTo(p.x * 0.72, p.y * 0.72);
  }
  ctx.strokeStyle = "rgba(110, 220, 255, 0.08)";
  ctx.lineWidth = 1.0;
  ctx.stroke();

  ctx.restore();
}

function frame(){
  ctx.clearRect(0,0,w,h);

  glows.forEach(g => { g.update(); g.draw(); });
  hearts.forEach(hh => { hh.update(); hh.draw(); });

  drawRose();

  t += 0.002;
  requestAnimationFrame(frame);
}

frame();
