import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('第一个页面有独立入口容器，后台默认隐藏', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

  assert.match(html, /id="accessGate"/);
  assert.match(html, /class="admin-shell" hidden/);
  assert.match(html, /assets\/blue-arrow-logo\.jpg/);
});

test('入口页模式强制隐藏第二页面后台', async () => {
  const css = await readFile(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(css, /\[hidden\]\s*\{[\s\S]*display:\s*none\s*!important/);
  assert.match(css, /body\.access-mode \.admin-shell\s*\{[\s\S]*display:\s*none\s*!important/);
  assert.match(css, /body:not\(\.access-mode\) \.access-gate\s*\{[\s\S]*display:\s*none\s*!important/);
});

test('入口流程包含项目建立和登录验证', async () => {
  const app = await readFile(new URL('../src/app.mjs', import.meta.url), 'utf8');

  assert.match(app, /consumeResetRequest/);
  assert.match(app, /searchParams\.has\('reset'\)/);
  assert.match(app, /建立第一个项目/);
  assert.match(app, /项目登录验证/);
  assert.match(app, /验证并继续/);
  assert.match(app, /验证码通过，请建立项目管理者代码和密码/);
  assert.match(app, /MOCK_VERIFY_CODE = '202620'/);
  assert.match(app, /projectName:\s*''/);
  assert.match(app, /blue_arrow_project_profile_v1/);
  assert.match(app, /blue_arrow_project_session_v1/);
});

test('入口页包含确认密码、密码显示和运营规则说明', async () => {
  const app = await readFile(new URL('../src/app.mjs', import.meta.url), 'utf8');

  assert.match(app, /managerPasswordConfirmInput/);
  assert.match(app, /管理者密码确认/);
  assert.match(app, /验证码通过后可设置/);
  assert.match(app, /disabled: !state\.setupDraft\.verified/);
  assert.match(app, /togglePasswordVisibility/);
  assert.match(app, /密码与确认密码不一致/);
  assert.match(app, /项目名称与密码规则/);
  assert.match(app, /项目名称建议使用正式立项或合同名称/);
  assert.match(app, /资料文件命名建议/);
  assert.match(app, /管理者密码为 6 位以上/);
  assert.match(app, /return `LAa\$\{String\(Date\.now\(\)\)\.slice\(-5\)\}`/);
});

test('项目建立后项目名称锁定，不提供重新建立入口', async () => {
  const app = await readFile(new URL('../src/app.mjs', import.meta.url), 'utf8');

  assert.match(app, /value="\$\{state\.profile\.projectName\}" readonly/);
  assert.doesNotMatch(app, /重新建立第一个项目/);
  assert.doesNotMatch(app, /rebuildProjectButton/);
});

test('数据智能中心包含 AI 待确认成果流程', async () => {
  const app = await readFile(new URL('../src/app.mjs', import.meta.url), 'utf8');

  assert.match(app, /renderIntelligenceCenter/);
  assert.match(app, /DeepSeek R1 文字资料模拟分析/);
  assert.match(app, /待项目管理者确认/);
  assert.match(app, /确认写入项目结构/);
});

test('平台明确区分 DeepSeek R1 文字分析和硅基流动视觉识别', async () => {
  const app = await readFile(new URL('../src/app.mjs', import.meta.url), 'utf8');

  assert.match(app, /DeepSeek R1 文字资料分析/);
  assert.match(app, /硅基流动图片识别/);
  assert.match(app, /DeepSeek-R1 文字接口/);
  assert.match(app, /硅基流动视觉接口/);
  assert.match(app, /DeepSeek-R1 仅负责文字资料和结构推理，不处理图片/);
  assert.match(app, /图纸、照片、视频帧/);
});

test('数据智能中心四个二级目录都有可执行动作', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const app = await readFile(new URL('../src/app.mjs', import.meta.url), 'utf8');

  assert.match(html, /id="apiModalHost"/);
  assert.match(app, /openSecondaryAction/);
  assert.match(app, /renderDataImportModal/);
  assert.match(app, /intelligenceFileInput/);
  assert.match(app, /classifyImportFile/);
  assert.match(app, /startSiliconFlowImportRecognition/);
  assert.match(app, /startDeepSeekImportAnalysis/);
  assert.match(app, /readFileAsDataUrl/);
  assert.match(app, /readFileAsText/);
  assert.match(app, /图片识别/);
  assert.match(app, /文档识别/);
  assert.match(app, /renderDeepSeekApiModal\(\)/);
  assert.match(app, /renderSiliconFlowApiModal\(\)/);
  assert.match(app, /renderGithubSyncModal/);
  assert.match(app, /githubRepository\.url/);
  assert.match(app, /githubRepository\.dataFolders/);
});

test('后台主界面显示当前项目身份并支持退出登录', async () => {
  const app = await readFile(new URL('../src/app.mjs', import.meta.url), 'utf8');

  assert.match(app, /renderAdminIdentityBar/);
  assert.match(app, /项目身份确认/);
  assert.match(app, /当前项目已锁定/);
  assert.match(app, /项目隔离运行/);
  assert.match(app, /logoutButton/);
  assert.match(app, /sessionStorage\.removeItem\(SESSION_KEY\)/);
});

test('项目指标由 DeepSeek 分类结果驱动并可点击查看目录', async () => {
  const app = await readFile(new URL('../src/app.mjs', import.meta.url), 'utf8');

  assert.match(app, /deepSeekProjectCatalog/);
  assert.match(app, /getDeepSeekCatalogStats/);
  assert.match(app, /renderProjectCatalogModal/);
  assert.match(app, /data-catalog-level/);
  assert.match(app, /单项工程/);
  assert.match(app, /单位工程/);
  assert.match(app, /分部分项工程/);
  assert.match(app, /单元工程/);
  assert.match(app, /SXK-DX-001/);
  assert.match(app, /SXK-DW-001/);
  assert.match(app, /SXK-FX-001/);
  assert.match(app, /SXK-DY-001/);
  assert.match(app, /DeepSeek-R1 根据设计文件、概预算和工程所属类型解析后写入/);
});

test('后台标签栏包含隐蔽验收和安全隐患并保留接口资料库', async () => {
  const app = await readFile(new URL('../src/app.mjs', import.meta.url), 'utf8');

  assert.match(app, /隐蔽验收/);
  assert.match(app, /安全隐患/);
  assert.match(app, /接口资料库/);
  assert.match(app, /\['总览', '质量控制', '进度控制', '档案资料', '隐蔽验收', '安全隐患', '接口资料库'\]/);
});

test('项目总览舱显示项目库、资料导入和模块生成状态', async () => {
  const app = await readFile(new URL('../src/app.mjs', import.meta.url), 'utf8');
  const data = await readFile(new URL('../src/data.mjs', import.meta.url), 'utf8');

  assert.match(app, /renderProjectOverview/);
  assert.match(app, /项目库状态/);
  assert.match(app, /资料导入入口/);
  assert.match(app, /项目总览驾驶舱/);
  assert.match(app, /overview-jump-card/);
  assert.match(app, /当前管理者代码/);
  assert.match(app, /githubRepository\.dataFolders/);
  assert.match(data, /项目总体状态/);
  assert.match(data, /关键节点预警/);
  assert.match(data, /质量问题汇总/);
  assert.match(data, /安全隐患汇总/);
  assert.match(data, /投资完成概览/);
  assert.match(data, /待审批资料/);
  assert.match(data, /点击后可继续挂接资料、责任单位、审批状态和虚拟数据库记录/);
});

test('项目总览舱支持挂接资料、责任单位、审批状态和虚拟数据库记录', async () => {
  const app = await readFile(new URL('../src/app.mjs', import.meta.url), 'utf8');

  assert.match(app, /bindProjectOverview/);
  assert.match(app, /renderOverviewLinkModal/);
  assert.match(app, /overviewAttachFileInput/);
  assert.match(app, /overviewResponsibilityInput/);
  assert.match(app, /overviewApprovalStatusInput/);
  assert.match(app, /overviewDatabaseRecordInput/);
  assert.match(app, /projectFileInput/);
  assert.match(app, /handleProjectFileSelection/);
  assert.match(app, /已选择工程文件/);
});

test('平台图片识别和文档识别按钮会打开本地文件选择', async () => {
  const app = await readFile(new URL('../src/app.mjs', import.meta.url), 'utf8');

  assert.match(app, /SILICONFLOW_API_KEY/);
  assert.match(app, /renderSiliconFlowApiModal/);
  assert.match(app, /siliconFlowApiKeyInput/);
  assert.match(app, /siliconFlowImageFileInput/);
  assert.match(app, /accept="\.jpg,\.jpeg,\.png,\.webp,\.dwg,\.pdf,\.mp4,\.mov,\.avi,\.zip"/);
  assert.match(app, /deepSeekDocumentFileInput/);
  assert.match(app, /buildSiliconFlowRecognitionPlan/);
  assert.match(app, /renderSiliconFlowRecognitionPlan/);
  assert.match(app, /renderTrialRecognitionResults/);
  assert.match(app, /本次识别成果整理/);
  assert.match(app, /石峡口水库除险加固初设报告与附图/);
  assert.match(app, /电气专业负荷合计约 69kW/);
  assert.match(app, /大坝典型剖面图/);
  assert.match(app, /溢洪道平面布置图/);
  assert.match(app, /后端解包/);
  assert.match(app, /后端先抽图\/抽帧/);
  assert.match(app, /isBrowserReadableImage/);
  assert.match(app, /后端先抽图\/抽帧\/解包/);
  assert.match(app, /识别成果整理/);
  assert.match(app, /图片识别/);
  assert.match(app, /文档识别/);
  assert.match(app, /click\(\)/);
  assert.match(app, /api\.siliconflow\.cn\/v1/);
  assert.match(app, /Qwen\/Qwen3-VL-32B-Instruct/);
  assert.match(app, /image_url/);
  assert.match(app, /硅基流动图片识别接口/);
});

test('点击项目总览舱二级目录会打开挂接入口', async () => {
  const app = await readFile(new URL('../src/app.mjs', import.meta.url), 'utf8');

  assert.match(app, /openOverviewSecondaryAction/);
  assert.match(app, /renderOverviewLinkModal\(item\)/);
  assert.match(app, /保存挂接记录/);
});

test('第一界面去掉外层黄色细线框', async () => {
  const css = await readFile(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(css, /\.access-card\s*\{[^}]*border:\s*0/);
  assert.doesNotMatch(css, /\.access-card\s*\{[^}]*rgba\(244,\s*196,\s*77,\s*0\.28\)/);
});

test('后台窄屏时改为单列，身份栏可直接显示', async () => {
  const css = await readFile(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(css, /@media\s*\(max-width:\s*900px\)/);
  assert.match(css, /grid-template-columns:\s*1fr/);
  assert.match(css, /body:not\(\.access-mode\)\s*\{[\s\S]*min-width:\s*0/);
});
