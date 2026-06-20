import { currentProject, getSecondaryItems, getStats, githubRepository, moduleCatalog, moduleDetails, progressItems } from './data.mjs';

const PROFILE_KEY = 'blue_arrow_project_profile_v1';
const SESSION_KEY = 'blue_arrow_project_session_v1';
const MOCK_VERIFY_CODE = '202620';

const state = {
  activeModule: 'overview',
  activeSecondaryIndex: 0,
  profile: loadProfile(),
};

function loadProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY));
  } catch {
    return null;
  }
}

function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  state.profile = profile;
}

function isLoggedIn() {
  return sessionStorage.getItem(SESSION_KEY) === 'active';
}

function projectName() {
  return state.profile?.projectName || currentProject.name;
}

function managerCodeSeed() {
  return `LA${String(Date.now()).slice(-6)}`;
}

function setScreen(mode) {
  document.body.classList.toggle('access-mode', mode === 'access');
  document.querySelector('#accessGate').hidden = mode !== 'access';
  document.querySelector('.admin-shell').hidden = mode !== 'admin';
}

function renderAccessGate(message = '') {
  setScreen('access');
  if (state.profile) {
    renderLoginGate(message);
    return;
  }

  document.querySelector('#accessGate').innerHTML = `
    <section class="access-card">
      <div class="access-brand">
        <img src="./assets/blue-arrow-logo.jpg" alt="蓝箭项目标识" />
        <div>
          <span>蓝箭项目管理平台</span>
          <strong>建立第一个项目</strong>
        </div>
      </div>
      <form id="createProjectForm" class="access-form">
        <label>
          <span>项目名称</span>
          <input id="projectNameInput" value="工程线位点二综合治理项目" required />
        </label>
        <label>
          <span>项目管理者联系电话</span>
          <input id="phoneInput" inputmode="tel" placeholder="请输入手机号" required />
        </label>
        <div class="verify-row">
          <label>
            <span>手机验证码</span>
            <input id="verifyCodeInput" inputmode="numeric" placeholder="点击发送后输入验证码" required />
          </label>
          <button id="sendCodeButton" class="secondary-action" type="button">发送验证码</button>
        </div>
        <label>
          <span>项目管理者代码</span>
          <input id="managerCodeInput" value="${managerCodeSeed()}" minlength="8" required />
        </label>
        <label>
          <span>管理者密码</span>
          <input id="managerPasswordInput" value="LA2026" minlength="6" required />
        </label>
        ${message ? `<p class="access-message">${message}</p>` : ''}
        <button class="primary-action" type="submit">建立项目</button>
      </form>
    </section>
  `;

  document.querySelector('#sendCodeButton').addEventListener('click', () => {
    renderAccessGate(`模拟验证码已发送：${MOCK_VERIFY_CODE}`);
  });

  document.querySelector('#createProjectForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const profile = {
      projectName: form.querySelector('#projectNameInput').value.trim(),
      phone: form.querySelector('#phoneInput').value.trim(),
      verifyCode: form.querySelector('#verifyCodeInput').value.trim(),
      managerCode: form.querySelector('#managerCodeInput').value.trim(),
      managerPassword: form.querySelector('#managerPasswordInput').value.trim(),
      createdAt: new Date().toISOString(),
    };

    if (profile.verifyCode !== MOCK_VERIFY_CODE) {
      renderAccessGate('验证码不正确。原型阶段请使用 202620。');
      return;
    }

    saveProfile(profile);
    sessionStorage.removeItem(SESSION_KEY);
    renderLoginGate('项目已建立。请使用管理者代码和密码进入后台。');
  });
}

function renderLoginGate(message = '') {
  setScreen('access');
  document.querySelector('#accessGate').innerHTML = `
    <section class="access-card compact">
      <div class="access-brand">
        <img src="./assets/blue-arrow-logo.jpg" alt="蓝箭项目标识" />
        <div>
          <span>蓝箭项目管理平台</span>
          <strong>项目登录验证</strong>
        </div>
      </div>
      <form id="loginProjectForm" class="access-form">
        <label>
          <span>项目名称</span>
          <input value="${state.profile.projectName}" readonly />
        </label>
        <label>
          <span>项目管理者代码</span>
          <input id="loginCodeInput" required />
        </label>
        <label>
          <span>管理者密码</span>
          <input id="loginPasswordInput" type="password" required />
        </label>
        ${message ? `<p class="access-message">${message}</p>` : ''}
        <button class="primary-action" type="submit">进入项目后台</button>
      </form>
    </section>
  `;

  document.querySelector('#loginProjectForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const code = document.querySelector('#loginCodeInput').value.trim();
    const password = document.querySelector('#loginPasswordInput').value.trim();
    if (code !== state.profile.managerCode || password !== state.profile.managerPassword) {
      renderLoginGate('项目管理者代码或密码不正确。');
      return;
    }
    sessionStorage.setItem(SESSION_KEY, 'active');
    renderAll();
  });
}

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
  document.querySelector('#projectSwitch').innerHTML = `<option>${projectName()}</option>`;
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
        <span class="eyebrow">${projectName()}</span>
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
  setScreen('admin');
  renderModules();
  renderProjectControls();
  renderSecondaryNav();
  renderStats();
  renderTabs();
  renderContent();
}

if (state.profile && isLoggedIn()) {
  renderAll();
} else {
  renderAccessGate();
}
