const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const heartsEl = document.getElementById('hearts');
const highscoreEl = document.getElementById('highscore');
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('startBtn');
const musicBtn = document.getElementById('musicBtn');
const overlayMusicBtn = document.getElementById('overlayMusicBtn');
const bgMusic = document.getElementById('bgMusic');
const touchControls = document.getElementById('touchControls');
const flapBtn = document.getElementById('flapBtn');
const joystick = document.getElementById('joystick');
const stick = document.getElementById('stick');

const W = canvas.width;
const H = canvas.height;
const highscoreKey = 'moewenpikHighscoreV5';
let highscore = Number(localStorage.getItem(highscoreKey) || 0);
highscoreEl.textContent = highscore;

let state = 'start';
let frame = 0;
let score = 0;
let health = 6; // 6 = drei volle Herzen, 1 = halbes Herz
let snackStreak = 0;
let level = 1;
let speed = 5.2;
let invincible = 0;
let snacks = [];
let tourists = [];
let clouds = [];
let birds = [];
let grass = [];
let particles = [];
let musicOn = false;

const input = { joyX: 0, joyY: 0, flapHeld: false, keys: new Set(), joyPointer: null };
const gull = {
  x: 205,
  y: 330,
  vx: 0,
  vy: 0,
  rot: 0,
  lift: 0,
  r: 30,
  energy: 1,
  flapPulse: 0
};

function resetGame() {
  state = 'playing';
  frame = 0;
  score = 0;
  health = 6;
  snackStreak = 0;
  level = 1;
  speed = 5.2;
  invincible = 0;
  snacks = [];
  tourists = [];
  particles = [];
  clouds = Array.from({length: 8}, (_, i) => ({ x: i * 190 + Math.random() * 100, y: 55 + Math.random() * 125, s: .65 + Math.random() * .8 }));
  birds = Array.from({length: 5}, (_, i) => ({ x: i * 260 + Math.random() * 150, y: 80 + Math.random() * 160, s: .6 + Math.random() * .6 }));
  grass = Array.from({length: 50}, (_, i) => ({ x: i * 34 + Math.random() * 20, h: 18 + Math.random() * 28, lean: Math.random() * 8 }));
  Object.assign(gull, { x: 205, y: 330, vx: 0, vy: 0, rot: 0, lift: 0, energy: 1, flapPulse: 0 });
  updateHud();
  overlay.classList.add('hidden');
  touchControls.classList.remove('hidden');
  startBtn.textContent = 'Spiel starten';
}

function updateHud() {
  scoreEl.textContent = score;
  levelEl.textContent = level;
  highscoreEl.textContent = highscore;
  heartsEl.textContent = Array.from({ length: 3 }, (_, i) => {
    const v = health - i * 2;
    return v >= 2 ? '♥' : (v === 1 ? '◐' : '♡');
  }).join(' ');
}

function startGameFromButton() {
  resetGame();
  if (musicOn) bgMusic.play().catch(() => {});
}

function flap() {
  if (state === 'start' || state === 'gameover') { startGameFromButton(); return; }
  gull.flapPulse = 11;
  gull.energy = Math.max(0, gull.energy - .035);
  gull.vy -= 1.75 + gull.energy * 1.65;
  gull.vx += .55;
  burst(gull.x - 38, gull.y + 14, 'rgba(255,255,255,.8)', 6);
}

function spawnSnack() {
  const isBurger = Math.random() > .55;
  snacks.push({
    x: W + 55,
    y: 230 + Math.random() * 265,
    r: isBurger ? 24 : 21,
    type: isBurger ? 'burger' : 'glace',
    value: isBurger ? 15 : 10,
    wobble: Math.random() * Math.PI * 2
  });
}

function spawnTourist() {
  const kinds = ['schirm', 'hand', 'handy'];
  tourists.push({
    x: W + 90,
    y: 570,
    w: 58,
    h: 148,
    phase: Math.random() * Math.PI * 2,
    kind: kinds[Math.floor(Math.random() * kinds.length)],
    shirt: ['#ffdc69', '#83c9f4', '#ff9878', '#a4db78'][Math.floor(Math.random() * 4)],
    angry: false,
    cooldown: 30 + Math.random() * 45,
    swatWindow: 0
  });
}

function roundedRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#9eddf9');
  sky.addColorStop(.42, '#eafaff');
  sky.addColorStop(.43, '#2f9dc3');
  sky.addColorStop(.62, '#117fa8');
  sky.addColorStop(.63, '#ecd092');
  sky.addColorStop(1, '#d6aa69');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  drawSun(); drawClouds(); drawSea(); drawDunes(); drawBoardwalk(); drawSyltDetails();
}

function drawSun() {
  const grd = ctx.createRadialGradient(1060, 92, 10, 1060, 92, 92);
  grd.addColorStop(0, 'rgba(255,244,156,.95)');
  grd.addColorStop(1, 'rgba(255,244,156,0)');
  ctx.fillStyle = grd; ctx.fillRect(960, 0, 220, 190);
  ctx.fillStyle = '#fff19d'; ctx.beginPath(); ctx.arc(1060, 92, 38, 0, Math.PI * 2); ctx.fill();
}

function drawClouds() {
  ctx.fillStyle = 'rgba(255,255,255,.78)';
  for (const c of clouds) { c.x -= speed * .1; if (c.x < -130) { c.x = W + Math.random() * 140; c.y = 45 + Math.random() * 125; } drawCloud(c.x, c.y, c.s); }
  ctx.strokeStyle = 'rgba(23,48,66,.55)'; ctx.lineWidth = 3;
  for (const b of birds) { b.x -= speed * .16; if (b.x < -50) { b.x = W + Math.random() * 150; b.y = 70 + Math.random() * 160; } ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.quadraticCurveTo(b.x + 14 * b.s, b.y - 10 * b.s, b.x + 28 * b.s, b.y); ctx.moveTo(b.x + 28 * b.s, b.y); ctx.quadraticCurveTo(b.x + 42 * b.s, b.y - 10 * b.s, b.x + 56 * b.s, b.y); ctx.stroke(); }
}
function drawCloud(x, y, s) { ctx.beginPath(); ctx.arc(x, y, 24*s, 0, Math.PI * 2); ctx.arc(x + 25*s, y - 9*s, 32*s, 0, Math.PI * 2); ctx.arc(x + 60*s, y, 25*s, 0, Math.PI * 2); ctx.arc(x + 31*s, y + 13*s, 32*s, 0, Math.PI * 2); ctx.fill(); }

function drawSea() {
  ctx.strokeStyle = 'rgba(255,255,255,.72)'; ctx.lineWidth = 5;
  for (let i = 0; i < 7; i++) { const y = 330 + i * 22; ctx.beginPath(); for (let x = -50; x < W + 50; x += 26) { const wave = Math.sin((x + frame * 2.1 + i * 39) / 36) * 5; if (x === -50) ctx.moveTo(x, y + wave); else ctx.lineTo(x, y + wave); } ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,255,255,.82)'; ctx.fillRect(0, 447, W, 5);
}

function drawDunes() {
  ctx.fillStyle = '#d6bd77'; ctx.beginPath(); ctx.moveTo(0, 475); for (let x = 0; x <= W; x += 90) ctx.quadraticCurveTo(x + 45, 440 + Math.sin(x / 90) * 14, x + 90, 475); ctx.lineTo(W, 560); ctx.lineTo(0, 560); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#698b44'; ctx.lineWidth = 4;
  for (const g of grass) { const gx = (g.x - (frame * speed * .28 % 1700)); const x = gx < -30 ? gx + 1700 : gx; const y = 512 + Math.sin(x * .02) * 12; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + g.lean, y - g.h); ctx.stroke(); }
}

function drawBoardwalk() {
  ctx.save(); ctx.translate(0, 535);
  const wood = ctx.createLinearGradient(0, 0, 0, 160); wood.addColorStop(0, '#d19a5b'); wood.addColorStop(1, '#9a6234'); ctx.fillStyle = wood; ctx.fillRect(0, 0, W, 160);
  ctx.strokeStyle = '#6e4527'; ctx.lineWidth = 4;
  for (let y = 18; y < 150; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y + Math.sin(y) * 2); ctx.stroke(); }
  for (let x = -((frame * speed) % 105); x < W + 105; x += 105) { ctx.fillStyle = 'rgba(80,45,22,.24)'; ctx.fillRect(x, 0, 9, 160); ctx.fillStyle = '#53351f'; ctx.beginPath(); ctx.arc(x + 28, 24, 4, 0, Math.PI * 2); ctx.arc(x + 72, 105, 4, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(0, 0, W, 20); ctx.restore();
}

function drawSyltDetails() {
  const baseX = 70 - (frame * .55 % 520);
  ctx.fillStyle = '#f8f2d6'; ctx.strokeStyle = '#173042'; ctx.lineWidth = 4; roundedRect(baseX, 470, 178, 54, 14); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#173042'; ctx.font = '900 23px system-ui'; ctx.fillText('Sylt Strand', baseX + 22, 504); ctx.fillRect(baseX + 84, 524, 12, 55);
  ctx.fillStyle = '#f7f0de'; ctx.strokeStyle = '#173042';
  for (let i = 0; i < 3; i++) { const x = 560 + i * 290 - (frame * .36 % 1200); roundedRect(x, 482, 48, 56, 8); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#e65b4d'; ctx.fillRect(x + 5, 488, 38, 13); ctx.fillStyle = '#f7f0de'; }
}

function drawGull() {
  ctx.save(); ctx.translate(gull.x, gull.y); ctx.rotate(gull.rot);
  if (invincible > 0 && Math.floor(frame / 5) % 2 === 0) ctx.globalAlpha = .55;
  const beat = Math.sin(frame / 5.5) * 8 + gull.flapPulse * 3.6;

  // Schwanzfedern
  ctx.strokeStyle = '#173042'; ctx.lineWidth = 4; ctx.fillStyle = '#e9eef0';
  ctx.beginPath(); ctx.moveTo(-48, -8); ctx.lineTo(-82, -23); ctx.lineTo(-64, 0); ctx.lineTo(-84, 22); ctx.lineTo(-45, 10); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#5f6b72';
  ctx.beginPath(); ctx.moveTo(-75, -18); ctx.lineTo(-59, -3); ctx.lineTo(-46, -7); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-78, 18); ctx.lineTo(-58, 5); ctx.lineTo(-45, 10); ctx.closePath(); ctx.fill();

  // Hinterer Flügel mit grauer Spitze
  ctx.fillStyle = '#f4f5f0'; ctx.strokeStyle = '#173042'; ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-8, -7);
  ctx.quadraticCurveTo(-56, -62 + beat, -126, -30 + beat * .75);
  ctx.quadraticCurveTo(-78, -13 + beat * .35, -10, 17);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#7d878d'; ctx.beginPath();
  ctx.moveTo(-82, -39 + beat * .7); ctx.quadraticCurveTo(-110, -38 + beat * .7, -126, -30 + beat * .75); ctx.lineTo(-86, -16 + beat * .35); ctx.closePath(); ctx.fill(); ctx.stroke();

  // Körper mit Brust und Schatten
  const body = ctx.createLinearGradient(-45, -18, 42, 22);
  body.addColorStop(0, '#dfe5e8'); body.addColorStop(.35, '#fffdf2'); body.addColorStop(1, '#f8f2df');
  ctx.fillStyle = body;
  ctx.beginPath(); ctx.ellipse(0, 0, 47, 24, -.06, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(95,107,114,.18)'; ctx.beginPath(); ctx.ellipse(-14, 11, 29, 8, -.08, 0, Math.PI * 2); ctx.fill();

  // Vorderer Flügel
  ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#173042'; ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-4, 0);
  ctx.quadraticCurveTo(-43, -82 + beat, -105, -58 + beat);
  ctx.quadraticCurveTo(-62, -35 + beat * .45, -13, 20);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#606b72';
  for (let i=0;i<4;i++) {
    ctx.beginPath();
    ctx.moveTo(-64 - i*9, -50 + beat * .8 + i*3);
    ctx.lineTo(-99 - i*2, -58 + beat + i*4);
    ctx.lineTo(-70 - i*6, -35 + beat * .55 + i*4);
    ctx.closePath(); ctx.fill();
  }

  // Kopf, Auge, Schnabel
  ctx.fillStyle = '#fffdf2'; ctx.strokeStyle = '#173042'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.ellipse(33, -16, 25, 18, -.08, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ffb13d'; ctx.beginPath(); ctx.moveTo(53, -15); ctx.lineTo(94, -8); ctx.lineTo(54, 3); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#b35f1e'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(62, -7); ctx.lineTo(89, -7); ctx.stroke();
  ctx.fillStyle = '#173042'; ctx.beginPath(); ctx.arc(39, -21, 4.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(40.5, -22.5, 1.4, 0, Math.PI * 2); ctx.fill();

  // Beine/Füsse
  ctx.strokeStyle = '#173042'; ctx.lineWidth = 4; ctx.fillStyle = '#ffb13d';
  for (const lx of [-20, 2]) {
    ctx.beginPath(); ctx.moveTo(lx, 20); ctx.lineTo(lx-6, 39); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(lx-7, 39); ctx.lineTo(lx-25, 45); ctx.lineTo(lx-4, 47); ctx.lineTo(lx+8, 42); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

function drawSnack(s) {
  ctx.save(); ctx.translate(s.x, s.y + Math.sin(frame / 10 + s.wobble) * 7); ctx.strokeStyle = '#173042'; ctx.lineWidth = 4; ctx.shadowColor = 'rgba(23,48,66,.18)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 5;
  if (s.type === 'burger') { ctx.fillStyle = '#e8a33d'; roundedRect(-26, -18, 52, 17, 9); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#6d3b22'; roundedRect(-24, -2, 48, 13, 6); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#8ad56a'; ctx.beginPath(); ctx.moveTo(-24, 10); ctx.lineTo(-11, 17); ctx.lineTo(1, 10); ctx.lineTo(15, 17); ctx.lineTo(26, 10); ctx.stroke(); ctx.fillStyle = '#f2c349'; roundedRect(-23, 15, 46, 8, 4); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#e8a33d'; roundedRect(-26, 22, 52, 15, 9); ctx.fill(); ctx.stroke(); }
  else { ctx.fillStyle = '#f28abc'; ctx.beginPath(); ctx.arc(0, -17, 18, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff2d0'; ctx.beginPath(); ctx.arc(10, -22, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#d89a4e'; ctx.beginPath(); ctx.moveTo(-17, 1); ctx.lineTo(17, 1); ctx.lineTo(0, 46); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.strokeStyle = 'rgba(90,55,28,.55)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-10, 11); ctx.lineTo(7, 33); ctx.moveTo(10, 11); ctx.lineTo(-7, 33); ctx.stroke(); }
  ctx.restore();
}

function drawTourist(t) {
  ctx.save(); ctx.translate(t.x, t.y); ctx.strokeStyle = '#173042'; ctx.lineWidth = 4; ctx.fillStyle = 'rgba(23,48,66,.18)'; ctx.beginPath(); ctx.ellipse(0, 58, 42, 11, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#f3b08d'; ctx.beginPath(); ctx.arc(0, -92, 22, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#7b4b28'; ctx.beginPath(); ctx.arc(-2, -105, 20, Math.PI, 0); ctx.fill(); ctx.stroke(); ctx.fillStyle = t.shirt; roundedRect(-27, -68, 54, 72, 14); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#4b9ed0'; roundedRect(-21, 4, 17, 52, 5); ctx.fill(); ctx.stroke(); roundedRect(5, 4, 17, 52, 5); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#173042'; ctx.fillRect(-10, -98, 5, 4); ctx.fillRect(7, -98, 5, 4); ctx.beginPath(); ctx.arc(2, -86, t.angry ? 9 : 7, 0, Math.PI); ctx.stroke();
  const swing = Math.sin(frame / 6 + t.phase) * (t.angry ? 46 : 24); const panic = t.swatWindow > 0 ? Math.sin(frame * .9) * 22 : 0; ctx.strokeStyle = '#173042'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(24, -47); ctx.lineTo(58, -62 + swing + panic); ctx.stroke();
  if (t.kind === 'schirm') { ctx.fillStyle = '#e85050'; ctx.beginPath(); ctx.moveTo(56, -82 + swing + panic); ctx.quadraticCurveTo(108, -112 + swing + panic, 125, -49 + swing + panic); ctx.lineTo(56, -50 + swing + panic); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  else if (t.kind === 'wasser') { ctx.fillStyle = '#47b7e9'; roundedRect(51, -78 + swing + panic, 24, 18, 5); ctx.fill(); ctx.stroke(); }
  else if (t.kind === 'handy') { ctx.fillStyle = '#173042'; roundedRect(52, -75 + swing + panic, 18, 30, 4); ctx.fill(); ctx.fillStyle = '#f3b08d'; ctx.beginPath(); ctx.arc(59, -58 + swing + panic, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  else { ctx.fillStyle = '#f3b08d'; ctx.beginPath(); ctx.arc(61, -63 + swing + panic, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  ctx.restore();
}

function drawAttack(t) {
  const a = t.attack;
  ctx.save(); ctx.strokeStyle = a.kind === 'water' ? '#8ee7ff' : '#173042'; ctx.fillStyle = a.kind === 'water' ? '#8ee7ff' : '#ffdc69'; ctx.lineWidth = 5;
  if (a.kind === 'water') { ctx.globalAlpha = .8; ctx.beginPath(); ctx.arc(a.x, a.y, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  else { ctx.beginPath(); ctx.moveTo(a.x - 18, a.y); ctx.lineTo(a.x + 18, a.y + 10); ctx.lineTo(a.x - 10, a.y + 20); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  ctx.restore();
}

function drawParticles() { for (const p of particles) { ctx.globalAlpha = Math.max(0, p.life / 40); ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; } }
function burst(x, y, color, count = 12) { for (let i = 0; i < count; i++) particles.push({ x, y, vx: (Math.random() - .5) * 7, vy: (Math.random() - .5) * 7, r: 3 + Math.random() * 4, life: 28 + Math.random() * 15, color }); }
function circleRectCollision(cx, cy, cr, rx, ry, rw, rh) { const closestX = Math.max(rx, Math.min(cx, rx + rw)); const closestY = Math.max(ry, Math.min(cy, ry + rh)); const dx = cx - closestX; const dy = cy - closestY; return dx * dx + dy * dy < cr * cr; }

function update() {
  if (state !== 'playing') return;
  frame++;
  const nextLevel = Math.floor(score / 150) + 1;
  if (nextLevel !== level) { level = nextLevel; burst(gull.x, gull.y - 40, '#fff19d', 22); }
  speed = 5.2 + (level - 1) * .55 + Math.min(2.1, frame * .00065);
  if (invincible > 0) invincible--;
  if (gull.flapPulse > 0) gull.flapPulse *= .82;
  gull.energy = Math.min(1, gull.energy + .004);

  const air = Math.hypot(gull.vx, gull.vy);
  const flapBoost = input.flapHeld ? 1.75 : 1;
  const targetVx = input.joyX * 6.4 * flapBoost;
  const targetVy = input.joyY * 6.1 * flapBoost;
  gull.vx += (targetVx - gull.vx) * (input.flapHeld ? .105 : .065);
  gull.vy += (targetVy - gull.vy) * (input.flapHeld ? .082 : .045);
  gull.vy += .16 + Math.max(0, gull.vy) * .012; // Gewicht und Sinkgeschwindigkeit
  gull.vx *= .976 - Math.min(.018, air * .0012); // Luftwiderstand
  gull.vy *= .986 - Math.min(.014, air * .0008);
  gull.x += gull.vx;
  gull.y += gull.vy;
  gull.rot += ((gull.vy * .052 + gull.vx * .022) - gull.rot) * .09;
  gull.rot = Math.max(-.62, Math.min(.72, gull.rot));
  gull.x = Math.max(80, Math.min(W - 120, gull.x));
  if (gull.y < 72) { gull.y = 72; gull.vy *= -.18; }
  if (gull.y > 505) { gull.y = 505; gull.vy = -2.8; }

  if (input.flapHeld && frame % 9 === 0) flap();
  if (frame % Math.max(38, 72 - level * 4) === 0) spawnSnack();
  if (frame % Math.max(56, 116 - level * 6) === 0) spawnTourist();

  for (const s of snacks) s.x -= speed + 1.4;
  for (const t of tourists) updateTourist(t);
  for (const p of particles) { p.x += p.vx; p.y += p.vy; p.vy += .18; p.life--; }
  snacks = snacks.filter(s => s.x > -80);
  tourists = tourists.filter(t => t.x > -190);
  particles = particles.filter(p => p.life > 0);

  collectSnacks();
  checkHits();
  updateHud();
}

function updateTourist(t) {
  t.x -= speed;
  t.cooldown--;
  const near = Math.abs((t.x + 30) - gull.x) < 290 && gull.y > 150 && gull.y < 520;
  t.angry = near;
  if (near && t.cooldown <= 0) {
    t.swatWindow = 26;
    t.cooldown = Math.max(34, 92 - level * 5);
  }
  if (t.swatWindow > 0) t.swatWindow--;
}

function collectSnacks() {
  for (let i = snacks.length - 1; i >= 0; i--) {
    const s = snacks[i]; const sy = s.y + Math.sin(frame / 10 + s.wobble) * 7; const dx = gull.x + 44 - s.x; const dy = gull.y - sy;
    if (dx * dx + dy * dy < (gull.r + s.r) * (gull.r + s.r)) {
      score += s.value;
      snackStreak++;
      if (snackStreak >= 3) {
        if (health < 6) { health += 1; burst(gull.x, gull.y - 28, '#d7233f', 16); }
        snackStreak = 0;
      }
      burst(s.x, sy, s.type === 'burger' ? '#f2c349' : '#f28abc');
      snacks.splice(i, 1);
    }
  }
}

function checkHits() {
  if (invincible > 0) return;
  for (const t of tourists) {
    const bodyHit = circleRectCollision(gull.x, gull.y, gull.r, t.x - 31, t.y - 122, 86, 165);
    const handX = t.x + 61;
    const handY = t.y - 64 + Math.sin(frame / 6 + t.phase) * (t.angry ? 46 : 24);
    const swatHit = t.swatWindow > 0 && Math.hypot(gull.x - handX, gull.y - handY) < gull.r + 25;
    if (bodyHit || swatHit) {
      health = Math.max(0, health - 2);
      snackStreak = 0;
      invincible = 85;
      gull.vy = -8;
      gull.vx = -4.2;
      burst(gull.x, gull.y, '#ffffff', 18);
      if (health <= 0) endGame();
      break;
    }
  }
}

function endGame() {
  state = 'gameover';
  highscore = Math.max(highscore, score);
  localStorage.setItem(highscoreKey, highscore);
  updateHud();
  touchControls.classList.add('hidden');
  overlay.classList.remove('hidden');
  overlay.querySelector('.badge').textContent = 'Möwenbilanz';
  overlay.querySelector('h1').textContent = 'Game Over';
  overlay.querySelector('.lead').textContent = `Du hast ${score} Punkte geklaut und Level ${level} erreicht. Highscore: ${highscore}.`;
  startBtn.textContent = 'Nochmal spielen';
}

function render() {
  drawBackground();
  for (const s of snacks) drawSnack(s);
  for (const t of tourists) drawTourist(t);
  drawParticles();
  drawGull();
  if (state === 'playing') {
    ctx.fillStyle = 'rgba(255,249,235,.86)'; roundedRect(24, 24, 330, 42, 20); ctx.fill(); ctx.strokeStyle = 'rgba(23,48,66,.22)'; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = '#173042'; ctx.font = '900 22px system-ui'; ctx.fillText(`Snack-Alarm auf Sylt · Level ${level}`, 44, 53);
  }
}
function loop() { update(); render(); requestAnimationFrame(loop); }

function setMusicLabel() { musicBtn.textContent = musicOn ? 'Musik an' : 'Musik aus'; overlayMusicBtn.textContent = musicOn ? 'Musik aus' : 'Musik an'; }
async function toggleMusic(e) {
  if (e) e.preventDefault();
  musicOn = !musicOn;
  bgMusic.volume = .48;
  setMusicLabel();
  if (musicOn) { try { await bgMusic.play(); } catch { musicOn = false; setMusicLabel(); } }
  else { bgMusic.pause(); }
}

function moveStick(clientX, clientY) {
  const rect = joystick.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const max = rect.width * .32;
  let dx = clientX - cx;
  let dy = clientY - cy;
  const d = Math.hypot(dx, dy);
  if (d > max) { dx = dx / d * max; dy = dy / d * max; }
  input.joyX = dx / max;
  input.joyY = dy / max;
  stick.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
}
function resetStick() { input.joyX = 0; input.joyY = 0; stick.style.transform = 'translate(-50%, -50%)'; }

startBtn.addEventListener('pointerup', startGameFromButton);
musicBtn.addEventListener('pointerup', toggleMusic);
overlayMusicBtn.addEventListener('pointerup', toggleMusic);
flapBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); input.flapHeld = true; flapBtn.classList.add('pressed'); flap(); });
flapBtn.addEventListener('pointerup', () => { input.flapHeld = false; flapBtn.classList.remove('pressed'); });
flapBtn.addEventListener('pointercancel', () => { input.flapHeld = false; flapBtn.classList.remove('pressed'); });
joystick.addEventListener('pointerdown', (e) => { e.preventDefault(); input.joyPointer = e.pointerId; joystick.setPointerCapture(e.pointerId); moveStick(e.clientX, e.clientY); });
joystick.addEventListener('pointermove', (e) => { if (input.joyPointer === e.pointerId) moveStick(e.clientX, e.clientY); });
joystick.addEventListener('pointerup', (e) => { if (input.joyPointer === e.pointerId) { input.joyPointer = null; resetStick(); } });
joystick.addEventListener('pointercancel', (e) => { if (input.joyPointer === e.pointerId) { input.joyPointer = null; resetStick(); } });
window.addEventListener('keydown', (e) => { input.keys.add(e.code); if (e.code === 'Space') { e.preventDefault(); flap(); } if (e.key.toLowerCase() === 'm') toggleMusic(e); });
window.addEventListener('keyup', (e) => { input.keys.delete(e.code); });
setInterval(() => {
  const horizontalKeys = input.keys.has('ArrowRight') || input.keys.has('KeyD') || input.keys.has('ArrowLeft') || input.keys.has('KeyA');
  const verticalKeys = input.keys.has('ArrowDown') || input.keys.has('KeyS') || input.keys.has('ArrowUp') || input.keys.has('KeyW');
  if (horizontalKeys) input.joyX = (input.keys.has('ArrowRight') || input.keys.has('KeyD') ? 1 : 0) - (input.keys.has('ArrowLeft') || input.keys.has('KeyA') ? 1 : 0);
  if (verticalKeys) input.joyY = (input.keys.has('ArrowDown') || input.keys.has('KeyS') ? 1 : 0) - (input.keys.has('ArrowUp') || input.keys.has('KeyW') ? 1 : 0);
  if (!horizontalKeys && !verticalKeys && input.joyPointer == null) resetStick();
}, 16);
document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
setMusicLabel(); render(); loop();
