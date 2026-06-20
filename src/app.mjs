import {
  archiveChecklist,
  calculateInvestmentTotal,
  calculateProgressPercent,
  flattenProjectTree,
  mapStoragePlan,
  mockDatabaseConnections,
  moduleCatalog,
  projectPortfolio,
  progressItems,
  qualityScopes,
  scheduleItems,
  hiddenAcceptanceItems,
  sourceDocuments,
  createBlankProjectTree,
} from './data.mjs';

const tabs = [
  { id: 'overview', label: '总览' },
  { id: 'quality', label: '质量控制' },
  { id: 'progress', label: '进度控制' },
  { id: 'archive', label: '档案资料' },
  { id: 'map', label: '上图入库' },
  { id: 'interfaces', label: '接口资料库' },
];

const UPLOAD_DB_NAME = 'engineering_project_uploads_v1';
const UPLOAD_STORE = 'files';
const PROJECTS_STORAGE_KEY = 'engineering_project_portfolio_v2';
const IMPORT_ANALYSIS_STORAGE_KEY = 'engineering_project_import_analysis_v1';
const ACCESS_PROFILE_STORAGE_KEY = 'engineering_project_access_profile_v1';
const SUPPORTED_IMPORT_ACCEPT = [
  '.png',
  '.jpg',
  '.jpeg',
  '.dwg',
  '.docx',
  '.doc',
  '.xls',
  '.xlsx',
  '.csv',
  '.shp',
  '.geojson',
  '.json',
  '.kml',
  '.zip',
  '.ppt',
  '.pptx',
  '.pdf',
].join(',');

const state = {
  projects: loadProjects(),
  activeProjectId: null,
  selectedNode: null,
  activeTab: 'overview',
  activeModuleId: 'dashboard',
  activeSubitemIndex: 0,
  activePermissionActor: '项目法人',
  importAnalyses: loadImportAnalyses(),
  accessProfile: loadAccessProfile(),
};

state.activeProjectId = state.projects[0].id;
state.selectedNode = flattenProjectTree(currentProject().tree)[0];

const formatMoney = (value) =>
  new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    maximumFractionDigits: 0,
  }).format(value);

function renderModules() {
  const moduleNav = document.querySelector('#moduleNav');
  moduleNav.innerHTML = moduleCatalog
    .map(
      (module) => `
        <button class="module-button ${module.id === state.activeModuleId ? 'active' : ''}" data-module-id="${module.id}" type="button">
          <span class="module-dot"></span>
          <span>${module.name}</span>
        </button>
      `,
    )
    .join('');

  moduleNav.querySelectorAll('[data-module-id]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeModuleId = button.dataset.moduleId;
      state.activeTab = 'module';
      state.activeSubitemIndex = 0;
      renderModules();
      renderTabs();
      renderSecondaryNav();
      renderContent();
    });
  });
}

function loadProjects() {
  const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
  if (!stored) return structuredClone(projectPortfolio);

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : structuredClone(projectPortfolio);
  } catch {
    return structuredClone(projectPortfolio);
  }
}

function saveProjects() {
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(state.projects));
}

function loadImportAnalyses() {
  const stored = localStorage.getItem(IMPORT_ANALYSIS_STORAGE_KEY);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveImportAnalyses() {
  localStorage.setItem(IMPORT_ANALYSIS_STORAGE_KEY, JSON.stringify(state.importAnalyses));
}

function loadAccessProfile() {
  const stored = localStorage.getItem(ACCESS_PROFILE_STORAGE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function saveAccessProfile() {
  localStorage.setItem(ACCESS_PROFILE_STORAGE_KEY, JSON.stringify(state.accessProfile));
}

function currentProject() {
  return state.projects.find((project) => project.id === state.activeProjectId) ?? state.projects[0];
}

function switchProject(projectId) {
  state.activeProjectId = projectId;
  state.selectedNode = flattenProjectTree(currentProject().tree)[0];
  renderAll();
}

function createOrSwitchProjectByName(name) {
  const existing = state.projects.find((project) => project.name === name);
  if (existing) {
    state.activeProjectId = existing.id;
    state.selectedNode = flattenProjectTree(existing.tree)[0];
    return existing;
  }

  const project = {
    id: `project-${Date.now()}`,
    name,
    region: '手动创建项目',
    stage: '待导入图纸资料',
    tree: createBlankProjectTree(name),
  };
  state.projects.push(project);
  state.activeProjectId = project.id;
  state.selectedNode = flattenProjectTree(project.tree)[0];
  return project;
}

function getProjectScopedId(connectionId) {
  return `${state.activeProjectId}:${connectionId}`;
}

function renderStats() {
  const statsGrid = document.querySelector('#statsGrid');
  const currentTreeNodes = flattenProjectTree(currentProject().tree);
  const unitWorkCount = countNodesByType(currentTreeNodes, '单位工程');
  const divisionWorkCount = countNodesByType(currentTreeNodes, '分部工程');
  const cellWorkCount = countNodesByType(currentTreeNodes, '单元工程');
  const stats = [
    { label: '单位工程数量', value: unitWorkCount, suffix: `完成 ${calculateUnitWorkCompletion()}%` },
    { label: '分部工程数量', value: divisionWorkCount, suffix: `完成 ${calculateNodeCompletion(currentTreeNodes, '分部工程')}%` },
    { label: '单元工程数量', value: cellWorkCount, suffix: `完成 ${calculateNodeCompletion(currentTreeNodes, '单元工程')}%` },
    { label: '上图入库', value: mapStoragePlan.interfaceIntegration ? 1 : 0, suffix: mapStoragePlan.interfaceIntegration ? '接口已对接' : '接口待对接' },
  ];
  statsGrid.innerHTML = stats
    .map(
      (stat) => `
        <article class="metric">
          <span>${stat.label}</span>
          <strong>${stat.value}</strong>
          <span>${stat.suffix}</span>
        </article>
      `,
    )
    .join('');
}

function countNodesByType(nodes, type) {
  return nodes.filter((node) => node.type === type).length;
}

function calculateUnitWorkCompletion() {
  return calculateNodeCompletion(flattenProjectTree(currentProject().tree), '单位工程');
}

function calculateNodeCompletion(nodes, type) {
  const scopedNodes = nodes.filter((node) => node.type === type);
  if (scopedNodes.length === 0) return 0;
  const completedNodes = scopedNodes.filter((node) => ['已完成', '已验收', '已归档'].includes(node.status));
  return Math.round((completedNodes.length / scopedNodes.length) * 100);
}

function findNodeAncestor(node, type) {
  const nodes = flattenProjectTree(currentProject().tree);
  let current = node;
  while (current) {
    if (current.type === type) return current.name;
    current = nodes.find((item) => item.id === current.parentId);
  }
  return nodes.find((item) => item.type === type)?.name ?? '未选择';
}

function getCellWorkRows() {
  return flattenProjectTree(currentProject().tree)
    .filter((node) => node.type === '单元工程')
    .map((node, index) => ({
      code: `DY-${String(index + 1).padStart(3, '0')}`,
      name: node.name,
      status: ['施工中', '关键线路', '已完成', '已验收'].includes(node.status) ? '已开工' : '未开工',
    }));
}

function getBidSections() {
  return flattenProjectTree(currentProject().tree).filter((node) => node.type === '标段');
}

function getProjectAnalyses() {
  return state.importAnalyses.filter((item) => item.projectId === state.activeProjectId);
}

function getImportedSuggestions() {
  const analyses = getProjectAnalyses();
  return {
    analyses,
    unitWorks: [...new Set(analyses.flatMap((item) => item.suggestions.unitWorks))],
    divisionWorks: [...new Set(analyses.flatMap((item) => item.suggestions.divisionWorks))],
    cellWorks: [...new Set(analyses.flatMap((item) => item.suggestions.cellWorks))],
    controls: [...new Set(analyses.flatMap((item) => item.suggestions.controls))],
  };
}

function hasProjectGeneratedData() {
  return getProjectAnalyses().length > 0;
}

function getDynamicScheduleItems() {
  const imported = getImportedSuggestions();
  if (imported.cellWorks.length > 0) {
    return imported.cellWorks.map((cell, index) => ({
      code: `JH-${String(index + 1).padStart(3, '0')}`,
      task: cell,
      start: '待编制',
      end: '待编制',
      predecessor: index === 0 ? '资料导入与项目划分确认' : imported.cellWorks[index - 1],
      floatDays: '待计算',
      critical: imported.controls.some((control) => ['隐蔽', '验收', '基础', '边坡', '灌浆', '接地'].some((key) => control.includes(key))),
    }));
  }

  if (flattenProjectTree(currentProject().tree).some((node) => node.type === '单元工程')) {
    return scheduleItems;
  }

  return [
    {
      code: 'JH-001',
      task: '导入设计图纸、批复、清单和施工组织资料后自动生成',
      start: '待导入',
      end: '待导入',
      predecessor: '新建项目',
      floatDays: '待计算',
      critical: true,
    },
  ];
}

function getDynamicProgressItems() {
  const imported = getImportedSuggestions();
  if (imported.cellWorks.length > 0) {
    return imported.cellWorks.map((cell, index) => ({
      id: `p${index + 1}`,
      item: cell,
      plannedQuantity: 1,
      completedQuantity: 0,
      unit: '项',
      tenderUnitPrice: 0,
      status: 'warning',
    }));
  }

  if (flattenProjectTree(currentProject().tree).some((node) => node.type === '单元工程')) {
    return progressItems;
  }

  return [
    {
      id: 'p1',
      item: '导入投标清单和完成工程量后自动计算',
      plannedQuantity: 1,
      completedQuantity: 0,
      unit: '项',
      tenderUnitPrice: 0,
      status: 'warning',
    },
  ];
}

function getDynamicQualityScopes() {
  const imported = getImportedSuggestions();
  if (imported.unitWorks.length > 0 || imported.controls.length > 0) {
    const units = imported.unitWorks.length > 0 ? imported.unitWorks : ['导入资料识别质量控制范围'];
    const controls =
      imported.controls.length > 0
        ? imported.controls
        : ['待从设计图纸、施工规范、隐蔽验收资料中提取控制指标'];
    return Object.fromEntries(
      units.map((unit) => [
        unit,
        {
          rawMaterials: ['待从材料表、检测报告、施工规范中提取'],
          processControls: controls,
        },
      ]),
    );
  }

  if (flattenProjectTree(currentProject().tree).some((node) => node.type === '单元工程')) {
    return qualityScopes;
  }

  return {
    待导入资料: {
      rawMaterials: ['导入设计图纸、规范、材料清单后生成'],
      processControls: ['导入资料后自动生成质量控制图和班组执行表'],
    },
  };
}

function getDynamicHiddenAcceptanceItems() {
  const imported = getImportedSuggestions();
  const controls = imported.controls.filter((item) => ['隐蔽', '验收', '备案', '基础', '灌浆', '接地'].some((key) => item.includes(key)));
  if (controls.length > 0) {
    return controls.map((control, index) => ({
      part: imported.cellWorks[index] ?? control,
      trigger: '进入下一道工序前',
      check: control,
      witnesses: '设计单位、监理单位、项目法人、上一级质量监督单位按需见证',
      status: '待验收',
    }));
  }

  if (flattenProjectTree(currentProject().tree).some((node) => node.type === '单元工程')) {
    return hiddenAcceptanceItems;
  }

  return [
    {
      part: '待导入隐蔽工程资料',
      trigger: '资料导入后生成',
      check: '基础面、结构尺寸、材料检测和工序交接资料',
      witnesses: '设计单位、监理单位、项目法人',
      status: '待补充',
    },
  ];
}

function getDynamicArchiveChecklist() {
  const imported = getImportedSuggestions();
  if (hasProjectGeneratedData()) {
    const baseItems = [
      ['项目开工申请', '监理工程师', '待审批'],
      ['隐蔽工程验收', '设计单位、监理单位、项目法人', '待验收'],
      ['隐蔽工程验收备案', '上一级质量监督单位', '待备案'],
      ['项目地块空间矢量坐标与高程', '测绘单位', '待补充'],
      ['多方联合确认会议纪要', '监理单位责任人', '待归档'],
    ];
    return [
      ...baseItems.map(([name, owner, status]) => ({ name, owner, status })),
      ...imported.analyses.slice(0, 6).map((analysis) => ({
        name: analysis.name,
        owner: '数据智能中心',
        status: analysis.status,
      })),
    ];
  }

  if (flattenProjectTree(currentProject().tree).some((node) => node.type === '单元工程')) {
    return archiveChecklist;
  }

  return [
    { name: '项目开工申请', owner: '监理工程师', status: '待审批' },
    { name: '隐蔽工程验收', owner: '设计单位、监理单位、项目法人', status: '待验收' },
    { name: '隐蔽工程验收备案', owner: '上一级质量监督单位', status: '待备案' },
    { name: '项目地块空间矢量坐标与高程', owner: '测绘单位', status: '待补充' },
    { name: '多方联合确认会议纪要', owner: '监理单位责任人', status: '待归档' },
  ];
}

function getDynamicSourceDocuments() {
  const imported = getImportedSuggestions();
  if (imported.analyses.length > 0) {
    return imported.analyses.map((analysis) => ({
      name: analysis.name,
      type: analysis.type,
      source: '本地导入',
      status: analysis.status,
      evidence: analysis.summary,
    }));
  }

  if (flattenProjectTree(currentProject().tree).some((node) => node.type === '单元工程')) {
    return sourceDocuments;
  }

  return [
    {
      name: '待导入设计图纸、批复、清单、坐标和验收资料',
      type: '本地文件',
      source: '新建项目',
      status: '待补充',
      evidence: '导入后自动补充项目划分、控制图表、档案资料和数据中心记录',
    },
  ];
}

function getModuleGenerationCards() {
  const imported = getImportedSuggestions();
  const generatedCount = imported.unitWorks.length + imported.divisionWorks.length + imported.cellWorks.length + imported.controls.length;
  const status = generatedCount > 0 ? '已生成' : '待资料导入';
  return [
    ['项目结构树', imported.cellWorks.length, status],
    ['时标网络图', getDynamicScheduleItems().length, status],
    ['工程量进度控制图', getDynamicProgressItems().length, status],
    ['质量控制图', Object.keys(getDynamicQualityScopes()).length, status],
    ['安全隐患树状图', imported.controls.filter((item) => ['安全', '边坡', '基坑', '用电'].some((key) => item.includes(key))).length, status],
    ['隐蔽工程与验收管理', getDynamicHiddenAcceptanceItems().length, status],
    ['进度与投资报表', getDynamicProgressItems().length, status],
    ['档案资料管理', getDynamicArchiveChecklist().length, status],
    ['数据智能中心', imported.analyses.length, imported.analyses.length > 0 ? '已入库' : '待导入'],
  ];
}

function getParticipantActors() {
  return moduleCatalog.find((item) => item.id === 'participants')?.subitems ?? [];
}

function createAccessProfile(projectName, managerCode = generateManagerCode(), managerPassword = generateMixedCode(6)) {
  const normalizedManagerCode = managerCode.trim();
  return {
    projectName,
    managerCode: normalizedManagerCode,
    managerPassword,
    createdAt: new Date().toLocaleString('zh-CN'),
    participants: getParticipantActors().map((actor, index) => ({
      actor,
      projectCode: `${normalizedManagerCode}-${String(index + 1).padStart(2, '0')}`,
      password: generateMixedCode(6),
      status: '待分发',
    })),
  };
}

function generateManagerCode() {
  return shuffleString(`${pickRandom('ABCDEFGHIJKLMNOPQRSTUVWXYZ')}${pickRandom('abcdefghijklmnopqrstuvwxyz')}${pickRandom('0123456789')}${generateMixedCode(5)}`);
}

function generateMixedCode(length) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const chars = `${letters}${digits}`;
  if (length < 2) return Array.from({ length }, () => pickRandom(chars)).join('');
  return shuffleString(`${pickRandom(letters)}${pickRandom(digits)}${Array.from({ length: length - 2 }, () => pickRandom(chars)).join('')}`);
}

function pickRandom(chars) {
  return chars[Math.floor(Math.random() * chars.length)];
}

function shuffleString(value) {
  return value
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

function validateManagerCode(value) {
  return value.length >= 8 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value);
}

function validatePassword(value) {
  return value.length === 6 && /[A-Za-z]/.test(value) && /\d/.test(value);
}

function renderAccessCredentialPanel() {
  if (!state.accessProfile) {
    return `
      <div class="import-empty">
        <strong>尚未建立项目身份体系</strong>
        <span>从进入页创建项目后，会自动生成项目管理者和10类参建单位的项目代码、密码。</span>
      </div>
    `;
  }

  return `
    <section class="credential-panel">
      <div class="credential-head">
        <div>
          <span class="eyebrow">项目协同身份</span>
          <h3>${state.accessProfile.projectName}</h3>
          <p>同一个项目只生成一套项目代码体系。后台按项目名称和管理者代码隔离不同项目内容。</p>
        </div>
        <div class="manager-code-card">
          <span>项目管理者代码</span>
          <strong>${state.accessProfile.managerCode}</strong>
          <small>管理者密码：${state.accessProfile.managerPassword}</small>
        </div>
      </div>
      <table class="table credential-table">
        <thead>
          <tr>
            <th>参建单位</th>
            <th>项目代码</th>
            <th>初始密码</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          ${state.accessProfile.participants
            .map(
              (item) => `
                <tr>
                  <td>${item.actor}</td>
                  <td>${item.projectCode}</td>
                  <td>${item.password}</td>
                  <td><span class="status warning">${item.status}</span></td>
                </tr>
              `,
            )
            .join('')}
        </tbody>
      </table>
    </section>
  `;
}

function getDynamicSubitems(module) {
  const nodes = flattenProjectTree(currentProject().tree);
  const analyses = getProjectAnalyses();
  const imported = {
    unitWorks: [...new Set(analyses.flatMap((item) => item.suggestions.unitWorks))],
    divisionWorks: [...new Set(analyses.flatMap((item) => item.suggestions.divisionWorks))],
    cellWorks: [...new Set(analyses.flatMap((item) => item.suggestions.cellWorks))],
    controls: [...new Set(analyses.flatMap((item) => item.suggestions.controls))],
  };

  const byType = (type) => nodes.filter((node) => node.type === type).map((node) => node.name);
  const pick = (primary, fallback) => (primary.length > 0 ? primary : fallback);

  const dynamicMap = {
    dashboard: pick(imported.unitWorks, ['项目总体状态', '资料解析结果', ...byType('单位工程')]),
    tree: pick([...byType('标段'), ...byType('单位工程')], module.subitems),
    network: pick(imported.cellWorks, module.subitems),
    'quantity-progress': pick(imported.cellWorks, module.subitems),
    quality: pick(imported.controls, [...byType('单位工程').map((name) => `${name}质量指标`), '班组执行表', '整改闭环']),
    safety: pick(imported.controls.filter((item) => item.includes('安全') || item.includes('边坡') || item.includes('基坑')), module.subitems),
    acceptance: pick(imported.controls.filter((item) => item.includes('隐蔽') || item.includes('验收') || item.includes('备案')), module.subitems),
    drawings: pick(analyses.map((item) => item.name), module.subitems),
    investment: pick(imported.cellWorks, module.subitems),
    archive: pick(analyses.map((item) => item.name), module.subitems),
    templates: module.subitems,
    'data-intelligence': pick(['资料自动解析库', ...analyses.map((item) => item.name)], module.subitems),
    participants: module.subitems,
  };

  return [...new Set(dynamicMap[module.id] ?? module.subitems)].slice(0, 30);
}

function getActiveSubitem() {
  const module = moduleCatalog.find((item) => item.id === state.activeModuleId) ?? moduleCatalog[0];
  return getDynamicSubitems(module)[state.activeSubitemIndex] ?? getDynamicSubitems(module)[0] ?? '';
}

function renderSecondaryNav() {
  const module = moduleCatalog.find((item) => item.id === state.activeModuleId) ?? moduleCatalog[0];
  const subitems = getDynamicSubitems(module);
  const host = document.querySelector('#secondaryNav');
  if (state.activeSubitemIndex >= subitems.length) state.activeSubitemIndex = 0;
  document.querySelector('#secondaryCount').textContent = `${subitems.length} 项`;
  host.innerHTML = subitems
    .map(
      (item, index) => `
        <button class="tree-node ${index === state.activeSubitemIndex ? 'active' : ''}" data-subitem-index="${index}" type="button">
          <span class="tree-node-title">${String(index + 1).padStart(2, '0')} ${item}</span>
          <span class="node-meta">
            <span>${currentProject().name}</span>
            <span>动态目录</span>
          </span>
        </button>
      `,
    )
    .join('');

  host.querySelectorAll('[data-subitem-index]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeSubitemIndex = Number(button.dataset.subitemIndex);
      renderSecondaryNav();
      renderContent();
    });
  });
}

function renderTabs() {
  const tabStrip = document.querySelector('#tabStrip');
  tabStrip.innerHTML = tabs
    .map(
      (tab) => `
        <button class="tab-button ${tab.id === state.activeTab ? 'active' : ''}" data-tab-id="${tab.id}" type="button">
          ${tab.label}
        </button>
      `,
    )
    .join('');

  tabStrip.querySelectorAll('[data-tab-id]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeTab = button.dataset.tabId;
      renderTabs();
      renderContent();
    });
  });
}

function renderProjectDashboard() {
  const project = currentProject();
  const nodes = flattenProjectTree(project.tree);
  const analyses = getProjectAnalyses();
  const counts = [
    ['单位工程', countNodesByType(nodes, '单位工程')],
    ['分部工程', countNodesByType(nodes, '分部工程')],
    ['单元工程', countNodesByType(nodes, '单元工程')],
    ['已导入资料', analyses.length],
  ];

  return `
    <section class="module-detail-view">
      <div class="project-command">
        <div>
          <span class="eyebrow">多项目统一管理入口</span>
          <h2>新建项目</h2>
          <p>输入新的项目名称后，平台会切换到独立的新项目状态。随后导入该项目的设计图纸、批复、投标清单、坐标和验收资料，各功能模块会按当前项目自动生成项目结构树、时标网络图、进度图、质量控制图、安全隐患树、投资报表和档案资料。</p>
        </div>
        <form id="projectCreateForm" class="project-create-form">
          <label>
            <span>新项目名称</span>
            <input id="projectNameInput" type="text" placeholder="例如：某某水库除险加固工程" />
          </label>
          <button class="upload-button" type="submit">新建项目并进入资料导入</button>
        </form>
      </div>

      <div class="project-card-grid">
        ${state.projects
          .map(
            (item) => `
              <button class="project-card ${item.id === state.activeProjectId ? 'active' : ''}" data-project-id="${item.id}" type="button">
                <strong>${item.name}</strong>
                <span>${item.region}</span>
                <small>${item.stage}</small>
              </button>
            `,
          )
          .join('')}
      </div>

      <div class="dashboard-status-grid">
        ${counts
          .map(
            ([label, value]) => `
              <article class="metric">
                <span>${label}</span>
                <strong>${value}</strong>
                <span>${label === '已导入资料' ? '份资料' : '个节点'}</span>
              </article>
            `,
          )
          .join('')}
      </div>

      ${renderAccessCredentialPanel()}

      ${renderProjectImportPanel()}

      <div class="view-grid module-generation-grid">
        ${getModuleGenerationCards()
          .map(
            ([name, count, status]) => `
              <article class="card">
                <h3>${name}</h3>
                <div class="detail-kv"><span>生成数量</span><strong>${count}</strong></div>
                <div class="detail-kv"><span>当前状态</span><strong>${status}</strong></div>
                <p class="node-meta">该模块内容跟随“${project.name}”的导入资料动态更新。</p>
              </article>
            `,
          )
          .join('')}
      </div>
    </section>
  `;
}

function renderOverview() {
  const rows = getCellWorkRows();
  if (rows.length === 0) {
    return `
      <div class="import-empty">
        <strong>当前项目还没有单元工程</strong>
        <span>请先在“项目总览舱”点击新建项目并导入图纸、批复、清单、坐标或施工资料，系统会自动生成单位工程、分部工程和单元工程。</span>
      </div>
    `;
  }

  return `
    <table class="table unit-overview-table">
      <thead>
        <tr>
          <th>单元工程编号</th>
          <th>单元工程名称</th>
          <th>开工状态</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row) => `
              <tr>
                <td>${row.code}</td>
                <td>${row.name}</td>
                <td><span class="status ${row.status === '已开工' ? 'ok' : 'warning'}">${row.status}</span></td>
              </tr>
            `,
          )
          .join('')}
      </tbody>
    </table>
  `;
}

function renderQuality() {
  const scopes = getDynamicQualityScopes();
  return `
    <div class="view-grid">
      ${Object.entries(scopes)
        .map(
          ([scope, controls]) => `
            <article class="card">
              <h3>${scope}</h3>
              <p class="node-meta">原材料控制</p>
              <ul>${controls.rawMaterials.slice(0, 6).map((item) => `<li>${item}</li>`).join('')}</ul>
              <p class="node-meta">过程控制</p>
              <ul>${controls.processControls.map((item) => `<li>${item}</li>`).join('')}</ul>
            </article>
          `,
        )
        .join('')}
    </div>
  `;
}

function renderScheduleNetwork() {
  const items = getDynamicScheduleItems();
  return `
    <table class="table">
      <thead>
        <tr>
          <th>节点</th>
          <th>关键工作</th>
          <th>计划时间</th>
          <th>前置条件</th>
          <th>自由时差</th>
          <th>关键线路</th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map(
            (item) => `
              <tr>
                <td>${item.code}</td>
                <td>${item.task}</td>
                <td>${item.start} 至 ${item.end}</td>
                <td>${item.predecessor}</td>
                <td>${item.floatDays}${Number.isFinite(item.floatDays) ? ' 天' : ''}</td>
                <td><span class="status ${item.critical ? 'danger' : 'ok'}">${item.critical ? '关键' : '可调整'}</span></td>
              </tr>
            `,
          )
          .join('')}
      </tbody>
    </table>
  `;
}

function renderHiddenAcceptance() {
  const items = getDynamicHiddenAcceptanceItems();
  return `
    <table class="table">
      <thead>
        <tr>
          <th>隐蔽部位</th>
          <th>触发时点</th>
          <th>核验内容</th>
          <th>见证单位</th>
          <th>状态</th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map(
            (item) => `
              <tr>
                <td>${item.part}</td>
                <td>${item.trigger}</td>
                <td>${item.check}</td>
                <td>${item.witnesses}</td>
                <td><span class="status ${item.status}">${item.status}</span></td>
              </tr>
            `,
          )
          .join('')}
      </tbody>
    </table>
  `;
}

function renderSourceDocuments() {
  const documents = getDynamicSourceDocuments();
  return `
    <table class="table">
      <thead>
        <tr>
          <th>资料名称</th>
          <th>类型</th>
          <th>来源</th>
          <th>解析状态</th>
          <th>已生成内容</th>
        </tr>
      </thead>
      <tbody>
        ${documents
          .map(
            (item) => `
              <tr>
                <td>${item.name}</td>
                <td>${item.type}</td>
                <td>${item.source}</td>
                <td><span class="status ${item.status === '已解析' || item.status === '已入库' ? 'ok' : 'warning'}">${item.status}</span></td>
                <td>${item.evidence}</td>
              </tr>
            `,
          )
          .join('')}
      </tbody>
    </table>
  `;
}

function renderProjectImportPanel() {
  return `
    <section class="import-panel">
      <div>
        <span class="eyebrow">本地工程文件导入</span>
        <h3>上传后自动识别并补充当前项目</h3>
        <p>支持 PNG、JPG、DWG、DOCX、DOC、XLS、XLSX、CSV、SHP、GeoJSON、KML、ZIP、Word 文档和 PPT。可解析内容会生成单位工程、分部工程、单元工程、质量控制和档案资料建议。</p>
      </div>
      <input id="projectImportInput" class="visually-hidden" type="file" multiple accept="${SUPPORTED_IMPORT_ACCEPT}" />
      <button id="projectImportButton" class="upload-button" type="button">导入并分析工程文件</button>
    </section>
    ${renderImportAnalysisResults()}
  `;
}

function renderImportAnalysisResults() {
  const analyses = state.importAnalyses.filter((item) => item.projectId === state.activeProjectId);
  if (analyses.length === 0) {
    return `
      <div class="import-empty">
        <strong>暂无导入分析记录</strong>
        <span>点击上方按钮选择本地文件后，系统会把识别到的工程对象补充到当前项目。</span>
      </div>
    `;
  }

  return `
    <div class="import-results">
      ${analyses
        .slice(0, 8)
        .map(
          (analysis) => `
            <article class="import-result-card">
              <div class="import-result-head">
                <div>
                  <strong>${escapeHtml(analysis.name)}</strong>
                  <span>${analysis.type} · ${analysis.status} · ${analysis.uploadedAt}</span>
                </div>
                <span class="status ${analysis.status === '已解析' ? 'ok' : 'warning'}">${analysis.status}</span>
              </div>
              <p>${escapeHtml(analysis.summary)}</p>
              <div class="suggestion-grid">
                ${renderSuggestionBlock('单位工程', analysis.suggestions.unitWorks)}
                ${renderSuggestionBlock('分部工程', analysis.suggestions.divisionWorks)}
                ${renderSuggestionBlock('单元工程', analysis.suggestions.cellWorks)}
                ${renderSuggestionBlock('质量/档案提示', analysis.suggestions.controls)}
              </div>
            </article>
          `,
        )
        .join('')}
    </div>
  `;
}

function renderSuggestionBlock(title, items) {
  const values = [...new Set(items)].slice(0, 5);
  return `
    <div class="suggestion-block">
      <span>${title}</span>
      ${values.length > 0 ? values.map((item) => `<strong>${escapeHtml(item)}</strong>`).join('') : '<em>待人工补充</em>'}
    </div>
  `;
}

function renderProgress() {
  const items = getDynamicProgressItems();
  const total = calculateInvestmentTotal(items);
  return `
    <table class="table">
      <thead>
        <tr>
          <th>单元工程编号</th>
          <th>单元工程</th>
          <th>计划/完成</th>
          <th>投标单价</th>
          <th>完成产值</th>
          <th>状态</th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map((item) => {
            const percent = calculateProgressPercent(item);
            const output = item.completedQuantity * item.tenderUnitPrice;
            return `
              <tr>
                <td>${item.id.toUpperCase()}</td>
                <td>${item.item}</td>
                <td>
                  ${item.completedQuantity}/${item.plannedQuantity} ${item.unit}
                  <div class="progress-bar"><span style="width:${percent}%"></span></div>
                </td>
                <td>${formatMoney(item.tenderUnitPrice)}</td>
                <td>${formatMoney(output)}</td>
                <td><span class="status ${item.status}">${percent}%</span></td>
              </tr>
            `;
          })
          .join('')}
      </tbody>
    </table>
    <div class="investment-total">累计完成工程直接费：${formatMoney(total)}</div>
  `;
}

function renderArchive() {
  const items = getDynamicArchiveChecklist();
  return `
    <table class="table">
      <thead>
        <tr>
          <th>资料名称</th>
          <th>责任单位</th>
          <th>状态</th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map(
            (item) => `
              <tr>
                <td>${item.name}</td>
                <td>${item.owner}</td>
                <td><span class="status ${item.status}">${item.status}</span></td>
              </tr>
            `,
          )
          .join('')}
      </tbody>
    </table>
  `;
}

function renderMapStorage() {
  return `
    <div class="prep-grid">
      <article class="prep-card">
        <span>当前阶段</span>
        <h3>${mapStoragePlan.phase}</h3>
        <strong>第一版原型</strong>
      </article>
      <article class="prep-card">
        <span>接口对接</span>
        <h3>${mapStoragePlan.interfaceIntegration ? '已对接' : '暂不对接'}</h3>
        <strong>仅预留字段</strong>
      </article>
      <article class="prep-card">
        <span>字段数量</span>
        <h3>${mapStoragePlan.fields.length}</h3>
        <strong>资料结构准备</strong>
      </article>
    </div>
    <div class="card" style="margin-top:12px">
      <h3>上图入库字段</h3>
      <ul>${mapStoragePlan.fields.map((field) => `<li>${field}</li>`).join('')}</ul>
    </div>
  `;
}

function renderInterfaces() {
  return `
    <div class="section-action-row">
      <a class="open-db-link" href="./database.html" target="_blank" rel="noreferrer">打开虚拟数据库项目</a>
    </div>
    ${renderProjectImportPanel()}
    <div class="view-grid">
      ${mockDatabaseConnections
        .map(
          (connection) => `
            <article class="card interface-card">
              <h3>${connection.name}</h3>
              <div class="detail-kv"><span>当前模式</span><strong>${connection.mode}</strong></div>
              <div class="detail-kv"><span>上传方式</span><strong>${connection.manualUpload ? '支持手动上传' : '接口自动同步'}</strong></div>
              <div class="detail-kv"><span>预留路径</span><strong>${connection.storagePath}</strong></div>
              <div class="detail-kv"><span>未来接口</span><strong>${connection.futureInterface}</strong></div>
              <p class="interface-desc">${connection.description}</p>
              <div class="file-tags">
                ${connection.acceptedFiles.map((fileType) => `<span>${fileType}</span>`).join('')}
              </div>
              <input class="visually-hidden upload-input" data-connection-id="${connection.id}" type="file" multiple accept="${SUPPORTED_IMPORT_ACCEPT}" />
              <button class="upload-button" data-upload-target="${connection.id}" type="button">手动上传资料</button>
              <div class="uploaded-list" data-upload-list="${connection.id}">
                <span>正在读取本地资料库...</span>
              </div>
            </article>
          `,
        )
        .join('')}
    </div>
  `;
}

function renderModuleDetailView() {
  const module = moduleCatalog.find((item) => item.id === state.activeModuleId) ?? moduleCatalog[0];
  const subitem = getActiveSubitem();
  if (module.id === 'dashboard') {
    return renderProjectDashboard();
  }

  if (module.id === 'participants') {
    return renderPermissionManager(module);
  }

  if (module.id === 'network') {
    return `
      <section class="module-detail-view">
        <div class="module-hero">
          <span>设计资料自动生成</span>
          <h2>${module.name}</h2>
          <p>${module.purpose}</p>
        </div>
        ${renderScheduleNetwork()}
      </section>
    `;
  }

  if (module.id === 'quantity-progress' || module.id === 'investment') {
    return `
      <section class="module-detail-view">
        <div class="module-hero">
          <span>投标清单单价计算</span>
          <h2>${module.name}</h2>
          <p>${module.purpose}</p>
        </div>
        ${renderProgress()}
      </section>
    `;
  }

  if (module.id === 'quality') {
    return `
      <section class="module-detail-view">
        <div class="module-hero">
          <span>关键工序控制</span>
          <h2>${module.name}</h2>
          <p>${module.purpose}</p>
        </div>
        ${renderQuality()}
      </section>
    `;
  }

  if (module.id === 'acceptance') {
    return `
      <section class="module-detail-view">
        <div class="module-hero">
          <span>隐蔽节点闭环</span>
          <h2>${module.name}</h2>
          <p>${module.purpose}</p>
        </div>
        ${renderHiddenAcceptance()}
      </section>
    `;
  }

  if (module.id === 'drawings' || module.id === 'data-intelligence') {
    return `
      <section class="module-detail-view">
        <div class="module-hero">
          <span>资料解析与入库</span>
          <h2>${module.name}</h2>
          <p>${module.purpose}</p>
        </div>
        ${module.id === 'data-intelligence' ? renderProjectImportPanel() : ''}
        ${renderSourceDocuments()}
      </section>
    `;
  }

  return `
    <section class="module-detail-view">
      <div class="module-hero">
        <span>栏目跳转</span>
        <h2>${module.name}</h2>
        <p>${module.purpose}</p>
      </div>
      <div class="focused-subitem">
        <span>${String(state.activeSubitemIndex + 1).padStart(2, '0')}</span>
        <h3>${subitem}</h3>
        <p>该二级目录由左侧二级目录栏选择。后续可继续挂接资料、责任单位、审批状态、虚拟数据库记录，并扩展三级子项。</p>
      </div>
      <div class="view-grid">
        <article class="card">
          <h3>资料挂接</h3>
          <ul>
            <li>图纸、照片、表格、报告可归属到当前二级目录</li>
            <li>上传资料按当前项目隔离保存</li>
          </ul>
        </article>
        <article class="card">
          <h3>责任与审批</h3>
          <ul>
            <li>可绑定责任单位、审核人和审批状态</li>
            <li>后续接入真实流程后按项目权限控制</li>
          </ul>
        </article>
        <article class="card">
          <h3>三级扩展</h3>
          <ul>
            <li>查看、填报、审批、导出、数据库记录均可继续细化</li>
            <li>由平台管理者统一配置权限范围</li>
          </ul>
        </article>
      </div>
    </section>
  `;
}

function renderPermissionManager(module) {
  const actors = getDynamicSubitems(module);
  if (!actors.includes(state.activePermissionActor)) {
    state.activePermissionActor = actors[0];
  }
  const scopeModules = moduleCatalog.filter((item) => item.id !== 'tree');

  return `
    <section class="module-detail-view">
      <div class="module-hero">
        <span>平台管理者权限设置</span>
        <h2>${state.activePermissionActor}</h2>
        <p>权限由平台管理者执行，范围覆盖一级栏目、二级目录，以及二级目录下的查看、填报、审批、导出等三级动作。</p>
      </div>
      <div class="permission-layout">
        <div class="permission-actors">
          ${actors
            .map(
              (actor, index) => `
                <button class="permission-actor ${actor === state.activePermissionActor ? 'active' : ''}" data-actor="${actor}" type="button">
                  <span>${String(index + 1).padStart(2, '0')}</span>
                  <strong>${actor}</strong>
                </button>
              `,
            )
            .join('')}
        </div>
        <div class="permission-scopes">
          ${scopeModules
            .map(
              (scope) => `
                <article class="permission-scope">
                  <div>
                    <strong>${scope.name}</strong>
                    <span>${getDynamicSubitems(scope).length} 个二级目录</span>
                  </div>
                  ${getDynamicSubitems(scope)
                    .slice(0, 4)
                    .map(
                      (subitem) => `
                        <label class="permission-check">
                          <input type="checkbox" checked />
                          <span>${subitem}：查看 / 填报 / 审批 / 导出</span>
                        </label>
                      `,
                    )
                    .join('')}
                </article>
              `,
            )
            .join('')}
        </div>
      </div>
      ${renderAccessCredentialPanel()}
    </section>
  `;
}

function renderContent() {
  const contentView = document.querySelector('#contentView');
  const renderers = {
    module: renderModuleDetailView,
    overview: renderOverview,
    quality: renderQuality,
    progress: renderProgress,
    archive: renderArchive,
    map: renderMapStorage,
    interfaces: renderInterfaces,
  };
  contentView.innerHTML = renderers[state.activeTab]();
  bindProjectDashboard();
  bindModuleSubitems();
  bindPermissionActors();
  bindProjectImportControls();
  if (state.activeTab === 'interfaces') {
    bindUploadControls();
  }
}

function bindModuleSubitems() {
  document.querySelectorAll('[data-subitem-index]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeSubitemIndex = Number(button.dataset.subitemIndex);
      renderSecondaryNav();
      renderContent();
    });
  });
}

function bindPermissionActors() {
  document.querySelectorAll('[data-actor]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activePermissionActor = button.dataset.actor;
      renderContent();
    });
  });
}

function bindProjectDashboard() {
  document.querySelector('#projectCreateForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = document.querySelector('#projectNameInput');
    const name = input.value.trim();
    if (!name) return;

    createOrSwitchProjectByName(name);
    state.accessProfile = createAccessProfile(name);
    state.activeModuleId = 'dashboard';
    state.activeTab = 'module';
    state.activeSubitemIndex = 0;
    saveAccessProfile();
    saveProjects();
    renderAll();
  });

  document.querySelectorAll('[data-project-id]').forEach((button) => {
    button.addEventListener('click', () => switchProject(button.dataset.projectId));
  });
}

function bindProjectImportControls() {
  const button = document.querySelector('#projectImportButton');
  const input = document.querySelector('#projectImportInput');
  if (!button || !input || button.dataset.bound === 'true') return;

  button.dataset.bound = 'true';
  button.addEventListener('click', () => input.click());
  input.addEventListener('change', async () => {
    const files = Array.from(input.files ?? []);
    for (const file of files) {
      await saveUploadedFile('source-doc-db', file);
      const analysis = await analyzeProjectFile(file);
      applyAnalysisToCurrentProject(analysis);
      state.importAnalyses.unshift(analysis);
    }
    input.value = '';
    saveImportAnalyses();
    saveProjects();
    renderAll();
  });
}

function boot() {
  if (!state.accessProfile) {
    renderAccessGate();
    return;
  }
  syncProjectFromAccessProfile();
  renderAll();
}

function syncProjectFromAccessProfile() {
  if (!state.accessProfile?.projectName) return;
  createOrSwitchProjectByName(state.accessProfile.projectName);
  saveProjects();
}

function renderAccessGate(errorMessage = '') {
  const accessGate = document.querySelector('#accessGate');
  document.querySelector('.admin-shell').hidden = true;
  document.body.classList.add('access-mode');
  const managerCode = generateManagerCode();
  const managerPassword = generateMixedCode(6);
  accessGate.innerHTML = `
    <div class="access-card">
      <div class="access-intro">
        <span class="eyebrow">工程项目管理平台</span>
        <h1>新建项目管理者入口</h1>
        <p>先建立项目名称、管理者代码和管理者密码。进入平台后，系统会按同一项目代码自动生成10类参建单位的项目代码和初始密码。</p>
      </div>
      <form id="accessCreateForm" class="access-form">
        <label>
          <span>项目名称</span>
          <input id="accessProjectName" type="text" placeholder="请输入项目名称" required />
        </label>
        <label>
          <span>项目管理者代码</span>
          <input id="accessManagerCode" type="text" value="${managerCode}" minlength="8" required />
          <small>至少8位，必须包含大写字母、小写字母和数字。</small>
        </label>
        <label>
          <span>管理者密码</span>
          <input id="accessManagerPassword" type="text" value="${managerPassword}" minlength="6" maxlength="6" required />
          <small>6位，必须由字母和数字混合组成。</small>
        </label>
        ${errorMessage ? `<strong class="access-error">${errorMessage}</strong>` : ''}
        <button class="upload-button" type="submit">新建项目并生成参建单位账号</button>
      </form>
    </div>
  `;
  bindAccessGate();
}

function bindAccessGate() {
  document.querySelector('#accessCreateForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const projectName = document.querySelector('#accessProjectName').value.trim();
    const managerCode = document.querySelector('#accessManagerCode').value.trim();
    const managerPassword = document.querySelector('#accessManagerPassword').value.trim();
    if (!projectName) {
      renderAccessGate('请先输入项目名称。');
      return;
    }
    if (!validateManagerCode(managerCode)) {
      renderAccessGate('项目管理者代码至少8位，并且必须包含大写字母、小写字母和数字。');
      return;
    }
    if (!validatePassword(managerPassword)) {
      renderAccessGate('管理者密码必须为6位，并且由字母和数字混合组成。');
      return;
    }

    createOrSwitchProjectByName(projectName);
    state.accessProfile = createAccessProfile(projectName, managerCode, managerPassword);
    state.activeModuleId = 'dashboard';
    state.activeTab = 'module';
    state.activeSubitemIndex = 0;
    saveAccessProfile();
    saveProjects();
    renderAll();
  });
}

function renderAll() {
  document.querySelector('#accessGate').innerHTML = '';
  document.querySelector('.admin-shell').hidden = false;
  document.body.classList.remove('access-mode');
  renderHeader();
  renderModules();
  renderStats();
  renderSecondaryNav();
  renderTabs();
  renderContent();
}

boot();

function renderHeader() {
  const project = currentProject();
  const currentNode = state.selectedNode ?? flattenProjectTree(project.tree)[0];
  document.querySelector('#currentProjectName').textContent = project.name;
  document.querySelector('#currentUnitWork').textContent = findNodeAncestor(currentNode, '单位工程');
  document.querySelector('#currentDivisionWork').textContent = findNodeAncestor(currentNode, '分部工程');
  document.querySelector('#projectSwitch').innerHTML = state.projects
    .map((item) => `<option value="${item.id}" ${item.id === state.activeProjectId ? 'selected' : ''}>${item.name}</option>`)
    .join('');
  document.querySelector('#projectSwitch').onchange = (event) => switchProject(event.target.value);
  document.querySelector('#bidSectionSwitch').innerHTML = getBidSections()
    .map((item) => `<option value="${item.id}">${item.name}</option>`)
    .join('');
}

function openUploadDb() {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(UPLOAD_DB_NAME, 1);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(UPLOAD_STORE)) {
        const store = database.createObjectStore(UPLOAD_STORE, { keyPath: 'id' });
        store.createIndex('connectionId', 'connectionId');
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveUploadedFile(connectionId, file) {
  const database = await openUploadDb();
  const record = {
    id: `${connectionId}-${Date.now()}-${crypto.randomUUID()}`,
    connectionId: getProjectScopedId(connectionId),
    name: file.name,
    size: file.size,
    type: file.type || '未知类型',
    uploadedAt: new Date().toLocaleString('zh-CN'),
    file,
  };

  await new Promise((resolve, reject) => {
    const transaction = database.transaction(UPLOAD_STORE, 'readwrite');
    transaction.objectStore(UPLOAD_STORE).put(record);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });

  database.close();
}

async function getUploadedFiles(connectionId) {
  const database = await openUploadDb();
  const files = await new Promise((resolve, reject) => {
    const transaction = database.transaction(UPLOAD_STORE, 'readonly');
    const index = transaction.objectStore(UPLOAD_STORE).index('connectionId');
    const request = index.getAll(getProjectScopedId(connectionId));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  database.close();
  return files.sort((a, b) => String(b.uploadedAt).localeCompare(String(a.uploadedAt)));
}

function bindUploadControls() {
  document.querySelectorAll('[data-upload-target]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelector(`.upload-input[data-connection-id="${button.dataset.uploadTarget}"]`)?.click();
    });
  });

  document.querySelectorAll('.upload-input').forEach((input) => {
    input.addEventListener('change', async () => {
      const connectionId = input.dataset.connectionId;
      const files = Array.from(input.files ?? []);
      for (const file of files) {
        await saveUploadedFile(connectionId, file);
        if (connectionId === 'source-doc-db') {
          const analysis = await analyzeProjectFile(file);
          applyAnalysisToCurrentProject(analysis);
          state.importAnalyses.unshift(analysis);
        }
      }
      input.value = '';
      saveImportAnalyses();
      saveProjects();
      await renderUploadedList(connectionId);
      renderAll();
    });
    renderUploadedList(input.dataset.connectionId);
  });
}

async function renderUploadedList(connectionId) {
  const host = document.querySelector(`[data-upload-list="${connectionId}"]`);
  if (!host) return;

  const files = await getUploadedFiles(connectionId);
  if (files.length === 0) {
    host.innerHTML = '<span>暂无上传资料</span>';
    return;
  }

  host.innerHTML = files
    .slice(0, 4)
    .map(
      (file) => `
        <div class="uploaded-file">
          <strong>${file.name}</strong>
          <span>${formatFileSize(file.size)} · ${file.uploadedAt}</span>
        </div>
      `,
    )
    .join('');
}

function formatFileSize(size) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

async function analyzeProjectFile(file) {
  const extension = getFileExtension(file.name);
  const text = await extractTextFromFile(file, extension);
  const suggestions = inferProjectSuggestions(file.name, text, extension);
  const status = text || ['png', 'jpg', 'jpeg', 'dwg', 'shp', 'doc', 'xls', 'ppt'].includes(extension) ? '已解析' : '待人工确认';
  return {
    id: `${Date.now()}-${crypto.randomUUID()}`,
    projectId: state.activeProjectId,
    name: file.name,
    type: extension.toUpperCase() || file.type || '未知格式',
    size: file.size,
    uploadedAt: new Date().toLocaleString('zh-CN'),
    status,
    summary: buildFileSummary(file.name, extension, text, suggestions),
    suggestions,
    textSample: text.slice(0, 1200),
  };
}

async function extractTextFromFile(file, extension) {
  if (['csv', 'geojson', 'json', 'kml'].includes(extension)) {
    return await readAsText(file);
  }

  if (['docx', 'xlsx', 'pptx', 'zip'].includes(extension)) {
    return await extractTextFromZipLike(await file.arrayBuffer(), extension);
  }

  if (['png', 'jpg', 'jpeg'].includes(extension)) {
    return `图片资料：${file.name}。浏览器端已记录文件名、格式和大小，后续可接入OCR识别图纸标题、照片点位和现场取证信息。`;
  }

  if (extension === 'dwg') {
    return `DWG图纸：${file.name}。浏览器端已入库，需后续接入CAD解析服务或转换为PDF/DXF后提取图层、桩号和构筑物名称。`;
  }

  if (extension === 'shp') {
    return `SHP空间数据：${file.name}。SHP通常需要shp/shx/dbf/prj配套文件，建议打包为ZIP上传后进行完整解析。`;
  }

  if (['doc', 'xls', 'ppt'].includes(extension)) {
    return `旧版Office文件：${file.name}。浏览器端已入库，建议另存为DOCX/XLSX/PPTX后可提取正文、表格和目录。`;
  }

  if (extension === 'pdf') {
    return `PDF资料：${file.name}。浏览器端已入库，后续可接入PDF文字识别服务；当前根据文件名和资料类型生成挂接建议。`;
  }

  return '';
}

async function extractTextFromZipLike(arrayBuffer, extension) {
  const bytes = new Uint8Array(arrayBuffer);
  const parts = [];
  let cursor = 0;
  while (cursor < bytes.length - 30 && parts.join('\n').length < 8000) {
    if (bytes[cursor] === 0x50 && bytes[cursor + 1] === 0x4b && bytes[cursor + 2] === 0x03 && bytes[cursor + 3] === 0x04) {
      const compression = readUint16(bytes, cursor + 8);
      const compressedSize = readUint32(bytes, cursor + 18);
      const fileNameLength = readUint16(bytes, cursor + 26);
      const extraLength = readUint16(bytes, cursor + 28);
      const nameStart = cursor + 30;
      const name = decodeBytes(bytes.slice(nameStart, nameStart + fileNameLength));
      const dataStart = nameStart + fileNameLength + extraLength;
      const dataEnd = dataStart + compressedSize;
      if (isTextEntry(name)) {
        if (compression === 0) {
          parts.push(decodeBytes(bytes.slice(dataStart, dataEnd)));
        } else if (compression === 8) {
          parts.push(await inflateRawText(bytes.slice(dataStart, dataEnd)));
        }
      } else if (name) {
        parts.push(name);
      }
      cursor = Math.max(dataEnd, cursor + 30);
    } else {
      cursor += 1;
    }
  }

  const raw = parts.join('\n');
  if (extension === 'docx') return cleanOfficeXmlText(raw);
  if (extension === 'xlsx') return cleanOfficeXmlText(raw);
  if (extension === 'pptx') return cleanOfficeXmlText(raw);
  return cleanOfficeXmlText(raw);
}

async function inflateRawText(bytes) {
  if (!('DecompressionStream' in window)) return '';
  try {
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return await new Response(stream).text();
  } catch {
    return '';
  }
}

function inferProjectSuggestions(fileName, text, extension) {
  const source = `${fileName}\n${text}`.toLowerCase();
  const suggestions = {
    unitWorks: [],
    divisionWorks: [],
    cellWorks: [],
    controls: [],
  };

  const rules = [
    { keys: ['大坝', '坝顶', '护坡', '防浪墙'], unit: '大坝除险加固工程', division: '大坝工程', cell: '坝顶、护坡及防渗处理', control: '大坝隐蔽验收与护坡质量控制' },
    { keys: ['溢洪道', '泄槽', '消能', '驼峰堰', '引渠'], unit: '溢洪道加固工程', division: '溢洪道工程', cell: '开挖、衬砌、消能防护', control: '基础面、边坡、衬砌和排水孔隐蔽验收' },
    { keys: ['交通桥', '空心板', '支座'], unit: '溢洪道交通桥工程', division: '交通桥工程', cell: '桥梁拆除重建及支座安装', control: '桥面宽度、净跨、支座和钢筋隐蔽验收' },
    { keys: ['电气', '控制柜', '照明', '接地', '电阻', '电导率'], unit: '电气与安全监测工程', division: '电气设备工程', cell: '控制柜、照明及接地检测', control: '接地电阻、接地电导率和送电前验收' },
    { keys: ['灌浆', '固结', '裂缝', '压水'], unit: '大坝除险加固工程', division: '斜廊道灌浆工程', cell: '固结灌浆和裂缝化学灌浆', control: '灌浆压力、抬动变形、压水试验和封孔质量' },
    { keys: ['坐标', 'geojson', 'kml', 'shp', '高程', '点位'], unit: '测量与上图入库资料', division: '工程点位坐标', cell: '地块矢量坐标与工程点位', control: '上图入库字段、坐标系和高程复核' },
    { keys: ['清单', '单价', '工程量', '计量', '支付'], unit: '进度与投资报表', division: '工程量清单', cell: '投标清单单价与完成工程量', control: '完成工程量乘以投标单价自动计算' },
    { keys: ['验收', '备案', '会议纪要', '批复', '开工申请'], unit: '档案资料管理', division: '审批验收资料', cell: '开工、隐蔽验收、备案和会议纪要', control: '责任单位、审批状态和归档状态' },
  ];

  for (const rule of rules) {
    if (rule.keys.some((key) => source.includes(key))) {
      suggestions.unitWorks.push(rule.unit);
      suggestions.divisionWorks.push(rule.division);
      suggestions.cellWorks.push(rule.cell);
      suggestions.controls.push(rule.control);
    }
  }

  if (['png', 'jpg', 'jpeg', 'dwg'].includes(extension)) {
    suggestions.unitWorks.push('图纸与现场取证');
    suggestions.divisionWorks.push('图纸版本与现场照片');
    suggestions.cellWorks.push('图纸点位、照片锚定和取证资料');
    suggestions.controls.push('需进行图纸编号、版本和点位人工确认');
  }

  return suggestions;
}

function applyAnalysisToCurrentProject(analysis) {
  const project = currentProject();
  const root = project.tree;
  const bid = root.children?.find((node) => node.type === '标段') ?? root.children?.[0];
  if (!bid) return;

  analysis.suggestions.unitWorks.forEach((unitName, unitIndex) => {
    if (['档案资料管理', '进度与投资报表', '图纸与现场取证'].includes(unitName)) return;
    const unit = ensureChildNode(bid, unitName, '单位工程');
    const divisionName = analysis.suggestions.divisionWorks[unitIndex] ?? analysis.suggestions.divisionWorks[0] ?? '待确认分部工程';
    const cellName = analysis.suggestions.cellWorks[unitIndex] ?? analysis.suggestions.cellWorks[0] ?? '待确认单元工程';
    const division = ensureChildNode(unit, divisionName, '分部工程');
    ensureChildNode(division, cellName, '单元工程');
  });
}

function ensureChildNode(parent, name, type) {
  parent.children ??= [];
  let child = parent.children.find((node) => node.name === name && node.type === type);
  if (!child) {
    child = {
      id: `${slugify(type)}-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
      name,
      type,
      status: '资料导入',
      children: [],
    };
    parent.children.push(child);
  }
  return child;
}

function buildFileSummary(fileName, extension, text, suggestions) {
  const readable = text.trim().slice(0, 120);
  const unitCount = new Set(suggestions.unitWorks).size;
  const cellCount = new Set(suggestions.cellWorks).size;
  if (readable) {
    return `已读取 ${fileName} 的可识别内容，建议补充 ${unitCount} 类单位工程、${cellCount} 类单元工程。摘要：${readable}`;
  }
  return `${fileName} 已入库。${extension.toUpperCase()} 格式当前需要转换或人工确认，系统已先根据文件名生成项目挂接建议。`;
}

function getFileExtension(name) {
  return name.includes('.') ? name.split('.').pop().toLowerCase() : '';
}

function readAsText(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => resolve('');
    reader.readAsText(file, 'utf-8');
  });
}

function readUint16(bytes, offset) {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

function readUint32(bytes, offset) {
  return (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)) >>> 0;
}

function decodeBytes(bytes) {
  try {
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return '';
  }
}

function isTextEntry(name) {
  return /\.(xml|txt|csv|json|geojson|kml)$/i.test(name) || name.includes('document.xml') || name.includes('sharedStrings.xml') || name.includes('slide');
}

function cleanOfficeXmlText(raw) {
  return raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(value) {
  return encodeURIComponent(value).replaceAll('%', '').toLowerCase().slice(0, 18);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
