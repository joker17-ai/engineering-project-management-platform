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
  const treeHiddenByDefault = await page.locator('.tree-panel').evaluate((node) => getComputedStyle(node).display === 'none');
  const projectCards = await page.locator('.project-card').count();
  const projectSwitchOptions = await page.locator('#projectSwitch option').count();

  await page.locator('#projectNameInput').fill('内蒙古测试高标准农田项目管理');
  await page.getByRole('button', { name: '创建项目', exact: true }).click();
  const createdProjectVisible = await page.getByRole('button', { name: /内蒙古测试高标准农田项目管理/ }).count();

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
  await page.locator('.upload-input').first().setInputFiles('tests/fixtures/sample-upload.txt');
  await page.waitForFunction(() => document.querySelectorAll('.uploaded-file').length > 0);
  const uploadedFiles = await page.locator('.uploaded-file').count();

  await page.goto('http://127.0.0.1:4173/database.html', { waitUntil: 'networkidle' });
  const databaseTitle = await page.locator('h1').textContent();
  const databaseTables = await page.locator('.database-list-item').count();
  const editableInputs = await page.locator('.editable-table input:not([readonly])').count();
  const firstEditable = page.locator('.editable-table input:not([readonly])').first();
  await firstEditable.fill('第一标段-已编辑');
  const editedValue = await firstEditable.inputValue();
  await page.locator('#databaseUploadInput').setInputFiles('tests/fixtures/sample-upload.txt');
  await page.waitForFunction(() => document.querySelectorAll('#databaseUploadList .uploaded-file').length > 0);
  const databaseUploadedFiles = await page.locator('#databaseUploadList .uploaded-file').count();

  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: '项目结构树', exact: true }).click();
  const treeVisibleAfterClick = await page.locator('.tree-panel').evaluate((node) => getComputedStyle(node).display !== 'none');
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
        treeHiddenByDefault,
        treeVisibleAfterClick,
        projectCards,
        projectSwitchOptions,
        createdProjectVisible,
        moduleSubitems,
        qualityCards,
        totalText,
        archiveRows,
        mapCards,
        interfaceCards,
        uploadButtons,
        uploadedFiles,
        databaseTitle,
        databaseTables,
        editableInputs,
        editedValue,
        databaseUploadedFiles,
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
