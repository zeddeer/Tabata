(() => {
  const phaseEl = document.getElementById('phase');
  const timeEl = document.getElementById('time');
  const roundEl = document.getElementById('round');
  const progressBar = document.getElementById('progressBar');
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const resetBtn = document.getElementById('resetBtn');
  const workInput = document.getElementById('workInput');
  const restInput = document.getElementById('restInput');
  const roundsInput = document.getElementById('roundsInput');

  let audioCtx = null;
  let phase = 'ready'; // ready | work | rest | done
  let round = 1;
  let secondsLeft = 0;
  let phaseDuration = 0;
  let tickId = null;

  function getSettings() {
    return {
      work: Math.max(1, parseInt(workInput.value, 10) || 20),
      rest: Math.max(1, parseInt(restInput.value, 10) || 10),
      rounds: Math.max(1, parseInt(roundsInput.value, 10) || 8),
    };
  }

  function ensureAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function beep(freq, duration, delay = 0, volume = 0.35) {
    if (!audioCtx) return;
    const startTime = audioCtx.currentTime + delay;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.015);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  // Work signal: bright double beep ("go!")
  function playWorkSignal() {
    beep(880, 0.14, 0);
    beep(1175, 0.18, 0.16);
  }

  // Rest signal: single lower beep
  function playRestSignal() {
    beep(392, 0.35, 0);
  }

  // Done signal: three-note ascending chime
  function playDoneSignal() {
    beep(523, 0.16, 0);
    beep(659, 0.16, 0.18);
    beep(784, 0.3, 0.36);
  }

  function updateDisplay() {
    const settings = getSettings();
    timeEl.textContent = secondsLeft;
    roundEl.textContent = `Round ${round} / ${settings.rounds}`;

    phaseEl.className = 'phase';
    progressBar.className = 'progress-bar';

    if (phase === 'ready') {
      phaseEl.textContent = 'READY';
      roundEl.textContent = `${settings.rounds} rounds • ${settings.work}s work / ${settings.rest}s rest`;
      progressBar.style.width = '0%';
    } else if (phase === 'work') {
      phaseEl.textContent = 'WORK';
      phaseEl.classList.add('work');
      progressBar.classList.add('work');
    } else if (phase === 'rest') {
      phaseEl.textContent = 'REST';
      phaseEl.classList.add('rest');
      progressBar.classList.add('rest');
    } else if (phase === 'done') {
      phaseEl.textContent = 'COMPLETE';
      phaseEl.classList.add('done');
      timeEl.textContent = '✓';
      progressBar.style.width = '100%';
    }

    if (phase === 'work' || phase === 'rest') {
      const elapsed = phaseDuration - secondsLeft;
      const pct = phaseDuration > 0 ? (elapsed / phaseDuration) * 100 : 0;
      progressBar.style.width = `${pct}%`;
    }
  }

  function enterPhase(newPhase) {
    const settings = getSettings();
    phase = newPhase;

    if (phase === 'work') {
      phaseDuration = settings.work;
      secondsLeft = settings.work;
      playWorkSignal();
    } else if (phase === 'rest') {
      phaseDuration = settings.rest;
      secondsLeft = settings.rest;
      playRestSignal();
    } else if (phase === 'done') {
      playDoneSignal();
      stopTimer();
      startBtn.disabled = false;
      startBtn.textContent = 'Start';
      pauseBtn.disabled = true;
    }

    updateDisplay();
  }

  function tick() {
    secondsLeft -= 1;

    if (secondsLeft < 0) {
      const settings = getSettings();
      if (phase === 'work') {
        if (round >= settings.rounds) {
          enterPhase('done');
          return;
        }
        enterPhase('rest');
      } else if (phase === 'rest') {
        round += 1;
        enterPhase('work');
      }
      return;
    }

    updateDisplay();
  }

  function startTimer() {
    if (tickId) return;
    tickId = setInterval(tick, 1000);
  }

  function stopTimer() {
    if (tickId) {
      clearInterval(tickId);
      tickId = null;
    }
  }

  function handleStart() {
    ensureAudio();
    setInputsDisabled(true);

    if (phase === 'ready' || phase === 'done') {
      round = 1;
      enterPhase('work');
    }

    startTimer();
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    pauseBtn.textContent = 'Pause';
  }

  function handlePause() {
    if (tickId) {
      stopTimer();
      pauseBtn.textContent = 'Resume';
      startBtn.disabled = false;
      startBtn.textContent = 'Continue';
    } else {
      startTimer();
      pauseBtn.textContent = 'Pause';
      startBtn.disabled = true;
    }
  }

  function handleReset() {
    stopTimer();
    phase = 'ready';
    round = 1;
    secondsLeft = 0;
    setInputsDisabled(false);
    startBtn.disabled = false;
    startBtn.textContent = 'Start';
    pauseBtn.disabled = true;
    pauseBtn.textContent = 'Pause';
    updateDisplay();
  }

  function setInputsDisabled(disabled) {
    workInput.disabled = disabled;
    restInput.disabled = disabled;
    roundsInput.disabled = disabled;
  }

  startBtn.addEventListener('click', handleStart);
  pauseBtn.addEventListener('click', handlePause);
  resetBtn.addEventListener('click', handleReset);

  updateDisplay();
})();
