/**
 * Rub-to-reveal paint effect on the hero (was js/footer-eyes.js → initRubReveal + initCursorHint).
 *
 * The black "paint" layer is revealed through an SVG mask (#rubMask → <g id="rubDots">):
 *  - moving the pointer paints a soft round brush + expanding "water flow" ripples
 *  - scrolling (or touch devices, after 0.8 s) lets two uneven liquid waves wash over the hero
 *  - once the hero is fully revealed it stays revealed.
 *
 * Logic is ported 1:1; the only change is that elements are passed in instead of looked up
 * globally, and a destroy() callback removes every listener / animation frame.
 */
const SVG_NS = 'http://www.w3.org/2000/svg';

interface Ripple {
  circle: SVGCircleElement;
  r: number;
  maxR: number;
  speed: number;
}

export function initRubReveal(heroEl: HTMLElement, dotsGroup: SVGGElement, hint: HTMLElement | null): () => void {
  const BRUSH_WIDTH = 190;
  const INITIAL_RIPPLE_RADIUS = 190;
  const GROWTH_SPEED = 1.7; // Gentle, smooth water-flow expansion (~66px/sec)
  const MAX_RIPPLES = 25;

  let currentPath: SVGPathElement | null = null;
  let pathD = '';
  let pathPointsCount = 0;

  let lastX: number | null = null;
  let lastY: number | null = null;
  let lastRippleTime = 0;
  let lastSpawnX = 0;
  let lastSpawnY = 0;
  let activeRipples: Ripple[] = [];
  let rafId: number | null = null;
  let waveRaf: number | null = null;
  let autoFilled = false;
  let mobileTimer: ReturnType<typeof setTimeout> | null = null;

  const hideHint = (): void => {
    if (hint) hint.classList.add('hide');
  };

  function getMaxHeroRadius(x: number, y: number): number {
    const rect = heroEl.getBoundingClientRect();
    const d1 = Math.hypot(x, y);
    const d2 = Math.hypot(rect.width - x, y);
    const d3 = Math.hypot(x, rect.height - y);
    const d4 = Math.hypot(rect.width - x, rect.height - y);
    return Math.max(d1, d2, d3, d4) + 80;
  }

  function fillHeroCover(): void {
    if (autoFilled) return;
    autoFilled = true;
    if (typeof document !== 'undefined' && document.body) {
      document.body.classList.add('hero-revealed');
    }
    if (!dotsGroup.querySelector('.auto-fill-rect')) {
      const rect = document.createElementNS(SVG_NS, 'rect');
      rect.setAttribute('x', '-2000');
      rect.setAttribute('y', '-2000');
      rect.setAttribute('width', '5000');
      rect.setAttribute('height', '5000');
      rect.setAttribute('fill', 'white');
      rect.classList.add('auto-fill-rect');
      dotsGroup.appendChild(rect);
    }
    hideHint();

    activeRipples = [];
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function updateWaterFlow(): void {
    let hasGrowing = false;
    for (let i = activeRipples.length - 1; i >= 0; i--) {
      const item = activeRipples[i];
      if (item.r < item.maxR) {
        item.r += item.speed;
        item.circle.setAttribute('r', item.r.toFixed(1));
        hasGrowing = true;
      } else {
        // When a ripple reaches maxR, it has smoothly expanded past all 4 corners
        fillHeroCover();
        return;
      }
    }

    if (hasGrowing && !autoFilled) {
      rafId = requestAnimationFrame(updateWaterFlow);
    } else {
      rafId = null;
    }
  }

  function startWaterFlow(): void {
    if (!rafId && activeRipples.length > 0) {
      rafId = requestAnimationFrame(updateWaterFlow);
    }
  }

  function startStroke(x: number, y: number): void {
    currentPath = document.createElementNS(SVG_NS, 'path');
    currentPath.setAttribute('fill', 'none');
    currentPath.setAttribute('stroke', 'white');
    currentPath.setAttribute('stroke-width', String(BRUSH_WIDTH));
    currentPath.setAttribute('stroke-linecap', 'round');
    currentPath.setAttribute('stroke-linejoin', 'round');
    pathD = `M ${x.toFixed(1)} ${y.toFixed(1)} L ${x.toFixed(1)} ${y.toFixed(1)}`;
    currentPath.setAttribute('d', pathD);
    dotsGroup.appendChild(currentPath);
    pathPointsCount = 1;
  }

  function appendPoint(x: number, y: number): void {
    if (!currentPath) {
      startStroke(x, y);
      return;
    }
    pathD += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    currentPath.setAttribute('d', pathD);
    pathPointsCount++;
    if (pathPointsCount >= 40) {
      startStroke(x, y);
    }
  }

  function endStroke(): void {
    currentPath = null;
    pathD = '';
    pathPointsCount = 0;
    lastX = null;
    lastY = null;
  }

  function spawnRipple(x: number, y: number): void {
    if (autoFilled) return;

    const circle = document.createElementNS(SVG_NS, 'circle');
    circle.setAttribute('cx', x.toFixed(1));
    circle.setAttribute('cy', y.toFixed(1));
    circle.setAttribute('r', String(INITIAL_RIPPLE_RADIUS));
    circle.setAttribute('fill', 'url(#rubSoftCircle)');
    dotsGroup.appendChild(circle);

    const maxR = getMaxHeroRadius(x, y);
    activeRipples.push({ circle, r: INITIAL_RIPPLE_RADIUS, maxR, speed: GROWTH_SPEED });

    if (activeRipples.length > MAX_RIPPLES) {
      activeRipples.shift();
    }

    startWaterFlow();
  }

  function addFlowPoint(x: number, y: number): void {
    if (autoFilled) return;

    const rect = heroEl.getBoundingClientRect();
    if (x < -120 || y < -120 || x > rect.width + 120 || y > rect.height + 120) {
      endStroke();
      return;
    }

    if (lastX === null || lastY === null) {
      lastX = x;
      lastY = y;
      lastSpawnX = x;
      lastSpawnY = y;
      startStroke(x, y);
      spawnRipple(x, y);
      return;
    }

    const dist = Math.hypot(x - lastX, y - lastY);
    if (dist < 3) return;

    hideHint();

    // Smooth interpolation between pointer events so fast movement never leaves gaps or jumps
    if (dist > 22) {
      const steps = Math.min(6, Math.floor(dist / 12));
      for (let s = 1; s <= steps; s++) {
        const ix = lastX + (x - lastX) * (s / steps);
        const iy = lastY + (y - lastY) * (s / steps);
        appendPoint(ix, iy);
      }
    } else {
      appendPoint(x, y);
    }

    lastX = x;
    lastY = y;

    // Calmly spawn expanding water flow ripples as cursor travels
    const now = performance.now();
    const distSinceSpawn = Math.hypot(x - lastSpawnX, y - lastSpawnY);
    if ((now - lastRippleTime > 180 && distSinceSpawn > 30) || now - lastRippleTime > 400) {
      lastRippleTime = now;
      lastSpawnX = x;
      lastSpawnY = y;
      spawnRipple(x, y);
    }
  }

  const onPointerMove = (e: PointerEvent): void => {
    const rect = heroEl.getBoundingClientRect();
    addFlowPoint(e.clientX - rect.left, e.clientY - rect.top);
  };
  const onPointerDown = (e: PointerEvent): void => {
    const rect = heroEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    startStroke(x, y);
    spawnRipple(x, y);
  };
  heroEl.addEventListener('pointermove', onPointerMove);
  heroEl.addEventListener('pointerdown', onPointerDown);
  heroEl.addEventListener('pointerleave', endStroke);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointerup', endStroke);

  // ── Uneven liquid flow: from top to bottom (scroll down) and bottom to top (scroll up) ──
  let topWavePath: SVGPathElement | null = null;
  let bottomWavePath: SVGPathElement | null = null;
  let currentTopY = -60;
  let currentBottomY = -40;
  let isAutoProgressing = false;
  let autoStartTime = 0;
  let autoTimerProgress = 0;

  function ensureWaveElements(): void {
    if (!topWavePath) {
      topWavePath = document.createElementNS(SVG_NS, 'path');
      topWavePath.setAttribute('fill', 'white');
      dotsGroup.appendChild(topWavePath);
    }
    if (!bottomWavePath) {
      bottomWavePath = document.createElementNS(SVG_NS, 'path');
      bottomWavePath.setAttribute('fill', 'white');
      dotsGroup.appendChild(bottomWavePath);
    }
  }

  function generateTopWavePath(width: number, currentY: number, time: number): string {
    if (currentY <= -50) {
      return `M -140 -140 L ${width + 140} -140 L ${width + 140} -70 L -140 -70 Z`;
    }

    const segments = 8;
    const dx = (width + 280) / segments;
    // Organic uneven offsets so liquid flows down with natural peaks and valleys
    const staticOffsets = [0, 52, -26, 78, 20, -45, 62, -15, 0];
    const points: { x: number; y: number }[] = [];

    for (let i = 0; i <= segments; i++) {
      const x = -140 + i * dx;
      const sway = Math.sin(time * 0.002 + i * 1.35) * 12;
      const y = currentY + staticOffsets[i] + sway;
      points.push({ x, y });
    }

    let d = `M -140 -140 L ${width + 140} -140 L ${points[points.length - 1].x.toFixed(1)} ${points[points.length - 1].y.toFixed(1)}`;
    for (let i = points.length - 1; i > 0; i--) {
      const p1 = points[i];
      const p0 = points[i - 1];
      const midX = (p1.x + p0.x) / 2;
      const midY = (p1.y + p0.y) / 2;
      d += ` Q ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} ${midX.toFixed(1)} ${midY.toFixed(1)}`;
    }
    d += ` L ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} Z`;
    return d;
  }

  function generateBottomWavePath(width: number, height: number, currentYBottom: number, time: number): string {
    if (currentYBottom <= -30) {
      return `M -140 ${height + 140} L ${width + 140} ${height + 140} L ${width + 140} ${height + 70} L -140 ${height + 70} Z`;
    }

    const segments = 8;
    const dx = (width + 280) / segments;
    const staticOffsets = [0, -42, 28, -68, -18, 38, -55, -12, 0];
    const points: { x: number; y: number }[] = [];

    for (let i = 0; i <= segments; i++) {
      const x = -140 + i * dx;
      const sway = Math.cos(time * 0.002 + i * 1.4) * 10;
      const y = height - currentYBottom + staticOffsets[i] + sway;
      points.push({ x, y });
    }

    let d = `M -140 ${height + 140} L ${width + 140} ${height + 140} L ${points[points.length - 1].x.toFixed(1)} ${points[points.length - 1].y.toFixed(1)}`;
    for (let i = points.length - 1; i > 0; i--) {
      const p1 = points[i];
      const p0 = points[i - 1];
      const midX = (p1.x + p0.x) / 2;
      const midY = (p1.y + p0.y) / 2;
      d += ` Q ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} ${midX.toFixed(1)} ${midY.toFixed(1)}`;
    }
    d += ` L ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} Z`;
    return d;
  }

  function updateWaveLoop(now: number): void {
    if (autoFilled) return; // Once filled, stay permanently revealed and never redo

    ensureWaveElements();

    const rect = heroEl.getBoundingClientRect();
    const heroWidth = rect.width;
    const heroHeight = rect.height;
    const scrollY = window.scrollY || window.pageYOffset || 0;

    if (scrollY >= 20 && !isAutoProgressing) {
      isAutoProgressing = true;
      autoStartTime = now;
      hideHint();
    }

    if (isAutoProgressing && autoTimerProgress < 1) {
      autoTimerProgress = Math.min(1, (now - autoStartTime) / 2800);
    }

    // Scroll-based progress: 20px -> 0, 400px -> 1
    const scrollProgress = Math.min(1, Math.max(0, (scrollY - 20) / 400));

    // Monotonic progress: always advances forward, never retreats or redoes
    const effectiveProgress = Math.max(scrollProgress, isAutoProgressing ? autoTimerProgress : 0);

    // Silky easeInOutSine
    const eased = -(Math.cos(Math.PI * effectiveProgress) - 1) / 2;

    // Target depths for top and bottom waves
    const targetTopY = -60 + eased * (heroHeight + 170);
    const targetBottomY = -40 + eased * (heroHeight * 0.45 + 80);

    // Inertia lerp smoothing for weightless fluid motion
    currentTopY += (targetTopY - currentTopY) * 0.075;
    currentBottomY += (targetBottomY - currentBottomY) * 0.075;

    topWavePath!.setAttribute('d', generateTopWavePath(heroWidth, currentTopY, now));
    bottomWavePath!.setAttribute('d', generateBottomWavePath(heroWidth, heroHeight, currentBottomY, now));

    if (effectiveProgress >= 0.98 && targetTopY - currentTopY < 2) {
      fillHeroCover();
      return; // Stop animation loop permanently
    }

    waveRaf = requestAnimationFrame(updateWaveLoop);
  }

  // ── "colour me" hint: shown on the next frame, hidden as soon as anything is painted ──
  // (registered in the same order as the original scripts: rub-reveal first, then the hint)
  waveRaf = requestAnimationFrame(updateWaveLoop);

  function checkScroll(): void {
    if (autoFilled) return;
    const scrollY = window.scrollY || window.pageYOffset || 0;
    if (scrollY >= 480) {
      fillHeroCover();
    }
  }

  window.addEventListener('scroll', checkScroll, { passive: true });
  checkScroll();

  // Mobile fallback
  if (window.matchMedia('(hover: none)').matches) {
    mobileTimer = setTimeout(() => {
      if (!autoFilled && !isAutoProgressing) {
        isAutoProgressing = true;
        autoStartTime = performance.now();
        hideHint();
      }
    }, 800);
  }

  const onHintClick = (e: MouseEvent): void => {
    e.stopPropagation();
    hideHint();
    const rect = heroEl.getBoundingClientRect();
    const btnRect = hint?.getBoundingClientRect();
    if (btnRect) {
      const cx = btnRect.left + btnRect.width / 2 - rect.left;
      const cy = btnRect.top + btnRect.height / 2 - rect.top;
      spawnRipple(cx, cy);
    }
    if (!isAutoProgressing) {
      isAutoProgressing = true;
      autoStartTime = performance.now();
    }
  };

  if (hint) {
    hint.addEventListener('click', onHintClick);
  }

  return function destroy(): void {
    if (typeof document !== 'undefined' && document.body) {
      document.body.classList.remove('hero-rub-active', 'hero-revealed');
    }
    if (hint) {
      hint.removeEventListener('click', onHintClick);
    }
    heroEl.removeEventListener('pointermove', onPointerMove);
    heroEl.removeEventListener('pointerdown', onPointerDown);
    heroEl.removeEventListener('pointerleave', endStroke);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('pointerup', endStroke);
    window.removeEventListener('scroll', checkScroll);
    if (rafId) cancelAnimationFrame(rafId);
    if (waveRaf) cancelAnimationFrame(waveRaf);
    if (mobileTimer) clearTimeout(mobileTimer);
  };
}
