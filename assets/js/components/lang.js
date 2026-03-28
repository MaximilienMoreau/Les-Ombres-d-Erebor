/* ============================================
   LANGUE — Commutateur FR / EN
   ============================================ */

(function () {
  const LANG_KEY = 'erebor_lang';
  const SUPPORTED = ['fr', 'en'];
  const DEFAULT = 'fr';

  let currentLang = localStorage.getItem(LANG_KEY) || DEFAULT;
  if (!SUPPORTED.includes(currentLang)) currentLang = DEFAULT;

  /* ---- Résolution de clé (ex: "nav.home") ---- */
  function t(key) {
    if (typeof TRANSLATIONS === 'undefined') return key;
    const parts = key.split('.');
    let obj = TRANSLATIONS[currentLang];
    for (const p of parts) {
      if (obj == null) return key;
      obj = obj[p];
    }
    return (obj != null) ? obj : key;
  }

  /* ---- Appliquer les traductions au DOM ---- */
  function applyTranslations() {
    if (typeof TRANSLATIONS === 'undefined') return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const val = t(el.dataset.i18n);
      if (val !== el.dataset.i18n) el.textContent = val;
    });

    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const val = t(el.dataset.i18nHtml);
      if (val !== el.dataset.i18nHtml) el.innerHTML = val;
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const val = t(el.dataset.i18nPlaceholder);
      if (val !== el.dataset.i18nPlaceholder) el.placeholder = val;
    });

    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const val = t(el.dataset.i18nAria);
      if (val !== el.dataset.i18nAria) el.setAttribute('aria-label', val);
    });

    document.documentElement.lang = currentLang;
    updateToggleUI();

    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: currentLang } }));
  }

  /* ---- Mettre à jour l'UI du bouton ---- */
  function updateToggleUI() {
    document.querySelectorAll('.lang-option').forEach(opt => {
      opt.classList.toggle('active', opt.dataset.lang === currentLang);
    });
  }

  /* ---- Changer la langue ---- */
  function setLanguage(lang) {
    if (!SUPPORTED.includes(lang)) return;
    currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);
    applyTranslations();
  }

  /* ---- Délégation d'événements (fiable sur tout type d'élément) ---- */
  document.addEventListener('click', function (e) {
    const opt = e.target.closest('.lang-option[data-lang]');
    if (opt) {
      e.stopPropagation();
      setLanguage(opt.dataset.lang);
    }
  });

  /* ---- API publique ---- */
  window.i18n = {
    t,
    setLanguage,
    getCurrentLang: () => currentLang,
    applyTranslations,
  };

  /* ---- Init ---- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyTranslations);
  } else {
    applyTranslations();
  }
})();
