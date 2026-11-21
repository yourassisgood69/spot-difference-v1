// Scene painter for Spot the Difference. Each scene is drawn twice by the
// same function: once plain for the left panel, once with a set of difference
// ids applied for the right panel. Nothing here loads an image or a font;
// every shape is drawn with canvas paths, so the two panels can only differ
// where a difference id says so.

function sdCircle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function sdEllipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function sdRect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function sdLine(ctx, x1, y1, x2, y2, colour, width) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = colour;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.stroke();
}

function sdRoundRect(ctx, x, y, w, h, r, fill) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function sdCloud(ctx, x, y, s) {
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.beginPath();
  ctx.arc(x, y, 18 * s, 0, Math.PI * 2);
  ctx.arc(x + 20 * s, y - 8 * s, 15 * s, 0, Math.PI * 2);
  ctx.arc(x + 40 * s, y, 17 * s, 0, Math.PI * 2);
  ctx.arc(x + 20 * s, y + 6 * s, 16 * s, 0, Math.PI * 2);
  ctx.fill();
}

function sdFlower(ctx, x, y, petal) {
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    sdCircle(ctx, x + Math.cos(a) * 7, y + Math.sin(a) * 7, 5, petal);
  }
  sdCircle(ctx, x, y, 5, '#ffd93b');
}

function sdButterfly(ctx, x, y, c1, c2) {
  ctx.save();
  ctx.translate(x, y);
  sdEllipse(ctx, -7, -4, 8, 6, c1);
  sdEllipse(ctx, 7, -4, 8, 6, c2);
  sdEllipse(ctx, -6, 5, 6, 4, c2);
  sdEllipse(ctx, 6, 5, 6, 4, c1);
  sdLine(ctx, 0, -6, 0, 8, '#5b4a3a', 2);
  ctx.restore();
}

function sdBird(ctx, x, y, colour) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.ellipse(x, y, 11, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 9, y - 6, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 13, y - 7);
  ctx.lineTo(x + 19, y - 5);
  ctx.lineTo(x + 13, y - 3);
  ctx.closePath();
  ctx.fillStyle = '#f2a541';
  ctx.fill();
  sdCircle(ctx, x + 10, y - 7, 1.4, '#222');
  sdLine(ctx, x - 8, y + 6, x - 14, y + 12, colour, 2);
}

// ---- Round 1: Garden Café ----
function sdDrawGarden(ctx, on) {
  const L = SD_ROUND_DEFS[0].layout;
  const sky = ctx.createLinearGradient(0, 0, 0, 400);
  sky.addColorStop(0, '#a8dcf5');
  sky.addColorStop(0.55, '#dff3e3');
  sky.addColorStop(1, '#cfe8b8');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 560, 400);
  // Sun, with rays unless the difference removed them.
  sdCircle(ctx, L.sun.x, L.sun.y, L.sun.r, '#ffd93b');
  if (!on.has('sun-rays')) {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      sdLine(
        ctx,
        L.sun.x + Math.cos(a) * 36, L.sun.y + Math.sin(a) * 36,
        L.sun.x + Math.cos(a) * 48, L.sun.y + Math.sin(a) * 48,
        '#f2a541', 4
      );
    }
  }
  sdCircle(ctx, L.sun.x - 9, L.sun.y - 4, 3, '#7a5a12');
  sdCircle(ctx, L.sun.x + 9, L.sun.y - 4, 3, '#7a5a12');
  ctx.beginPath();
  ctx.arc(L.sun.x, L.sun.y + 6, 8, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.strokeStyle = '#7a5a12';
  ctx.lineWidth = 3;
  ctx.stroke();
  L.clouds.forEach((c) => sdCloud(ctx, c.x, c.y, c.s));
  // Rolling hills and grass.
  sdEllipse(ctx, 110, 420, 260, 90, '#8fce6e');
  sdEllipse(ctx, 470, 430, 280, 100, '#7cc35f');
  sdRect(ctx, 0, 330, 560, 70, '#93d17a');
  // Tree with a branch and a bird.
  sdRect(ctx, L.tree.x - 9, L.tree.top + 40, 18, 130, '#8a5a33');
  sdLine(ctx, L.tree.x, L.tree.top + 60, L.tree.x + 52, L.tree.top + 8, '#8a5a33', 8);
  sdCircle(ctx, L.tree.x - 30, L.tree.top + 18, 38, '#5da24a');
  sdCircle(ctx, L.tree.x + 26, L.tree.top, 42, '#6db356');
  sdCircle(ctx, L.tree.x, L.tree.top - 30, 40, '#79c065');
  sdBird(ctx, L.bird.x, L.bird.y, '#5b8dd9');
  if (on.has('extra-bird')) sdBird(ctx, L.birdExtra.x, L.birdExtra.y, '#e86a7a');
  // Café building.
  const C = L.cafe;
  sdRect(ctx, C.x, C.y, C.w, C.h, '#fdf3d8');
  ctx.beginPath();
  ctx.moveTo(C.x - 12, C.y);
  ctx.lineTo(C.x + C.w + 12, C.y);
  ctx.lineTo(C.x + C.w - 20, C.y - 34);
  ctx.lineTo(C.x + 20, C.y - 34);
  ctx.closePath();
  ctx.fillStyle = '#d96f4e';
  ctx.fill();
  sdRect(ctx, C.x, C.y - 6, C.w, 8, '#b85a3e');
  // Awning: red and cream stripes; one stripe turns green on the right.
  for (let i = 0; i < 7; i++) {
    const sx = L.awning.x + i * 28;
    let col = i % 2 === 0 ? '#d95f4b' : '#fdf3d8';
    if (i === 3 && on.has('awning-stripe')) col = '#4fae62';
    sdRect(ctx, sx, L.awning.y, 28, L.awning.h, col);
  }
  sdRect(ctx, L.awning.x, L.awning.y + L.awning.h, L.awning.w, 4, '#b85a3e');
  // Window with a cake on the sill, unless the cake vanished.
  const W = L.window;
  sdRect(ctx, W.x - 4, W.y - 4, W.w + 8, W.h + 8, '#8a5a33');
  sdRect(ctx, W.x, W.y, W.w, W.h, '#bfe6f2');
  sdLine(ctx, W.x + W.w / 2, W.y, W.x + W.w / 2, W.y + W.h, '#8a5a33', 3);
  sdLine(ctx, W.x, W.y + W.h / 2, W.x + W.w, W.y + W.h / 2, '#8a5a33', 3);
  if (!on.has('window-cake')) {
    sdRect(ctx, W.x + 22, W.y + 38, 28, 14, '#f2a541');
    sdCircle(ctx, W.x + 36, W.y + 38, 9, '#fff0f5');
    sdCircle(ctx, W.x + 36, W.y + 30, 3, '#e85d75');
  }
  // Door with a round window and a knob.
  const D = L.door;
  sdRoundRect(ctx, D.x, D.y, D.w, D.h, 8, '#a06a3b');
  sdCircle(ctx, D.x + D.w / 2, D.y + 26, 11, '#bfe6f2');
  sdCircle(ctx, D.x + D.w - 12, D.y + 56, 4, '#ffd93b');
  // Garden table with two cups.
  const T = L.table;
  sdEllipse(ctx, T.x, T.y, 62, 12, '#fff7e6');
  sdRect(ctx, T.x - 46, T.y + 8, 8, 44, '#8a5a33');
  sdRect(ctx, T.x + 38, T.y + 8, 8, 44, '#8a5a33');
  sdEllipse(ctx, L.cupA.x, L.cupA.y + 12, 16, 4, '#e8dcc8');
  sdRoundRect(ctx, L.cupA.x - 11, L.cupA.y - 4, 22, 16, 4, '#5b8dd9');
  sdEllipse(ctx, L.cupB.x, L.cupB.y + 12, 16, 4, '#e8dcc8');
  sdRoundRect(
    ctx, L.cupB.x - 11, L.cupB.y - 4, 22, 16, 4,
    on.has('cup-colour') ? '#2f9e8f' : '#e86a9a'
  );
  // Flower pots.
  [L.potA, L.potB].forEach((p, i) => {
    sdLine(ctx, p.x, p.y - 22, p.x, p.y - 6, '#4e8a3f', 3);
    sdEllipse(ctx, p.x - 8, p.y - 14, 10, 6, '#5da24a');
    sdEllipse(ctx, p.x + 8, p.y - 14, 10, 6, '#5da24a');
    const missing = i === 1 && on.has('pot-flower');
    if (!missing) sdFlower(ctx, p.x, p.y - 26, i === 0 ? '#e85d75' : '#e85d75');
    ctx.beginPath();
    ctx.moveTo(p.x - 18, p.y - 6);
    ctx.lineTo(p.x + 18, p.y - 6);
    ctx.lineTo(p.x + 13, p.y + 18);
    ctx.lineTo(p.x - 13, p.y + 18);
    ctx.closePath();
    ctx.fillStyle = '#c96f3f';
    ctx.fill();
    sdRect(ctx, p.x - 20, p.y - 10, 40, 7, '#a8542c');
  });
  // Cat asleep by the table, tail curled unless the tail is gone.
  const K = L.cat;
  sdEllipse(ctx, K.x, K.y + 12, 26, 16, '#f2a541');
  sdCircle(ctx, K.x + 20, K.y - 8, 13, '#f2a541');
  ctx.beginPath();
  ctx.moveTo(K.x + 10, K.y - 18);
  ctx.lineTo(K.x + 13, K.y - 30);
  ctx.lineTo(K.x + 19, K.y - 18);
  ctx.closePath();
  ctx.fillStyle = '#f2a541';
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(K.x + 24, K.y - 16);
  ctx.lineTo(K.x + 28, K.y - 28);
  ctx.lineTo(K.x + 32, K.y - 16);
  ctx.closePath();
  ctx.fill();
  sdCircle(ctx, K.x + 24, K.y - 10, 1.6, '#333');
  sdLine(ctx, K.x + 16, K.y + 14, K.x + 26, K.y + 14, '#d98a2b', 2);
  if (!on.has('cat-tail')) {
    ctx.beginPath();
    ctx.moveTo(K.x - 22, K.y + 10);
    ctx.quadraticCurveTo(K.x - 38, K.y + 2, K.x - 30, K.y - 12);
    ctx.strokeStyle = '#f2a541';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
  // Butterflies.
  sdButterfly(ctx, L.butterflyA.x, L.butterflyA.y, '#8a6fd6', '#e86a9a');
  if (!on.has('butterfly')) sdButterfly(ctx, L.butterflyB.x, L.butterflyB.y, '#e86a9a', '#f2a541');
  // Wild flowers and stepping stones.
  L.flowers.forEach((f) => {
    sdLine(ctx, f.x, f.y, f.x, f.y + 10, '#4e8a3f', 2);
    sdFlower(ctx, f.x, f.y - 2, f.c);
  });
  sdEllipse(ctx, 210, 388, 18, 6, '#e8dcc8');
  sdEllipse(ctx, 260, 392, 18, 6, '#e8dcc8');
  sdEllipse(ctx, 310, 388, 18, 6, '#e8dcc8');
}

// ---- Round 2: Harbour at Dawn ----
function sdDrawHarbour(ctx, on) {
  const L = SD_ROUND_DEFS[1].layout;
  const sky = ctx.createLinearGradient(0, 0, 0, 240);
  sky.addColorStop(0, '#ffd9a0');
  sky.addColorStop(0.6, '#ffb3a7');
  sky.addColorStop(1, '#ffe9c9');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 560, 240);
  sdCircle(ctx, L.sun.x, L.sun.y, L.sun.r, '#fff3c4');
  sdCircle(ctx, L.sun.x, L.sun.y, L.sun.r + 10, 'rgba(255,243,196,0.35)');
  const sea = ctx.createLinearGradient(0, 210, 0, 400);
  sea.addColorStop(0, '#7fb8c9');
  sea.addColorStop(1, '#3f7d96');
  ctx.fillStyle = sea;
  ctx.fillRect(0, L.horizon, 560, 190);
  for (let i = 0; i < 6; i++) {
    const wy = 232 + i * 26;
    ctx.beginPath();
    for (let x = 0; x <= 560; x += 14) {
      const y = wy + Math.sin((x + i * 60) / 46) * 3;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  // Lighthouse with bands; its beam shines unless the difference cut it.
  const H = L.lighthouse;
  ctx.beginPath();
  ctx.moveTo(H.x, H.y + H.h);
  ctx.lineTo(H.x + 6, H.y);
  ctx.lineTo(H.x + H.w - 6, H.y);
  ctx.lineTo(H.x + H.w, H.y + H.h);
  ctx.closePath();
  ctx.fillStyle = '#fdf6e3';
  ctx.fill();
  sdRect(ctx, H.x + 2, H.y + 60, H.w - 4, 26, '#d95f4b');
  sdRect(ctx, H.x + 1, H.y + 130, H.w - 2, 26, '#d95f4b');
  sdRect(ctx, H.x + 1, H.y + 200, H.w - 2, 26, '#d95f4b');
  sdRect(ctx, H.x - 4, H.y - 22, H.w + 8, 24, '#3a3f4a');
  sdCircle(ctx, L.lamp.x, L.lamp.y, 9, '#ffe98a');
  sdCircle(ctx, L.lamp.x, L.lamp.y, 13, 'rgba(255,233,138,0.4)');
  if (!on.has('beam')) {
    ctx.beginPath();
    ctx.moveTo(L.lamp.x + 8, L.lamp.y - 4);
    ctx.lineTo(330, L.lamp.y - 34);
    ctx.lineTo(330, L.lamp.y + 26);
    ctx.lineTo(L.lamp.x + 8, L.lamp.y + 6);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,233,138,0.28)';
    ctx.fill();
  }
  // Gulls.
  L.gulls.forEach((g, i) => {
    if (i === 1 && on.has('gull')) return;
    ctx.beginPath();
    ctx.moveTo(g.x - 10, g.y);
    ctx.quadraticCurveTo(g.x - 4, g.y - 7, g.x, g.y);
    ctx.quadraticCurveTo(g.x + 4, g.y - 7, g.x + 10, g.y);
    ctx.strokeStyle = '#4a4a55';
    ctx.lineWidth = 2;
    ctx.stroke();
  });
  // Distant boat, sailboat and rowboat.
  sdEllipse(ctx, L.farboat.x, L.farboat.y + 8, 22, 6, '#5a3d2b');
  ctx.beginPath();
  ctx.moveTo(L.farboat.x, L.farboat.y + 8);
  ctx.lineTo(L.farboat.x + 4, L.farboat.y - 16);
  ctx.lineTo(L.farboat.x + 16, L.farboat.y + 6);
  ctx.closePath();
  ctx.fillStyle = '#fdf6e3';
  ctx.fill();
  const S = L.sailboat;
  ctx.beginPath();
  ctx.moveTo(S.x - 34, S.y);
  ctx.lineTo(S.x + 34, S.y);
  ctx.lineTo(S.x + 24, S.y + 16);
  ctx.lineTo(S.x - 24, S.y + 16);
  ctx.closePath();
  ctx.fillStyle = '#7a4a2b';
  ctx.fill();
  sdLine(ctx, S.x, S.y - 84, S.x, S.y, '#5a3d2b', 4);
  ctx.beginPath();
  ctx.moveTo(S.x + 3, S.y - 82);
  ctx.lineTo(S.x + 3, S.y - 8);
  ctx.lineTo(S.x + 34, S.y - 8);
  ctx.closePath();
  ctx.fillStyle = '#fdf6e3';
  ctx.fill();
  if (!on.has('sail-stripe')) {
    sdLine(ctx, S.x + 10, S.y - 52, S.x + 24, S.y - 52, '#d95f4b', 6);
  }
  ctx.beginPath();
  ctx.moveTo(S.x, S.y - 84);
  ctx.lineTo(S.x + 22, S.y - 79);
  ctx.lineTo(S.x, S.y - 74);
  ctx.closePath();
  ctx.fillStyle = on.has('flag') ? '#3f7dc9' : '#d95f4b';
  ctx.fill();
  const R = L.rowboat;
  ctx.beginPath();
  ctx.moveTo(R.x - 26, R.y);
  ctx.lineTo(R.x + 26, R.y);
  ctx.lineTo(R.x + 18, R.y + 11);
  ctx.lineTo(R.x - 18, R.y + 11);
  ctx.closePath();
  ctx.fillStyle = '#4e8a3f';
  ctx.fill();
  // Wooden dock with crates, a rope coil and a fisherman.
  sdRect(ctx, 40, 300, 240, 40, '#9a6b3f');
  for (let x = 52; x < 280; x += 24) sdLine(ctx, x, 300, x, 340, '#7a4f2a', 2);
  sdRect(ctx, 40, 300, 240, 5, '#b98a56');
  L.crates.forEach((c) => {
    sdRect(ctx, c.x - 16, c.y - 16, 32, 32, '#c98f4e');
    sdLine(ctx, c.x - 16, c.y - 16, c.x + 16, c.y + 16, '#8a5a33', 2);
    sdLine(ctx, c.x + 16, c.y - 16, c.x - 16, c.y + 16, '#8a5a33', 2);
  });
  if (on.has('crate')) {
    const c = L.crateExtra;
    sdRect(ctx, c.x - 14, c.y - 14, 28, 28, '#c98f4e');
    sdLine(ctx, c.x - 14, c.y - 14, c.x + 14, c.y + 14, '#8a5a33', 2);
    sdLine(ctx, c.x + 14, c.y - 14, c.x - 14, c.y + 14, '#8a5a33', 2);
  }
  if (!on.has('rope')) {
    ctx.beginPath();
    ctx.arc(L.rope.x, L.rope.y, 12, 0, Math.PI * 2);
    ctx.strokeStyle = '#d9b380';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(L.rope.x, L.rope.y, 6, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Fisherman with a rod and a coloured hat.
  const F = L.fisherman;
  sdLine(ctx, F.x + 6, F.y - 30, F.x + 44, F.y - 66, '#5a3d2b', 2);
  sdLine(ctx, F.x + 44, F.y - 66, F.x + 44, F.y - 30, '#5a3d2b', 1);
  sdRect(ctx, F.x - 10, F.y - 34, 22, 40, '#3f7dc9');
  sdCircle(ctx, F.x + 1, F.y - 42, 10, '#f2c9a0');
  ctx.beginPath();
  ctx.moveTo(F.x - 12, F.y - 48);
  ctx.lineTo(F.x + 14, F.y - 48);
  ctx.lineTo(F.x + 1, F.y - 62);
  ctx.closePath();
  ctx.fillStyle = on.has('hat') ? '#7a4fc9' : '#f2c230';
  ctx.fill();
  sdRect(ctx, F.x - 8, F.y + 6, 8, 26, '#3a3f4a');
  sdRect(ctx, F.x + 4, F.y + 6, 8, 26, '#3a3f4a');
  // Buoy bobbing on the water.
  const B = L.buoy;
  sdEllipse(ctx, B.x, B.y + 12, 22, 5, 'rgba(255,255,255,0.35)');
  ctx.beginPath();
  ctx.moveTo(B.x - 12, B.y + 8);
  ctx.lineTo(B.x - 8, B.y - 14);
  ctx.lineTo(B.x + 8, B.y - 14);
  ctx.lineTo(B.x + 12, B.y + 8);
  ctx.closePath();
  ctx.fillStyle = on.has('buoy') ? '#2f9e5f' : '#d95f4b';
  ctx.fill();
  sdRect(ctx, B.x - 10, B.y - 4, 20, 6, '#fdf6e3');
  sdCircle(ctx, B.x, B.y - 18, 3, '#f2c230');
  // A fish jumping clear of the water, unless it vanished.
  if (!on.has('fish')) {
    const Fs = L.fish;
    ctx.beginPath();
    ctx.ellipse(Fs.x, Fs.y, 14, 7, -0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#8fb8c9';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(Fs.x + 12, Fs.y - 4);
    ctx.lineTo(Fs.x + 20, Fs.y - 10);
    ctx.lineTo(Fs.x + 20, Fs.y + 2);
    ctx.closePath();
    ctx.fill();
    sdCircle(ctx, Fs.x - 8, Fs.y - 3, 1.6, '#222');
    ctx.beginPath();
    ctx.arc(Fs.x, Fs.y + 12, 12, Math.PI, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

// ---- Round 3: Night Market ----
function sdDrawMarket(ctx, on) {
  const L = SD_ROUND_DEFS[2].layout;
  const sky = ctx.createLinearGradient(0, 0, 0, 400);
  sky.addColorStop(0, '#141a33');
  sky.addColorStop(0.6, '#232c52');
  sky.addColorStop(1, '#3a2f5e');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 560, 400);
  // Stars, one of which can go out.
  L.stars.forEach((s, i) => {
    if (i === 1 && on.has('star')) return;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y - 5);
    ctx.lineTo(s.x + 1.5, s.y - 1.5);
    ctx.lineTo(s.x + 5, s.y);
    ctx.lineTo(s.x + 1.5, s.y + 1.5);
    ctx.lineTo(s.x, s.y + 5);
    ctx.lineTo(s.x - 1.5, s.y + 1.5);
    ctx.lineTo(s.x - 5, s.y);
    ctx.lineTo(s.x - 1.5, s.y - 1.5);
    ctx.closePath();
    ctx.fillStyle = '#ffe98a';
    ctx.fill();
  });
  // Moon: a crescent, unless the difference made it full.
  const M = L.moon;
  sdCircle(ctx, M.x, M.y, M.r, '#fdf6d8');
  if (!on.has('moon')) {
    sdCircle(ctx, M.x + 10, M.y - 4, M.r - 3, '#232c52');
  }
  sdCircle(ctx, M.x - 6, M.y - 6, 3, '#e8d9a0');
  sdCircle(ctx, M.x + 4, M.y + 8, 2.5, '#e8d9a0');
  // String lights sagging across the top; one bulb changes colour.
  const bulbColours = ['#ffd93b', '#ff8a5c', '#8affc1', '#ff8ad8'];
  [L.lights.lineA, L.lights.lineB].forEach((ln) => {
    ctx.beginPath();
    ctx.moveTo(ln.x1, ln.y1);
    ctx.quadraticCurveTo((ln.x1 + ln.x2) / 2, ln.y1 + ln.sag * 2, ln.x2, ln.y2);
    ctx.strokeStyle = '#0c1024';
    ctx.lineWidth = 2;
    ctx.stroke();
    const count = 6;
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      const bx = ln.x1 + (ln.x2 - ln.x1) * t;
      const wy = ln.y1 + 136 * t * (1 - t);
      const isSpecial = Math.abs(bx - 414) < 24 && ln === L.lights.lineB;
      const col = isSpecial && on.has('bulb')
        ? '#5c8aff'
        : bulbColours[(i + (ln === L.lights.lineB ? 2 : 0)) % bulbColours.length];
      sdCircle(ctx, bx, wy + 8, 6, col);
      sdCircle(ctx, bx, wy + 8, 9, 'rgba(255,217,59,0.18)');
    }
  });
  // Bunting flags strung between the stalls.
  ctx.beginPath();
  ctx.moveTo(210, 108);
  ctx.quadraticCurveTo(300, 128, 390, 108);
  ctx.strokeStyle = '#0c1024';
  ctx.lineWidth = 2;
  ctx.stroke();
  const buntingCols = ['#e85d75', '#f2a541', '#4fae62', '#5b8dd9', '#8a6fd6'];
  L.bunting.xs.forEach((bx, i) => {
    if (i === 3 && on.has('bunting')) return;
    const t = (bx - 210) / 180;
    const by = 108 + 2 * 10 * t * (1 - t) + 10 * t * (1 - t);
    ctx.beginPath();
    ctx.moveTo(bx - 9, by);
    ctx.lineTo(bx + 9, by);
    ctx.lineTo(bx, by + 16);
    ctx.closePath();
    ctx.fillStyle = buntingCols[i % buntingCols.length];
    ctx.fill();
  });
  // Ground and warm pools of stall light.
  sdRect(ctx, 0, 330, 560, 70, '#1a1f38');
  sdEllipse(ctx, 130, 344, 90, 14, 'rgba(255,217,59,0.10)');
  sdEllipse(ctx, 294, 344, 90, 14, 'rgba(255,138,92,0.10)');
  sdEllipse(ctx, 458, 344, 90, 14, 'rgba(138,255,193,0.10)');
  // Stalls: striped canopy, posts, counter, sign.
  const stalls = [
    { def: L.stallA, sign: L.signA, text: 'FRUIT', signCol: on.has('sign') ? '#4fae62' : '#e86a2c' },
    { def: L.stallB, sign: L.signB, text: 'LIGHTS', signCol: '#8a6fd6' },
    { def: L.stallC, sign: L.signC, text: 'TOYS', signCol: '#2f9e8f' },
  ];
  stalls.forEach((s, si) => {
    const d = s.def;
    sdRect(ctx, d.x - 6, d.y - 8, 8, d.h + 8, '#5a3d2b');
    sdRect(ctx, d.x + d.w - 2, d.y - 8, 8, d.h + 8, '#5a3d2b');
    for (let i = 0; i < 6; i++) {
      sdRect(ctx, d.x - 8 + i * 27, d.y - 22, 27, 18, i % 2 === 0 ? '#d95f4b' : '#fdf3d8');
    }
    sdRect(ctx, d.x - 8, d.y - 6, d.w + 16, 5, '#b85a3e');
    sdRect(ctx, d.x, d.y + 92, d.w, 46, '#6b4a2f');
    sdRect(ctx, d.x, d.y + 92, d.w, 6, '#8a5a33');
    sdRoundRect(ctx, s.sign.x - 34, s.sign.y - 14, 68, 26, 6, s.signCol);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(s.text, s.sign.x, s.sign.y);
    void si;
  });
  // Stall A goods: apples, oranges and baskets of fruit.
  const A = L.stallA;
  for (let i = 0; i < 5; i++) sdCircle(ctx, A.x + 22 + i * 24, A.y + 82, 9, i % 2 ? '#f28a2c' : '#d94b3f');
  for (let i = 0; i < 4; i++) sdCircle(ctx, A.x + 34 + i * 24, A.y + 66, 8, '#e85d75');
  if (!on.has('basket')) {
    const b = L.basket;
    ctx.beginPath();
    ctx.moveTo(b.x - 18, b.y - 6);
    ctx.lineTo(b.x + 18, b.y - 6);
    ctx.lineTo(b.x + 13, b.y + 12);
    ctx.lineTo(b.x - 13, b.y + 12);
    ctx.closePath();
    ctx.fillStyle = '#a87c4f';
    ctx.fill();
    sdCircle(ctx, b.x - 8, b.y - 10, 7, '#d94b3f');
    sdCircle(ctx, b.x + 2, b.y - 12, 7, '#f28a2c');
    sdCircle(ctx, b.x + 10, b.y - 9, 7, '#d94b3f');
  }
  const b2 = L.basketB;
  ctx.beginPath();
  ctx.moveTo(b2.x - 16, b2.y - 6);
  ctx.lineTo(b2.x + 16, b2.y - 6);
  ctx.lineTo(b2.x + 12, b2.y + 12);
  ctx.lineTo(b2.x - 12, b2.y + 12);
  ctx.closePath();
  ctx.fillStyle = '#a87c4f';
  ctx.fill();
  sdCircle(ctx, b2.x - 6, b2.y - 10, 7, '#8a6fd6');
  sdCircle(ctx, b2.x + 6, b2.y - 10, 7, '#4fae62');
  // Stall B goods: paper lanterns hanging in a row.
  L.lanterns.forEach((ln, i) => {
    if (i === 0 && on.has('lantern')) return;
    sdLine(ctx, ln.x, L.stallB.y + 4, ln.x, ln.y - 14, '#0c1024', 2);
    sdEllipse(ctx, ln.x, ln.y, 13, 16, '#e85d3f');
    sdEllipse(ctx, ln.x, ln.y, 13, 16, 'rgba(255,255,255,0.12)');
    sdLine(ctx, ln.x - 12, ln.y - 6, ln.x + 12, ln.y - 6, '#b83a28', 2);
    sdLine(ctx, ln.x - 12, ln.y + 6, ln.x + 12, ln.y + 6, '#b83a28', 2);
    sdCircle(ctx, ln.x, ln.y, 5, '#ffd93b');
  });
  // Vendor behind stall B, apron colour can change.
  const V = L.vendor;
  sdCircle(ctx, V.x, V.y - 34, 12, '#f2c9a0');
  ctx.beginPath();
  ctx.arc(V.x, V.y - 38, 13, Math.PI, 0);
  ctx.fillStyle = '#3a3f4a';
  ctx.fill();
  sdRoundRect(ctx, V.x - 16, V.y - 22, 32, 48, 8, on.has('apron') ? '#7a4fc9' : '#f2c230');
  sdCircle(ctx, V.x - 6, V.y - 8, 2, '#333');
  sdCircle(ctx, V.x + 6, V.y - 8, 2, '#333');
  // Stall C goods: jars on the counter, one can change colour.
  L.jars.forEach((j, i) => {
    sdRoundRect(ctx, j.x - 11, j.y - 20, 22, 30, 5, i === 2 && on.has('jar') ? '#e86a9a' : ['#2f9e8f', '#e86a9a', '#2f9e8f'][i]);
    sdRect(ctx, j.x - 8, j.y - 26, 16, 7, '#d9b380');
    sdCircle(ctx, j.x, j.y - 6, 4, 'rgba(255,255,255,0.5)');
  });
  // Cat curled up asleep on stall C's roof.
  if (!on.has('roof-cat')) {
    const Ccat = L.cat;
    sdEllipse(ctx, Ccat.x, Ccat.y, 20, 9, '#3a3f4a');
    sdCircle(ctx, Ccat.x + 16, Ccat.y - 4, 8, '#3a3f4a');
    ctx.beginPath();
    ctx.moveTo(Ccat.x + 10, Ccat.y - 10);
    ctx.lineTo(Ccat.x + 13, Ccat.y - 18);
    ctx.lineTo(Ccat.x + 17, Ccat.y - 10);
    ctx.closePath();
    ctx.fillStyle = '#3a3f4a';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(Ccat.x - 18, Ccat.y + 2);
    ctx.quadraticCurveTo(Ccat.x - 30, Ccat.y - 4, Ccat.x - 22, Ccat.y - 10);
    ctx.strokeStyle = '#3a3f4a';
    ctx.lineWidth = 4;
    ctx.stroke();
  }
}

function sdDrawScene(ctx, roundIndex, diffsOn) {
  ctx.clearRect(0, 0, 560, 400);
  if (roundIndex === 0) sdDrawGarden(ctx, diffsOn);
  else if (roundIndex === 1) sdDrawHarbour(ctx, diffsOn);
  else sdDrawMarket(ctx, diffsOn);
}
