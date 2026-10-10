/* Shared language selection for all five pages. No location or network lookup. */
(() => {
  'use strict';
  const key = 'rhyvia-language';
  const supported = value => value === 'zh' || value === 'en';

  function initial() {
    const requested = new URLSearchParams(location.search).get('lang');
    if (supported(requested)) return requested;
    try {
      const saved = localStorage.getItem(key);
      if (supported(saved)) return saved;
    } catch { /* Private browsing or blocked storage: still detect browser language. */ }
    const preferences = navigator.languages?.length ? navigator.languages : [navigator.language];
    for (const preference of preferences) {
      const language = String(preference || '').toLowerCase().split(/[-_]/)[0];
      if (supported(language)) return language;
    }
    return 'en';
  }

  function remember(language) {
    if (!supported(language)) return;
    try { localStorage.setItem(key, language); } catch { /* Switching still works. */ }
    // A language-specific share link should reflect a subsequent manual switch.
    const url = new URL(location.href);
    if (url.searchParams.has('lang')) {
      url.searchParams.set('lang', language);
      try { history.replaceState(history.state, '', url); } catch { /* Embedded preview. */ }
    }
  }

  window.RHYVIA_LANGUAGE = Object.freeze({ initial, remember });
})();
