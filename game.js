const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const highscoreEl = document.getElementById('highscore');
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('startBtn');

const W = canvas.width;
const H = canvas.height;
const highscoreKey = 'moewenpikHighscoreV1';
let highscore = Number(localStorage.getItem(highscoreKey) || 0);
highscoreEl.textContent = highscore;

let state = 'start';
let frame = 0;
let score = 0;
let lives = 3;
let speed = 4.1;
let invincible = 0;
let snacks = [];
let tourists = [];
let clouds = [];

const gull = {
  x: 150,
  y: 230,
  r: 28,
  vy: 0,
  rot: 0
};

function resetGame() {
  state = 'playing';
  frame = 0;
  score = 0;
  lives = 3;
  speed = 4.1;
  invincible = 0;
  snacks = [];
  tourists = [];
  clouds = Array.from({length: 7}, (_, i) => ({
    x: i * 160 + Math.random() * 80,
    y: 34 + Math.random() * 118,
    s: .65 + Math.random() * .7
  }));
  gull.y = 240;
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
  if (state === 'start' || state === 'gameover') {
    resetGame();
    return;
  }
  gull.vy = -8.8;
}

function spawnSnack() {
  const isBurger = Math.random() > .56;
  snacks.push({
    x: W + 40,
    y: 178 + Math.random() * 210,
    r: isBurger ? 21 : 18,
    type: isBurger ? 'burger' : 'glace',
    value: isBurger ? 15 : 10,
    wobble: Math.random() * Math.PI * 2
  });
}

function spawnTourist() {
  tourists.push({
    x: W + 70,
    y: 367,
    w: 48,
    h: 112,
    phase: Math.random() * Math.PI * 2,
    kind: Math.random() > .5 ? 'schirm' : 'hand'
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
  sky.addColorStop(0, '#aee7ff');
  sky.addColorStop(.47, '#eafaff');
  sky.addColorStop(.48, '#4eb8d8');
  sky.addColorStop(.66, '#3aa7c9');
  sky.addColorStop(.67, '#f4d89c');
  sky.addColorStop(1, '#e3ba76');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = 'rgba(255,255,255,.78)';
  for (const c of clouds) {
    c.x -= speed * .12;
    if (c.x < -100) { c.x = W + Math.random() * 120; c.y = 32 + Math.random() * 110; }
    drawCloud(c.x, c.y, c.s);
  }

  ctx.strokeStyle = 'rgba(255,255,255,.72)';
  ctx.lineWidth = 4;
  for (let i = 0; i < 5; i++) {
    const y = 260 + i * 23;
    ctx.beginPath();
    for (let x = -40; x < W + 40; x += 30) {
      const wave = Math.sin((x + frame * 2 + i * 40) / 34) * 5;
      if (x === -40) ctx.moveTo(x, y + wave); else ctx.lineTo(x, y + wave);
    }
    ctx.stroke();
  }

  drawBoardwalk();
  drawSign();
}

function drawCloud(x, y, s) {
  ctx.beginPath();
  ctx.arc(x, y, 24*s, 0, Math.PI * 2);
  ctx.arc(x + 24*s, y - 8*s, 30*s, 0, Math.PI * 2);
  ctx.arc(x + 55*s, y, 23*s, 0, Math.PI * 2);
  ctx.arc(x + 28*s, y + 10*s, 30*s, 0, Math.PI * 2);
  ctx.fill();
}

function drawBoardwalk() {
  ctx.save();
  ctx.translate(0, 376);
  ctx.fillStyle = '#c79558';
  ctx.fillRect(0, 0, W, 98);
  ctx.fillStyle = '#b9844b';
  for (let x = -((frame * speed) % 90); x < W + 90; x += 90) {
    ctx.fillRect(x, 0, 8, 98);
  }
  ctx.strokeStyle = '#7c5532';
  ctx.lineWidth = 4;
  for (let y = 10; y < 98; y += 28) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  ctx.restore();
}

function drawSign() {
  const x = 28 - (frame * .4 % 420);
  ctx.fillStyle = '#f8f2d6';
  ctx.strokeStyle = '#193144';
  ctx.lineWidth = 4;
  roundedRect(x, 320, 132, 44, 12);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#193144';
  ctx.font = '900 18px system-ui';
  ctx.fillText('Sylt Strand', x + 16, 348);
  ctx.fillRect(x + 62, 364, 10, 38);
}

function drawGull() {
  ctx.save();
  ctx.translate(gull.x, gull.y);
  ctx.rotate(gull.rot);
  if (invincible > 0 && Math.floor(frame / 5) % 2 === 0) ctx.globalAlpha = .55;

  ctx.strokeStyle = '#193144';
  ctx.lineWidth = 5;
  ctx.fillStyle = '#fff8ec';

  ctx.beginPath();
  ctx.ellipse(0, 0, 34, 24, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(23, -12, 20, 17, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();

  const wing = Math.sin(frame / 5) * 12;
  ctx.beginPath();
  ctx.moveTo(-8, -8);
  ctx.quadraticCurveTo(-52, -54 + wing, -66, -8 + wing);
  ctx.quadraticCurveTo(-36, -15, -10, 12);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  ctx.fillStyle = '#ffb23f';
  ctx.beginPath();
  ctx.moveTo(41, -13); ctx.lineTo(72, -5); ctx.lineTo(42, 2); ctx.closePath();
  ctx.fill(); ctx.stroke();

  ctx.fillStyle = '#193144';
  ctx.beginPath(); ctx.arc(28, -17, 3.5, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = '#ffb23f';
  ctx.beginPath();
  ctx.moveTo(-21, 18); ctx.lineTo(-28, 34); ctx.lineTo(-13, 23); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-3, 20); ctx.lineTo(-7, 37); ctx.lineTo(7, 24); ctx.closePath(); ctx.fill(); ctx.stroke();

  ctx.restore();
}

function drawSnack(s) {
  ctx.save();
  ctx.translate(s.x, s.y + Math.sin(frame / 10 + s.wobble) * 6);
  ctx.strokeStyle = '#193144';
  ctx.lineWidth = 4;
  if (s.type === 'burger') {
    ctx.fillStyle = '#e9a23a';
    roundedRect(-22, -14, 44, 14, 8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#6f3c24';
    roundedRect(-20, -2, 40, 10, 5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#8dd35f';
    ctx.beginPath(); ctx.moveTo(-19, 8); ctx.lineTo(-8, 14); ctx.lineTo(3, 8); ctx.lineTo(16, 14); ctx.lineTo(22, 8); ctx.stroke();
    ctx.fillStyle = '#e9a23a';
    roundedRect(-22, 10, 44, 13, 8); ctx.fill(); ctx.stroke();
  } else {
    ctx.fillStyle = '#f58fc2';
    ctx.beginPath(); ctx.arc(0, -14, 16, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e4a654';
    ctx.beginPath(); ctx.moveTo(-15, 0); ctx.lineTo(15, 0); ctx.lineTo(0, 38); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

function drawTourist(t) {
  ctx.save();
  ctx.translate(t.x, t.y);
  ctx.strokeStyle = '#193144';
  ctx.lineWidth = 4;
  ctx.fillStyle = '#f5b08d';
  ctx.beginPath(); ctx.arc(0, -62, 18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

  ctx.fillStyle = '#ffdf5d';
  roundedRect(-21, -44, 42, 55, 12); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#46a6d8';
  ctx.fillRect(-15, 11, 12, 38); ctx.fillRect(4, 11, 12, 38);
  ctx.strokeRect(-15, 11, 12, 38); ctx.strokeRect(4, 11, 12, 38);

  ctx.fillStyle = '#193144';
  ctx.fillRect(-8, -67, 5, 4); ctx.fillRect(6, -67, 5, 4);
  ctx.beginPath(); ctx.arc(2, -57, 6, 0, Math.PI); ctx.stroke();

  const swing = Math.sin(frame / 9 + t.phase) * 22;
  ctx.strokeStyle = '#193144';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(19, -33);
  ctx.lineTo(44, -42 + swing);
  ctx.stroke();
  if (t.kind === 'schirm') {
    ctx.fillStyle = '#e85050';
    ctx.beginPath();
    ctx.moveTo(42, -58 + swing);
    ctx.quadraticCurveTo(80, -82 + swing, 92, -36 + swing);
    ctx.lineTo(42, -36 + swing);
    ctx.closePath(); ctx.fill(); ctx.stroke();
  } else {
    ctx.fillStyle = '#f5b08d';
    ctx.beginPath(); ctx.arc(48, -43 + swing, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
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
  speed += 0.0008;
  if (invincible > 0) invincible--;

  gull.vy += .42;
  gull.y += gull.vy;
  gull.rot = Math.max(-.45, Math.min(.45, gull.vy / 18));
  if (gull.y < 55) { gull.y = 55; gull.vy = 0; }
  if (gull.y > 350) { gull.y = 350; gull.vy = -4; }

  if (frame % 78 === 0) spawnSnack();
  if (frame % 112 === 0) spawnTourist();

  for (const s of snacks) s.x -= speed + 1.1;
  for (const t of tourists) t.x -= speed;

  snacks = snacks.filter(s => s.x > -70);
  tourists = tourists.filter(t => t.x > -110);

  for (let i = snacks.length - 1; i >= 0; i--) {
    const s = snacks[i];
    const sy = s.y + Math.sin(frame / 10 + s.wobble) * 6;
    const dx = gull.x + 35 - s.x;
    const dy = gull.y - sy;
    if (dx * dx + dy * dy < (gull.r + s.r) * (gull.r + s.r)) {
      score += s.value;
      snacks.splice(i, 1);
      updateHud();
    }
  }

  if (invincible === 0) {
    for (const t of tourists) {
      if (circleRectCollision(gull.x, gull.y, gull.r, t.x - 28, t.y - 86, 78, 138)) {
        lives--;
        invincible = 90;
        gull.vy = -7;
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
  overlay.querySelector('h1').textContent = 'Game Over';
  overlay.querySelector('.lead').textContent = `Du hast ${score} Punkte geklaut. Highscore: ${highscore}.`;
  startBtn.textContent = 'Nochmal spielen';
}

function render() {
  drawBackground();
  for (const s of snacks) drawSnack(s);
  for (const t of tourists) drawTourist(t);
  drawGull();

  if (state === 'playing') {
    ctx.fillStyle = 'rgba(25,49,68,.1)';
    roundedRect(20, 20, 190, 38, 18); ctx.fill();
    ctx.fillStyle = '#193144';
    ctx.font = '800 18px system-ui';
    ctx.fillText('Snack-Alarm auf Sylt', 36, 46);
  }
}

function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}

startBtn.addEventListener('click', resetGame);
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault();
    flap();
  }
});
canvas.addEventListener('pointerdown', (e) => { e.preventDefault(); flap(); });
overlay.addEventListener('pointerdown', (e) => {
  if (e.target === startBtn) return;
});

render();
loop();
