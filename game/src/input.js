// Pointer and keyboard input for Spot the Difference. A click on either
// canvas is mapped back into scene coordinates and handed to the state as
// one find attempt; keys drive hint, restart and sound.

const SD_Input = {
  init() {
    const left = document.getElementById('panel-left');
    const right = document.getElementById('panel-right');
    [left, right].forEach((canvas) => {
      canvas.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 560;
        const y = ((event.clientY - rect.top) / rect.height) * 400;
        sdFindAt(x, y);
      });
    });

    const hintBtn = document.getElementById('hint-btn');
    if (hintBtn) hintBtn.addEventListener('click', () => sdUseHint());
    const restartBtn = document.getElementById('restart-btn-top');
    if (restartBtn) restartBtn.addEventListener('click', () => { SD_Sounds.playClick(); sdRestart(); });
    const soundBtn = document.getElementById('sound-btn');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        SD_Sounds.enabled = !SD_Sounds.enabled;
        SD_State.muted = !SD_Sounds.enabled;
        soundBtn.textContent = SD_Sounds.enabled ? 'Sound: on' : 'Sound: off';
      });
    }

    document.addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase();
      if (key === 'h') {
        sdUseHint();
      } else if (key === 'r') {
        sdRestart();
      } else if (key === 'm') {
        SD_Sounds.enabled = !SD_Sounds.enabled;
        SD_State.muted = !SD_Sounds.enabled;
        const btn = document.getElementById('sound-btn');
        if (btn) btn.textContent = SD_Sounds.enabled ? 'Sound: on' : 'Sound: off';
      } else if (key === 'enter') {
        if (SD_State.screen === 'start') sdStartGame();
        else if (SD_State.screen === 'roundDone') sdNextRound();
        else if (SD_State.screen === 'final' || SD_State.screen === 'timeUp') sdRestart();
      }
    });
  },
};
