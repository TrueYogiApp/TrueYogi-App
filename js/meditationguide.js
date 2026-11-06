 

window.startMeditationGuideAnimation = startMeditationGuideAnimation;
window.stopMeditationGuideAnimation = stopMeditationGuideAnimation;

let animationFrameId = null;
let ctx = null;
let running = false;
let state = "inhale";
let stateStart = 0;
let holdParticles = [];

const NUM_PARTICLES = 32; // number of particles for shimmer
const inhaleDuration = 6000;           // ms (6 sec)
const holdAfterInhaleDuration = 3500;  // ms (3.5 sec)
const exhaleDuration = 5000;           // ms (5 sec)
const holdAfterExhaleDuration = 5500;  // ms (5.5 sec)

const minRadius = 38;
const maxRadius = 78;

let timerDuration = 60; // seconds in each loop
let timerStart = null;

function lerp(a, b, t) { return a + (b - a) * t; }

function drawFrame(now) {
  if (!ctx) return;
  if (!stateStart) stateStart = now;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

if (state === "hold_inhale" || state === "hold_exhale") {
    if (holdParticles.length === 0) {
      initParticles(ctx.canvas); // create when entering hold
    }
    updateParticles(ctx.canvas, now);
    // draw
    for (let p of holdParticles) {
      ctx.save();
      ctx.globalAlpha = p.currentAlpha || p.alpha;
      let grad = ctx.createRadialGradient(p.x, p.y, 0.1, p.x, p.y, p.r*2.2);
      grad.addColorStop(0, "#fffbdb");
      grad.addColorStop(0.3, "#ffe066");
      grad.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
      ctx.fillStyle = grad;
      ctx.shadowColor = "#fffbe0";
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.restore();
    }
} else {
    holdParticles = []; // clear particles on state exit
}

  let radius, alpha;
  let elapsed = now - stateStart;
  if (state === "inhale") {
    let p = Math.min(1, elapsed / inhaleDuration);
    radius = lerp(minRadius, maxRadius, p);
    alpha = lerp(0.61, 1.0, p);
    if (elapsed >= inhaleDuration) {
      state = "hold_inhale";
      stateStart = now;
    }
  } else if (state === "hold_inhale") {
    radius = maxRadius;
    alpha = 1.0;
    if (elapsed >= holdAfterInhaleDuration) {
      state = "exhale";
      stateStart = now;
    }
  } else if (state === "exhale") {
    let p = Math.min(1, elapsed / exhaleDuration);
    radius = lerp(maxRadius, minRadius, p);
    alpha = lerp(1.0, 0.61, p);
    if (elapsed >= exhaleDuration) {
      state = "hold_exhale";
      stateStart = now;
    }
  } else if (state === "hold_exhale") {
    radius = minRadius;
    alpha = 0.61;
    if (elapsed >= holdAfterExhaleDuration) {
      state = "inhale";
      stateStart = now;
    }
  }

  // ...drawing code stays the same...
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.arc(ctx.canvas.width / 2, ctx.canvas.height / 2, radius, 0, 2 * Math.PI);
  ctx.fillStyle = '#ffed80';
  ctx.shadowColor = '#ffe066';
  ctx.shadowBlur = 30;
  ctx.fill();
  ctx.restore();

 
ctx.save();
ctx.font = "bold 20px sans-serif";
ctx.fillStyle = '#ffe066';
ctx.textAlign = "center";
ctx.textBaseline = "middle";  // Better for complex scripts

let labelKey = state === "inhale" ? "Inhale"
             : state === "exhale" ? "Exhale"
             : "Hold2";

let label = t(labelKey);

// Telugu often needs more space - use a slightly smaller font
let currentFontSize = 18;  // Reduced from 20 for Telugu
let minFontSize = 12;

ctx.font = `bold ${currentFontSize}px sans-serif`;
let metrics = ctx.measureText(label);

// For Telugu, add extra padding because measureText underestimates width
let estimatedWidth = metrics.width * 1.15;  // 15% extra for Telugu characters
let maxWidth = ctx.canvas.width - 40;

while (estimatedWidth > maxWidth && currentFontSize > minFontSize) {
    currentFontSize--;
    ctx.font = `bold ${currentFontSize}px sans-serif`;
    metrics = ctx.measureText(label);
    estimatedWidth = metrics.width * 1.15;
}

// Draw with some top padding to avoid clipping
ctx.globalAlpha = 1;
ctx.shadowColor = "#222";
ctx.shadowBlur = 8;
ctx.fillText(label, ctx.canvas.width/2, 45);  // Moved down slightly from 40 to 45
ctx.restore();

// Inside drawFrame:
if (timerStart) {
  let elapsedSecs = Math.floor((Date.now() - timerStart) / 1000);
  let left = timerDuration - (elapsedSecs % timerDuration);
  let m = Math.floor(left / 60);
  let s = left % 60;
  document.getElementById('breath-timer').textContent = m + ":" + (s < 10 ? "0" : "") + s;
}

  animationFrameId = requestAnimationFrame(drawFrame);
}

function startMeditationGuideAnimation() {
  if (running) return;
  const canvas = document.getElementById('medGuideCanvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  running = true;
  state = "inhale";
  stateStart = 0;
  animationFrameId = requestAnimationFrame(drawFrame);
  timerStart = Date.now();
}

function stopMeditationGuideAnimation() {
  running = false;
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  animationFrameId = null;
  if (ctx) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx = null;
  stateStart = 0;
}

function createParticle(canvas) {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: 0.9 + Math.random() * 1.2,
    alpha: 0.5 + Math.random() * 0.5,
    angle: Math.random() * 2 * Math.PI,
    speed: 0.2 + Math.random() * 0.14,
    twinkle: Math.random() * 2 * Math.PI, // phase offset for shimmer
  };
}

function initParticles(canvas) {
  holdParticles = [];
  for (let i = 0; i < NUM_PARTICLES; i++) {
    holdParticles.push(createParticle(canvas));
  }
}

function updateParticles(canvas, now) {
  for (let p of holdParticles) {
    p.x += Math.cos(p.angle) * p.speed;
    p.y += Math.sin(p.angle) * p.speed;
    // bounce off edges
    if (p.x < 0 || p.x > canvas.width) p.angle = Math.PI - p.angle;
    if (p.y < 0 || p.y > canvas.height) p.angle = -p.angle;
    // twinkle by time
    p.currentAlpha = p.alpha * (0.7 + 0.5 * Math.sin(now * 0.002 + p.twinkle));
  }
}
