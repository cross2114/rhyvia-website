/* Frosted pointer: direct positioning with stable ownership during scrolling. */
(() => {
  'use strict';
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const forcedColors = matchMedia('(forced-colors: active)');
  const root = document.documentElement;
  const cursor = document.createElement('div');
  cursor.className = 'glass-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.append(document.createElement('span'));
  document.body.append(cursor);
  let point = null, raf = 0;
  const nativeTarget = 'input,textarea,select,[contenteditable]:not([contenteditable="false"]),iframe,dialog';

  function hide() {
    cancelAnimationFrame(raf);
    raf = 0;
    root.classList.remove('has-glass-cursor');
    cursor.classList.remove('is-visible', 'is-interactive', 'is-pressed');
  }

  function paint() {
    raf = 0;
    if (!point || !finePointer.matches || forcedColors.matches || document.hidden) {
      hide(); return;
    }
    cursor.style.transform = `translate3d(${point.x}px,${point.y}px,0)`;
    root.classList.add('has-glass-cursor');
    const target = document.elementFromPoint(point.x, point.y);
    // Composited scroll layers can briefly have no hit-test target. Keep the
    // current pointer rather than restoring the system arrow for one frame.
    if (!target) return;
    if (document.querySelector('dialog[open]')) { hide(); return; }
    if (target.closest(nativeTarget)) {
      cursor.classList.remove('is-visible', 'is-interactive', 'is-pressed');
      return;
    }
    cursor.classList.toggle('is-interactive', !!target.closest('a[href],button:not(:disabled),[role="button"],[role="tab"],summary'));
    cursor.classList.add('is-visible');
    root.classList.add('has-glass-cursor');
  }

  function move(event) {
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') { point = null; hide(); return; }
    point = { x: event.clientX, y: event.clientY };
    if (!raf) raf = requestAnimationFrame(paint);
  }

  document.addEventListener('pointermove', move, { passive: true });
  document.addEventListener('pointerover', move, { passive: true });
  document.addEventListener('pointerdown', event => {
    move(event);
    if (event.pointerType === 'mouse') cursor.classList.add('is-pressed');
  }, { passive: true });
  document.addEventListener('pointerup', () => cursor.classList.remove('is-pressed'), { passive: true });
  document.addEventListener('pointercancel', hide, { passive: true });
  root.addEventListener('pointerleave', event => {
    // Ignore leave events caused by scrolling/replacing the underlying layer.
    if (event.clientX <= 0 || event.clientY <= 0 || event.clientX >= innerWidth || event.clientY >= innerHeight) {
      point = null; hide();
    }
  });
  window.addEventListener('blur', () => { point = null; hide(); });
  window.addEventListener('scroll', () => { if (point && !raf) raf = requestAnimationFrame(paint); }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { point = null; hide(); } });
  document.addEventListener('keydown', event => { if (event.key === 'Tab' || event.key === 'Escape') { point = null; hide(); } });
  // Modal dialogs live above ordinary document layers; keep their native pointer.
  document.querySelectorAll('dialog').forEach(dialog => new MutationObserver(() => {
    if (point) paint();
  }).observe(dialog, { attributes: true, attributeFilter: ['open'] }));
  finePointer.addEventListener('change', hide);
  forcedColors.addEventListener('change', hide);
})();
