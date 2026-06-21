import {
  confirmAiFindingIntoTree,
  currentProject,
  getAiFindings,
  getPendingAiFindings,
  getSecondaryItems,
  getStats,
  githubRepository,
  moduleCatalog,
  moduleDetails,
  progressItems,
} from './data.mjs?v=catalog-tabs-5';

const PROFILE_KEY = 'blue_arrow_project_profile_v1';
const SESSION_KEY = 'blue_arrow_project_session_v1';
const DEEPSEEK_API_KEY = 'blue_arrow_deepseek_api_config_v1';
const SILICONFLOW_API_KEY = 'blue_arrow_siliconflow_api_config_v1';
const MOCK_VERIFY_CODE = '202620';

consumeResetRequest();

const initialDeepSeekApiConfig = loadDeepSeekApiConfig();
const initialSiliconFlowApiConfig = loadSiliconFlowApiConfig();

const trialRecognitionResults = {
  sourceFiles: [
    '01 石峡口水库除险加固初步设计-报批稿-2024.03.27.pdf',
    '02 初设附图.pdf',
  ],
  textFindings: [
    '初设报告共 333 页，工程为呼和浩特市清水河县石峡口水库除险加固工程，设计单位为黄河勘测规划设计研究院有限公司。',
    '石峡口水库控制流域面积约 254km²，总库容约 2436 万 m³，为以防洪为主，兼顾工业供水、灌溉等综合利用的中型水库。',
    '工程等别为 III 等，主要建筑物大坝、泄洪洞、溢洪道为 3 级建筑物。',
    '主要问题包括防浪墙开裂破损、溢洪道行洪安全隐患、坝坡护坡局部塌陷、泄洪洞斜廊道裂缝漏水、闸门启闭机失修、电气设备老化和安全监测设施不足。',
    '电气专业负荷合计约 69kW；泄洪洞工作门启闭机为二级负荷，其余为三级负荷；设计更换 80kVA 变压器，重新敷设架空绝缘导线，配置综合配电箱、控制柜、PLC 现地控制和视频监控。',
  ],
  drawingFindings: [
    {
      drawing: '石峡口水库工程平面布置图',
      page: '附图第 1 页',
      objects: '大坝、溢洪道、泄洪洞、管理房、现有道路、护坡及控制点坐标。',
      action: '挂接到项目总体状态、图纸与现场取证、项目结构树。',
    },
    {
      drawing: '大坝典型剖面图',
      page: '附图第 2 页',
      objects: '坝体、防浪墙、上游护坡、下游护坡、截水槽、正常蓄水位、设计/校核洪水位。',
      action: '形成大坝除险加固质量控制点和安全隐患复核点。',
    },
    {
      drawing: '泄洪洞及斜廊道布置图',
      page: '附图第 3 页',
      objects: '泄洪洞、斜廊道、启闭机房、检修闸门、固结灌浆孔、排水管和裂缝化学灌浆处理。',
      action: '挂接到隐蔽工程验收、金属结构维护和安全风险清单。',
    },
    {
      drawing: '溢洪道平面布置图',
      page: '附图第 4 页',
      objects: '控制段、泄槽段、消能防护段、交通桥、干砌石护坡、混凝土预制块护坡拆除范围。',
      action: '形成溢洪道开挖、衬砌、消能防护、边坡安全的待确认任务。',
    },
  ],
  projectOutputs: [
    '单位工程建议：大坝除险加固工程、溢洪道加固工程、泄洪洞及斜廊道加固工程、机电与金属结构工程、安全监测与档案管理。',
    '质量控制建议：防浪墙拆除重建、护坡重做与修补、溢洪道混凝土衬砌、灌浆和排水孔、闸门启闭机维护、电气配电与控制柜安装。',
    '安全隐患建议：溢洪道边坡冲刷、泄洪洞裂缝漏水、启闭设备失修、备用电源老化、施工导流和临电控制。',
    '档案挂接建议：初设报告、批复、附图、地勘报告、图号、页码、识别对象、责任单位、审批状态和虚拟数据库记录。',
  ],
};

const deepSeekProjectCatalog = [
  {
    id: 'SXK-DX-001',
    name: '石峡口水库除险加固工程',
    level: '单项工程',
    basis: '根据初设报告工程任务、概预算和水库除险加固工程类型归并。',
  },
  {
    id: 'SXK-DW-001',
    name: '大坝除险加固工程',
    level: '单位工程',
    basis: '防浪墙、坝顶路面、上下游护坡、坝脚抛石和安全监测相关内容。',
  },
  {
    id: 'SXK-DW-002',
    name: '溢洪道加固工程',
    level: '单位工程',
    basis: '控制段、泄槽段、消能防护段、边坡处理和混凝土衬砌。',
  },
  {
    id: 'SXK-DW-003',
    name: '泄洪洞及斜廊道加固工程',
    level: '单位工程',
    basis: '泄洪洞廊道防渗、启闭机房、人行桥、检修闸门和工作闸门。',
  },
  {
    id: 'SXK-DW-004',
    name: '机电与金属结构工程',
    level: '单位工程',
    basis: '80kVA 变压器、配电箱、控制柜、PLC、视频监控、闸门启闭设备。',
  },
  {
    id: 'SXK-FX-001',
    name: '防浪墙拆除重建及坝顶路面恢复',
    level: '分部分项工程',
    basis: '对应大坝防浪墙开裂破损、路面及路缘石重建。',
  },
  {
    id: 'SXK-FX-002',
    name: '上游干砌石护坡清理重做',
    level: '分部分项工程',
    basis: '对应上游护坡局部塌陷破损、近坝区散落石和浮土层清理。',
  },
  {
    id: 'SXK-FX-003',
    name: '溢洪道控制段与泄槽段混凝土加固',
    level: '分部分项工程',
    basis: '对应驼峰堰、泄槽、消能防护段和全断面防护。',
  },
  {
    id: 'SXK-FX-004',
    name: '泄洪洞斜廊道防渗与裂缝处理',
    level: '分部分项工程',
    basis: '对应固结灌浆、排水孔和化学灌浆。',
  },
  {
    id: 'SXK-FX-005',
    name: '配电与现地控制系统改造',
    level: '分部分项工程',
    basis: '对应配电箱、控制柜、PLC、照明和备用电源维护。',
  },
  {
    id: 'SXK-DY-001',
    name: '防浪墙 C25W6F250 混凝土施工验收',
    level: '单元工程',
    basis: '由大坝剖面图与防浪墙断面识别形成。',
  },
  {
    id: 'SXK-DY-002',
    name: '干砌石护坡块石质量与砌筑验收',
    level: '单元工程',
    basis: '由大坝典型剖面图说明与初设报告质量要求形成。',
  },
  {
    id: 'SXK-DY-003',
    name: '溢洪道 Y0+000 至 Y0+370 段断面复核',
    level: '单元工程',
    basis: '由溢洪道平面图及剖面图桩号识别形成。',
  },
  {
    id: 'SXK-DY-004',
    name: '斜廊道固结灌浆孔和排水孔验收',
    level: '单元工程',
    basis: '由泄洪洞及斜廊道布置图识别形成。',
  },
  {
    id: 'SXK-DY-005',
    name: '启闭机房配电箱与控制柜安装调试',
    level: '单元工程',
    basis: '由电气章节和图纸对象识别形成。',
  },
  {
    id: 'SXK-DY-006',
    name: '视频监控与安全监测设施安装复核',
    level: '单元工程',
    basis: '由安全监测、电气二次和视频监控系统内容形成。',
  },
];

const state = {
  activeModule: 'overview',
  activeSecondaryIndex: 0,
  profile: loadProfile(),
  setupDraft: {
    projectName: '',
    phone: '',
    verifyCode: '',
    verified: false,
  },
  aiAnalysisStarted: false,
  selectedProjectFileName: '',
  selectedIntelligenceFileName: '',
  intelligenceImportFiles: [],
  intelligenceImportStatus: '',
  siliconFlowRecognitionPlan: null,
  deepSeekApi: initialDeepSeekApiConfig,
  deepSeekApiConfigured: Boolean(initialDeepSeekApiConfig.apiKey),
  deepSeekApiStatus: '',
  siliconFlowApi: initialSiliconFlowApiConfig,
  siliconFlowApiConfigured: Boolean(initialSiliconFlowApiConfig.apiKey),
  siliconFlowApiStatus: '',
};

function applyDirectViewRequest() {
  if (!window.location.search) return '';
  const searchParams = new URLSearchParams(window.location.search);
  const target = searchParams.get('show');
  if (target !== 'siliconflow') return '';

  if (!state.profile) {
    state.profile = {
      projectName: currentProject.name,
      phone: '',
      managerCode: 'PreviewOnly2026',
      managerPassword: '',
    };
  }
  sessionStorage.setItem(SESSION_KEY, 'active');
  state.activeModule = 'intelligence';
  state.activeSecondaryIndex = 2;
  return target;
}

function consumeResetRequest() {
  if (!window.location.search) return;
  const searchParams = new URLSearchParams(window.location.search);
  if (!searchParams.has('reset')) return;

  localStorage.removeItem(PROFILE_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  window.history.replaceState({}, '', window.location.pathname);
}

function loadProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY));
  } catch {
    return null;
  }
}

function loadDeepSeekApiConfig() {
  try {
    return (
      JSON.parse(localStorage.getItem(DEEPSEEK_API_KEY)) ?? {
        endpoint: 'https://api.deepseek.com',
        model: 'deepseek-reasoner',
      }
    );
  } catch {
    return {
      endpoint: 'https://api.deepseek.com',
      model: 'deepseek-reasoner',
    };
  }
}

function saveDeepSeekApiConfig(config) {
  localStorage.setItem(DEEPSEEK_API_KEY, JSON.stringify(config));
  state.deepSeekApi = config;
  state.deepSeekApiConfigured = Boolean(config.apiKey);
}

function loadSiliconFlowApiConfig() {
  try {
    return (
      JSON.parse(localStorage.getItem(SILICONFLOW_API_KEY)) ?? {
        endpoint: 'https://api.siliconflow.cn/v1',
        visionModel: 'Qwen/Qwen3-VL-32B-Instruct',
      }
    );
  } catch {
    return {
      endpoint: 'https://api.siliconflow.cn/v1',
      visionModel: 'Qwen/Qwen3-VL-32B-Instruct',
    };
  }
}

function saveSiliconFlowApiConfig(config) {
  localStorage.setItem(SILICONFLOW_API_KEY, JSON.stringify(config));
  state.siliconFlowApi = config;
  state.siliconFlowApiConfigured = Boolean(config.apiKey);
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
  return `LAa${String(Date.now()).slice(-5)}`;
}

function renderPasswordField({ id, label, value = '', confirm = false, disabled = false, placeholder = '' }) {
  return `
    <label>
      <span>${label}</span>
      <div class="password-field">
        <input id="${id}" type="password" value="${value}" placeholder="${placeholder}" minlength="6" autocomplete="${confirm ? 'new-password' : 'current-password'}" ${disabled ? 'disabled' : ''} required />
        <button class="password-eye" type="button" data-password-toggle="${id}" aria-label="显示${label}" title="显示${label}" ${disabled ? 'disabled' : ''}>👁</button>
      </div>
    </label>
  `;
}

function renderManagerCredentialFields({ disabled }) {
  return `
    <label>
      <span>项目管理者代码</span>
      <input
        id="managerCodeInput"
        value="${disabled ? '' : managerCodeSeed()}"
        placeholder="${disabled ? '验证码通过后可设置' : ''}"
        minlength="8"
        ${disabled ? 'disabled' : ''}
        required
      />
    </label>
    ${renderPasswordField({
      id: 'managerPasswordInput',
      label: '管理者密码',
      value: disabled ? '' : 'LA2026',
      disabled,
      placeholder: disabled ? '验证码通过后可设置' : '',
    })}
    ${renderPasswordField({
      id: 'managerPasswordConfirmInput',
      label: '管理者密码确认',
      value: disabled ? '' : 'LA2026',
      confirm: true,
      disabled,
      placeholder: disabled ? '验证码通过后可设置' : '',
    })}
  `;
}

function renderAccessRules() {
  return `
    <aside class="access-rules" aria-label="项目名称与密码规则">
      <strong>项目名称与密码规则</strong>
      <p>项目名称建议使用正式立项或合同名称，建立后不可修改。</p>
      <p>资料文件命名建议：项目名称-资料类型-日期-版本号，例如 工程线位点二-施工组织设计-20260621-V1。</p>
      <p>管理者代码不少于 8 位，建议包含大写字母、小写字母和数字。</p>
      <p>管理者密码为 6 位以上，建议使用字母与数字组合；确认密码必须保持一致。</p>
    </aside>
  `;
}

function togglePasswordVisibility(button) {
  const input = document.querySelector(`#${button.dataset.passwordToggle}`);
  if (!input) return;
  const nextType = input.type === 'password' ? 'text' : 'password';
  input.type = nextType;
  const isVisible = nextType === 'text';
  button.textContent = isVisible ? '隐藏' : '👁';
  button.setAttribute('aria-label', `${isVisible ? '隐藏' : '显示'}${input.id.includes('Confirm') ? '确认密码' : '密码'}`);
}

function bindPasswordToggles() {
  document.querySelectorAll('[data-password-toggle]').forEach((button) => {
    button.addEventListener('click', () => togglePasswordVisibility(button));
  });
}

function isValidManagerCode(code) {
  return code.length >= 8 && /[A-Z]/.test(code) && /[a-z]/.test(code) && /\d/.test(code);
}

function isValidManagerPassword(password) {
  return password.length >= 6 && /[A-Za-z]/.test(password) && /\d/.test(password);
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
          <input id="projectNameInput" value="${state.setupDraft.projectName}" ${state.setupDraft.verified ? 'readonly' : ''} required />
        </label>
        <label>
          <span>项目管理者联系电话</span>
          <input id="phoneInput" inputmode="tel" value="${state.setupDraft.phone}" placeholder="请输入手机号" ${state.setupDraft.verified ? 'readonly' : ''} required />
        </label>
        ${
          state.setupDraft.verified
            ? `
              ${renderManagerCredentialFields({ disabled: !state.setupDraft.verified })}
            `
            : `
              <div class="verify-row">
                <label>
                  <span>手机验证码</span>
                  <input id="verifyCodeInput" inputmode="numeric" value="${state.setupDraft.verifyCode}" placeholder="点击发送后输入验证码" required />
                </label>
                <button id="sendCodeButton" class="secondary-action" type="button">发送验证码</button>
              </div>
              ${renderManagerCredentialFields({ disabled: !state.setupDraft.verified })}
            `
        }
        ${message ? `<p class="access-message">${message}</p>` : ''}
        <button class="primary-action" type="submit">${state.setupDraft.verified ? '建立项目' : '验证并继续'}</button>
      </form>
      ${renderAccessRules()}
    </section>
  `;

  bindPasswordToggles();

  document.querySelector('#sendCodeButton')?.addEventListener('click', () => {
    captureSetupDraft();
    renderAccessGate(`模拟验证码已发送：${MOCK_VERIFY_CODE}`);
  });

  document.querySelector('#createProjectForm').addEventListener('submit', (event) => {
    event.preventDefault();
    captureSetupDraft();

    if (!state.setupDraft.verified) {
      if (!state.setupDraft.projectName) {
        renderAccessGate('请先填写项目名称。');
        return;
      }

      if (state.setupDraft.verifyCode !== MOCK_VERIFY_CODE) {
        renderAccessGate('验证码不正确。原型阶段请使用 202620。');
        return;
      }
      state.setupDraft.verified = true;
      renderAccessGate('验证码通过，请建立项目管理者代码和密码。');
      return;
    }

    const form = event.currentTarget;
    const profile = {
      projectName: state.setupDraft.projectName,
      phone: state.setupDraft.phone,
      managerCode: form.querySelector('#managerCodeInput').value.trim(),
      managerPassword: form.querySelector('#managerPasswordInput').value.trim(),
      createdAt: new Date().toISOString(),
    };
    const confirmPassword = form.querySelector('#managerPasswordConfirmInput').value.trim();

    if (!profile.managerCode || !profile.managerPassword) {
      renderAccessGate('请填写项目管理者代码和管理者密码。');
      return;
    }

    if (!isValidManagerCode(profile.managerCode)) {
      renderAccessGate('管理者代码需不少于 8 位，并包含大写字母、小写字母和数字。');
      return;
    }

    if (!isValidManagerPassword(profile.managerPassword)) {
      renderAccessGate('管理者密码为 6 位以上，并需要包含字母和数字。');
      return;
    }

    if (profile.managerPassword !== confirmPassword) {
      renderAccessGate('密码与确认密码不一致。');
      return;
    }

    saveProfile(profile);
    sessionStorage.removeItem(SESSION_KEY);
    renderLoginGate('项目已建立。请使用管理者代码和密码进入后台。');
  });
}

function captureSetupDraft() {
  state.setupDraft.projectName = document.querySelector('#projectNameInput')?.value.trim() || '';
  state.setupDraft.phone = document.querySelector('#phoneInput')?.value.trim() || '';
  state.setupDraft.verifyCode = document.querySelector('#verifyCodeInput')?.value.trim() || state.setupDraft.verifyCode;
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
        ${renderPasswordField({ id: 'loginPasswordInput', label: '管理者密码' })}
        ${message ? `<p class="access-message">${message}</p>` : ''}
        <button class="primary-action" type="submit">进入项目后台</button>
      </form>
      ${renderAccessRules()}
    </section>
  `;

  bindPasswordToggles();

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
      openSecondaryAction(getSecondaryItems(state.activeModule)[state.activeSecondaryIndex]);
    });
  });
}

function openSecondaryAction(item) {
  if (state.activeModule === 'overview' && item) {
    renderOverviewLinkModal(item);
  }
  if (state.activeModule === 'intelligence' && item?.name === '资料导入解析') {
    renderDataImportModal();
  }
  if (state.activeModule === 'intelligence' && item?.name === 'DeepSeek R1 文字资料专项服务') {
    renderDeepSeekApiModal();
  }
  if (state.activeModule === 'intelligence' && item?.name === '硅基流动视觉识别服务') {
    renderSiliconFlowApiModal();
  }
  if (state.activeModule === 'intelligence' && item?.name === 'GitHub 数据同步') {
    renderGithubSyncModal();
  }
}

function openOverviewSecondaryAction(item) {
  openSecondaryAction(item);
}

function renderOverviewLinkModal(item) {
  modalHost().innerHTML = `
    <div class="modal-backdrop" role="presentation">
      <section class="api-modal" role="dialog" aria-modal="true" aria-label="${item.name}挂接入口">
        <div class="modal-heading">
          <div>
            <span class="eyebrow">项目总览舱</span>
            <h2>${item.name}</h2>
          </div>
          <button id="closeOverviewLinkModalButton" class="ghost-action" type="button">关闭</button>
        </div>
        <div class="api-form">
          <p class="api-hint">${item.note}</p>
          <label class="file-upload-action modal-upload-action">
            <input id="overviewAttachFileInput" type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.dwg,.zip,.jpg,.jpeg,.png,.webp,.txt,.csv" />
            <span>挂接资料</span>
          </label>
          <label>
            <span>责任单位</span>
            <input id="overviewResponsibilityInput" placeholder="请输入责任单位或管理人" />
          </label>
          <label>
            <span>审批状态</span>
            <select id="overviewApprovalStatusInput">
              <option>待审批</option>
              <option>审批中</option>
              <option>已通过</option>
              <option>需退回补充</option>
            </select>
          </label>
          <label>
            <span>虚拟数据库记录</span>
            <textarea id="overviewDatabaseRecordInput" rows="4" placeholder="记录资料编号、审批说明、挂接路径或后续处理意见"></textarea>
          </label>
          <p id="overviewAttachStatus" class="access-message">请选择资料或填写挂接信息。</p>
          <div class="api-actions">
            <button id="saveOverviewLinkButton" class="primary-action" type="button">保存挂接记录</button>
          </div>
        </div>
      </section>
    </div>
  `;

  document.querySelector('#closeOverviewLinkModalButton').addEventListener('click', () => {
    closeDeepSeekApiModal();
    renderAll();
  });
  document.querySelector('#overviewAttachFileInput').addEventListener('change', (event) => {
    const files = Array.from(event.currentTarget.files ?? []);
    document.querySelector('#overviewAttachStatus').textContent = files.length
      ? `已选择 ${files.length} 个挂接资料：${files.map((file) => file.name).join('、')}`
      : '请选择资料或填写挂接信息。';
  });
  document.querySelector('#saveOverviewLinkButton').addEventListener('click', () => {
    document.querySelector('#overviewAttachStatus').textContent = `${item.name}挂接记录已保存到当前项目虚拟数据库。`;
  });
}

function renderStats() {
  const catalogStats = getDeepSeekCatalogStats();
  const cards = [
    ['单项工程', catalogStats['单项工程'], 'DeepSeek 解析'],
    ['单位工程', catalogStats['单位工程'], 'DeepSeek 解析'],
    ['分部分项工程', catalogStats['分部分项工程'], 'DeepSeek 解析'],
    ['单元工程', catalogStats['单元工程'], 'DeepSeek 解析'],
  ];

  document.querySelector('#statsGrid').innerHTML = cards
    .map(
      ([label, value, note]) => `
        <button class="metric metric-button" data-catalog-level="${label}" type="button">
          <span>${label}</span>
          <strong>${value}</strong>
          <span>${note}</span>
        </button>
      `,
    )
    .join('');

  document.querySelectorAll('[data-catalog-level]').forEach((button) => {
    button.addEventListener('click', () => renderProjectCatalogModal(button.dataset.catalogLevel));
  });
}

function getDeepSeekCatalogStats() {
  return deepSeekProjectCatalog.reduce(
    (stats, item) => {
      stats[item.level] += 1;
      return stats;
    },
    {
      单项工程: 0,
      单位工程: 0,
      分部分项工程: 0,
      单元工程: 0,
    },
  );
}

function renderProjectCatalogModal(level) {
  const items = deepSeekProjectCatalog.filter((item) => item.level === level);
  modalHost().innerHTML = `
    <div class="modal-backdrop" role="presentation">
      <section class="api-modal" role="dialog" aria-modal="true" aria-label="${level}目录">
        <div class="modal-heading">
          <div>
            <span class="eyebrow">DeepSeek 设计文件与概预算解析</span>
            <h2>${level}目录</h2>
          </div>
          <button id="closeProjectCatalogModalButton" class="ghost-action" type="button">关闭</button>
        </div>
        <div class="api-form">
          <p class="api-hint">这里的分类由 DeepSeek-R1 根据设计文件、概预算和工程所属类型解析后写入。外部数字直接等于本目录条目数量。</p>
          <div class="catalog-result-list">
            ${items
              .map(
                (item) => `
                  <article>
                    <span>${item.id}</span>
                    <strong>${item.name}</strong>
                    <small>${item.basis}</small>
                  </article>
                `,
              )
              .join('')}
          </div>
        </div>
      </section>
    </div>
  `;

  document.querySelector('#closeProjectCatalogModalButton').addEventListener('click', () => {
    closeDeepSeekApiModal();
    renderAll();
  });
}

function renderAdminIdentityBar() {
  const profile = state.profile;
  document.querySelector('#adminIdentityBar').innerHTML = `
    <div>
      <span>项目身份确认</span>
      <strong>${projectName()}</strong>
      <small>当前项目已锁定，只显示该项目的结构树、资料、图表和档案。</small>
    </div>
    <div class="admin-identity-meta">
      <span>项目隔离运行</span>
      <span>管理者代码：${profile?.managerCode ?? '未登录'}</span>
      <button id="logoutButton" class="ghost-action" type="button">退出登录</button>
    </div>
  `;

  document.querySelector('#logoutButton').addEventListener('click', () => {
    sessionStorage.removeItem(SESSION_KEY);
    renderLoginGate('已退出后台。请重新输入项目管理者代码和密码。');
  });
}

function renderTabs() {
  const tabs = ['总览', '质量控制', '进度控制', '档案资料', '隐蔽验收', '安全隐患', '接口资料库'];
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

  if (state.activeModule === 'intelligence') {
    view.innerHTML = renderIntelligenceCenter(module);
    bindIntelligenceCenter();
    return;
  }

  if (state.activeModule === 'overview') {
    view.innerHTML = renderProjectOverview(module);
    bindProjectOverview();
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

function renderProjectOverview(module) {
  const catalogStats = getDeepSeekCatalogStats();
  const profile = state.profile;
  const overviewItems = getSecondaryItems('overview');

  return `
    <section class="module-summary">
      <div>
        <span class="eyebrow">${projectName()}</span>
        <h1>${module.name}</h1>
      </div>
      <span class="status ok">项目隔离运行</span>
    </section>
    <section class="overview-board">
      <article class="overview-primary">
        <span class="eyebrow">项目库状态</span>
        <h2>${projectName()}</h2>
        <p>当前后台只显示该项目的结构树、资料、图表、参建单位、档案和数据库记录。</p>
        <dl>
          <div><dt>项目库路径</dt><dd>${currentProject.repositoryPath}</dd></div>
          <div><dt>GitHub data 目录</dt><dd>${githubRepository.dataFolders.join(' / ')}</dd></div>
          <div><dt>当前管理者代码</dt><dd>${profile?.managerCode ?? '未登录'}</dd></div>
        </dl>
      </article>
      <article class="overview-import">
        <span class="eyebrow">资料导入入口</span>
        <h3>${state.selectedProjectFileName ? '已选择工程文件' : '等待导入工程资料'}</h3>
        <p>${
          state.selectedProjectFileName
            ? `已选择工程文件：${state.selectedProjectFileName}。文字资料进入 DeepSeek R1 分析，图片资料进入硅基流动识别。`
            : '施工组织设计、批复、概预算等文字资料进入 DeepSeek R1；图纸、照片、视频帧等图片资料进入硅基流动。'
        }</p>
        <label class="file-upload-action">
          <input id="projectFileInput" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.dwg,.zip,.jpg,.jpeg,.png,.txt,.csv" />
          <span>选择工程文件</span>
        </label>
      </article>
    </section>
    <section class="overview-jump">
      <div class="overview-jump-heading">
        <span class="eyebrow">栏目跳转</span>
        <h2>项目总览驾驶舱</h2>
        <p>集中展示质量、安全、进度、投资、档案和接口资料库的关键状态。</p>
      </div>
      <div class="overview-jump-grid">
        ${overviewItems
          .map(
            (item, index) => `
              <button class="overview-jump-card" data-overview-card="${index}" type="button">
                <span>${String(index + 1).padStart(2, '0')}</span>
                <strong>${item.name}</strong>
                <small>${item.note}</small>
              </button>
            `,
          )
          .join('')}
      </div>
    </section>
    <section class="overview-status-grid" aria-label="模块生成状态">
      <article>
        <span>单项工程</span>
        <strong>${catalogStats['单项工程']}</strong>
      </article>
      <article>
        <span>单位工程</span>
        <strong>${catalogStats['单位工程']}</strong>
      </article>
      <article>
        <span>分部分项工程</span>
        <strong>${catalogStats['分部分项工程']}</strong>
      </article>
      <article>
        <span>单元工程</span>
        <strong>${catalogStats['单元工程']}</strong>
      </article>
    </section>
    <section id="deepSeekApiModalHost"></section>
  `;
}

function normalizeDeepSeekEndpoint(endpoint) {
  return endpoint.trim().replace(/\/+$/, '');
}

function normalizeSiliconFlowEndpoint(endpoint) {
  return endpoint.trim().replace(/\/+$/, '');
}

function modalHost() {
  return document.querySelector('#apiModalHost') ?? document.querySelector('#deepSeekApiModalHost');
}

function fileExtension(fileName = '') {
  return fileName.toLowerCase().split('.').pop() || '';
}

function isBrowserReadableImage(file) {
  return ['jpg', 'jpeg', 'png', 'webp'].includes(fileExtension(file.name)) && file.type.startsWith('image/');
}

function classifyImportFile(file) {
  const name = typeof file === 'string' ? file : file.name;
  const extension = fileExtension(name);
  if (['jpg', 'jpeg', 'png', 'webp'].includes(extension)) {
    return { engine: 'siliconflow', label: '硅基流动视觉识别', direct: true };
  }
  if (['dwg', 'mp4', 'mov', 'avi'].includes(extension)) {
    return { engine: 'siliconflow', label: '硅基流动视觉识别', direct: false };
  }
  if (extension === 'zip') {
    return { engine: 'split', label: '后端解包后：图纸走硅基流动，文档走 DeepSeek-R1', direct: false };
  }
  if (['txt', 'csv'].includes(extension)) {
    return { engine: 'deepseek', label: 'DeepSeek-R1 文字分析', direct: true };
  }
  if (['doc', 'docx', 'xls', 'xlsx'].includes(extension)) {
    return { engine: 'deepseek', label: 'DeepSeek-R1 文字分析', direct: false };
  }
  if (extension === 'pdf') {
    return { engine: 'split', label: '文字页走 DeepSeek-R1，图纸页走硅基流动', direct: false };
  }
  return { engine: 'manual', label: '待人工确认资料类型', direct: false };
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result));
    reader.addEventListener('error', () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result));
    reader.addEventListener('error', () => reject(reader.error));
    reader.readAsText(file, 'utf-8');
  });
}

function buildSiliconFlowRecognitionPlan(file) {
  const extension = fileExtension(file.name);
  const sourceType = extension.toUpperCase() || '图片';
  const isZip = extension === 'zip';
  return {
    fileName: file.name,
    sourceType,
    status: '已进入后端抽图/抽帧与硅基流动识别队列',
    summary: isZip
      ? `${file.name} 将先由后端解包，识别其中的 PDF、DWG、图片和视频资料；PDF 按页抽图，DWG 转换图像，视频抽帧，再交给硅基流动识别并整理成果。`
      : `${file.name} 将先由后端抽图、抽页或抽帧，再交给硅基流动识别图纸范围、设备对象、文字标注、质量安全风险点和可归档节点。`,
    sections: [
      [isZip ? '后端解包' : '后端抽取', isZip ? '先读取压缩包目录，不在前端直接展开大文件；解包后按资料类型分流。' : 'PDF 按页抽图，DWG 转换为可识别图像，视频按关键帧抽帧。'],
      ['抽图/抽帧', 'PDF 按页抽图，DWG 转换为可识别图像，视频按关键帧抽帧。'],
      ['图纸目录', '按专业、图号、版本、页码或视频帧编号建立目录。'],
      ['识别对象', '整理设备、构筑物、管线、控制柜、照明、接地、危险源等对象。'],
      ['文字标注', '提取图签、设计说明、材料表、坐标、高程、规格型号和日期版本。'],
      ['风险与问题', '形成质量问题、安全隐患、缺项资料、疑似冲突位置清单。'],
      ['挂接位置', '挂到项目结构树、项目总览舱、图纸与现场取证、档案资料管理。'],
      ['待确认成果', '先进入项目管理者待确认区，确认后再写入正式项目数据库。'],
    ],
  };
}

function renderSiliconFlowRecognitionPlan(plan = state.siliconFlowRecognitionPlan) {
  const displayPlan =
    plan ??
    {
      fileName: '等待选择图纸、PDF、DWG、视频或 ZIP 资料包',
      sourceType: '硅基流动视觉资料',
      status: '后端解包/抽图/抽帧后进入识别',
      summary: 'ZIP 先后端解包；PDF、DWG、视频需要后端先抽图、抽页或抽帧，再交给硅基流动识别，识别成果整理后进入项目管理者待确认区。',
      sections: [
        ['后端解包', 'ZIP 先读取目录并解包，再按 PDF、DWG、图片、视频、文档类型分流。'],
        ['后端抽取', 'PDF 按页抽图，DWG 转换为可识别图像，视频按关键帧抽帧。'],
        ['硅基流动识别', '识别图纸范围、设备对象、文字标注、现场照片对象和视频帧风险点。'],
        ['成果整理', '整理为图纸目录、识别对象、文字标注、风险问题、挂接位置和待确认成果。'],
        ['确认入库', '项目管理者确认后写入项目总览舱、结构树、图纸取证和档案资料管理。'],
      ],
    };
  return `
    <section class="recognition-plan" aria-label="硅基流动识别成果整理">
      <div>
        <span class="eyebrow">识别成果整理</span>
        <strong>${displayPlan.fileName}</strong>
        <small>${displayPlan.sourceType} · ${displayPlan.status}</small>
      </div>
      <p>${displayPlan.summary}</p>
      <div class="recognition-plan-grid">
        ${displayPlan.sections
          .map(
            ([title, detail]) => `
              <article>
                <strong>${title}</strong>
                <span>${detail}</span>
              </article>
            `,
          )
          .join('')}
      </div>
    </section>
  `;
}

function renderTrialRecognitionResults() {
  return `
    <section class="recognition-result-board" aria-label="本次识别成果整理">
      <div class="result-heading">
        <span class="eyebrow">本次识别成果整理</span>
        <strong>石峡口水库除险加固初设报告与附图</strong>
        <small>硅基流动已试跑附图代表页；文字资料已本地提取，待 DeepSeek-R1 接口复核。</small>
      </div>
      <div class="result-source-list">
        ${trialRecognitionResults.sourceFiles.map((file) => `<span>${file}</span>`).join('')}
      </div>
      <div class="result-block">
        <h3>文字资料提取成果</h3>
        <ul>
          ${trialRecognitionResults.textFindings.map((item) => `<li>${item}</li>`).join('')}
        </ul>
      </div>
      <div class="result-block">
        <h3>硅基流动图纸识别成果</h3>
        <div class="drawing-result-grid">
          ${trialRecognitionResults.drawingFindings
            .map(
              (item) => `
                <article>
                  <span>${item.page}</span>
                  <strong>${item.drawing}</strong>
                  <p>${item.objects}</p>
                  <small>${item.action}</small>
                </article>
              `,
            )
            .join('')}
        </div>
      </div>
      <div class="result-block">
        <h3>整理后建议写入</h3>
        <ul>
          ${trialRecognitionResults.projectOutputs.map((item) => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    </section>
  `;
}

async function testDeepSeekApiConnection(config) {
  const endpoint = normalizeDeepSeekEndpoint(config.endpoint || 'https://api.deepseek.com');
  const response = await fetch(`${endpoint}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model || 'deepseek-reasoner',
      messages: [
        {
          role: 'user',
          content: '请回复“蓝箭项目管理平台 API 连接正常”。',
        },
      ],
      stream: false,
      max_tokens: 64,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek API 返回 ${response.status}：${errorText.slice(0, 180)}`);
  }

  return response.json();
}

async function analyzeDeepSeekText(config, text) {
  const endpoint = normalizeDeepSeekEndpoint(config.endpoint || 'https://api.deepseek.com');
  const response = await fetch(`${endpoint}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model || 'deepseek-reasoner',
      messages: [
        {
          role: 'user',
          content: `请从工程项目管理角度提取这段资料的项目结构、质量安全、进度和档案要点，并输出待确认建议：\n${String(text).slice(0, 6000)}`,
        },
      ],
      stream: false,
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek API 返回 ${response.status}：${errorText.slice(0, 180)}`);
  }

  return response.json();
}

async function recognizeSiliconFlowImage(config, imageUrl) {
  const endpoint = normalizeSiliconFlowEndpoint(config.endpoint || 'https://api.siliconflow.cn/v1');
  const response = await fetch(`${endpoint}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.visionModel || 'Qwen/Qwen3-VL-32B-Instruct',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: '请识别这张工程资料图片中的图纸范围、现场对象、文字标注、质量安全风险点，并输出给项目管理者确认的中文摘要。',
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      stream: false,
      max_tokens: 80,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`硅基流动 API 返回 ${response.status}：${errorText.slice(0, 180)}`);
  }

  return response.json();
}

async function testSiliconFlowImageRecognition(config) {
  const sampleImage =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABySURBVFhH7Y5BCsAgDAR9SB/ah/V/LTn0MqgxWiqBHZiLxGXKcZ33Tgsf/lYBClBAzoAevPUMBUTg35bDATNwo2aOgBW4RRXgBqzCPeoGmCtwiypgKMCcgRs18wSYEfi3ZSjgtQdvPacCvlQBClDA9oAH+VpnwQCF+WEAAAAASUVORK5CYII=';
  return recognizeSiliconFlowImage(config, sampleImage);
}

function renderDeepSeekApiModal(message = state.deepSeekApiStatus) {
  const config = state.deepSeekApi ?? {};
  modalHost().innerHTML = `
    <div class="modal-backdrop" role="presentation">
      <section class="api-modal" role="dialog" aria-modal="true" aria-label="DeepSeek-R1 API 接入配置">
        <div class="modal-heading">
          <div>
            <span class="eyebrow">数据智能中心</span>
            <h2>DeepSeek-R1 API 接入配置</h2>
          </div>
          <button id="closeApiModalButton" class="ghost-action" type="button">关闭</button>
        </div>
        <form id="deepSeekApiForm" class="api-form">
          <label>
            <span>API 地址</span>
            <input id="deepSeekApiEndpointInput" value="${config.endpoint ?? 'https://api.deepseek.com'}" required />
          </label>
          <label>
            <span>API Key</span>
            <input id="deepSeekApiKeyInput" type="password" value="${config.apiKey ?? ''}" placeholder="请输入 DeepSeek-R1 API Key" required />
          </label>
          <label>
            <span>模型名称</span>
            <input id="deepSeekModelInput" value="${config.model ?? 'deepseek-reasoner'}" required />
          </label>
          <p class="api-hint">DeepSeek-R1 仅负责文字资料和结构推理，不处理图片；施工组织设计、批复、概预算、检查表等文本内容在这里接入。</p>
          <input id="deepSeekDocumentFileInput" class="hidden-file-input" type="file" accept=".txt,.csv,.pdf,.doc,.docx,.xls,.xlsx" />
          ${message ? `<p class="access-message">${message}</p>` : ''}
          <div class="api-actions">
            <button id="testDeepSeekApiButton" class="secondary-action" type="button">文档识别</button>
            <button class="primary-action" type="submit">保存 API 配置</button>
          </div>
        </form>
      </section>
    </div>
  `;

  document.querySelector('#closeApiModalButton').addEventListener('click', () => {
    closeDeepSeekApiModal();
    renderAll();
  });
  document.querySelector('#testDeepSeekApiButton').addEventListener('click', async () => {
    document.querySelector('#deepSeekDocumentFileInput').click();
  });
  document.querySelector('#deepSeekDocumentFileInput').addEventListener('change', async (event) => {
    const [file] = event.currentTarget.files ?? [];
    if (!file) return;
    const config = readDeepSeekApiForm();
    if (!config.apiKey) {
      state.deepSeekApiStatus = `已选择文档：${file.name}。请先填写并保存 DeepSeek-R1 API Key。`;
      renderDeepSeekApiModal();
      return;
    }
    if (!['txt', 'csv'].includes(fileExtension(file.name))) {
      saveDeepSeekApiConfig(config);
      state.deepSeekApiStatus = `已选择文档：${file.name}。PDF、Word、Excel 正式阶段需要后端先提取正文后再交给 DeepSeek-R1 识别。`;
      renderDeepSeekApiModal();
      return;
    }
    state.deepSeekApiStatus = `正在用 DeepSeek-R1 识别文档：${file.name}...`;
    renderDeepSeekApiModal();
    try {
      const text = await readFileAsText(file);
      await analyzeDeepSeekText(config, text);
      saveDeepSeekApiConfig(config);
      state.deepSeekApiStatus = `文档识别完成：${file.name}`;
      renderDeepSeekApiModal();
    } catch (error) {
      state.deepSeekApiStatus = `文档识别失败：${error.message}`;
      renderDeepSeekApiModal();
    }
  });
  document.querySelector('#deepSeekApiForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const config = readDeepSeekApiForm();
    if (!config.apiKey) {
      renderDeepSeekApiModal('请填写 API Key。');
      return;
    }
    saveDeepSeekApiConfig(config);
    state.deepSeekApiStatus = 'DeepSeek API 配置已保存。';
    closeDeepSeekApiModal();
    renderAll();
  });
}

function renderSiliconFlowApiModal(message = state.siliconFlowApiStatus) {
  const config = state.siliconFlowApi ?? {};
  modalHost().innerHTML = `
    <div class="modal-backdrop" role="presentation">
      <section class="api-modal" role="dialog" aria-modal="true" aria-label="硅基流动图片识别接口配置">
        <div class="modal-heading">
          <div>
            <span class="eyebrow">图纸照片视频帧处理</span>
            <h2>硅基流动图片识别接口</h2>
          </div>
          <button id="closeSiliconFlowApiModalButton" class="ghost-action" type="button">关闭</button>
        </div>
        <form id="siliconFlowApiForm" class="api-form">
          <label>
            <span>API 地址</span>
            <input id="siliconFlowApiEndpointInput" value="${config.endpoint ?? 'https://api.siliconflow.cn/v1'}" required />
          </label>
          <label>
            <span>API Key</span>
            <input id="siliconFlowApiKeyInput" type="password" value="${config.apiKey ?? ''}" placeholder="请输入硅基流动 API Key" required />
          </label>
          <label>
            <span>视觉模型名称</span>
            <input id="siliconFlowVisionModelInput" value="${config.visionModel ?? 'Qwen/Qwen3-VL-32B-Instruct'}" required />
          </label>
          <p class="api-hint">用于图纸、照片、视频帧等图片类资料识别。点击图片识别后可选择图片、PDF、DWG、视频或图纸压缩包；PDF、DWG、视频和 ZIP 先进入后端抽图/抽帧/解包队列，再交给硅基流动识别。</p>
          <input id="siliconFlowImageFileInput" class="hidden-file-input" type="file" accept=".jpg,.jpeg,.png,.webp,.dwg,.pdf,.mp4,.mov,.avi,.zip" />
          ${message ? `<p class="access-message">${message}</p>` : ''}
          ${renderSiliconFlowRecognitionPlan()}
          ${renderTrialRecognitionResults()}
          <div class="api-actions">
            <button id="testSiliconFlowImageButton" class="secondary-action" type="button">图片识别</button>
            <button class="primary-action" type="submit">保存接口配置</button>
          </div>
        </form>
      </section>
    </div>
  `;

  document.querySelector('#closeSiliconFlowApiModalButton').addEventListener('click', () => {
    closeDeepSeekApiModal();
    renderAll();
  });
  document.querySelector('#testSiliconFlowImageButton').addEventListener('click', async () => {
    document.querySelector('#siliconFlowImageFileInput').click();
  });
  document.querySelector('#siliconFlowImageFileInput').addEventListener('change', async (event) => {
    const [file] = event.currentTarget.files ?? [];
    if (!file) return;
    state.siliconFlowRecognitionPlan = buildSiliconFlowRecognitionPlan(file);
    const config = readSiliconFlowApiForm();
    if (!config.apiKey) {
      state.siliconFlowApiStatus = `已选择图片资料：${file.name}。请先填写并保存硅基流动 API Key。`;
      renderSiliconFlowApiModal();
      return;
    }
    if (!isBrowserReadableImage(file)) {
      saveSiliconFlowApiConfig(config);
      state.siliconFlowApiStatus = `已选择图片资料：${file.name}。PDF、DWG、视频和 ZIP 需要后端先抽图/抽帧/解包，再交给硅基流动识别，成果整理为待确认清单。`;
      renderSiliconFlowApiModal();
      return;
    }
    state.siliconFlowApiStatus = `正在用硅基流动识别图片：${file.name}...`;
    renderSiliconFlowApiModal();
    try {
      const imageUrl = await readFileAsDataUrl(file);
      const result = await recognizeSiliconFlowImage(config, imageUrl);
      saveSiliconFlowApiConfig(config);
      const answer = result?.choices?.[0]?.message?.content ?? '图片识别接口已返回结果。';
      state.siliconFlowApiStatus = `图片识别完成：${String(answer).slice(0, 80)}`;
      renderSiliconFlowApiModal();
    } catch (error) {
      state.siliconFlowApiStatus = `图片识别失败：${error.message}`;
      renderSiliconFlowApiModal();
    }
  });
  document.querySelector('#siliconFlowApiForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const config = readSiliconFlowApiForm();
    if (!config.apiKey) {
      renderSiliconFlowApiModal('请填写硅基流动 API Key。');
      return;
    }
    saveSiliconFlowApiConfig(config);
    state.siliconFlowApiStatus = '硅基流动接口配置已保存。';
    closeDeepSeekApiModal();
    renderAll();
  });
}

function readDeepSeekApiForm() {
  return {
    endpoint: normalizeDeepSeekEndpoint(document.querySelector('#deepSeekApiEndpointInput').value),
    apiKey: document.querySelector('#deepSeekApiKeyInput').value.trim(),
    model: document.querySelector('#deepSeekModelInput').value.trim() || 'deepseek-reasoner',
  };
}

function readSiliconFlowApiForm() {
  return {
    endpoint: normalizeSiliconFlowEndpoint(document.querySelector('#siliconFlowApiEndpointInput').value),
    apiKey: document.querySelector('#siliconFlowApiKeyInput').value.trim(),
    visionModel: document.querySelector('#siliconFlowVisionModelInput').value.trim() || 'Qwen/Qwen3-VL-32B-Instruct',
  };
}

function closeDeepSeekApiModal() {
  modalHost().innerHTML = '';
}

function renderDataImportModal(message = '') {
  const selectedName = state.selectedIntelligenceFileName || state.selectedProjectFileName;
  const importedFiles = state.intelligenceImportFiles;
  modalHost().innerHTML = `
    <div class="modal-backdrop" role="presentation">
      <section class="api-modal" role="dialog" aria-modal="true" aria-label="资料导入解析">
        <div class="modal-heading">
          <div>
            <span class="eyebrow">数据智能中心</span>
            <h2>资料导入解析</h2>
          </div>
          <button id="closeDataImportModalButton" class="ghost-action" type="button">关闭</button>
        </div>
        <div class="api-form">
          <p class="api-hint">选择工程资料后，文字资料进入 DeepSeek R1，图片、图纸、照片、视频帧进入硅基流动视觉识别。</p>
          <label class="file-upload-action modal-upload-action">
            <input id="intelligenceFileInput" type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.dwg,.zip,.jpg,.jpeg,.png,.webp,.mp4,.mov,.avi,.txt,.csv" />
            <span>选择要导入的工程资料</span>
          </label>
          ${
            importedFiles.length
              ? `<div class="import-routing-list">
                  ${importedFiles
                    .map(
                      ({ file, route }) => `
                        <article>
                          <strong>${file.name}</strong>
                          <span>${route.label}${route.direct ? ' · 可直接启动' : ' · 待后端抽取/转换'}</span>
                        </article>
                      `,
                    )
                    .join('')}
                </div>`
              : ''
          }
          <div class="api-actions">
            <button id="startSiliconFlowImportButton" class="secondary-action" type="button">图片识别</button>
            <button id="startDeepSeekImportButton" class="primary-action" type="button">文档识别</button>
          </div>
          <div class="link-panel">
            <a href="${githubRepository.url}/tree/${githubRepository.branch}/data/documents" target="_blank" rel="noreferrer">打开 GitHub 资料目录</a>
            <a href="${githubRepository.url}/tree/${githubRepository.branch}/data/projects" target="_blank" rel="noreferrer">打开项目数据目录</a>
          </div>
          ${selectedName ? `<p class="access-message">已选择资料：${selectedName}</p>` : ''}
          ${state.intelligenceImportStatus ? `<p class="access-message">${state.intelligenceImportStatus}</p>` : ''}
          ${message ? `<p class="access-message">${message}</p>` : ''}
          ${renderSiliconFlowRecognitionPlan()}
        </div>
      </section>
    </div>
  `;

  document.querySelector('#closeDataImportModalButton').addEventListener('click', () => {
    closeDeepSeekApiModal();
    renderAll();
  });
  document.querySelector('#intelligenceFileInput').addEventListener('change', handleIntelligenceFileSelectionV2);
  document.querySelector('#startSiliconFlowImportButton').addEventListener('click', startSiliconFlowImportRecognition);
  document.querySelector('#startDeepSeekImportButton').addEventListener('click', startDeepSeekImportAnalysis);
}

function renderGithubSyncModal() {
  modalHost().innerHTML = `
    <div class="modal-backdrop" role="presentation">
      <section class="api-modal" role="dialog" aria-modal="true" aria-label="GitHub 数据同步">
        <div class="modal-heading">
          <div>
            <span class="eyebrow">数据托管</span>
            <h2>GitHub 数据同步</h2>
          </div>
          <button id="closeGithubSyncModalButton" class="ghost-action" type="button">关闭</button>
        </div>
        <div class="api-form">
          <p class="api-hint">当前项目数据已关联到 GitHub。这里提供仓库和 data 目录入口，后续正式阶段可接自动同步任务。</p>
          <div class="link-panel">
            <a href="${githubRepository.url}" target="_blank" rel="noreferrer">打开 GitHub 数据仓库</a>
            ${githubRepository.dataFolders
              .map(
                (folder) =>
                  `<a href="${githubRepository.url}/tree/${githubRepository.branch}/${folder}" target="_blank" rel="noreferrer">打开 ${folder}</a>`,
              )
              .join('')}
          </div>
          <p class="access-message">仓库地址：${githubRepository.cloneUrl}</p>
        </div>
      </section>
    </div>
  `;

  document.querySelector('#closeGithubSyncModalButton').addEventListener('click', () => {
    closeDeepSeekApiModal();
    renderAll();
  });
}

function handleProjectFileSelection(event) {
  const [file] = event.currentTarget.files ?? [];
  state.selectedProjectFileName = file?.name ?? '';
  renderAll();
}

function handleIntelligenceFileSelection(event) {
  const [file] = event.currentTarget.files ?? [];
  state.selectedIntelligenceFileName = file?.name ?? '';
  renderDataImportModal(state.selectedIntelligenceFileName ? '资料已进入待解析队列。' : '');
}

function handleIntelligenceFileSelectionV2(event) {
  const files = Array.from(event.currentTarget.files ?? []);
  state.intelligenceImportFiles = files.map((file) => ({
    file,
    route: classifyImportFile(file),
  }));
  state.selectedIntelligenceFileName = files.map((file) => file.name).join('、');
  state.intelligenceImportStatus = files.length
    ? `已导入 ${files.length} 个资料，请按资料类型启动硅基流动或 DeepSeek-R1。`
    : '';
  renderDataImportModal();
}

async function startSiliconFlowImportRecognition() {
  const visualFiles = state.intelligenceImportFiles.filter(({ route }) =>
    ['siliconflow', 'split'].includes(route.engine),
  );
  if (!visualFiles.length) {
    state.intelligenceImportStatus = '当前没有需要硅基流动识别的图片、图纸或视频资料。';
    renderDataImportModal();
    return;
  }
  if (!state.siliconFlowApiConfigured) {
    state.intelligenceImportStatus = '请先配置硅基流动视觉接口，再启动图片识别。';
    renderDataImportModal();
    return;
  }

  const imageItem = visualFiles.find(({ file, route }) => route.direct && isBrowserReadableImage(file));
  if (!imageItem) {
    const queuedItem = visualFiles[0];
    if (queuedItem?.file) {
      state.siliconFlowRecognitionPlan = buildSiliconFlowRecognitionPlan(queuedItem.file);
    }
    state.intelligenceImportStatus =
      '图纸 PDF、DWG 或视频资料已进入后端抽图/抽帧与硅基流动识别队列；成果将整理为待确认清单。';
    renderDataImportModal();
    return;
  }

  state.intelligenceImportStatus = `正在用硅基流动识别 ${imageItem.file.name}...`;
  renderDataImportModal();

  try {
    const imageUrl = await readFileAsDataUrl(imageItem.file);
    const result = await recognizeSiliconFlowImage(state.siliconFlowApi, imageUrl);
    const summary = result?.choices?.[0]?.message?.content ?? '识别完成，已返回结果。';
    state.intelligenceImportStatus = `硅基流动识别完成：${summary.slice(0, 120)}`;
  } catch (error) {
    state.intelligenceImportStatus = `硅基流动识别失败：${error.message}`;
  }
  renderDataImportModal();
}

async function startDeepSeekImportAnalysis() {
  const textFiles = state.intelligenceImportFiles.filter(({ route }) =>
    ['deepseek', 'split'].includes(route.engine),
  );
  if (!textFiles.length) {
    state.intelligenceImportStatus = '当前没有需要 DeepSeek-R1 分析的文字资料。';
    renderDataImportModal();
    return;
  }
  if (!state.deepSeekApiConfigured) {
    state.intelligenceImportStatus = '请先配置 DeepSeek-R1 文字接口，再启动文字资料分析。';
    renderDataImportModal();
    return;
  }

  const textItem = textFiles.find(({ route }) => route.direct);
  if (!textItem) {
    state.intelligenceImportStatus =
      'PDF、Word、Excel 等资料已进入 DeepSeek-R1 文字分析队列；正式阶段需要后端先提取正文后再分析。';
    renderDataImportModal();
    return;
  }

  state.intelligenceImportStatus = `正在用 DeepSeek-R1 分析 ${textItem.file.name}...`;
  renderDataImportModal();

  try {
    const text = await readFileAsText(textItem.file);
    const result = await analyzeDeepSeekText(state.deepSeekApi, text);
    const summary = result?.choices?.[0]?.message?.content ?? '分析完成，已返回结果。';
    state.intelligenceImportStatus = `DeepSeek-R1 分析完成：${summary.slice(0, 120)}`;
  } catch (error) {
    state.intelligenceImportStatus = `DeepSeek-R1 分析失败：${error.message}`;
  }
  renderDataImportModal();
}

function bindProjectOverview() {
  document.querySelector('#deepSeekApiButton')?.addEventListener('click', () => renderDeepSeekApiModal());
  document.querySelector('#siliconFlowApiButton')?.addEventListener('click', () => renderSiliconFlowApiModal());
  document.querySelector('#projectFileInput')?.addEventListener('change', handleProjectFileSelection);
  document.querySelectorAll('[data-overview-card]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeSecondaryIndex = Number(button.dataset.overviewCard);
      renderAll();
      openOverviewSecondaryAction(getSecondaryItems('overview')[state.activeSecondaryIndex]);
    });
  });
}

function renderIntelligenceCenter(module) {
  const pendingFindings = getPendingAiFindings();
  const allFindings = getAiFindings();
  const confirmedCount = allFindings.filter((finding) => finding.status === '已确认写入').length;

  return `
    <section class="module-summary">
      <div>
        <span class="eyebrow">${projectName()}</span>
        <h1>${module.name}</h1>
      </div>
      <span class="status ${pendingFindings.length ? 'danger' : 'ok'}">
        ${pendingFindings.length ? '待项目管理者确认' : '已全部确认'}
      </span>
    </section>
    <section class="ai-flow">
      <article>
        <span>01</span>
        <strong>导入资料</strong>
        <p>文字资料进入 DeepSeek R1；图纸、照片、视频帧等图片类资料进入硅基流动。</p>
      </article>
      <article class="${state.aiAnalysisStarted ? 'active' : ''}">
        <span>02</span>
        <strong>硅基流动图片识别</strong>
        <p>识别图纸范围、现场照片对象、视频帧风险点，并形成待确认的视觉识别结果。</p>
      </article>
      <article class="${state.aiAnalysisStarted ? 'active' : ''}">
        <span>03</span>
        <strong>DeepSeek R1 文字资料分析</strong>
        <p>基于文字资料和硅基流动识别结果，输出单位工程、分部工程、单元工程、时标网络图、质量控制图和档案编码建议。</p>
      </article>
      <article class="${confirmedCount ? 'active' : ''}">
        <span>04</span>
        <strong>确认写入</strong>
        <p>AI 成果先保留在待确认区，项目管理者确认后才写入正式项目结构树。</p>
      </article>
    </section>
    <section class="ai-action-row">
      <div>
        <strong>${state.aiAnalysisStarted ? '模拟分析已完成' : '资料已导入，等待分析'}</strong>
        <span>${pendingFindings.length} 项待确认，${confirmedCount} 项已写入</span>
      </div>
      <button id="runAiAnalysisButton" class="primary-action" type="button">DeepSeek R1 文字资料模拟分析</button>
    </section>
    <section class="ai-findings" aria-label="AI 待确认成果">
      ${allFindings
        .map(
          (finding) => `
            <article class="ai-finding">
              <div>
                <span class="eyebrow">${finding.source}</span>
                <h3>${finding.title}</h3>
                <p>${finding.summary}</p>
              </div>
              <div class="ai-targets">
                ${finding.targets.map((target) => `<span>${target}</span>`).join('')}
              </div>
              <div class="ai-finding-footer">
                <span class="status ${statusClass(finding.status)}">${finding.status}</span>
                ${
                  finding.status === '待项目管理者确认'
                    ? `<button class="secondary-action" data-confirm-ai="${finding.id}" type="button">确认写入项目结构</button>`
                    : '<span class="confirmed-note">已进入正式项目结构树</span>'
                }
              </div>
            </article>
          `,
        )
        .join('')}
    </section>
  `;
}

function bindIntelligenceCenter() {
  document.querySelector('#runAiAnalysisButton')?.addEventListener('click', () => {
    state.aiAnalysisStarted = true;
    renderAll();
  });

  document.querySelectorAll('[data-confirm-ai]').forEach((button) => {
    button.addEventListener('click', () => {
      confirmAiFindingIntoTree(currentProject, button.dataset.confirmAi);
      state.aiAnalysisStarted = true;
      renderAll();
    });
  });
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
  renderAdminIdentityBar();
  renderSecondaryNav();
  renderStats();
  renderTabs();
  renderContent();
}

const directViewTarget = applyDirectViewRequest();

if (directViewTarget || (state.profile && isLoggedIn())) {
  renderAll();
  if (directViewTarget === 'siliconflow') {
    renderSiliconFlowApiModal();
  }
} else {
  renderAccessGate();
}
