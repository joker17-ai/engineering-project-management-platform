import test from 'node:test';
import assert from 'node:assert/strict';
import {
  projectTree,
  qualityScopes,
  progressItems,
  mapStoragePlan,
  mockDatabaseConnections,
  moduleCatalog,
  projectPortfolio,
  virtualDatabaseTables,
  calculateInvestmentTotal,
  flattenProjectTree,
} from '../src/data.mjs';

test('project tree contains the first-version high-standard farmland scope', () => {
  const names = flattenProjectTree(projectTree).map((node) => node.name);
  assert.ok(names.includes('灌溉与排水工程'));
  assert.ok(names.includes('田间道路工程'));
  assert.ok(names.includes('田块整治工程'));
});

test('project tree uses bid section naming instead of project area naming', () => {
  const names = flattenProjectTree(projectTree).map((node) => node.name);
  assert.ok(names.includes('第一标段'));
  assert.equal(names.some((name) => name.includes('第一项目区')), false);
});

test('project portfolio supports multiple project instances with independent trees', () => {
  assert.ok(projectPortfolio.length >= 2);
  assert.ok(projectPortfolio.every((project) => project.name.includes('高标准农田项目管理')));
  assert.notEqual(projectPortfolio[0].id, projectPortfolio[1].id);
  assert.notEqual(projectPortfolio[0].tree.name, projectPortfolio[1].tree.name);
});

test('quality control covers the three confirmed high-frequency unit works', () => {
  assert.deepEqual(Object.keys(qualityScopes), ['灌溉与排水工程', '田间道路工程', '田块整治工程']);
  assert.ok(qualityScopes['灌溉与排水工程'].rawMaterials.includes('水泥抗压强度'));
  assert.ok(qualityScopes['田间道路工程'].processControls.includes('回填土密实度'));
});

test('investment total is calculated from completed quantity and tender unit price', () => {
  assert.equal(calculateInvestmentTotal(progressItems), 989100);
});

test('map storage is field-and-document preparation only in first version', () => {
  assert.equal(mapStoragePlan.phase, '字段与资料准备');
  assert.equal(mapStoragePlan.interfaceIntegration, false);
});

test('mock database connections reserve manual upload sources before real permissions exist', () => {
  assert.equal(mockDatabaseConnections.length, 5);
  assert.ok(mockDatabaseConnections.every((connection) => connection.mode === '模拟连接'));
  assert.ok(mockDatabaseConnections.every((connection) => connection.manualUpload === true));
  assert.ok(mockDatabaseConnections.map((connection) => connection.name).includes('工程量清单库'));
});

test('module catalog lists core management modules with clickable subitems', () => {
  assert.equal(moduleCatalog.length, 13);
  assert.ok(moduleCatalog.every((module) => module.subitems.length >= 4));
  assert.ok(moduleCatalog.map((module) => module.name).includes('项目总览舱'));
  assert.ok(moduleCatalog.map((module) => module.name).includes('时标网络图'));
  assert.ok(moduleCatalog.find((module) => module.name === '质量控制图').subitems.includes('三类单位工程质量指标库'));
});

test('participant module orders contractors and subcontractors in the requested positions', () => {
  const participants = moduleCatalog.find((module) => module.name === '参建单位与权限管理').subitems;
  assert.deepEqual(participants.slice(0, 3), ['项目法人', '项目总承包商', '项目分包商']);
  const constructionIndex = participants.indexOf('施工单位');
  assert.equal(participants[constructionIndex + 1], '施工分包商');
});

test('virtual database tables are filled from project ontology data and editable fields', () => {
  assert.equal(virtualDatabaseTables.length, 5);
  assert.ok(virtualDatabaseTables.every((table) => table.editable === true));
  assert.ok(virtualDatabaseTables.find((table) => table.id === 'project-node-table').rows.some((row) => row.name === '第一标段'));
  assert.ok(virtualDatabaseTables.find((table) => table.id === 'progress-investment-table').rows.some((row) => row.totalAmount === 646000));
});
