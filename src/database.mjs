import { mockDatabaseConnections, virtualDatabaseTables } from './data.mjs';

const STORAGE_KEY = 'farmland_virtual_database_tables_v1';

const state = {
  activeTableId: virtualDatabaseTables[0].id,
  tables: loadTables(),
};

function loadTables() {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(virtualDatabaseTables);

  try {
    return JSON.parse(saved);
  } catch {
    return structuredClone(virtualDatabaseTables);
  }
}

function saveTables() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tables));
}

function getActiveTable() {
  return state.tables.find((table) => table.id === state.activeTableId) ?? state.tables[0];
}

function renderDatabaseList() {
  const host = document.querySelector('#databaseList');
  host.innerHTML = `
    <div class="panel-heading">
      <span>虚拟数据库</span>
      <strong>${state.tables.length} 张表</strong>
    </div>
    ${state.tables
      .map((table) => {
        const connection = mockDatabaseConnections.find((item) => item.name.includes(table.name.slice(0, 2)));
        return `
          <button class="database-list-item ${table.id === state.activeTableId ? 'active' : ''}" data-table-id="${table.id}" type="button">
            <strong>${table.name}</strong>
            <span>${table.source}</span>
            <small>${connection?.mode ?? '模拟连接'} · 可编辑</small>
          </button>
        `;
      })
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
      <p class="interface-desc">来源：${table.source}。当前为虚拟数据库，支持手动修改展示数据；取得真实接口权限后，可将这张表替换为真实数据库连接。</p>
      <div class="file-tags">
        <span>${table.editable ? '可页面编辑' : '只读'}</span>
        <span>${table.rows.length} 条记录</span>
        <span>本地暂存</span>
      </div>
    </article>
    <button class="upload-button" id="resetTable" type="button">恢复当前表默认数据</button>
  `;

  document.querySelector('#resetTable').addEventListener('click', () => {
    const fresh = structuredClone(virtualDatabaseTables.find((item) => item.id === table.id));
    const index = state.tables.findIndex((item) => item.id === table.id);
    state.tables[index] = fresh;
    saveTables();
    render();
  });
}

function renderEditableTable() {
  const table = getActiveTable();
  const host = document.querySelector('#databaseTableHost');
  const rows = table.rows;
  const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));

  host.innerHTML = `
    <table class="table editable-table">
      <thead>
        <tr>${columns.map((column) => `<th>${column}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row, rowIndex) => `
              <tr>
                ${columns
                  .map((column) => {
                    const value = row[column] ?? '';
                    const readonly = column === 'id' ? 'readonly' : '';
                    return `
                      <td>
                        <input ${readonly} data-row="${rowIndex}" data-column="${column}" value="${String(value).replaceAll('"', '&quot;')}" />
                      </td>
                    `;
                  })
                  .join('')}
              </tr>
            `,
          )
          .join('')}
      </tbody>
    </table>
  `;

  host.querySelectorAll('input:not([readonly])').forEach((input) => {
    input.addEventListener('input', () => {
      const row = table.rows[Number(input.dataset.row)];
      row[input.dataset.column] = parseValue(input.value);
      saveTables();
    });
  });
}

function parseValue(value) {
  const trimmed = value.trim();
  if (trimmed !== '' && !Number.isNaN(Number(trimmed))) return Number(trimmed);
  return value;
}

function render() {
  renderDatabaseList();
  renderSummary();
  renderEditableTable();
}

render();
