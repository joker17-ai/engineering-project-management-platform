const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 920 } });
  const errors = [];

  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });

  const title = await page.locator('h1').textContent();
  const brandTitle = await page.locator('.brand strong').textContent();
  const brandText = await page.locator('.brand').textContent();
  const brandSubtitleCount = await page.locator('.brand small').count();
  const brandIconCount = await page.locator('.brand-mark svg').count();
  const moduleCount = await page.locator('.module-button').count();
  const treeCount = await page.locator('.tree-node').count();

  await page.getByRole('button', { name: '时标网络图', exact: true }).click();
  const moduleSubitems = await page.locator('.subitem-card').count();

  await page.getByRole('button', { name: '总览', exact: true }).click();
  await page.getByRole('button', { name: '质量控制', exact: true }).click();
  const qualityCards = await page.locator('.content-view .card').count();

  await page.getByRole('button', { name: '进度投资', exact: true }).click();
  const totalText = await page.locator('.investment-total').textContent();

  await page.getByRole('button', { name: '档案资料', exact: true }).click();
  const archiveRows = await page.locator('.content-view tbody tr').count();

  await page.getByRole('button', { name: '上图入库', exact: true }).click();
  const mapCards = await page.locator('.prep-card').count();

  await page.getByRole('button', { name: '接口资料库', exact: true }).click();
  const interfaceCards = await page.locator('.interface-card').count();
  const uploadButtons = await page.locator('.upload-button').count();

  await page.goto('http://127.0.0.1:4173/database.html', { waitUntil: 'networkidle' });
  const databaseTitle = await page.locator('h1').textContent();
  const databaseTables = await page.locator('.database-list-item').count();
  const editableInputs = await page.locator('.editable-table input:not([readonly])').count();
  const firstEditable = page.locator('.editable-table input:not([readonly])').first();
  await firstEditable.fill('第一标段-已编辑');
  const editedValue = await firstEditable.inputValue();

  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  await page.locator('.tree-node').nth(3).click();
  const detailTitle = await page.locator('.node-detail h2').textContent();

  const layout = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    bodyBg: getComputedStyle(document.body).backgroundColor,
  }));

  await page.screenshot({ path: 'preview-current.png', fullPage: true });
  await browser.close();

  console.log(
    JSON.stringify(
      {
        title,
        brandTitle,
        brandText,
        brandSubtitleCount,
        brandIconCount,
        moduleCount,
        treeCount,
        moduleSubitems,
        qualityCards,
        totalText,
        archiveRows,
        mapCards,
        interfaceCards,
        uploadButtons,
        databaseTitle,
        databaseTables,
        editableInputs,
        editedValue,
        detailTitle,
        layout,
        errors,
      },
      null,
      2,
    ),
  );
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
