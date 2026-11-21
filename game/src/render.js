// Renderer for Spot the Difference: paints both panels, the marker rings
// on found differences, the hint pulse, the HUD and the overlay screens.

const SD_Render = {
  leftCtx: null,
  rightCtx: null,
  shakeUntil: 0,
  shakePanel: null,

  init() {
    const left = document.getElementById('panel-left');
    const right = document.getElementById('panel-right');
    this.leftCtx = left.getContext('2d');
    this.rightCtx = right.getContext('2d');
    this.drawPanels();
    this.updateHud();
  },

  ringProgress(diffId) {
    // In a frozen screenshot state the ring is drawn complete at once.
    if (SD_State.frozen) return 1;
    const at = SD_State.foundAt.get(diffId);
    if (at === undefined) return 0;
    return Math.min(1, (Date.now() - at) / 450);
  },

  drawMarkerRing(ctx, x, y, radius, progress, colour) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
    ctx.strokeStyle = colour;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();
    if (progress >= 1) {
      ctx.beginPath();
      ctx.arc(x, y, radius - 7, 0, Math.PI * 2);
      ctx.strokeStyle = colour;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.55;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.moveTo(x - 7, y);
      ctx.lineTo(x - 2, y + 6);
      ctx.lineTo(x + 8, y - 6);
      ctx.strokeStyle = colour;
      ctx.lineWidth = 3.5;
      ctx.stroke();
    }
    ctx.restore();
  },

  drawPanels() {
    if (!this.leftCtx || !this.rightCtx) return;
    const round = SD_State.roundIndex;
    const rightOn = SD_State.screen === 'start' ? new Set() : sdDiffsOnRight();
    const shake = Date.now() < this.shakeUntil ? 1 : 0;
    [this.leftCtx, this.rightCtx].forEach((ctx, side) => {
      ctx.save();
      if (shake && this.shakePanel === side) {
        ctx.translate((Math.random() - 0.5) * 7, (Math.random() - 0.5) * 7);
      }
      sdDrawScene(ctx, round, side === 0 ? new Set() : rightOn);
      ctx.restore();
    });
    // Marker rings on both panels for every difference found so far.
    const now = Date.now();
    SD_State.found.forEach((id) => {
      const diff = sdCurrentRound().diffs.find((d) => d.id === id);
      if (!diff) return;
      const progress = this.ringProgress(id);
      this.drawMarkerRing(this.leftCtx, diff.x, diff.y, sdCurrentRound().radius + 4, progress, '#2f9e5f');
      this.drawMarkerRing(this.rightCtx, diff.x, diff.y, sdCurrentRound().radius + 4, progress, '#2f9e5f');
    });
    // Hint pulse on one unfound difference, on both panels.
    if (SD_State.hinted && now < SD_State.hintUntil) {
      const diff = sdCurrentRound().diffs.find((d) => d.id === SD_State.hinted);
      if (diff) {
        const pulse = 0.5 + 0.5 * Math.sin(now / 130);
        const r = sdCurrentRound().radius + 6 + pulse * 6;
        [this.leftCtx, this.rightCtx].forEach((ctx) => {
          ctx.save();
          ctx.beginPath();
          ctx.arc(diff.x, diff.y, r, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(242,165,65,' + (0.55 + pulse * 0.45) + ')';
          ctx.lineWidth = 4;
          ctx.stroke();
          ctx.restore();
        });
      }
    } else if (SD_State.hinted) {
      SD_State.hinted = null;
    }
  },

  shakePanels() {
    this.shakeUntil = Date.now() + 260;
    this.shakePanel = Math.random() < 0.5 ? 0 : 1;
  },

  updateHud() {
    const round = sdCurrentRound();
    const left = sdRemaining();
    const setText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };
    setText('round-label', 'Round ' + (SD_State.roundIndex + 1) + ' of 3 — ' + round.name);
    setText('round-place', round.place);
    setText('score-value', String(SD_State.score));
    setText('combo-value', SD_State.combo > 1 ? 'x' + SD_State.combo : '—');
    setText('found-value', SD_State.found.size + ' / ' + round.diffs.length + ' found · ' + left + ' left');
    setText('hint-count', String(SD_State.hintsLeft));
    const secs = Math.max(0, Math.ceil(SD_State.timeLeft));
    setText('timer-value', secs + 's');
    const bar = document.getElementById('timer-fill');
    if (bar) {
      const frac = Math.max(0, SD_State.timeLeft / round.timeLimit);
      bar.style.width = (frac * 100).toFixed(1) + '%';
      bar.classList.toggle('low', frac < 0.25);
    }
    const dots = document.getElementById('found-dots');
    if (dots) {
      dots.innerHTML = '';
      round.diffs.forEach((d) => {
        const dot = document.createElement('span');
        dot.className = 'dot' + (SD_State.found.has(d.id) ? ' done' : '');
        dot.title = SD_State.found.has(d.id) ? d.label : 'still hidden';
        dots.appendChild(dot);
      });
    }
    const hintBtn = document.getElementById('hint-btn');
    if (hintBtn) hintBtn.disabled = SD_State.screen !== 'play' || SD_State.hintsLeft <= 0;
  },

  toast(message, kind) {
    // Frozen screenshot states never show a toast: the frame must be clean.
    if (SD_State.frozen) return;
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = message;
    el.className = 'toast show ' + (kind || 'info');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      el.className = 'toast';
    }, 1900);
  },

  showScreen(screen) {
    const overlay = document.getElementById('overlay');
    const card = document.getElementById('overlay-card');
    if (!overlay || !card) return;
    if (screen === 'play') {
      overlay.classList.add('hidden');
      return;
    }
    overlay.classList.remove('hidden');
    if (screen === 'start') {
      card.innerHTML =
        '<h2>Spot the Difference</h2>' +
        '<p class="tagline">Three hand-drawn scenes. Two pictures that look the same — ' +
        'but they are not. Find every change before the clock runs out.</p>' +
        '<ul class="rules">' +
        '<li>Click a difference on <b>either</b> picture to mark it on both.</li>' +
        '<li>Three rounds: a sunny garden café, a harbour at dawn, a night market. ' +
        'Each round hides more, smaller differences and gives you less time.</li>' +
        '<li>Quick finds in a row build a combo worth extra points. ' +
        'Finish fast for a time bonus.</li>' +
        '<li>A miss costs 3 seconds. A hint pulses one hidden difference, ' +
        'costs 50 points, and you get 3 per round.</li>' +
        '<li>Keys: <b>H</b> hint · <b>R</b> restart · <b>M</b> sound on/off.</li>' +
        '</ul>' +
        '<button id="start-btn" class="big-btn">Start hunting</button>' +
        '<p class="fine">No downloads, no account, no network — the game runs entirely in this page.</p>';
      const btn = document.getElementById('start-btn');
      if (btn) btn.addEventListener('click', () => { SD_Sounds.playClick(); sdStartGame(); });
    } else if (screen === 'roundDone') {
      const next = SD_ROUND_DEFS[SD_State.roundIndex + 1];
      card.innerHTML =
        '<h2>Round complete!</h2>' +
        '<p class="tagline">You found all ' + sdCurrentRound().diffs.length + ' differences in ' +
        sdCurrentRound().name + '.</p>' +
        '<p class="score-line">Round score <b>' + SD_State.roundScore + '</b> ' +
        '(time bonus +' + SD_State.timeBonus + ')</p>' +
        '<p class="score-line">Total score <b>' + SD_State.score + '</b> · best combo x' +
        SD_State.bestCombo + '</p>' +
        '<p class="tagline">Next up: <b>' + next.name + '</b> — ' + next.blurb +
        ' ' + next.diffs.length + ' differences, ' + next.timeLimit + ' seconds.</p>' +
        '<button id="next-btn" class="big-btn">Next round</button>';
      const btn = document.getElementById('next-btn');
      if (btn) btn.addEventListener('click', () => { SD_Sounds.playClick(); sdNextRound(); });
    } else if (screen === 'final') {
      const secs = Math.round((SD_State.finishedAt - SD_State.startedAt) / 1000);
      card.innerHTML =
        '<h2>You found them all!</h2>' +
        '<p class="tagline">Three scenes, ' + SD_State.finds + ' differences found, ' +
        SD_State.misses + ' misses, in ' + secs + ' seconds.</p>' +
        '<p class="score-line big">Final score <b>' + SD_State.score + '</b></p>' +
        '<p class="score-line">Best combo <b>x' + SD_State.bestCombo + '</b></p>' +
        '<p class="tagline">How sharp were your eyes? Play again and beat your score — ' +
        'the differences are always in the same places, but the clock is not kind.</p>' +
        '<button id="again-btn" class="big-btn">Play again</button>';
      const btn = document.getElementById('again-btn');
      if (btn) btn.addEventListener('click', () => { SD_Sounds.playClick(); sdRestart(); });
    } else if (screen === 'timeUp') {
      card.innerHTML =
        '<h2>Time ran out</h2>' +
        '<p class="tagline">You found ' + SD_State.found.size + ' of ' +
        sdCurrentRound().diffs.length + ' differences in ' + sdCurrentRound().name + '.</p>' +
        '<p class="score-line">Score so far <b>' + SD_State.score + '</b></p>' +
        '<p class="tagline">The hidden ones were there all along — look closer next time.</p>' +
        '<button id="retry-btn" class="big-btn">Try this round again</button>' +
        '<button id="restart-btn" class="ghost-btn">Restart from round 1</button>';
      const retry = document.getElementById('retry-btn');
      if (retry) retry.addEventListener('click', () => { SD_Sounds.playClick(); sdStartRound(SD_State.roundIndex); });
      const restart = document.getElementById('restart-btn');
      if (restart) restart.addEventListener('click', () => { SD_Sounds.playClick(); sdRestart(); });
    }
  },
};
