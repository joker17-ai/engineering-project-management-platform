const tableSources = [
  ['project', 'data/projects/line-site-2.json', '工程线位点二项目记录'],
  ['progress', 'data/progress/progress-items.json', '进度与投资台账'],
  ['documents', 'data/documents/index.json', '资料归档索引'],
  ['public', 'data/public-notices/notices.json', '公众公开公告'],
];

const state = {
  activeTableId: 'project',
  tables: [],
};

function getActiveTable() {
  return state.tables.find((table) => table.id === state.activeTableId) ?? state.tables[0];
}

function normalizeRows(data) {
  return Array.isArray(data) ? data : [data];
}

async function loadTables() {
  state.tables = await Promise.all(
    tableSources.map(async ([id, path, name]) => {
      const response = await fetch(path);
      const data = await response.json();
      return { id, path, name, rows: normalizeRows(data) };
    }),
  );
}

function renderDatabaseList() {
  const host = document.querySelector('#databaseList');
  host.innerHTML = `
    <div class="panel-heading">
      <span>GitHub 数据目录</span>
      <strong>${state.tables.length} 组数据</strong>
    </div>
    ${state.tables
      .map(
        (table) => `
          <button class="database-list-item ${table.id === state.activeTableId ? 'active' : ''}" data-table-id="${table.id}" type="button">
            <strong>${table.name}</strong>
            <span>${table.path}</span>
            <small>${table.rows.length} 条记录 / 仓库托管</small>
          </button>
        `,
      )
      .join('')}
  `;

  host.querySelectorAll('[data-table-id]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeTableId = button.dataset.tableId;
      render();
    });
  });
}

function renderSummary() {
  const table = getActiveTable();
  const summary = document.querySelector('#databaseSummary');
  summary.innerHTML = `
    <article class="card">
      <h3>${table.name}</h3>
      <p class="interface-desc">来源：${table.path}。这组数据已经按蓝箭平台目录规范放入 GitHub 仓库，适合后续接入 GitHub Pages 或接口读取。</p>
      <div class="file-tags">
        <span>JSON</span>
        <span>${table.rows.length} 条记录</span>
        <span>GitHub 数据</span>
      </div>
    </article>
    <div class="database-actions card">
      <strong>数据路径</strong>
      <span>${table.path}</span>
      <a class="primary-button" href="https://github.com/joker17-ai/engineering-project-management-platform" target="_blank" rel="noreferrer">打开 GitHub</a>
    </div>
  `;
}

function renderDataTable() {
  const table = getActiveTable();
  const host = document.querySelector('#databaseTableHost');
  const columns = Array.from(new Set(table.rows.flatMap((row) => Object.keys(row))));

  host.innerHTML = `
    <table class="table editable-table">
      <thead>
        <tr>${columns.map((column) => `<th>${column}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${table.rows
          .map(
            (row) => `
              <tr>
                ${columns
                  .map((column) => `<td><input readonly value="${String(row[column] ?? '').replaceAll('"', '&quot;')}" /></td>`)
                  .join('')}
              </tr>
            `,
          )
          .join('')}
      </tbody>
    </table>
  `;
}

function render() {
  renderDatabaseList();
  renderSummary();
  renderDataTable();
}

loadTables().then(render);
