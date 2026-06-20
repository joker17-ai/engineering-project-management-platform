import { mockDatabaseConnections, virtualDatabaseTables } from './data.mjs';

const STORAGE_KEY = 'engineering_virtual_database_tables_v2';
const UPLOAD_DB_NAME = 'engineering_project_uploads_v1';
const UPLOAD_STORE = 'files';

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
    <div class="database-actions">
      <input class="visually-hidden" id="databaseUploadInput" type="file" multiple />
      <button class="upload-button" id="databaseUploadButton" type="button">上传资料到当前表</button>
      <button class="secondary-button" id="resetTable" type="button">恢复当前表默认数据</button>
    </div>
    <div class="uploaded-list database-upload-list" id="databaseUploadList">
      <span>正在读取上传资料...</span>
    </div>
  `;

  document.querySelector('#resetTable').addEventListener('click', () => {
    const fresh = structuredClone(virtualDatabaseTables.find((item) => item.id === table.id));
    const index = state.tables.findIndex((item) => item.id === table.id);
    state.tables[index] = fresh;
    saveTables();
    render();
  });

  document.querySelector('#databaseUploadButton').addEventListener('click', () => {
    document.querySelector('#databaseUploadInput').click();
  });

  document.querySelector('#databaseUploadInput').addEventListener('change', async (event) => {
    const files = Array.from(event.target.files ?? []);
    for (const file of files) {
      await saveUploadedFile(table.id, file);
    }
    event.target.value = '';
    await renderUploadedList(table.id);
  });

  renderUploadedList(table.id);
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

async function renderUploadedList(connectionId) {
  const host = document.querySelector('#databaseUploadList');
  if (!host) return;

  const files = await getUploadedFiles(connectionId);
  if (files.length === 0) {
    host.innerHTML = '<span>当前表暂无上传资料</span>';
    return;
  }

  host.innerHTML = files
    .slice(0, 6)
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
