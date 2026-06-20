import test from 'node:test';
import assert from 'node:assert/strict';
import {
  projectTree,
  archiveChecklist,
  qualityScopes,
  progressItems,
  mapStoragePlan,
  mockDatabaseConnections,
  moduleCatalog,
  projectPortfolio,
  virtualDatabaseTables,
  scheduleItems,
  hiddenAcceptanceItems,
  sourceDocuments,
  calculateInvestmentTotal,
  flattenProjectTree,
} from '../src/data.mjs';

test('project tree is generated from the Shixiakou reservoir reinforcement source scope', () => {
  const names = flattenProjectTree(projectTree).map((node) => node.name);
  assert.ok(names.includes('清水河县石峡口水库除险加固工程'));
  assert.ok(names.includes('大坝除险加固工程'));
  assert.ok(names.includes('溢洪道加固工程'));
  assert.ok(names.includes('溢洪道交通桥工程'));
  assert.ok(names.includes('电气与安全监测工程'));
});

test('project tree keeps bid section naming and unit/division/cell hierarchy', () => {
  const nodes = flattenProjectTree(projectTree);
  assert.ok(nodes.some((node) => node.name === '第一标段' && node.type === '标段'));
  assert.ok(nodes.some((node) => node.name === '泄槽段工程' && node.type === '分部工程'));
  assert.ok(nodes.some((node) => node.name === '斜廊道固结灌浆' && node.type === '单元工程'));
});

test('project portfolio supports multiple project instances and keeps farmland as a template', () => {
  assert.ok(projectPortfolio.length >= 2);
  assert.equal(projectPortfolio[0].name, '清水河县石峡口水库除险加固工程');
  assert.ok(projectPortfolio.some((project) => project.name.includes('高标准农田')));
  assert.notEqual(projectPortfolio[0].id, projectPortfolio[1].id);
});

test('quality control covers reservoir unit works and key indicators from design disclosure', () => {
  assert.deepEqual(Object.keys(qualityScopes), ['大坝除险加固工程', '溢洪道加固工程', '溢洪道交通桥工程', '电气与安全监测工程']);
  assert.ok(qualityScopes['大坝除险加固工程'].processControls.includes('灌浆抬动变形值不大于0.2mm'));
  assert.ok(qualityScopes['溢洪道加固工程'].processControls.includes('控制段堰顶高程1423.80m、过流净宽13m'));
  assert.ok(qualityScopes['电气与安全监测工程'].processControls.includes('接地电阻检测'));
});

test('investment total is calculated from completed quantity and tender unit price', () => {
  assert.equal(calculateInvestmentTotal(progressItems), 461360);
});

test('schedule network includes critical route tasks', () => {
  assert.ok(scheduleItems.length >= 8);
  assert.ok(scheduleItems.some((item) => item.task === '溢洪道开挖及基础处理' && item.critical === true));
  assert.ok(scheduleItems.some((item) => item.task.includes('联合验收')));
});

test('hidden acceptance list covers foundation, grouting, crack repair and electrical checks', () => {
  const parts = hiddenAcceptanceItems.map((item) => item.part);
  assert.ok(parts.includes('溢洪道基础面'));
  assert.ok(parts.includes('斜廊道固结灌浆'));
  assert.ok(parts.includes('电气接地与监测管线'));
});

test('source documents record parsed design and approval materials', () => {
  assert.ok(sourceDocuments.some((item) => item.name.includes('设计交底') && item.status === '已解析'));
  assert.ok(sourceDocuments.some((item) => item.name.includes('电气专业图纸')));
  assert.ok(sourceDocuments.some((item) => item.name.includes('初步设计报告的批复')));
});

test('map storage remains field-and-document preparation in first stage', () => {
  assert.equal(mapStoragePlan.phase, '字段与资料准备');
  assert.equal(mapStoragePlan.interfaceIntegration, false);
  assert.deepEqual(mapStoragePlan.fields, ['项目立项信息', '实施过程信息', '验收信息', '地块矢量坐标', '工程点位坐标', '管护责任主体']);
});

test('archive checklist follows reservoir project document scope', () => {
  const names = archiveChecklist.map((item) => item.name);
  assert.ok(names.includes('项目开工申请'));
  assert.ok(names.includes('设计交底报告及图纸会审记录'));
  assert.ok(names.includes('固结灌浆自动记录与质量检查报告'));
});

test('mock database connections reserve manual upload sources before real permissions exist', () => {
  assert.equal(mockDatabaseConnections.length, 6);
  assert.ok(mockDatabaseConnections.every((connection) => connection.mode === '模拟连接'));
  assert.ok(mockDatabaseConnections.every((connection) => connection.manualUpload === true));
  assert.ok(mockDatabaseConnections.map((connection) => connection.name).includes('设计资料解析库'));
});

test('module catalog lists core management modules with clickable subitems', () => {
  assert.equal(moduleCatalog.length, 13);
  assert.ok(moduleCatalog.every((module) => module.subitems.length >= 4));
  assert.ok(moduleCatalog.map((module) => module.name).includes('项目总览舱'));
  assert.ok(moduleCatalog.map((module) => module.name).includes('时标网络图'));
  assert.ok(moduleCatalog.map((module) => module.name).includes('项目结构树'));
  assert.ok(moduleCatalog.find((module) => module.name === '质量控制图').subitems.includes('大坝除险加固质量指标'));
});

test('participant module keeps requested contractor and subcontractor ordering', () => {
  const participants = moduleCatalog.find((module) => module.name === '参建单位与管理').subitems;
  assert.deepEqual(participants.slice(0, 3), ['项目法人', '项目总承包商', '项目分包商']);
  const constructionIndex = participants.indexOf('施工单位');
  assert.equal(participants[constructionIndex + 1], '施工分包商');
});

test('virtual database tables are filled from project ontology and source documents', () => {
  assert.equal(virtualDatabaseTables.length, 8);
  assert.ok(virtualDatabaseTables.every((table) => table.editable === true));
  assert.ok(virtualDatabaseTables.find((table) => table.id === 'project-node-table').rows.some((row) => row.name === '第一标段'));
  assert.ok(virtualDatabaseTables.find((table) => table.id === 'source-document-table').rows.some((row) => row.name.includes('设计交底')));
});
