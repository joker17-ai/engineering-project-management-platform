import {
  archiveItems,
  calculateInvestment,
  flattenTree,
  getProjectStats,
  githubRepository,
  modules,
  progressItems,
  projects,
  publicNotices,
  qualityItems,
} from './data.mjs';

const state = {
  activeModule: 'overview',
  activeProjectId: 'line-site-2',
  selectedNodeId: 'root',
};

const formatMoney = (value) =>
  new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    maximumFractionDigits: 0,
  }).format(value);

function currentProject() {
  return projects.find((project) => project.id === state.activeProjectId) ?? projects[0];
}

function selectedNode() {
  return flattenTree(currentProject().tree).find((node) => node.id === state.selectedNodeId) ?? flattenTree(currentProject().tree)[0];
}

function renderModules() {
  document.querySelector('#moduleNav').innerHTML = modules
    .map(
      (module) => `
        <button class="module-button ${module.id === state.activeModule ? 'active' : ''}" data-module="${module.id}" type="button">
          ${module.name}
        </button>
      `,
    )
    .join('');

  document.querySelectorAll('[data-module]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeModule = button.dataset.module;
      renderAll();
    });
  });
}

function renderProjectPanel() {
  const project = currentProject();
  document.querySelector('#activeProjectName').textContent = project.name;
  document.querySelector('#projectSelect').innerHTML = projects
    .map((item) => `<option value="${item.id}" ${item.id === project.id ? 'selected' : ''}>${item.name}</option>`)
    .join('');
  document.querySelector('#projectSelect').onchange = (event) => {
    state.activeProjectId = event.target.value;
    state.selectedNodeId = currentProject().tree.id;
    renderAll();
  };

  const sections = flattenTree(project.tree).filter((node) => node.type === '标段');
  document.querySelector('#sectionSelect').innerHTML = sections.map((section) => `<option>${section.name}</option>`).join('');

  document.querySelector('#projectTree').innerHTML = flattenTree(project.tree)
    .map(
      (node) => `
        <button class="tree-node depth-${Math.min(node.depth, 3)} ${node.id === state.selectedNodeId ? 'active' : ''}" data-node="${node.id}" type="button">
          <strong>${node.name}</strong>
          <small>${node.type} / ${node.status}</small>
        </button>
      `,
    )
    .join('');

  document.querySelectorAll('[data-node]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedNodeId = button.dataset.node;
      state.activeModule = 'structure';
      renderAll();
    });
  });
}

function renderStats() {
  const stats = getProjectStats(currentProject());
  const items = [
    ['结构节点', stats.nodeCount, '项目、标段、单位工程与分部工程'],
    ['单位工程', stats.unitCount, '当前平台重点管理对象'],
    ['综合进度', `${stats.activeProgress}%`, '按任务完成率自动汇总'],
    ['GitHub 目录', stats.githubFolders, '建议入库数据目录'],
  ];

  document.querySelector('#statsGrid').innerHTML = items
    .map(
      ([label, value, note]) => `
        <article class="metric">
          <span>${label}</span>
          <strong>${value}</strong>
          <span>${note}</span>
        </article>
      `,
    )
    .join('');
}

function renderTabs() {
  document.querySelector('#tabStrip').innerHTML = modules
    .map(
      (module) => `
        <button class="tab-button ${module.id === state.activeModule ? 'active' : ''}" data-tab="${module.id}" type="button">
          ${module.name}
        </button>
      `,
    )
    .join('');

  document.querySelectorAll('[data-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeModule = button.dataset.tab;
      renderAll();
    });
  });
}

function renderContent() {
  const view = document.querySelector('#contentView');
  const project = currentProject();
  const renderers = {
    overview: () => renderOverview(project),
    structure: () => renderStructure(project),
    github: renderGithub,
    progress: renderProgress,
    quality: renderQuality,
    archive: renderArchive,
    public: renderPublic,
  };
  view.innerHTML = (renderers[state.activeModule] ?? renderers.overview)();
}

function renderOverview(project) {
  return `
    <section class="data-hub">
      <div>
        <h2>${project.publicName}</h2>
        <p>${project.name} 已被设置为蓝箭平台的首个公众项目样板。平台把工程结构、资料目录、进度投资、质量安全和公开公告统一挂接到 GitHub 仓库。</p>
      </div>
      <a href="${githubRepository.url}" target="_blank" rel="noreferrer">查看 GitHub 数据仓库</a>
    </section>
    <div class="grid-3">
      <article class="card">
        <h3>项目定位</h3>
        <p>${project.region} / ${project.section} / ${project.stage}</p>
        <div class="badge-row"><span class="badge">公众项目</span><span class="badge">工程线位点二</span><span class="badge">GitHub 托管</span></div>
      </article>
      <article class="card">
        <h3>数据方式</h3>
        <p>正式数据建议以 JSON、CSV、PDF 和图片资料提交到仓库目录，平台读取同一套目录规范形成公开台账。</p>
        <div class="badge-row"><span class="badge">可追溯</span><span class="badge">可审阅</span><span class="badge">可回滚</span></div>
      </article>
      <article class="card">
        <h3>当前投资完成</h3>
        <p>${formatMoney(calculateInvestment())}</p>
        <div class="badge-row"><span class="badge">按完成率估算</span><span class="badge">演示数据</span></div>
      </article>
    </div>
  `;
}

function renderStructure(project) {
  const node = selectedNode();
  const children = node.children ?? [];
  return `
    <section class="detail-panel">
      <span class="eyebrow">当前选中节点</span>
      <h2>${node.name}</h2>
      <div class="kv-grid">
        <div class="kv"><span>类型</span><strong>${node.type}</strong></div>
        <div class="kv"><span>状态</span><strong>${node.status}</strong></div>
        <div class="kv"><span>子节点</span><strong>${children.length}</strong></div>
        <div class="kv"><span>数据路径</span><strong>${project.repositoryPath}</strong></div>
      </div>
    </section>
    <div class="grid-3">
      ${
        children.length
          ? children
              .map(
                (child) => `
          <article class="card">
            <h3>${child.name}</h3>
            <p>${child.type}，当前状态：${child.status}</p>
            <div class="badge-row"><span class="badge">${child.children?.length ?? 0} 个下级节点</span></div>
          </article>
        `,
              )
              .join('')
          : '<div class="empty">这个节点暂时没有下级工程对象。</div>'
      }
    </div>
  `;
}

function renderGithub() {
  return `
    <section class="data-hub">
      <div>
        <h2>${githubRepository.owner}/${githubRepository.name}</h2>
        <p>仓库地址：${githubRepository.cloneUrl}。建议把平台数据拆成项目、资料、进度和公告四类目录，后续可以直接接 GitHub Pages 或接口读取。</p>
      </div>
      <a href="${githubRepository.url}" target="_blank" rel="noreferrer">打开仓库</a>
    </section>
    <div class="grid-4">
      ${githubRepository.dataFolders
        .map(
          (folder) => `
            <article class="card">
              <h3>${folder}</h3>
              <p>建议目录已纳入蓝箭平台数据规范，可在仓库中创建对应 JSON、CSV 或文档文件。</p>
              <span class="status ok">建议建立</span>
            </article>
          `,
        )
        .join('')}
    </div>
  `;
}

function renderProgress() {
  return `
    <table class="table">
      <thead><tr><th>编号</th><th>任务</th><th>责任方</th><th>进度</th><th>完成投资</th><th>状态</th></tr></thead>
      <tbody>
        ${progressItems
          .map(
            (item) => `
              <tr>
                <td>${item.id}</td>
                <td>${item.task}</td>
                <td>${item.owner}</td>
                <td><div class="progress"><span style="width:${item.done}%"></span></div>${item.done}%</td>
                <td>${formatMoney(item.amount * (item.done / 100))}</td>
                <td><span class="status ${item.status}">${statusText(item.status)}</span></td>
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
    <div class="grid-2">
      ${qualityItems
        .map(
          (item) => `
            <article class="card">
              <h3>${item.scope}</h3>
              <p>${item.control}</p>
              <div class="badge-row"><span class="badge">${item.owner}</span><span class="status ${item.status}">${statusText(item.status)}</span></div>
            </article>
          `,
        )
        .join('')}
    </div>
  `;
}

function renderArchive() {
  return `
    <table class="table">
      <thead><tr><th>资料名称</th><th>GitHub 目录</th><th>归档状态</th></tr></thead>
      <tbody>
        ${archiveItems
          .map(
            (item) => `
              <tr>
                <td>${item.name}</td>
                <td>${item.folder}</td>
                <td><span class="status ${archiveStatusClass(item.status)}">${item.status}</span></td>
              </tr>
            `,
          )
          .join('')}
      </tbody>
    </table>
  `;
}

function renderPublic() {
  return `
    <div class="grid-3">
      ${publicNotices
        .map(
          (notice) => `
            <article class="card">
              <h3>${notice.title}</h3>
              <p>${notice.date}</p>
              <div class="badge-row"><span class="badge">${notice.level}</span><span class="badge">公众项目平台</span></div>
            </article>
          `,
        )
        .join('')}
    </div>
  `;
}

function statusText(status) {
  return { ok: '正常', warn: '关注', risk: '风险' }[status] ?? status;
}

function archiveStatusClass(status) {
  if (status.includes('已')) return 'ok';
  if (status.includes('审核') || status.includes('补')) return 'risk';
  return 'warn';
}

function renderAll() {
  renderModules();
  renderProjectPanel();
  renderStats();
  renderTabs();
  renderContent();
}

renderAll();
