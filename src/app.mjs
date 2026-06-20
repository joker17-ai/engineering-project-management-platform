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
  createProjectTree,
} from './data.mjs';

const tabs = [
  { id: 'overview', label: '总览' },
  { id: 'quality', label: '质量控制' },
  { id: 'progress', label: '进度投资' },
  { id: 'archive', label: '档案资料' },
  { id: 'map', label: '上图入库' },
  { id: 'interfaces', label: '接口资料库' },
];

const UPLOAD_DB_NAME = 'engineering_project_uploads_v1';
const UPLOAD_STORE = 'files';
const PROJECTS_STORAGE_KEY = 'engineering_project_portfolio_v1';

const state = {
  projects: loadProjects(),
  activeProjectId: null,
  selectedNode: null,
  activeTab: 'overview',
  activeModuleId: 'dashboard',
  activeSubitemIndex: 0,
  activePermissionActor: '项目法人',
  treeVisible: false,
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
      state.treeVisible = state.activeModuleId === 'tree';
      renderModules();
      renderTabs();
      renderShellLayout();
      renderProjectTree();
      renderContent();
      renderSidePanel();
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

function currentProject() {
  return state.projects.find((project) => project.id === state.activeProjectId) ?? state.projects[0];
}

function switchProject(projectId) {
  state.activeProjectId = projectId;
  state.selectedNode = flattenProjectTree(currentProject().tree)[0];
  renderAll();
}

function renderShellLayout() {
  document.querySelector('.admin-shell').classList.toggle('tree-open', state.treeVisible);
}

function getProjectScopedId(connectionId) {
  return `${state.activeProjectId}:${connectionId}`;
}

function renderStats() {
  const statsGrid = document.querySelector('#statsGrid');
  const currentTreeNodes = flattenProjectTree(currentProject().tree);
  const stats = [
    { label: '项目节点容量', value: currentTreeNodes.length, suffix: '已建节点 / 30000 预留' },
    { label: '一级栏目', value: moduleCatalog.length, suffix: '个动态栏目' },
    { label: '质量范围', value: Object.keys(qualityScopes).length, suffix: '类单位工程' },
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

function renderProjectTree() {
  const nodes = flattenProjectTree(currentProject().tree);
  const tree = document.querySelector('#projectTree');
  tree.innerHTML = nodes
    .map(
      (node) => `
        <button class="tree-node tree-depth-${Math.min(node.depth, 3)} ${node.id === state.selectedNode.id ? 'active' : ''}" data-node-id="${node.id}" type="button">
          <span class="tree-node-title">
            <span>${node.name}</span>
          </span>
          <span class="node-meta">
            <span>${node.type}</span>
            <span>${node.status}</span>
          </span>
        </button>
      `,
    )
    .join('');

  tree.querySelectorAll('[data-node-id]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedNode = nodes.find((node) => node.id === button.dataset.nodeId);
      renderProjectTree();
      renderSidePanel();
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
      renderSidePanel();
    });
  });
}

function renderOverview() {
  return `
    <section class="project-command">
      <div>
        <span class="eyebrow">项目组合管理</span>
        <h2>一个平台同时管理多个工程项目</h2>
        <p>项目名称由你在这里手动创建。每一个项目都会形成自己独立的一套项目结构树、资料库、质量安全进度投资和档案管理数据。</p>
      </div>
      <form id="projectCreateForm" class="project-create-form">
        <input id="projectNameInput" type="text" placeholder="请输入项目名称，如：内蒙古*****高标准农田项目管理" />
        <button class="upload-button" type="submit">创建项目</button>
      </form>
    </section>
    <div class="project-card-grid">
      ${state.projects
        .map(
          (project) => `
            <button class="project-card ${project.id === state.activeProjectId ? 'active' : ''}" data-project-id="${project.id}" type="button">
              <span>${project.region}</span>
              <strong>${project.name}</strong>
              <small>${project.stage} · ${flattenProjectTree(project.tree).length} 个结构节点</small>
            </button>
          `,
        )
        .join('')}
    </div>
    <div class="view-grid">
      <article class="card">
        <h3>当前项目管理范围</h3>
        <ul>
          <li>优先做高标准农田项目场景</li>
          <li>先做电脑端管理后台</li>
          <li>上图入库只做字段和资料准备</li>
        </ul>
      </article>
      <article class="card">
        <h3>三类高频单位工程</h3>
        <ul>
          <li>灌溉与排水工程</li>
          <li>田间道路工程</li>
          <li>田块整治工程</li>
        </ul>
      </article>
      <article class="card">
        <h3>工程本体关系</h3>
        <ul>
          <li>项目树承载节点扩展</li>
          <li>质量、安全、进度、投资挂接到节点</li>
          <li>档案和取证资料形成闭环</li>
        </ul>
      </article>
    </div>
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

function renderProgress() {
  const total = calculateInvestmentTotal(progressItems);
  return `
    <table class="table">
      <thead>
        <tr>
          <th>单位工程</th>
          <th>清单项目</th>
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
                <td>${item.unitWork}</td>
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
              <input class="visually-hidden upload-input" data-connection-id="${connection.id}" type="file" multiple />
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
  const subitem = module.subitems[state.activeSubitemIndex] ?? module.subitems[0];
  if (module.id === 'participants') {
    return renderPermissionManager(module);
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
        <p>该二级目录由右侧竖向目录选择。后续可继续挂接资料、责任单位、审批状态、虚拟数据库记录，并扩展三级子项。</p>
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
  const actors = module.subitems;
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
                    <span>${scope.subitems.length} 个二级目录</span>
                  </div>
                  ${scope.subitems
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
  if (state.activeTab === 'interfaces') {
    bindUploadControls();
  }
}

function bindModuleSubitems() {
  document.querySelectorAll('[data-subitem-index]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeSubitemIndex = Number(button.dataset.subitemIndex);
      renderContent();
      renderSidePanel();
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

function renderNodeDetail() {
  const detail = document.querySelector('#nodeDetail');
  const selectedBadge = document.querySelector('#selectedBadge');
  selectedBadge.textContent = state.selectedNode.type;
  detail.innerHTML = `
    <h2>${state.selectedNode.name}</h2>
    <div class="detail-kv"><span>节点类型</span><strong>${state.selectedNode.type}</strong></div>
    <div class="detail-kv"><span>当前状态</span><strong>${state.selectedNode.status}</strong></div>
    <div class="detail-kv"><span>层级深度</span><strong>${state.selectedNode.depth}</strong></div>
    <div class="detail-kv"><span>可挂要素</span><strong>质量 / 安全 / 进度 / 投资 / 档案</strong></div>
    <div class="detail-kv"><span>管理原则</span><strong>节点可继续扩展，资料必须归属到节点</strong></div>
  `;
}

function renderModuleSideNav() {
  const module = moduleCatalog.find((item) => item.id === state.activeModuleId) ?? moduleCatalog[0];
  const selectedBadge = document.querySelector('#selectedBadge');
  const detail = document.querySelector('#nodeDetail');
  selectedBadge.textContent = '二级目录';
  detail.innerHTML = `
    <h2>${module.name}</h2>
    <div class="module-subnav">
      ${module.subitems
        .map(
          (item, index) => `
            <button class="tree-node ${index === state.activeSubitemIndex ? 'active' : ''}" data-subitem-index="${index}" type="button">
              <span class="tree-node-title">${String(index + 1).padStart(2, '0')} ${item}</span>
              <span class="node-meta">
                <span>二级目录</span>
                <span>可扩展三级</span>
              </span>
            </button>
          `,
        )
        .join('')}
    </div>
  `;
  bindModuleSubitems();
}

function renderSidePanel() {
  if (state.activeModuleId === 'tree' && state.treeVisible) {
    renderNodeDetail();
    return;
  }
  renderModuleSideNav();
}

function boot() {
  renderAll();
}

function renderAll() {
  renderShellLayout();
  renderHeader();
  renderModules();
  renderStats();
  renderProjectTree();
  renderTabs();
  renderContent();
  renderSidePanel();
}

boot();

function renderHeader() {
  const project = currentProject();
  document.querySelector('#currentProjectName').textContent = project.name;
  document.querySelector('#currentProjectMeta').textContent = `多项目统一管理平台 · 当前项目：${project.name}`;
  document.querySelector('#projectSwitch').innerHTML = state.projects
    .map((item) => `<option value="${item.id}" ${item.id === state.activeProjectId ? 'selected' : ''}>${item.name}</option>`)
    .join('');
  document.querySelector('#projectSwitch').onchange = (event) => switchProject(event.target.value);
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
      }
      input.value = '';
      await renderUploadedList(connectionId);
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
