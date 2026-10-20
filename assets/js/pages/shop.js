/* ============================================
   SHOP — Logique panier & produits
   ============================================ */

const CART_KEY = 'erebor_cart';

function loadCart() {
  try {
    const stored = JSON.parse(localStorage.getItem(CART_KEY) || '{}');
    if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return {};
    return Object.fromEntries(Object.entries(stored).filter(([id, qty]) => SHOP_PRODUCTS.some(p => p.id === id && !p.draft) && Number.isInteger(qty) && qty > 0 && qty <= 10));
  } catch { return {}; }
}
let cart = loadCart();
function saveCart() {
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch { /* Keep this visit's basket usable when storage is unavailable. */ }
}
// cart: { [productId]: quantity }

function getLang() {
  return (window.i18n && window.i18n.getCurrentLang) ? window.i18n.getCurrentLang() : 'fr';
}
function pt(p, field) {
  const lang = getLang();
  return (lang === 'en' && p[field + 'En']) ? p[field + 'En'] : p[field];
}

// ---- Rendu des produits ----
function buildProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid || typeof SHOP_PRODUCTS === 'undefined') return;
  grid.innerHTML = '';

  SHOP_PRODUCTS.filter(p => !p.draft).forEach((p, i) => {
    const card = document.createElement('div');
    card.className = `product-card${p.id === 'deluxe' ? ' featured' : ''} reveal`;
    card.id = `product-${p.id}`;
    card.style.animationDelay = `${i * 0.1}s`;

    const badgeHtml = p.badge ? `<div class="product-badge ${p.badge.includes('BEST') ? 'best-seller' : 'nouveau'}">${p.badge}</div>` : '';
    const originalPrice = p.originalPrice ? `<div class="price-original">${p.originalPrice.toFixed(2).replace('.', ',')} €</div>` : '';
    const metaTags = [
      p.players ? `<span class="product-meta-tag">👥 ${pt(p, 'players')}</span>` : '',
      p.duration ? `<span class="product-meta-tag">⏱️ ${pt(p, 'duration')}</span>` : '',
      p.age ? `<span class="product-meta-tag">🔞 ${pt(p, 'age')}</span>` : '',
    ].filter(Boolean).join('');

    const contentsList = (pt(p, 'contents') || p.contents).map(c => `<li>${c}</li>`).join('');

    card.innerHTML = `
      ${badgeHtml}
      <div class="product-inner">
        <div class="product-visual">${p.icon}</div>
        <div class="product-info">
          <div class="product-subtitle">${pt(p, 'subtitle')}</div>
          <div class="product-name">${pt(p, 'name')}</div>
          <p class="product-description">${pt(p, 'description')}</p>
          <div class="product-meta">${metaTags}</div>
        </div>
        <div class="product-actions">
          <div class="product-price">
            ${originalPrice}
            <div class="price-current">${p.price.toFixed(2).replace('.', ',')}</div>
            <div class="price-unit">€ TTC</div>
          </div>
          <div class="quantity-control">
            <button class="qty-btn" aria-label="${getLang() === 'en' ? 'Change quantity' : 'Modifier la quantité'}" onclick="changeQty('${p.id}', -1)">−</button>
            <input type="number" class="qty-input" id="qty-${p.id}" value="1" min="1" max="10" readonly>
            <button class="qty-btn" aria-label="${getLang() === 'en' ? 'Change quantity' : 'Modifier la quantité'}" onclick="changeQty('${p.id}', +1)">+</button>
          </div>
          <button class="btn-add-cart" id="add-${p.id}" onclick="addToCart('${p.id}')">
            ${window.i18n ? window.i18n.t('shop.addToCart') : '🛒 Ajouter au panier'}
          </button>
        </div>
      </div>
      <div class="product-contents">
        <button type="button" class="contents-toggle" aria-expanded="false" onclick="toggleContents(this)">
          ${window.i18n ? window.i18n.t('shop.contentsToggle') : 'Contenu de la boîte'}
          <span class="toggle-icon">▼</span>
        </button>
        <ul class="contents-list">${contentsList}</ul>
      </div>
    `;

    grid.appendChild(card);
    setTimeout(() => {
      card.classList.add('visible');
    }, 50);
  });
}

function changeQty(productId, delta) {
  const input = document.getElementById(`qty-${productId}`);
  if (!input) return;
  let val = parseInt(input.value) + delta;
  val = Math.max(1, Math.min(10, val));
  input.value = val;
}

function addToCart(productId) {
  const qty = parseInt(document.getElementById(`qty-${productId}`)?.value || '1');
  if (!SHOP_PRODUCTS.some(p => p.id === productId && !p.draft)) return;
  cart[productId] = Math.min(10, (cart[productId] || 0) + qty);
  saveCart();
  renderCart();

  const btn = document.getElementById(`add-${productId}`);
  if (btn) {
    btn.classList.add('added');
    btn.textContent = window.i18n ? window.i18n.t('shop.added') : '✓ Ajouté !';
    setTimeout(() => { btn.classList.remove('added'); btn.innerHTML = window.i18n ? window.i18n.t('shop.addToCart') : '🛒 Ajouter au panier'; }, 2000);
  }
}

function removeFromCart(productId) {
  delete cart[productId];
  saveCart();
  renderCart();
}

function clearCart() {
  cart = {};
  try { localStorage.removeItem(CART_KEY); } catch {}
  renderCart();
}

function renderCart() {
  const items   = document.getElementById('cart-items');
  const empty   = document.getElementById('cart-empty');
  const countEl = document.getElementById('cart-count');
  const subEl   = document.getElementById('cart-subtotal');
  const shipEl  = document.getElementById('cart-shipping');
  const totalEl = document.getElementById('cart-total');
  const checkBtn = document.getElementById('btn-checkout');

  const entries = Object.entries(cart).filter(([, qty]) => qty > 0);
  const totalItems = entries.reduce((sum, [, qty]) => sum + qty, 0);
  const subtotal   = entries.reduce((sum, [id, qty]) => {
    const p = SHOP_PRODUCTS.find(p => p.id === id);
    return sum + (p ? p.price * qty : 0);
  }, 0);
  const shipping  = subtotal >= 50 ? 0 : (subtotal > 0 ? 5.90 : 0);
  const total     = subtotal + shipping;

  if (countEl) countEl.textContent = totalItems;
  if (subEl)   subEl.textContent   = `${subtotal.toFixed(2).replace('.', ',')} €`;
  if (shipEl)  shipEl.textContent  = shipping === 0 ? (subtotal > 0 ? (window.i18n ? window.i18n.t('shop.cartShippingFree') : '🎉 Offerte') : (window.i18n ? window.i18n.t('shop.cartShippingThreshold') : 'Offerte dès 50 €')) : `${shipping.toFixed(2).replace('.', ',')} €`;
  if (totalEl) totalEl.textContent = `${total.toFixed(2).replace('.', ',')} €`;
  if (checkBtn) checkBtn.disabled  = entries.length === 0;

  if (entries.length === 0) {
    if (empty) empty.style.display = 'block';
    if (items) items.style.display = 'none';
    return;
  }

  if (empty) empty.style.display = 'none';
  if (items) {
    items.style.display = 'block';
    items.innerHTML = '';

    entries.forEach(([id, qty]) => {
      const p = SHOP_PRODUCTS.find(p => p.id === id);
      if (!p) return;
      const linePrice = (p.price * qty).toFixed(2).replace('.', ',');

      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <div class="cart-item-info">
          <span class="cart-item-icon">${p.icon}</span>
          <div>
            <div class="cart-item-name">${pt(p, 'name')}</div>
            <div class="cart-item-qty">× ${qty}</div>
          </div>
        </div>
        <span class="cart-item-price">${linePrice} €</span>
        <button class="cart-item-remove" onclick="removeFromCart('${id}')" title="${window.i18n ? window.i18n.t('shop.cartRemove') || 'Retirer' : 'Retirer'}">✕</button>
      `;
      items.appendChild(row);
    });
  }
}

function toggleContents(toggleEl) {
  toggleEl.setAttribute('aria-expanded', String(toggleEl.classList.toggle('open')));
}

function scrollToProduct(id) {
  const el = document.getElementById(`product-${id}`);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ---- Checkout ----
function openCheckout() {
  const entries = Object.entries(cart).filter(([, qty]) => qty > 0);
  if (entries.length === 0) return;

  // Récapitulatif dans la modal
  const summary = document.getElementById('checkout-summary');
  if (summary) {
    const subtotal = entries.reduce((sum, [id, qty]) => {
      const p = SHOP_PRODUCTS.find(p => p.id === id);
      return sum + (p ? p.price * qty : 0);
    }, 0);
    const shipping = subtotal >= 50 ? 0 : 5.90;
    const total    = subtotal + shipping;

    summary.innerHTML = entries.map(([id, qty]) => {
      const p = SHOP_PRODUCTS.find(p => p.id === id);
      return `<div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;">
        <span>${p?.icon} ${pt(p, 'name')} × ${qty}</span>
        <strong style="color:var(--color-gold);">${(p ? p.price * qty : 0).toFixed(2).replace('.', ',')} €</strong>
      </div>`;
    }).join('') + `
      <div style="border-top:1px solid var(--color-border);margin-top:0.75rem;padding-top:0.75rem;display:flex;justify-content:space-between;">
        <strong>Total TTC</strong>
        <strong style="color:var(--color-gold);font-size:1.1rem;">${total.toFixed(2).replace('.', ',')} €</strong>
      </div>
    `;

    const totalBtn = document.getElementById('checkout-total-btn');
    if (totalBtn) totalBtn.textContent = `${total.toFixed(2).replace('.', ',')} €`;
  }

  const lines = entries.map(([id, qty]) => {
    const p = SHOP_PRODUCTS.find(product => product.id === id);
    return `${pt(p, 'name')} × ${qty} — ${(p.price * qty).toFixed(2)} EUR`;
  });
  const subject = getLang() === 'en' ? 'Availability enquiry — Les Ombres d’Erebor' : 'Demande de disponibilité — Les Ombres d’Erebor';
  document.getElementById('reservation-email').href = `mailto:contact@ombres-erebor.fr?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
  document.getElementById('checkout-overlay')?.classList.add('open');
}

function closeCheckout() {
  document.getElementById('checkout-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

// ---- Initialisation ----
document.addEventListener('DOMContentLoaded', () => {
  buildProducts();
  renderCart();

  // Fermer checkout en cliquant dehors
  document.getElementById('checkout-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'checkout-overlay') closeCheckout();
  });

  document.addEventListener('langchange', () => {
    buildProducts();
    renderCart();
    if (document.getElementById('checkout-overlay')?.classList.contains('open')) openCheckout();
  });
});

// Exposer pour HTML
window.clearCart      = clearCart;
window.removeFromCart = removeFromCart;
window.openCheckout   = openCheckout;
window.closeCheckout  = closeCheckout;
window.changeQty      = changeQty;
window.addToCart      = addToCart;
window.toggleContents = toggleContents;
window.scrollToProduct = scrollToProduct;

window.addEventListener('storage', event => { if (event.key === CART_KEY || event.key === null) { cart = loadCart(); renderCart(); } });
