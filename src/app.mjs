import { currentProject, getSecondaryItems, getStats, githubRepository, moduleCatalog, moduleDetails, progressItems } from './data.mjs';

const state = {
  activeModule: 'overview',
  activeSecondaryIndex: 0,
};

function renderModules() {
  document.querySelector('#moduleNav').innerHTML = moduleCatalog
    .map(
      (module) => `
        <button class="module-button ${module.id === state.activeModule ? 'active' : ''}" data-module="${module.id}" type="button">
          <span class="module-dot"></span>
          <span>${module.name}</span>
        </button>
      `,
    )
    .join('');

  document.querySelectorAll('[data-module]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeModule = button.dataset.module;
      state.activeSecondaryIndex = 0;
      renderAll();
    });
  });
}

function renderProjectControls() {
  document.querySelector('#projectSwitch').innerHTML = `<option>${currentProject.shortName}</option>`;
  document.querySelector('#sectionSwitch').innerHTML = `<option>${currentProject.section}</option>`;
}

function renderSecondaryNav() {
  const items = getSecondaryItems(state.activeModule);
  document.querySelector('#secondaryCount').textContent = `${items.length} 项`;
  document.querySelector('#secondaryNav').innerHTML = items
    .map(
      (item, index) => `
        <button class="secondary-item ${index === state.activeSecondaryIndex ? 'active' : ''}" data-secondary="${index}" type="button">
          <strong>${String(index + 1).padStart(2, '0')} ${item.name}</strong>
          <span>${item.status ?? item.type}</span>
          <small>动态目录</small>
        </button>
      `,
    )
    .join('');

  document.querySelectorAll('[data-secondary]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeSecondaryIndex = Number(button.dataset.secondary);
      renderAll();
    });
  });
}

function renderStats() {
  const stats = getStats();
  const cards = [
    ['单位工程数量', stats.unitCount, '完成 0%'],
    ['分部工程数量', stats.divisionCount, '完成 0%'],
    ['单元工程数量', stats.cellCount, '完成 0%'],
    ['上图入库', stats.mapStorage, '接口待对接'],
  ];

  document.querySelector('#statsGrid').innerHTML = cards
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
  const tabs = ['总览', '质量控制', '进度控制', '档案资料', '上图入库', '接口资料库'];
  document.querySelector('#tabStrip').innerHTML = tabs
    .map((tab, index) => `<button class="tab-button ${index === 0 ? 'active' : ''}" type="button">${tab}</button>`)
    .join('');
}

function renderContent() {
  const module = moduleCatalog.find((item) => item.id === state.activeModule);
  const items = moduleDetails[state.activeModule] ?? [];
  const selected = getSecondaryItems(state.activeModule)[state.activeSecondaryIndex];
  const view = document.querySelector('#contentView');

  if (state.activeModule === 'quantity') {
    view.innerHTML = renderProgressTable();
    return;
  }

  view.innerHTML = `
    <section class="module-summary">
      <div>
        <span class="eyebrow">${currentProject.name}</span>
        <h1>${module.name}</h1>
      </div>
      <a href="${githubRepository.url}" target="_blank" rel="noreferrer">GitHub</a>
    </section>
    <section class="focus-panel">
      <span>当前二级目录</span>
      <strong>${selected?.name ?? module.name}</strong>
      <p>${selected?.note ?? '该模块会根据当前项目资料和工程结构动态生成。'}</p>
    </section>
    <div class="card-grid">
      ${items
        .map(
          (item) => `
            <article class="info-card">
              <h3>${item.name}</h3>
              <p>${item.note}</p>
              <span class="status ${statusClass(item.status)}">${item.status}</span>
            </article>
          `,
        )
        .join('')}
    </div>
  `;
}

function renderProgressTable() {
  return `
    <table class="table">
      <thead>
        <tr><th>单元工程编号</th><th>单元工程名称</th><th>开工状态</th><th>完成率</th></tr>
      </thead>
      <tbody>
        ${progressItems
          .map(
            (item) => `
              <tr>
                <td>${item.id}</td>
                <td>${item.task}</td>
                <td><span class="status warning">${item.status}</span></td>
                <td><div class="progress-bar"><span style="width:${item.done}%"></span></div>${item.done}%</td>
              </tr>
            `,
          )
          .join('')}
      </tbody>
    </table>
  `;
}

function statusClass(status = '') {
  if (status.includes('已') || status.includes('正常')) return 'ok';
  if (status.includes('风险') || status.includes('待')) return 'danger';
  return 'warning';
}

function renderAll() {
  renderModules();
  renderProjectControls();
  renderSecondaryNav();
  renderStats();
  renderTabs();
  renderContent();
}

renderAll();
