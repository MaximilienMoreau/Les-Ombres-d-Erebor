/* ============================================
   COOKIE CONSENT — Les Ombres d'Erebor
   Bandeau RGPD, stockage localStorage
   ============================================ */

(function initCookieConsent() {
  const STORAGE_KEY = 'erebor-cookie-consent';
  if (localStorage.getItem(STORAGE_KEY)) return;

  // ---- CSS injecté dynamiquement ----
  const style = document.createElement('style');
  style.textContent = `
    .cookie-banner {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 9999;
      background: rgba(11, 15, 26, 0.97);
      backdrop-filter: blur(12px);
      border-top: 1px solid var(--color-border);
      padding: 1.25rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      flex-wrap: wrap;
      box-shadow: 0 -4px 24px rgba(0,0,0,0.5);
      transform: translateY(100%);
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .cookie-banner.visible {
      transform: translateY(0);
    }
    .cookie-banner-text {
      flex: 1;
      min-width: 200px;
      font-family: var(--font-ui);
      font-size: 0.8125rem;
      color: var(--color-text-muted);
      line-height: 1.5;
    }
    .cookie-banner-text strong {
      color: var(--color-text);
      font-weight: 600;
    }
    .cookie-banner-text a {
      color: var(--color-gold);
      text-decoration: none;
    }
    .cookie-banner-text a:hover {
      color: var(--color-gold-light);
      text-decoration: underline;
    }
    .cookie-banner-actions {
      display: flex;
      gap: 0.75rem;
      flex-shrink: 0;
      flex-wrap: wrap;
    }
    .cookie-btn {
      display: inline-flex;
      align-items: center;
      padding: 0.5rem 1.25rem;
      border-radius: 6px;
      font-family: var(--font-ui);
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
      white-space: nowrap;
    }
    .cookie-btn-accept {
      background: linear-gradient(135deg, #7a6230, #c9a84c);
      color: #06080f;
    }
    .cookie-btn-accept:hover {
      box-shadow: 0 0 20px rgba(201,168,76,0.4);
      transform: translateY(-1px);
    }
    .cookie-btn-decline {
      background: transparent;
      color: var(--color-text-muted);
      border: 1px solid var(--color-border);
    }
    .cookie-btn-decline:hover {
      color: var(--color-text);
      border-color: var(--color-border-glow);
    }
    @media (max-width: 600px) {
      .cookie-banner { padding: 1rem; gap: 1rem; }
      .cookie-banner-actions { width: 100%; }
      .cookie-btn { flex: 1; justify-content: center; }
    }
  `;
  document.head.appendChild(style);

  // ---- HTML du bandeau ----
  const banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Consentement aux cookies');

  const lang = document.documentElement.lang === 'en' ? 'en' : 'fr';

  const texts = {
    fr: {
      msg: '<strong>🍪 Cookies</strong> — Ce site utilise des cookies analytiques pour améliorer votre expérience. Consultez notre <a href="privacy.html">politique de confidentialité</a>.',
      accept: 'Accepter',
      decline: 'Refuser',
    },
    en: {
      msg: '<strong>🍪 Cookies</strong> — This site uses analytics cookies to improve your experience. See our <a href="privacy.html">privacy policy</a>.',
      accept: 'Accept',
      decline: 'Decline',
    },
  };

  const t = texts[lang];

  banner.innerHTML = `
    <p class="cookie-banner-text">${t.msg}</p>
    <div class="cookie-banner-actions">
      <button class="cookie-btn cookie-btn-decline" id="cookie-decline">${t.decline}</button>
      <button class="cookie-btn cookie-btn-accept" id="cookie-accept">${t.accept}</button>
    </div>
  `;

  document.body.appendChild(banner);

  // Afficher après un court délai
  requestAnimationFrame(() => {
    requestAnimationFrame(() => banner.classList.add('visible'));
  });

  function dismiss(choice) {
    localStorage.setItem(STORAGE_KEY, choice);
    banner.style.transform = 'translateY(100%)';
    setTimeout(() => banner.remove(), 400);
  }

  document.getElementById('cookie-accept').addEventListener('click', () => dismiss('accepted'));
  document.getElementById('cookie-decline').addEventListener('click', () => dismiss('declined'));

  // Mettre à jour si la langue change
  document.addEventListener('langchange', () => {
    const newLang = document.documentElement.lang === 'en' ? 'en' : 'fr';
    const nt = texts[newLang];
    banner.querySelector('.cookie-banner-text').innerHTML = nt.msg;
    document.getElementById('cookie-decline').textContent = nt.decline;
    document.getElementById('cookie-accept').textContent = nt.accept;
  });
})();
