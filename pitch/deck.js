/* TALOS deck engine. Works like PowerPoint: → next step, ← back.
 *
 * Every slide is a <section data-steps="N">. Its look is a pure function of (slide, step):
 *   [data-step="k"]  gets .on from step k onwards,
 *   [data-only="k"]  gets .on only at step k,
 *   scenes[data-scene].render(...) handles counts, the travelling dot and the grid.
 * Moving forward by one step animates; anything else (back, jumps, reload) snaps to the final state.
 * A slide with data-auto="ms" plays all its steps from one key press (see autoplay()).
 * A slide marked data-optional is skipped when its video cannot be loaded (e.g. not published).
 *
 * Keys: → Space PgDn Enter = next · ← PgUp Backspace = back · Home/End · F fullscreen · N notes · B blank · R restart
 *       A = fine print (appendix) for Q&A; A or any arrow returns to where you were
 * URL hash #slide.step (both 1-based) restarts exactly where you were.
 */
(() => {
  const stage = document.getElementById('stage');
  const slides = [...document.querySelectorAll('.slide')];
  const notes = document.getElementById('notes');
  const blank = document.getElementById('blank');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let cur = 0, step = 0;

  const fit = () => {
    const s = Math.min(innerWidth / 1920, innerHeight / 1080);
    stage.style.transform = `translate(-50%, -50%) scale(${s})`;
  };
  addEventListener('resize', fit);
  fit();

  // ---------- helpers ----------
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  let token = 0;  // bumped on every render; running animations stop when it changes

  function tween(ms, fn, my) {
    return new Promise(done => {
      const t0 = performance.now();
      const tick = now => {
        if (my !== token) return done(false);
        // rAF timestamps can precede t0 (frame start), so clamp to [0, 1]
        const p = Math.min(Math.max((now - t0) / ms, 0), 1);
        fn(ease(p));
        p < 1 ? requestAnimationFrame(tick) : done(true);
      };
      requestAnimationFrame(tick);
    });
  }

  function countTo(el, from, to, ms, my, fmt = v => String(Math.round(v))) {
    el.textContent = fmt(from);
    return tween(ms, p => { el.textContent = fmt(from + (to - from) * p); }, my)
      .then(ok => { if (ok) el.textContent = fmt(to); return ok; });
  }

  // ---------- scenes ----------
  const scenes = {};

  scenes.numbers = {
    render(slide, s, animate, my) {
      slide.classList.toggle('focusing', s >= 1 && s <= 5);
      slide.querySelectorAll('[data-focus]').forEach(c => c.classList.toggle('focus', +c.dataset.focus === s));
      const fifty = slide.querySelector('#fifty');
      if (s === 5 && animate) countTo(fifty, 13, 50, 1100, my, v => Math.round(v) + '%');
      else fifty.textContent = '50%';
    },
  };

  scenes.triad = {
    render(slide, s) {
      slide.querySelectorAll('.w').forEach(w => w.classList.toggle('past', +w.dataset.step < s));
    },
  };

  // Video slides: restart on entry, pause on exit; [data-t] elements light up at that second of the clip.
  function playOnEnter(video, slide) {
    const timed = [...slide.querySelectorAll('[data-t]')];
    const sync = () => timed.forEach(el => el.classList.toggle('on', video.currentTime >= +el.dataset.t));
    video.addEventListener('timeupdate', sync);
    return {
      enter() { video.currentTime = 0; sync(); video.play().catch(() => {}); },
      leave() { video.pause(); },
      render() {},
    };
  }
  // One clip, two panels: both sides always stay in sync.
  const proofVideo = document.getElementById('proof');
  scenes.proof = playOnEnter(proofVideo, proofVideo.closest('.slide'));

  // Scenario outcomes on the 30-scenario evaluation set E (e_000 … e_029), box placed on the tray.
  // From the paired audits of the saved rollouts (docs/evidence/host-verification.md in the TALOS repo).
  const ROUND = {
    1: [12, 16, 17, 21],
    2: [0, 2, 3, 7, 8, 11, 12, 16, 18, 20, 21, 22, 23, 25, 29],
    3: [0, 2, 3, 4, 5, 6, 8, 9, 12, 13, 23, 25],
  };
  const cellsEl = document.getElementById('cells');
  for (let i = 0; i < 30; i++) {
    const c = document.createElement('div');
    c.className = 'c';
    c.title = 'e_' + String(i).padStart(3, '0');
    cellsEl.appendChild(c);
  }
  const cells = [...cellsEl.children];

  function paintRound(r, animate) {
    const on = new Set(ROUND[r]);
    const lost = r === 3 ? new Set(ROUND[2].filter(i => !on.has(i))) : new Set();
    cells.forEach((c, i) => {
      const nowOn = on.has(i), nowRed = lost.has(i);
      const changed = c.classList.contains('on') !== nowOn || c.classList.contains('red') !== nowRed;
      c.style.setProperty('--d', animate ? ((i % 10) * 0.05 + Math.floor(i / 10) * 0.08) + 's' : '0s');
      if (animate && changed) c.classList.toggle('flip');
      c.classList.toggle('on', nowOn);
      c.classList.toggle('red', nowRed);
    });
  }

  const STAGE_X = [260, 610, 960, 1310, 1660], TRACK_Y = 560;
  scenes.how = {
    render(slide, s, animate, my) {
      const dot = slide.querySelector('#dot');
      const arc = slide.querySelector('#arc');
      const words = [...slide.querySelectorAll('.stage-w')];
      const pipe = slide.querySelector('#pipe');
      const setDot = (x, y) => { dot.setAttribute('cx', x); dot.setAttribute('cy', y); };
      const light = x => words.forEach((w, i) => w.classList.toggle('lit', x >= STAGE_X[i] - 8));

      pipe.style.opacity = s >= 1 ? '' : '0';
      pipe.classList.toggle('up', s >= 4);
      arc.classList.toggle('on', s >= 2);
      dot.classList.remove('fail');

      if (s === 1 && animate) {
        setDot(STAGE_X[0], TRACK_Y); light(STAGE_X[0]);
        tween(1600, p => { const x = STAGE_X[0] + (STAGE_X[4] - STAGE_X[0]) * p; setDot(x, TRACK_Y); light(x); }, my);
      } else if (s === 2 && animate) {
        arc.classList.remove('on');
        light(9999);
        setDot(STAGE_X[0], TRACK_Y);
        tween(900, p => setDot(STAGE_X[0] + (STAGE_X[3] - STAGE_X[0]) * p, TRACK_Y), my)
          .then(ok => {
            if (!ok) return false;
            dot.classList.add('fail');
            arc.classList.add('on');
            const len = arc.getTotalLength();
            return tween(900, p => { const pt = arc.getPointAtLength(len * p); setDot(pt.x, pt.y); }, my);
          })
          .then(ok => { if (ok) dot.classList.remove('fail'); });
      } else if (s >= 1) {
        light(9999);
        setDot(s === 1 ? STAGE_X[4] : STAGE_X[1], TRACK_Y);
      } else {
        light(-1);
        setDot(STAGE_X[0], TRACK_Y);
      }

      // Results: round 1 (step 4) → round 2 (step 5) → round 3 (step 6)
      const round = slide.querySelector('#round'), count = slide.querySelector('#count');
      const r = s >= 6 ? 3 : s === 5 ? 2 : 1;
      round.textContent = 'ROUND ' + r;
      if (animate && (s === 5 || s === 6)) {
        paintRound(r, true);
        countTo(count, ROUND[r - 1].length, ROUND[r].length, 1100, my);
      } else {
        paintRound(r, false);
        count.textContent = String(ROUND[r].length);
      }
      count.classList.toggle('red', r === 3);
    },
  };

  const demo = document.getElementById('demo');
  scenes.demo = playOnEnter(demo, demo.closest('.slide'));

  // ---------- optional slides ----------
  // A slide with data-optional is shown only once its video can play; if it fails to load it is skipped.
  const optionalReady = slides.filter(s => s.hasAttribute('data-optional')).map(s => {
    s.dataset.skip = '1';
    const v = s.querySelector('video');
    return new Promise(settle => {
      if (v.readyState >= 2) { delete s.dataset.skip; return settle(); }
      v.addEventListener('loadeddata', () => { delete s.dataset.skip; settle(); }, { once: true });
      v.addEventListener('error', settle, { once: true });
      setTimeout(settle, 2000);
    });
  });
  // Appendix slides (data-appendix) are never reached with the arrow keys; A opens and closes them.
  const usable = i => i >= 0 && i < slides.length && !slides[i].dataset.skip && !slides[i].hasAttribute('data-appendix');
  const appendixIndex = slides.findIndex(s => s.hasAttribute('data-appendix'));
  let returnTo = null;
  function toggleAppendix() {
    if (appendixIndex < 0) return;
    const prev = cur;
    clearTimeout(autoTimer);
    if (returnTo) { [cur, step] = returnTo; returnTo = null; if (autoMs(cur)) step = stepsOf(cur) - 1; }
    else { returnTo = [cur, step]; cur = appendixIndex; step = 0; }
    render(false, prev);
  }

  // ---------- core ----------
  const stepsOf = i => +slides[i].dataset.steps || 1;

  // A slide with data-auto="ms" plays all its steps from one key press, one step every ms.
  // The next press leaves the slide; arriving any other way (back, jump, reload) shows its finished state.
  const autoMs = i => +slides[i].dataset.auto || 0;
  let autoTimer = 0;
  function autoplay() {
    clearTimeout(autoTimer);
    if (!autoMs(cur)) return;
    if (reduced) { step = stepsOf(cur) - 1; return render(false, cur); }
    const here = cur;
    const tick = () => {
      if (cur !== here || returnTo || step >= stepsOf(cur) - 1) return;
      step++;
      render(true, cur);
      if (step < stepsOf(cur) - 1) autoTimer = setTimeout(tick, autoMs(cur));
    };
    autoTimer = setTimeout(tick, autoMs(cur));
  }

  function render(animate, prev) {
    token++;
    const my = token;
    const slide = slides[cur];
    animate = animate && !reduced;
    if (!animate) stage.classList.add('instant');
    slides.forEach((x, i) => x.classList.toggle('active', i === cur));
    slide.querySelectorAll('[data-step]').forEach(el => el.classList.toggle('on', step >= +el.dataset.step));
    slide.querySelectorAll('[data-only]').forEach(el => el.classList.toggle('on', step === +el.dataset.only));
    const scene = scenes[slide.dataset.scene];
    if (prev !== cur) {
      scenes[slides[prev].dataset.scene]?.leave?.();
      scene?.enter?.();
    }
    scene?.render(slide, step, animate, my);
    notes.textContent = slide.dataset.note || '';
    history.replaceState(null, '', `#${cur + 1}.${step + 1}`);
    if (!animate) { void stage.offsetWidth; requestAnimationFrame(() => requestAnimationFrame(() => stage.classList.remove('instant'))); }
  }

  function go(dir) {
    if (returnTo) return toggleAppendix();  // any arrow leaves the fine print, back where you were
    clearTimeout(autoTimer);
    const prev = cur;
    const auto = autoMs(cur) > 0;
    if (dir > 0) {
      if (!auto && step < stepsOf(cur) - 1) step++;
      else {
        let i = cur + 1;
        while (i < slides.length && !usable(i)) i++;
        if (i >= slides.length) return;
        cur = i; step = 0;
      }
      render(true, prev);
      if (cur !== prev) autoplay();
    } else {
      if (!auto && step > 0) step--;
      else {
        let i = cur - 1;
        while (i >= 0 && !usable(i)) i--;
        if (i < 0) return;
        cur = i; step = stepsOf(cur) - 1;
      }
      render(false, prev);
    }
  }

  function jump(slide, s) {
    const prev = cur;
    returnTo = null;
    cur = Math.max(0, Math.min(slides.length - 1, slide));
    // land on the nearest regular slide: forward first (skipped clip), else backward (appendix at the end)
    let i = cur;
    while (i < slides.length && !usable(i)) i++;
    if (i >= slides.length) { i = cur; while (i > 0 && !usable(i)) i--; }
    cur = i;
    step = autoMs(cur) ? stepsOf(cur) - 1 : Math.max(0, Math.min(stepsOf(cur) - 1, s));
    clearTimeout(autoTimer);
    render(false, prev);
  }

  const fullscreen = () => document.fullscreenElement
    ? document.exitFullscreen()
    : document.documentElement.requestFullscreen().catch(() => {});

  addEventListener('keydown', e => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const k = e.key;
    if (['ArrowRight', 'PageDown', ' ', 'Enter', 'ArrowDown'].includes(k)) { e.preventDefault(); go(1); }
    else if (['ArrowLeft', 'PageUp', 'Backspace', 'ArrowUp'].includes(k)) { e.preventDefault(); go(-1); }
    else if (k === 'Home') jump(0, 0);
    else if (k === 'End') jump(slides.length - 1, Infinity);
    else if (k === 'f' || k === 'F') fullscreen();
    else if (k === 'n' || k === 'N') notes.classList.toggle('show');
    else if (k === 'b' || k === 'B' || k === '.') blank.classList.toggle('show');
    else if (k === 'r' || k === 'R') jump(0, 0);
    else if (k === 'a' || k === 'A') toggleAppendix();
  });

  // Hide the cursor when idle; never advance on click (a stray click must not skip a beat).
  let idle;
  addEventListener('mousemove', () => {
    document.body.classList.remove('idle');
    clearTimeout(idle);
    idle = setTimeout(() => document.body.classList.add('idle'), 1500);
  });

  const m = location.hash.match(/^#(\d+)(?:\.(\d+))?$/);
  const start = () => m ? jump(+m[1] - 1, (+m[2] || 1) - 1) : jump(0, 0);
  Promise.all([document.fonts ? document.fonts.ready : null, ...optionalReady]).then(start);
})();
