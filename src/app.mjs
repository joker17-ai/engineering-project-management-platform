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
  createProjectTree,
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

function currentProject() {
  return state.projects.find((project) => project.id === state.activeProjectId) ?? state.projects[0];
}

function switchProject(projectId) {
  state.activeProjectId = projectId;
  state.selectedNode = flattenProjectTree(currentProject().tree)[0];
  renderAll();
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
  const planned = progressItems.reduce((total, item) => total + item.plannedQuantity, 0);
  const completed = progressItems.reduce((total, item) => total + item.completedQuantity, 0);
  return planned === 0 ? 0 : Math.round((completed / planned) * 100);
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

function renderOverview() {
  const rows = getCellWorkRows();
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
  return `
    <div class="view-grid">
      ${Object.entries(qualityScopes)
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
        ${scheduleItems
          .map(
            (item) => `
              <tr>
                <td>${item.code}</td>
                <td>${item.task}</td>
                <td>${item.start} 至 ${item.end}</td>
                <td>${item.predecessor}</td>
                <td>${item.floatDays} 天</td>
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
        ${hiddenAcceptanceItems
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
        ${sourceDocuments
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
  const total = calculateInvestmentTotal(progressItems);
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
        ${progressItems
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
        ${archiveChecklist
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

      const project = {
        id: `project-${Date.now()}`,
        name,
        region: '手动创建',
        stage: '新建项目',
      tree: createProjectTree(name),
    };
    state.projects.push(project);
    state.activeProjectId = project.id;
    state.selectedNode = flattenProjectTree(project.tree)[0];
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
  renderAll();
}

function renderAll() {
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

  for (const unitName of analysis.suggestions.unitWorks) {
    if (['档案资料管理', '进度与投资报表', '图纸与现场取证'].includes(unitName)) continue;
    const unit = ensureChildNode(bid, unitName, '单位工程');
    const divisions = analysis.suggestions.divisionWorks.length > 0 ? analysis.suggestions.divisionWorks : ['待确认分部工程'];
    const cells = analysis.suggestions.cellWorks.length > 0 ? analysis.suggestions.cellWorks : ['待确认单元工程'];
    for (const divisionName of divisions) {
      const division = ensureChildNode(unit, divisionName, '分部工程');
      for (const cellName of cells) {
        ensureChildNode(division, cellName, '单元工程');
      }
    }
  }
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
