const { test, expect } = require('@playwright/test');
test.beforeEach(async ({ context }) => {
  // Deterministic offline checks: the local game must not need third-party services.
  await context.route(/https:\/\/(www\.gstatic\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)/, route => route.abort());
  await context.addInitScript(() => { localStorage.setItem('erebor-cookie-consent','declined'); });
});
async function dismissCookies(page) {
  const reject = page.locator('#cookie-decline');
  if (await reject.count()) await reject.click();
}
test('local game syncs separate tabs, retains identities and rejects late arrivals', async ({ page: gm, context }) => {
  await gm.goto('/play.html?mode=local'); await dismissCookies(gm);
  await gm.locator('#gm-name').fill('Conteur');
  await gm.locator('#create-form button[type=submit]').click();
  await expect(gm).toHaveURL(/game.html\?room=/);
  const code = await gm.locator('#lobby-room-code').textContent();
  const players=[];
  for (const name of ['Alice','Bob']) {
    const page = await context.newPage(); players.push(page);
    await page.goto('/play.html?mode=local'); await dismissCookies(page);
    await page.locator('#player-name').fill(name); await page.locator('#room-code-input').fill(code);
    await page.locator('#join-form button[type=submit]').click();
    await expect(page).toHaveURL(/game.html\?room=/);
  }
  await expect(gm.locator('.player-row')).toHaveCount(3);
  await expect(players[0].locator('.player-row')).toHaveCount(3);
  for (const input of await gm.locator('#role-checkboxes-lobby input').all()) await input.uncheck();
  await gm.locator('.role-checkbox-item input[value=herald]').check();
  await gm.locator('.role-checkbox-item input[value=assassin]').check();
  await gm.evaluate(() => window.assignRoles());
  await gm.evaluate(() => window.startNight());
  await expect(gm.locator('#view-night')).toHaveClass(/active/);
  await expect(players[0].locator('.role-reveal-name')).toBeVisible();
  const role = await players[0].locator('.role-reveal-name').textContent();
  await players[0].reload(); await expect(players[0].locator('.role-reveal-name')).toHaveText(role);
  // A forged host query does not grant host controls.
  await players[0].goto(players[0].url() + '&gm=1');
  await expect(players[0].locator('#gm-night-content')).toBeHidden();
  const late=await context.newPage(); await late.goto('/play.html?mode=local'); await dismissCookies(late);
  await late.locator('#player-name').fill('Late'); await late.locator('#room-code-input').fill(code);
  await late.locator('#join-form button[type=submit]').click();
  await expect(late.locator('#join-error')).toContainText('déjà commencé');
  await expect(late.locator('#join-form button[type=submit]')).toBeEnabled();
  // Reach day, execute one player and verify local game-over renders immediately.
  for(let i=0;i<14;i++) await gm.evaluate(() => window.advanceNightStep());
  await gm.evaluate(() => window.startDay());
  await expect(players[0].locator('#view-day')).toHaveClass(/active/);
  const target=await players[0].evaluate(() => Object.values(JSON.parse(localStorage.getItem('erebor_room_v2_' + new URLSearchParams(location.search).get('room'))).public.seats).find(p=>p.name==='Bob').uid);
  await players[0].evaluate(uid => window.submitVote(uid),target);
  await gm.evaluate(() => window.resolveVote());
  await expect(gm.locator('#view-gameover')).toHaveClass(/active/);
  await expect(players[0].locator('#gameover-winner-name')).not.toBeEmpty();
});
test('basket recovers from corrupt storage and opens an honest accessible enquiry', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('erebor_cart','broken JSON'));
  await page.goto('/shop.html'); await dismissCookies(page);
  await page.locator('.btn-add-cart').first().click();
  await expect(page.locator('#cart-count')).toHaveText('1');
  const trigger=page.locator('#btn-checkout'); await trigger.click();
  const overlay=page.locator('#checkout-overlay'); await expect(overlay).toHaveAttribute('aria-hidden','false');
  await expect(overlay).toContainText('aucune commande');
  await expect(page.locator('#reservation-email')).toHaveAttribute('href',/mailto:.*subject=.*body=/);
  await expect(overlay.locator('input')).toHaveCount(0);
  await page.keyboard.press('Shift+Tab'); await expect(page.locator('#reservation-email')).toBeFocused();
  await page.keyboard.press('Tab'); await expect(overlay.locator('[data-dialog-close]')).toBeFocused();
  await page.keyboard.press('Escape'); await expect(overlay).toHaveAttribute('aria-hidden','true'); await expect(trigger).toBeFocused();
  await expect(page.locator('main')).not.toHaveAttribute('inert','');
});
test('role modal traps focus, escapes and restores its trigger', async ({ page }) => {
  await page.goto('/roles.html'); await dismissCookies(page);
  const card=page.locator('.role-card').first(); await card.focus(); await page.keyboard.press('Enter');
  await expect(page.locator('.modal-close')).toBeFocused();
  await page.keyboard.press('Tab'); await expect(page.locator('.modal-close')).toBeFocused();
  await page.keyboard.press('Escape'); await expect(card).toBeFocused();
});
test('public pages load without uncaught JavaScript errors', async ({ page }) => {
  const errors=[]; page.on('pageerror',error=>errors.push(error.message));
  for (const path of ['index','roles','interactions','compose','rules','night-order','shop','contact','play','game','404','privacy','terms']) await page.goto('/'+path+'.html');
  expect(errors).toEqual([]);
});
