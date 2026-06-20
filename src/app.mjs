import {
  archiveChecklist,
  calculateInvestmentTotal,
  calculateProgressPercent,
  dashboardStats,
  flattenProjectTree,
  mapStoragePlan,
  mockDatabaseConnections,
  moduleCatalog,
  progressItems,
  projectTree,
  qualityScopes,
} from './data.mjs';

const tabs = [
  { id: 'overview', label: '总览' },
  { id: 'quality', label: '质量控制' },
  { id: 'progress', label: '进度投资' },
  { id: 'archive', label: '档案资料' },
  { id: 'map', label: '上图入库' },
  { id: 'interfaces', label: '接口资料库' },
];

const state = {
  selectedNode: flattenProjectTree(projectTree)[0],
  activeTab: 'overview',
  activeModuleId: 'dashboard',
};

const UPLOAD_DB_NAME = 'engineering_project_uploads_v1';
const UPLOAD_STORE = 'files';

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
      renderModules();
      renderTabs();
      renderContent();
      renderModuleDetail();
    });
  });
}

function renderStats() {
  const statsGrid = document.querySelector('#statsGrid');
  statsGrid.innerHTML = dashboardStats
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
  const nodes = flattenProjectTree(projectTree);
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
      renderNodeDetail();
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
      renderNodeDetail();
    });
  });
}

function renderOverview() {
  return `
    <div class="view-grid">
      <article class="card">
        <h3>第一版原型范围</h3>
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
  return `
    <section class="module-detail-view">
      <div class="module-hero">
        <span>栏目跳转</span>
        <h2>${module.name}</h2>
        <p>${module.purpose}</p>
      </div>
      <div class="subitem-grid">
        ${module.subitems
          .map(
            (item, index) => `
              <button class="subitem-card" type="button">
                <span>${String(index + 1).padStart(2, '0')}</span>
                <strong>${item}</strong>
                <small>点击后可继续挂接资料、责任单位、审批状态和虚拟数据库记录</small>
              </button>
            `,
          )
          .join('')}
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
  if (state.activeTab === 'interfaces') {
    bindUploadControls();
  }
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

function renderModuleDetail() {
  const module = moduleCatalog.find((item) => item.id === state.activeModuleId) ?? moduleCatalog[0];
  const selectedBadge = document.querySelector('#selectedBadge');
  const detail = document.querySelector('#nodeDetail');
  selectedBadge.textContent = '栏目';
  detail.innerHTML = `
    <h2>${module.name}</h2>
    <div class="detail-kv"><span>栏目编号</span><strong>${module.id}</strong></div>
    <div class="detail-kv"><span>子项数量</span><strong>${module.subitems.length}</strong></div>
    <div class="detail-kv"><span>数据来源</span><strong>工程本体平台项目数据</strong></div>
    <div class="detail-kv"><span>管理方式</span><strong>点击栏目跳转，子项继续挂接数据库记录</strong></div>
  `;
}

function boot() {
  renderModules();
  renderStats();
  renderProjectTree();
  renderTabs();
  renderContent();
  renderNodeDetail();
}

boot();

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
    connectionId,
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
    const request = index.getAll(connectionId);
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
