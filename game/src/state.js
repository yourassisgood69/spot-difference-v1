// Game state and rules for Spot the Difference: rounds, scoring, combos,
// hints, misses and the timer. This file knows nothing about drawing or the
// DOM beyond the callbacks it calls into the renderer; the renderer and the
// input handler live in their own files.

const SD_State = {
  screen: 'start',
  roundIndex: 0,
  found: new Set(),
  foundAt: new Map(),
  hinted: null,
  hintUntil: 0,
  score: 0,
  totalScore: 0,
  combo: 0,
  bestCombo: 0,
  lastFindAt: 0,
  hintsLeft: 3,
  timeLeft: 90,
  timeBonus: 0,
  roundScore: 0,
  frozen: false,
  muted: false,
  misses: 0,
  finds: 0,
  startedAt: 0,
  finishedAt: 0,
};

function sdCurrentRound() {
  return SD_ROUND_DEFS[SD_State.roundIndex];
}

function sdDiffsOnRight() {
  // The right panel shows every difference of the current round applied.
  const on = new Set();
  sdCurrentRound().diffs.forEach((d) => on.add(d.id));
  return on;
}

function sdRemaining() {
  return sdCurrentRound().diffs.length - SD_State.found.size;
}

function sdStartGame() {
  SD_State.totalScore = 0;
  SD_State.bestCombo = 0;
  SD_State.finds = 0;
  SD_State.misses = 0;
  SD_State.startedAt = Date.now();
  sdStartRound(0);
}

function sdStartRound(index) {
  SD_State.roundIndex = index;
  SD_State.found = new Set();
  SD_State.foundAt = new Map();
  SD_State.hinted = null;
  SD_State.combo = 0;
  SD_State.lastFindAt = 0;
  SD_State.hintsLeft = 3;
  SD_State.timeLeft = sdCurrentRound().timeLimit;
  SD_State.roundScore = 0;
  SD_State.timeBonus = 0;
  SD_State.screen = 'play';
  SD_Render.drawPanels();
  SD_Render.updateHud();
  SD_Render.showScreen('play');
}

function sdNearestDiff(x, y) {
  const round = sdCurrentRound();
  let best = null;
  let bestDist = Infinity;
  round.diffs.forEach((d) => {
    const dist = Math.hypot(d.x - x, d.y - y);
    if (dist < bestDist) {
      bestDist = dist;
      best = d;
    }
  });
  if (best && bestDist <= round.radius) return best;
  return null;
}

// The single entry point for a click on either panel, used by the pointer
// handler and by the screenshot states alike: the same rules either way.
function sdFindAt(x, y) {
  if (SD_State.screen !== 'play') return 'idle';
  const diff = sdNearestDiff(x, y);
  if (diff && !SD_State.found.has(diff.id)) {
    const now = Date.now();
    if (now - SD_State.lastFindAt <= 4000) SD_State.combo += 1;
    else SD_State.combo = 1;
    SD_State.lastFindAt = now;
    if (SD_State.combo > SD_State.bestCombo) SD_State.bestCombo = SD_State.combo;
    const points = 100 + (SD_State.combo - 1) * 25;
    SD_State.score += points;
    SD_State.roundScore += points;
    SD_State.found.add(diff.id);
    SD_State.foundAt.set(diff.id, now);
    SD_State.finds += 1;
    SD_Sounds.playFind(SD_State.combo);
    SD_Render.drawPanels();
    SD_Render.updateHud();
    SD_Render.toast('+' + points + '  ·  ' + diff.label, 'good');
    if (SD_State.found.size === sdCurrentRound().diffs.length) sdFinishRound();
    return 'found';
  }
  if (diff && SD_State.found.has(diff.id)) {
    SD_Render.toast('Already found — ' + diff.label, 'info');
    return 'repeat';
  }
  SD_State.misses += 1;
  SD_State.combo = 0;
  SD_State.timeLeft = Math.max(0, SD_State.timeLeft - 3);
  SD_Sounds.playMiss();
  SD_Render.shakePanels();
  SD_Render.updateHud();
  SD_Render.toast('Miss! −3 seconds', 'bad');
  if (SD_State.timeLeft <= 0) sdTimeUp();
  return 'miss';
}

function sdUseHint() {
  if (SD_State.screen !== 'play') return false;
  if (SD_State.hintsLeft <= 0) {
    SD_Render.toast('No hints left this round', 'info');
    return false;
  }
  const unfound = sdCurrentRound().diffs.filter((d) => !SD_State.found.has(d.id));
  if (unfound.length === 0) return false;
  const pick = unfound[Math.floor(Math.random() * unfound.length)];
  SD_State.hintsLeft -= 1;
  SD_State.score = Math.max(0, SD_State.score - 50);
  SD_State.roundScore = Math.max(0, SD_State.roundScore - 50);
  SD_State.hinted = pick.id;
  SD_State.hintUntil = Date.now() + 1800;
  SD_Sounds.playHint();
  SD_Render.drawPanels();
  SD_Render.updateHud();
  SD_Render.toast('Hint −50 points', 'info');
  return true;
}

function sdFinishRound() {
  SD_State.timeBonus = Math.round(SD_State.timeLeft) * 5;
  SD_State.score += SD_State.timeBonus;
  SD_State.roundScore += SD_State.timeBonus;
  SD_State.totalScore = SD_State.score;
  SD_Sounds.playWin();
  if (SD_State.roundIndex + 1 >= SD_ROUND_DEFS.length) {
    SD_State.screen = 'final';
    SD_State.finishedAt = Date.now();
  } else {
    SD_State.screen = 'roundDone';
  }
  SD_Render.drawPanels();
  SD_Render.updateHud();
  SD_Render.showScreen(SD_State.screen);
}

function sdNextRound() {
  if (SD_State.screen !== 'roundDone') return;
  sdStartRound(SD_State.roundIndex + 1);
}

function sdTimeUp() {
  if (SD_State.screen !== 'play') return;
  SD_State.screen = 'timeUp';
  SD_State.totalScore = SD_State.score;
  SD_Sounds.playMiss();
  SD_Render.showScreen('timeUp');
}

function sdRestart() {
  sdStartGame();
}

function sdTick(dtSeconds) {
  if (SD_State.screen !== 'play' || SD_State.frozen) return;
  SD_State.timeLeft -= dtSeconds;
  if (SD_State.timeLeft <= 10 && SD_State.timeLeft > 0) {
    const whole = Math.ceil(SD_State.timeLeft);
    if (whole !== SD_State._lastTickSecond) {
      SD_State._lastTickSecond = whole;
      SD_Sounds.playTick();
    }
  }
  if (SD_State.timeLeft <= 0) {
    SD_State.timeLeft = 0;
    SD_Render.updateHud();
    sdTimeUp();
    return;
  }
  SD_Render.updateHud();
}
