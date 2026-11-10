import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({
  headless: true,
  args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist']
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const base = 'http://127.0.0.1:5173/';

try {
  await page.goto(base, { waitUntil:'domcontentloaded' });
  await page.waitForSelector('.card-compare-btn');
  assert.equal(await page.locator('.card').count(), 46, 'dictionary should render 46 terms');

  const search = page.locator('#term-search');
  await search.fill('POV');
  const found = await page.locator('.card:visible').count();
  assert.ok(found >= 1 && found < 46, 'POV search should narrow visible cards');
  await search.fill('no-such-film-term-7193');
  assert.equal(await page.locator('.card:visible').count(), 0, 'no-match search should hide all cards');
  await search.fill('');
  assert.equal(await page.locator('.card:visible').count(), 46, 'clearing search should restore cards');

  // Verify two original animations can be duplicated and launched in comparison mode.
  await page.locator('.card-compare-btn').nth(0).click();
  await page.locator('.card-compare-btn').nth(1).click();
  await page.locator('#compare-open').click();
  assert.equal(await page.locator('#compare-columns .stage').count(), 2, 'comparison must contain two real stages');
  await page.locator('#compare-columns .stage').first().click();
  await page.locator('#compare-panel-close').click();
  await page.locator('#compare-clear').click();
  assert.equal(await page.locator('#compare-tray').isVisible(), false, 'clearing should hide tray');

  // Test one SVG light demo copied into the comparison workspace.
  await page.locator('#light-front .card-compare-btn').click();
  await page.locator('#light-soft .card-compare-btn').click();
  await page.locator('#compare-open').click();
  assert.equal(await page.locator('#compare-columns .light-scene').count(), 2);
  await page.locator('#compare-columns .stage').first().click();
  await page.waitForTimeout(350);
  await page.locator('#compare-clear').click();
  await page.screenshot({path:'/tmp/cinematic-dictionary-v03.png'});

  // Verify dictionary-to-lab deep linking and real WebGL rendering.
  await page.goto(base + 'lab.html?mode=angle&preset=1', {waitUntil:'domcontentloaded'});
  await page.waitForSelector('#lab-shot canvas', {timeout:30000});
  assert.equal(await page.locator('[data-mode="angle"]').getAttribute('aria-pressed'), 'true');
  const spatial = page.locator('#lab-spatial canvas');
  const shot = page.locator('#lab-shot canvas');
  const before = await spatial.screenshot();
  const box = await spatial.boundingBox();
  assert.ok(box, 'spatial canvas should have a real viewport');
  await page.mouse.move(box.x + box.width/2, box.y + box.height/2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width/2 + 75, box.y + box.height/2 + 25, {steps:6});
  await page.mouse.up();
  const after = await spatial.screenshot();
  assert.notDeepEqual(before, after, 'dragging overview should change spatial view');
  await page.locator('#lab-overview-reset').click();

  await page.locator('#lab-save-a').click();
  assert.equal(await page.locator('#lab-capture-a img').count(), 1, 'A screenshot should be retained');
  await page.locator('#focal').evaluate(input=>{
    input.value = '70';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.locator('#lab-save-b').click();
  assert.equal(await page.locator('#lab-capture-b img').count(), 1, 'B screenshot should be retained');
  assert.notEqual(
    await page.locator('#lab-capture-a img').getAttribute('src'),
    await page.locator('#lab-capture-b img').getAttribute('src'),
    'changing focal length should produce a different captured frame'
  );
  await page.screenshot({path:'/tmp/cinematic-lab-v03.png'});
  await page.locator('[data-mode="lens"]').click();
  assert.equal(await page.locator('.lab-capture-frame img').count(), 0,
    'switching experiment should clear A/B comparisons');

  // Mobile widths should not create accidental horizontal scrolling.
  await page.setViewportSize({width:390,height:844});
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('.card-compare-btn');
  const horizontalOverflow = await page.evaluate(() =>
    document.documentElement.scrollWidth > window.innerWidth + 2);
  assert.equal(horizontalOverflow,false,'dictionary must not overflow on narrow viewports');

  assert.deepEqual(errors,[], 'uncaught browser JavaScript errors');
  console.log('PASS: desktop/mobile dictionary, search, SVG comparison, camera orbit and A/B WebGL capture');
} finally {
  await browser.close();
}
