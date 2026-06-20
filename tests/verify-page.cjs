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
  await page.evaluate(() => localStorage.removeItem('engineering_project_portfolio_v1'));
  await page.reload({ waitUntil: 'networkidle' });

  const title = await page.locator('h1').textContent();
  const brandTitle = await page.locator('.brand strong').textContent();
  const brandText = await page.locator('.brand').textContent();
  const brandSubtitleCount = await page.locator('.brand small').count();
  const brandIconCount = await page.locator('.brand-mark svg').count();
  const moduleCount = await page.locator('.module-button').count();
  const secondaryPanelVisible = await page.locator('.secondary-panel').evaluate((node) => getComputedStyle(node).display !== 'none');
  const secondaryItemCount = await page.locator('#secondaryNav .tree-node').count();
  const tertiaryItemCount = await page.locator('.detail-panel .tree-node').count();
  const metricTexts = await page.locator('.metric').allTextContents();
  const currentUnitWork = await page.locator('#currentUnitWork').textContent();
  const currentDivisionWork = await page.locator('#currentDivisionWork').textContent();
  const projectSwitchOptions = await page.locator('#projectSwitch option').count();
  const bidSectionOptions = await page.locator('#bidSectionSwitch option').count();
  const unitOverviewRows = await page.locator('.unit-overview-table tbody tr').count();
  const unitOverviewStatuses = await page.locator('.unit-overview-table .status').allTextContents();

  await page.getByRole('button', { name: '时标网络图', exact: true }).click();
  const moduleSubitems = await page.locator('#secondaryNav .tree-node').count();
  const focusedSubitem = await page.locator('.focused-subitem h3').textContent();
  await page.locator('#secondaryNav .tree-node').nth(1).click();
  const focusedSubitemAfterClick = await page.locator('.focused-subitem h3').textContent();

  await page.getByRole('button', { name: '参建单位与管理', exact: true }).click();
  const permissionActors = await page.locator('.permission-actor').count();
  const permissionChecks = await page.locator('.permission-check input').count();

  await page.getByRole('button', { name: '总览', exact: true }).click();
  await page.getByRole('button', { name: '质量控制', exact: true }).click();
  const qualityCards = await page.locator('.content-view .card').count();

  await page.getByRole('button', { name: '进度控制', exact: true }).click();
  const totalText = await page.locator('.investment-total').textContent();
  const progressHeaders = await page.locator('.content-view thead th').allTextContents();

  await page.getByRole('button', { name: '档案资料', exact: true }).click();
  const archiveRows = await page.locator('.content-view tbody tr').count();
  const archiveNames = await page.locator('.content-view tbody td:first-child').allTextContents();

  await page.getByRole('button', { name: '上图入库', exact: true }).click();
  const mapCards = await page.locator('.prep-card').count();
  const mapFields = await page.locator('.content-view .card li').allTextContents();

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
        secondaryPanelVisible,
        secondaryItemCount,
        tertiaryItemCount,
        metricTexts,
        currentUnitWork,
        currentDivisionWork,
        projectSwitchOptions,
        bidSectionOptions,
        unitOverviewRows,
        unitOverviewStatuses,
        moduleSubitems,
        focusedSubitem,
        focusedSubitemAfterClick,
        permissionActors,
        permissionChecks,
        qualityCards,
        totalText,
        progressHeaders,
        archiveRows,
        archiveNames,
        mapCards,
        mapFields,
        interfaceCards,
        uploadButtons,
        uploadedFiles,
        databaseTitle,
        databaseTables,
        editableInputs,
        editedValue,
        databaseUploadedFiles,
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
