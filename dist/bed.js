(() => {
  'use strict';
  const dialog = document.querySelector('#bed-dialog');
  const trigger = document.querySelector('[data-bed-open]');
  if (!dialog || !trigger || typeof dialog.showModal !== 'function') return;
  trigger.hidden = false;
  trigger.addEventListener('click', () => {
    dialog.showModal();
    document.body.classList.add('dialog-open');
  });
  dialog.querySelector('[data-bed-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    trigger.focus({ preventScroll: true });
  });
})();
