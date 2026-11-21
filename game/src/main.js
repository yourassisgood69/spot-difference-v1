// Bootstrap for Spot the Difference: wires the renderer and input, runs
// the timer and the marker animations, and sets up real game states for
// screenshots. A ?shot= value plays the real rules forward — the game
// itself clicks real differences — never a faked frame:
//   ?shot=start   the start screen
//   ?shot=play    round 1 mid-play, 3 differences found, 5 still hidden
//   ?shot=round2  round 2 mid-play, 4 differences found
//   ?shot=end     the final screen after all three rounds

const SD_Main = {
  lastFrame: 0,

  boot() {
    SD_Render.init();
    SD_Input.init();
    SD_Render.showScreen('start');
    this.applyShot();
    this.lastFrame = performance.now();
    const step = (now) => {
      const dt = Math.min(0.25, (now - this.lastFrame) / 1000);
      this.lastFrame = now;
      if (SD_State.screen === 'play' && !SD_State.frozen) {
        sdTick(dt);
        if (this.needsRedraw()) SD_Render.drawPanels();
      } else if (SD_State.screen === 'play' && SD_State.frozen) {
        // Frozen screenshot state: one settled frame is already painted.
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  },

  needsRedraw() {
    if (Date.now() < SD_Render.shakeUntil) return true;
    if (SD_State.hinted && Date.now() < SD_State.hintUntil) return true;
    let animating = false;
    SD_State.foundAt.forEach((at) => {
      if (Date.now() - at < 500) animating = true;
    });
    return animating;
  },

  findDiffsByIndices(roundIndex, indices) {
    const diffs = SD_ROUND_DEFS[roundIndex].diffs;
    indices.forEach((i) => sdFindAt(diffs[i].x, diffs[i].y));
  },

  findDiffs(roundIndex, count) {
    const diffs = SD_ROUND_DEFS[roundIndex].diffs;
    const take = count === undefined ? diffs.length : count;
    for (let i = 0; i < take; i++) {
      sdFindAt(diffs[i].x, diffs[i].y);
    }
  },

  applyShot() {
    const params = new URLSearchParams(window.location.search);
    const shot = params.get('shot');
    if (!shot) return;
    SD_State.frozen = true;
    SD_Sounds.enabled = false;
    if (shot === 'start') {
      SD_Render.drawPanels();
      SD_Render.updateHud();
      return;
    }
    if (shot === 'play') {
      sdStartGame();
      // Three well-spread finds for the cover: sun, extra bird, awning.
      this.findDiffsByIndices(0, [0, 3, 6]);
      SD_State.timeLeft = 62;
      SD_Render.drawPanels();
      SD_Render.updateHud();
      return;
    }
    if (shot === 'round2') {
      sdStartGame();
      this.findDiffs(0);
      sdNextRound();
      this.findDiffs(1, 4);
      SD_State.timeLeft = 48;
      SD_Render.drawPanels();
      SD_Render.updateHud();
      return;
    }
    if (shot === 'end') {
      sdStartGame();
      this.findDiffs(0);
      sdNextRound();
      this.findDiffs(1);
      sdNextRound();
      this.findDiffs(2);
      SD_Render.drawPanels();
      SD_Render.updateHud();
      return;
    }
    SD_State.frozen = false;
    SD_Sounds.enabled = true;
  },
};

document.addEventListener('DOMContentLoaded', () => SD_Main.boot());

// Small hook for automated play-testing: the state and the same find entry
// point the pointer handler uses.
window.__spot = {
  state: SD_State,
  findAt: sdFindAt,
  useHint: sdUseHint,
  startGame: sdStartGame,
};
