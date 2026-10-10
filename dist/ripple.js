/* A damped water surface rendered as transparent light and shade.
   Native page content is never captured, displaced or rendered into the canvas. */
(() => {
  'use strict';
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const canvas = document.createElement('canvas');
  canvas.className = 'ripple-trail';
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;
  document.body.append(canvas);

  const step = 1000 / 60;
  const settleTime = 2200;
  let width, height, scaleX, scaleY, surface, previous, next, pixels;
  let raf = 0, lastFrame = 0, accumulator = 0, lastInput = -Infinity;
  let lastEmission = -Infinity, lastPoint = null;
  const enabled = () => finePointer.matches && !reduceMotion.matches && !document.hidden;

  function clear() {
    cancelAnimationFrame(raf);
    raf = 0; accumulator = 0; lastFrame = 0;
    lastInput = lastEmission = -Infinity; lastPoint = null;
    surface?.fill(0); previous?.fill(0); next?.fill(0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function resize() {
    clear();
    // A small simulation grid keeps work bounded even on large retina screens.
    const cell = Math.max(3, innerWidth / 420, innerHeight / 300);
    width = Math.ceil(innerWidth / cell); height = Math.ceil(innerHeight / cell);
    canvas.width = width; canvas.height = height;
    scaleX = width / innerWidth; scaleY = height / innerHeight;
    surface = new Float32Array(width * height);
    previous = new Float32Array(width * height);
    next = new Float32Array(width * height);
    pixels = ctx.createImageData(width, height);
  }

  function advance() {
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = y * width + x, h = surface[i];
        const laplacian = surface[i - 1] + surface[i + 1] + surface[i - width] + surface[i + width] - 4 * h;
        // Courant-stable propagation; energy decays on every fixed time step.
        next[i] = (2 * h - previous[i] + .22 * laplacian) * .976;
      }
    }
    const spare = previous; previous = surface; surface = next; next = spare;
  }

  function render(fade) {
    const data = pixels.data;
    data.fill(0);
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = y * width + x;
        // Surface normals catch a single soft light from the upper left.
        // Overlapping disturbances merge instead of drawing stacked circles.
        const nx = surface[i - 1] - surface[i + 1];
        const ny = surface[i - width] - surface[i + width];
        const light = (nx * .55 + ny * .83) * .7;
        const bright = light > 0;
        const alpha = Math.min(.3, Math.abs(light)) * fade * (bright ? 1 : .45);
        if (alpha < .003) continue;
        const p = i * 4;
        data[p] = bright ? 255 : 96;
        data[p + 1] = bright ? 253 : 91;
        data[p + 2] = bright ? 245 : 80;
        data[p + 3] = Math.round(alpha * 255);
      }
    }
    ctx.putImageData(pixels, 0, 0);
  }

  function frame(now) {
    raf = 0;
    const idle = now - lastInput;
    if (!enabled() || idle >= settleTime) { clear(); return; }
    accumulator += Math.min(now - lastFrame, 50);
    lastFrame = now;
    while (accumulator >= step) { advance(); accumulator -= step; }
    // An explicit tail guarantees stillness after the pointer stops.
    const tail = Math.max(0, Math.min(1, (settleTime - idle) / 700));
    render(tail * tail * (3 - 2 * tail));
    raf = requestAnimationFrame(frame);
  }

  function disturb(event, click = false) {
    if (!enabled() || event.pointerType === 'touch' || (event.buttons && !click)) return;
    if (event.target.closest('dialog,input,textarea,select,[contenteditable="true"]')) return;
    const now = performance.now(), x = event.clientX, y = event.clientY;
    if (now - lastEmission < 55) return;
    if (!click && lastPoint && Math.hypot(x - lastPoint.x, y - lastPoint.y) < 14) return;
    const cx = x * scaleX, cy = y * scaleY;
    const radius = Math.max(2.8, (click ? 17 : 13) * scaleX);
    const extent = Math.ceil(radius * 2.5), power = click ? .8 : .55;
    for (let gy = Math.max(1, Math.floor(cy) - extent); gy < Math.min(height - 1, cy + extent); gy++) {
      for (let gx = Math.max(1, Math.floor(cx) - extent); gx < Math.min(width - 1, cx + extent); gx++) {
        const d2 = ((gx - cx) ** 2 + (gy - cy) ** 2) / (radius * radius);
        const i = gy * width + gx;
        surface[i] = Math.min(2, surface[i] + power * Math.exp(-d2 * 1.5));
      }
    }
    lastPoint = { x, y }; lastInput = lastEmission = now;
    if (!raf) { lastFrame = now; raf = requestAnimationFrame(frame); }
  }

  document.addEventListener('pointermove', event => disturb(event), { passive: true });
  document.addEventListener('pointerdown', event => disturb(event, true), { passive: true });
  document.documentElement.addEventListener('pointerleave', event => {
    if (event.clientX <= 0 || event.clientY <= 0 || event.clientX >= innerWidth || event.clientY >= innerHeight) clear();
  });
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('blur', clear);
  document.addEventListener('visibilitychange', clear);
  finePointer.addEventListener('change', clear);
  reduceMotion.addEventListener('change', clear);
  resize();
})();
