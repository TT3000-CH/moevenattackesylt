const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const highscoreEl = document.getElementById('highscore');
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('startBtn');
const musicBtn = document.getElementById('musicBtn');

const W = canvas.width;
const H = canvas.height;
const highscoreKey = 'moewenpikHighscoreV2';
let highscore = Number(localStorage.getItem(highscoreKey) || 0);
highscoreEl.textContent = highscore;

let state = 'start';
let frame = 0;
let score = 0;
let lives = 3;
let speed = 5.2;
let invincible = 0;
let snacks = [];
let tourists = [];
let clouds = [];
let birds = [];
let grass = [];
let particles = [];

let audioCtx = null;
let musicOn = false;
let nextNoteTime = 0;
let noteIndex = 0;
let musicTimer = null;

const gull = { x: 205, y: 330, r: 31, vy: 0, rot: 0 };
const melody = [392, 440, 494, 587, 494, 440, 392, 330, 392, 494, 659, 587, 494, 440, 392, 0];
const bass = [196, 196, 247, 247, 220, 220, 165, 165];

function resetGame() {
  state = 'playing';
  frame = 0;
  score = 0;
  lives = 3;
  speed = 5.2;
  invincible = 0;
  snacks = [];
  tourists = [];
  particles = [];
  clouds = Array.from({length: 8}, (_, i) => ({ x: i * 190 + Math.random() * 100, y: 55 + Math.random() * 125, s: .65 + Math.random() * .8 }));
  birds = Array.from({length: 5}, (_, i) => ({ x: i * 260 + Math.random() * 150, y: 80 + Math.random() * 160, s: .6 + Math.random() * .6 }));
  grass = Array.from({length: 50}, (_, i) => ({ x: i * 34 + Math.random() * 20, h: 18 + Math.random() * 28, lean: Math.random() * 8 }));
  gull.y = 330;
  gull.vy = 0;
  updateHud();
  overlay.classList.add('hidden');
}

function updateHud() {
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  highscoreEl.textContent = highscore;
}

function flap() {
  if (state === 'start' || state === 'gameover') { resetGame(); return; }
  gull.vy = -10.4;
}

function spawnSnack() {
  const isBurger = Math.random() > .54;
  snacks.push({
    x: W + 55,
    y: 245 + Math.random() * 255,
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
    shirt: ['#ffdc69', '#83c9f4', '#ff9878', '#a4db78'][Math.floor(Math.random() * 4)]
  });
}

function roundedRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
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

  drawSun();
  drawClouds();
  drawSea();
  drawDunes();
  drawBoardwalk();
  drawSyltDetails();
}

function drawSun() {
  const grd = ctx.createRadialGradient(1060, 92, 10, 1060, 92, 92);
  grd.addColorStop(0, 'rgba(255,244,156,.95)');
  grd.addColorStop(1, 'rgba(255,244,156,0)');
  ctx.fillStyle = grd;
  ctx.fillRect(960, 0, 220, 190);
  ctx.fillStyle = '#fff19d';
  ctx.beginPath(); ctx.arc(1060, 92, 38, 0, Math.PI * 2); ctx.fill();
}

function drawClouds() {
  ctx.fillStyle = 'rgba(255,255,255,.78)';
  for (const c of clouds) {
    c.x -= speed * .1;
    if (c.x < -130) { c.x = W + Math.random() * 140; c.y = 45 + Math.random() * 125; }
    drawCloud(c.x, c.y, c.s);
  }
  ctx.strokeStyle = 'rgba(23,48,66,.55)';
  ctx.lineWidth = 3;
  for (const b of birds) {
    b.x -= speed * .16;
    if (b.x < -50) { b.x = W + Math.random() * 150; b.y = 70 + Math.random() * 160; }
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.quadraticCurveTo(b.x + 14 * b.s, b.y - 10 * b.s, b.x + 28 * b.s, b.y);
    ctx.moveTo(b.x + 28 * b.s, b.y);
    ctx.quadraticCurveTo(b.x + 42 * b.s, b.y - 10 * b.s, b.x + 56 * b.s, b.y);
    ctx.stroke();
  }
}

function drawCloud(x, y, s) {
  ctx.beginPath();
  ctx.arc(x, y, 24*s, 0, Math.PI * 2);
  ctx.arc(x + 25*s, y - 9*s, 32*s, 0, Math.PI * 2);
  ctx.arc(x + 60*s, y, 25*s, 0, Math.PI * 2);
  ctx.arc(x + 31*s, y + 13*s, 32*s, 0, Math.PI * 2);
  ctx.fill();
}

function drawSea() {
  ctx.strokeStyle = 'rgba(255,255,255,.72)';
  ctx.lineWidth = 5;
  for (let i = 0; i < 7; i++) {
    const y = 330 + i * 22;
    ctx.beginPath();
    for (let x = -50; x < W + 50; x += 26) {
      const wave = Math.sin((x + frame * 2.1 + i * 39) / 36) * 5;
      if (x === -50) ctx.moveTo(x, y + wave); else ctx.lineTo(x, y + wave);
    }
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,255,255,.82)';
  ctx.fillRect(0, 447, W, 5);
}

function drawDunes() {
  ctx.fillStyle = '#d6bd77';
  ctx.beginPath();
  ctx.moveTo(0, 475);
  for (let x = 0; x <= W; x += 90) ctx.quadraticCurveTo(x + 45, 440 + Math.sin(x / 90) * 14, x + 90, 475);
  ctx.lineTo(W, 560); ctx.lineTo(0, 560); ctx.closePath(); ctx.fill();

  ctx.strokeStyle = '#698b44';
  ctx.lineWidth = 4;
  for (const g of grass) {
    const gx = (g.x - (frame * speed * .28 % 1700));
    const x = gx < -30 ? gx + 1700 : gx;
    const y = 512 + Math.sin(x * .02) * 12;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + g.lean, y - g.h); ctx.stroke();
  }
}

function drawBoardwalk() {
  ctx.save();
  ctx.translate(0, 535);
  const wood = ctx.createLinearGradient(0, 0, 0, 160);
  wood.addColorStop(0, '#d19a5b');
  wood.addColorStop(1, '#9a6234');
  ctx.fillStyle = wood;
  ctx.fillRect(0, 0, W, 160);

  ctx.strokeStyle = '#6e4527';
  ctx.lineWidth = 4;
  for (let y = 18; y < 150; y += 32) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y + Math.sin(y) * 2); ctx.stroke();
  }
  for (let x = -((frame * speed) % 105); x < W + 105; x += 105) {
    ctx.fillStyle = 'rgba(80,45,22,.24)';
    ctx.fillRect(x, 0, 9, 160);
    ctx.fillStyle = '#53351f';
    ctx.beginPath(); ctx.arc(x + 28, 24, 4, 0, Math.PI * 2); ctx.arc(x + 72, 105, 4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,255,255,.12)';
  ctx.fillRect(0, 0, W, 20);
  ctx.restore();
}

function drawSyltDetails() {
  const baseX = 70 - (frame * .55 % 520);
  ctx.fillStyle = '#f8f2d6';
  ctx.strokeStyle = '#173042';
  ctx.lineWidth = 4;
  roundedRect(baseX, 470, 178, 54, 14); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#173042';
  ctx.font = '900 23px system-ui';
  ctx.fillText('Sylt Strand', baseX + 22, 504);
  ctx.fillRect(baseX + 84, 524, 12, 55);

  ctx.fillStyle = '#f7f0de';
  ctx.strokeStyle = '#173042';
  for (let i = 0; i < 3; i++) {
    const x = 560 + i * 290 - (frame * .36 % 1200);
    roundedRect(x, 482, 48, 56, 8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e65b4d'; ctx.fillRect(x + 5, 488, 38, 13);
    ctx.fillStyle = '#f7f0de';
  }
}

function drawGull() {
  ctx.save();
  ctx.translate(gull.x, gull.y);
  ctx.rotate(gull.rot);
  if (invincible > 0 && Math.floor(frame / 5) % 2 === 0) ctx.globalAlpha = .55;

  ctx.strokeStyle = '#173042';
  ctx.lineWidth = 5;
  ctx.fillStyle = '#fffaf0';
  ctx.beginPath(); ctx.ellipse(0, 0, 42, 28, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(29, -15, 24, 19, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

  const wing = Math.sin(frame / 5) * 16;
  ctx.fillStyle = '#f8f8f2';
  ctx.beginPath();
  ctx.moveTo(-10, -8);
  ctx.quadraticCurveTo(-67, -70 + wing, -88, -8 + wing);
  ctx.quadraticCurveTo(-48, -19, -11, 18);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#9ea7ad';
  ctx.beginPath(); ctx.moveTo(-48, -20 + wing * .25); ctx.lineTo(-72, -8 + wing); ctx.lineTo(-44, 2); ctx.closePath(); ctx.fill(); ctx.stroke();

  ctx.fillStyle = '#ffb13d';
  ctx.beginPath(); ctx.moveTo(50, -15); ctx.lineTo(90, -6); ctx.lineTo(51, 4); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#173042';
  ctx.beginPath(); ctx.arc(35, -20, 4, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#173042'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(31, -10, 6, .15, Math.PI); ctx.stroke();

  ctx.fillStyle = '#ffb13d'; ctx.strokeStyle = '#173042'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-26, 22); ctx.lineTo(-36, 43); ctx.lineTo(-15, 29); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-3, 24); ctx.lineTo(-9, 46); ctx.lineTo(11, 31); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
}

function drawSnack(s) {
  ctx.save();
  ctx.translate(s.x, s.y + Math.sin(frame / 10 + s.wobble) * 7);
  ctx.strokeStyle = '#173042'; ctx.lineWidth = 4;
  ctx.shadowColor = 'rgba(23,48,66,.18)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 5;
  if (s.type === 'burger') {
    ctx.fillStyle = '#e8a33d'; roundedRect(-26, -18, 52, 17, 9); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#6d3b22'; roundedRect(-24, -2, 48, 13, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#8ad56a'; ctx.beginPath(); ctx.moveTo(-24, 10); ctx.lineTo(-11, 17); ctx.lineTo(1, 10); ctx.lineTo(15, 17); ctx.lineTo(26, 10); ctx.stroke();
    ctx.fillStyle = '#f2c349'; roundedRect(-23, 15, 46, 8, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e8a33d'; roundedRect(-26, 22, 52, 15, 9); ctx.fill(); ctx.stroke();
  } else {
    ctx.fillStyle = '#f28abc'; ctx.beginPath(); ctx.arc(0, -17, 18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff2d0'; ctx.beginPath(); ctx.arc(10, -22, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#d89a4e'; ctx.beginPath(); ctx.moveTo(-17, 1); ctx.lineTo(17, 1); ctx.lineTo(0, 46); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(90,55,28,.55)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-10, 11); ctx.lineTo(7, 33); ctx.moveTo(10, 11); ctx.lineTo(-7, 33); ctx.stroke();
  }
  ctx.restore();
}

function drawTourist(t) {
  ctx.save();
  ctx.translate(t.x, t.y);
  ctx.strokeStyle = '#173042'; ctx.lineWidth = 4;
  ctx.fillStyle = 'rgba(23,48,66,.18)'; ctx.beginPath(); ctx.ellipse(0, 58, 42, 11, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f3b08d'; ctx.beginPath(); ctx.arc(0, -92, 22, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#7b4b28'; ctx.beginPath(); ctx.arc(-2, -105, 20, Math.PI, 0); ctx.fill(); ctx.stroke();
  ctx.fillStyle = t.shirt; roundedRect(-27, -68, 54, 72, 14); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#4b9ed0'; roundedRect(-21, 4, 17, 52, 5); ctx.fill(); ctx.stroke(); roundedRect(5, 4, 17, 52, 5); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#173042'; ctx.fillRect(-10, -98, 5, 4); ctx.fillRect(7, -98, 5, 4); ctx.beginPath(); ctx.arc(2, -86, 7, 0, Math.PI); ctx.stroke();

  const swing = Math.sin(frame / 8 + t.phase) * 27;
  ctx.strokeStyle = '#173042'; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(24, -47); ctx.lineTo(58, -62 + swing); ctx.stroke();
  if (t.kind === 'schirm') {
    ctx.fillStyle = '#e85050'; ctx.beginPath(); ctx.moveTo(56, -82 + swing); ctx.quadraticCurveTo(108, -112 + swing, 125, -49 + swing); ctx.lineTo(56, -50 + swing); ctx.closePath(); ctx.fill(); ctx.stroke();
  } else if (t.kind === 'handy') {
    ctx.fillStyle = '#173042'; roundedRect(52, -75 + swing, 18, 30, 4); ctx.fill();
    ctx.fillStyle = '#f3b08d'; ctx.beginPath(); ctx.arc(59, -58 + swing, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  } else {
    ctx.fillStyle = '#f3b08d'; ctx.beginPath(); ctx.arc(61, -63 + swing, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

function drawParticles() {
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life / 40);
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function burst(x, y, color) {
  for (let i = 0; i < 12; i++) particles.push({ x, y, vx: (Math.random() - .5) * 7, vy: (Math.random() - .5) * 7, r: 3 + Math.random() * 4, life: 28 + Math.random() * 15, color });
}

function circleRectCollision(cx, cy, cr, rx, ry, rw, rh) {
  const closestX = Math.max(rx, Math.min(cx, rx + rw));
  const closestY = Math.max(ry, Math.min(cy, ry + rh));
  const dx = cx - closestX;
  const dy = cy - closestY;
  return dx * dx + dy * dy < cr * cr;
}

function update() {
  if (state !== 'playing') return;
  frame++;
  speed += 0.001;
  if (invincible > 0) invincible--;

  gull.vy += .48;
  gull.y += gull.vy;
  gull.rot = Math.max(-.48, Math.min(.48, gull.vy / 18));
  if (gull.y < 70) { gull.y = 70; gull.vy = 0; }
  if (gull.y > 500) { gull.y = 500; gull.vy = -4.5; }

  if (frame % 68 === 0) spawnSnack();
  if (frame % 104 === 0) spawnTourist();

  for (const s of snacks) s.x -= speed + 1.4;
  for (const t of tourists) t.x -= speed;
  for (const p of particles) { p.x += p.vx; p.y += p.vy; p.vy += .18; p.life--; }

  snacks = snacks.filter(s => s.x > -80);
  tourists = tourists.filter(t => t.x > -150);
  particles = particles.filter(p => p.life > 0);

  for (let i = snacks.length - 1; i >= 0; i--) {
    const s = snacks[i];
    const sy = s.y + Math.sin(frame / 10 + s.wobble) * 7;
    const dx = gull.x + 44 - s.x;
    const dy = gull.y - sy;
    if (dx * dx + dy * dy < (gull.r + s.r) * (gull.r + s.r)) {
      score += s.value;
      burst(s.x, sy, s.type === 'burger' ? '#f2c349' : '#f28abc');
      snacks.splice(i, 1);
      updateHud();
    }
  }

  if (invincible === 0) {
    for (const t of tourists) {
      if (circleRectCollision(gull.x, gull.y, gull.r, t.x - 35, t.y - 124, 105, 178)) {
        lives--;
        invincible = 90;
        gull.vy = -8;
        burst(gull.x, gull.y, '#ffffff');
        updateHud();
        if (lives <= 0) endGame();
        break;
      }
    }
  }
}

function endGame() {
  state = 'gameover';
  highscore = Math.max(highscore, score);
  localStorage.setItem(highscoreKey, highscore);
  updateHud();
  overlay.classList.remove('hidden');
  overlay.querySelector('.badge').textContent = 'Möwenbilanz';
  overlay.querySelector('h1').textContent = 'Game Over';
  overlay.querySelector('.lead').textContent = `Du hast Snacks im Wert von ${score} Punkten geklaut. Highscore: ${highscore}.`;
  startBtn.textContent = 'Nochmal spielen';
}

function render() {
  drawBackground();
  for (const s of snacks) drawSnack(s);
  for (const t of tourists) drawTourist(t);
  drawParticles();
  drawGull();

  if (state === 'playing') {
    ctx.fillStyle = 'rgba(255,249,235,.86)'; roundedRect(24, 24, 300, 42, 20); ctx.fill();
    ctx.strokeStyle = 'rgba(23,48,66,.22)'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#173042'; ctx.font = '900 22px system-ui'; ctx.fillText('Snack-Alarm auf Sylt', 44, 53);
  }
}

function loop() { update(); render(); requestAnimationFrame(loop); }

function playTone(freq, start, duration, type, gainValue) {
  if (!audioCtx || !freq) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.03);
}

function scheduleMusic() {
  if (!musicOn || !audioCtx) return;
  while (nextNoteTime < audioCtx.currentTime + 0.45) {
    const m = melody[noteIndex % melody.length];
    const b = bass[Math.floor(noteIndex / 2) % bass.length];
    playTone(m, nextNoteTime, 0.16, 'square', 0.026);
    if (noteIndex % 2 === 0) playTone(b, nextNoteTime, 0.25, 'triangle', 0.034);
    if (noteIndex % 4 === 2) playTone(880, nextNoteTime + 0.05, 0.055, 'sine', 0.018);
    nextNoteTime += 0.18;
    noteIndex++;
  }
}

function toggleMusic() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  musicOn = !musicOn;
  musicBtn.textContent = musicOn ? 'Musik: an' : 'Musik: aus';
  if (musicOn) {
    nextNoteTime = audioCtx.currentTime;
    noteIndex = 0;
    scheduleMusic();
    musicTimer = setInterval(scheduleMusic, 120);
  } else if (musicTimer) {
    clearInterval(musicTimer);
    musicTimer = null;
  }
}

startBtn.addEventListener('click', resetGame);
musicBtn.addEventListener('click', toggleMusic);
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); flap(); }
  if (e.key.toLowerCase() === 'm') toggleMusic();
});
canvas.addEventListener('pointerdown', (e) => { e.preventDefault(); flap(); });

render();
loop();
