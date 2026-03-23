/* ============================================
   LANGUE — Commutateur FR / EN
   ============================================ */

(function () {
  const LANG_KEY = 'erebor_lang';
  const SUPPORTED = ['fr', 'en'];
  const DEFAULT_LANG = 'fr';

  let currentLang = localStorage.getItem(LANG_KEY) || DEFAULT_LANG;
  if (!SUPPORTED.includes(currentLang)) currentLang = DEFAULT_LANG;

  /* ---- Résolution de clé (ex: "nav.home") ---- */
  function t(key) {
    if (typeof TRANSLATIONS === 'undefined') return key;
    const parts = key.split('.');
    let obj = TRANSLATIONS[currentLang];
    for (const part of parts) {
      if (obj == null) return key;
      obj = obj[part];
    }
    return (obj !== null && obj !== undefined) ? obj : key;
  }

  /* ---- Appliquer les traductions au DOM ---- */
  function applyTranslations() {
    if (typeof TRANSLATIONS === 'undefined') return;

    /* Contenu texte */
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const val = t(el.dataset.i18n);
      if (val !== el.dataset.i18n) el.textContent = val;
    });

    /* Contenu HTML (pour éléments avec balises internes) */
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const val = t(el.dataset.i18nHtml);
      if (val !== el.dataset.i18nHtml) el.innerHTML = val;
    });

    /* Placeholder */
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const val = t(el.dataset.i18nPlaceholder);
      if (val !== el.dataset.i18nPlaceholder) el.placeholder = val;
    });

    /* Aria-label */
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const val = t(el.dataset.i18nAria);
      if (val !== el.dataset.i18nAria) el.setAttribute('aria-label', val);
    });

    /* Attribut lang HTML */
    document.documentElement.lang = currentLang;

    /* Mettre à jour le bouton de langue */
    updateToggleUI();

    /* Déclencher l'événement pour les rendus JS (roles, shop...) */
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: currentLang } }));
  }

  /* ---- Mettre à jour l'UI du bouton ---- */
  function updateToggleUI() {
    document.querySelectorAll('.lang-toggle').forEach(btn => {
      btn.querySelectorAll('.lang-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.lang === currentLang);
      });
      btn.setAttribute('aria-label', currentLang === 'fr' ? 'Switch to English' : 'Passer en français');
    });
  }

  /* ---- Changer la langue ---- */
  function setLanguage(lang) {
    if (!SUPPORTED.includes(lang)) return;
    currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);
    applyTranslations();
  }

  function toggleLanguage() {
    setLanguage(currentLang === 'fr' ? 'en' : 'fr');
  }

  function getCurrentLang() {
    return currentLang;
  }

  /* ---- API publique ---- */
  window.i18n = { t, setLanguage, toggleLanguage, getCurrentLang, applyTranslations };

  /* ---- Init au chargement ---- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyTranslations);
  } else {
    applyTranslations();
  }
})();
