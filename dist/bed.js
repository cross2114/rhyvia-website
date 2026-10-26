(() => {
  'use strict';
  const dialog = document.querySelector('#bed-dialog');
  const trigger = document.querySelector('[data-bed-open]');
  if (!dialog || !trigger || typeof dialog.showModal !== 'function') return;
  const image = dialog.querySelector(':scope > img');
  const title = dialog.querySelector('#bed-dialog-title');
  const original = {src:image.getAttribute('src'),zh:image.dataset.altZh||image.alt,en:image.dataset.altEn};
  let opener = trigger;
  function open(source, src, zh, en, titleZh, titleEn) {
    opener = source;
    image.src = src;
    image.dataset.altZh = zh;
    image.dataset.altEn = en;
    title.dataset.zh = titleZh;
    title.dataset.en = titleEn;
    const english = document.documentElement.lang === 'en';
    image.alt = english ? en : zh;
    title.textContent = english ? titleEn : titleZh;
    dialog.showModal();
    document.body.classList.add('dialog-open');
  }
  trigger.hidden = false;
  trigger.addEventListener('click', () => open(trigger, original.src, original.zh, original.en, 'RHYVIA 律动床', 'RHYVIA rhythm bed'));
  document.querySelectorAll('[data-product-view]').forEach(link => {
    link.addEventListener('click', event => {
      if(event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const photo = link.querySelector('img');
      open(link, link.href, photo.dataset.altZh || photo.alt, photo.dataset.altEn, photo.dataset.altZh || photo.alt, photo.dataset.altEn);
    });
  });
  dialog.querySelector('[data-bed-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    opener.focus({ preventScroll: true });
  });
})();
