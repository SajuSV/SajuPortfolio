/**
 * SHARED PAGE EFFECTS
 * Small animation helpers used by more than one component (home, footer, hero).
 * Each `init...` function starts an effect and RETURNS a "cleanup" function.
 * The component calls that cleanup in ngOnDestroy so nothing keeps running after it is removed.
 */

/** Extra delay (ms) for some elements, so they appear one after another. Key = data-ws-appear-id. */
const EXTRA_DELAY_MS: Record<string, number> = {
  '7d2myj': 200,
  'i7f3zr': 400,
  '198dkc3': 600,
  'prtpi1': 1200,
  'tangiq': 1400,
  '1994vxa': 1400,
  'cxut1g': 1600,
};

/**
 * EFFECT 1 - FADE IN ON SCROLL
 * Elements with class "fade-el" get the class "is-visible" when they scroll into view
 * (CSS then animates them) and lose it again when they scroll out.
 */
export function initFadeIn(root: HTMLElement): () => void {
  const fadeEls = Array.from(root.querySelectorAll<HTMLElement>('.fade-el'));
  if (!fadeEls.length) return () => {};

  const timers: ReturnType<typeof setTimeout>[] = [];

  // We watch a visible parent ("watcher") instead of the element itself, because the
  // element may start hidden/moved. One watcher can have several fade elements.
  const watcherToElements = new Map<HTMLElement, HTMLElement[]>();
  fadeEls.forEach((fadeEl) => {
    const watcher = findSizedAncestor(fadeEl);
    if (!watcherToElements.has(watcher)) watcherToElements.set(watcher, []);
    watcherToElements.get(watcher)!.push(fadeEl);
  });

  // IntersectionObserver = browser tool that tells us when an element enters/leaves the screen
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const targets = watcherToElements.get(entry.target as HTMLElement) || [];
        targets.forEach((fadeEl) => {
          if (entry.isIntersecting) {
            const id = fadeEl.getAttribute('data-ws-appear-id') || '';
            const delay = EXTRA_DELAY_MS[id] || 0;
            timers.push(setTimeout(() => fadeEl.classList.add('is-visible'), delay));
          } else {
            fadeEl.classList.remove('is-visible');
          }
        });
      });
    },
    { threshold: 0, rootMargin: '0px 0px -10% 0px' }, // trigger a bit before the bottom edge
  );
  watcherToElements.forEach((_, watcher) => observer.observe(watcher));

  return () => {
    observer.disconnect();
    timers.forEach((t) => clearTimeout(t));
  };
}

/** Walks up the parents until it finds one that has a real size on screen. */
function findSizedAncestor(el: HTMLElement): HTMLElement {
  let node = el.parentElement;
  while (node && node !== document.body) {
    const box = node.getBoundingClientRect();
    if (box.width > 0 || box.height > 0) return node;
    node = node.parentElement;
  }
  return el;
}

/**
 * EFFECT 2 - ENDLESS TICKER (scrolling row of logos / skills)
 * Copies every item in each ".ticker-list" once, so the CSS animation can loop with no gap.
 */
export function initTickers(root: HTMLElement): () => void {
  const containers = Array.from(
    root.querySelectorAll<HTMLElement>(
      '[data-ws-name="Ticker"], [name="Ticker"], [name="Ticker 2"], [name="Ticker 3"]',
    ),
  );

  const prepared: { list: HTMLElement; originalCount: number }[] = [];

  // Tells CSS how far to move (--ticker-shift) = where the first copied item starts
  const measureShift = (list: HTMLElement, originalCount: number): void => {
    const firstClone = list.children[originalCount] as HTMLElement;
    if (!firstClone) return;
    list.style.setProperty('--ticker-shift', `${firstClone.offsetLeft}px`);
  };

  containers.forEach((container) => {
    container.querySelectorAll<HTMLElement>('ul').forEach((list) => {
      if (list.dataset['tickerInit']) return; // already prepared
      if (!list.classList.contains('ticker-list')) return;
      list.dataset['tickerInit'] = 'true';

      const items = Array.from(list.children);
      items.forEach((item) => list.appendChild(item.cloneNode(true))); // add the copies

      measureShift(list, items.length);
      prepared.push({ list, originalCount: items.length });
      list.classList.add('ticker-scrolling'); // starts the CSS animation
    });
  });

  if (!prepared.length) return () => {};

  // Sizes change when the window is resized or fonts finish loading -> measure again
  const remeasureAll = (): void => prepared.forEach((p) => measureShift(p.list, p.originalCount));

  let resizeTimer: ReturnType<typeof setTimeout> | null = null;
  const onResize = (): void => {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(remeasureAll, 150); // wait until resizing stops
  };
  window.addEventListener('resize', onResize);
  document.fonts?.ready.then(remeasureAll);

  return () => {
    window.removeEventListener('resize', onResize);
    if (resizeTimer) clearTimeout(resizeTimer);
  };
}

/**
 * EFFECT 3 - CARTOON EYES THAT FOLLOW THE MOUSE (and blink every 3 seconds)
 * @param root          element that contains the eyes
 * @param eyeSelector   CSS selector that finds the eyes inside `root`
 * @param maxMove       how far (px) a pupil may move from the centre of the eye
 * @param moveEvent     which mouse event to listen to
 */
export function initEyeTracking(
  root: HTMLElement,
  eyeSelector: string,
  maxMove: number,
  moveEvent: 'mousemove' | 'pointermove',
): () => void {
  const eyes = Array.from(root.querySelectorAll<HTMLElement>(eyeSelector));
  if (!eyes.length) return () => {};

  const onMove = (e: MouseEvent): void => {
    eyes.forEach((eye) => {
      const pupil = eye.querySelector<HTMLElement>('.pupil');
      if (!pupil) return;

      // Centre of the eye on screen
      const rect = eye.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return; // eye is hidden
      const centreX = rect.left + rect.width / 2;
      const centreY = rect.top + rect.height / 2;

      // Direction and distance from the eye to the mouse
      const dx = e.clientX - centreX;
      const dy = e.clientY - centreY;
      const distance = Math.min(maxMove, Math.hypot(dx, dy) / 8); // never more than maxMove
      const angle = Math.atan2(dy, dx);

      // Move the pupil that way (-50% keeps it centred)
      const moveX = Math.cos(angle) * distance;
      const moveY = Math.sin(angle) * distance;
      pupil.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;
    });
  };
  window.addEventListener(moveEvent, onMove as EventListener, { passive: true });

  // Blink: add the "blink" class for 150ms every 3 seconds
  const blinkTimer = setInterval(() => {
    eyes.forEach((eye) => eye.classList.add('blink'));
    setTimeout(() => eyes.forEach((eye) => eye.classList.remove('blink')), 150);
  }, 3000);

  return () => {
    window.removeEventListener(moveEvent, onMove as EventListener);
    clearInterval(blinkTimer);
  };
}
