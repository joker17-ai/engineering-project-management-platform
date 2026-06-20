import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { currentProject, flattenTree, getStats, githubRepository, moduleCatalog } from '../src/data.mjs';

test('蓝箭平台使用用户提供的 GitHub 仓库', () => {
  assert.equal(githubRepository.cloneUrl, 'https://github.com/joker17-ai/engineering-project-management-platform.git');
});

test('工程线位点二是当前主项目', () => {
  assert.equal(currentProject.id, 'line-site-2');
  assert.match(currentProject.region, /工程线位点二/);
});

test('后台保留 13 个一级目录', () => {
  assert.equal(moduleCatalog.length, 13);
  assert.equal(moduleCatalog[0].name, '项目总览舱');
  assert.equal(moduleCatalog.at(-1).name, '数据智能中心');
});

test('项目结构树可以生成指标', () => {
  const nodes = flattenTree(currentProject.tree);
  const stats = getStats(currentProject);
  assert.ok(nodes.length >= 10);
  assert.equal(stats.unitCount, 4);
  assert.equal(stats.cellCount, 5);
});

test('GitHub data 目录包含主项目记录', async () => {
  const raw = await readFile(new URL('../data/projects/line-site-2.json', import.meta.url), 'utf8');
  const record = JSON.parse(raw);
  assert.equal(record.platform, '蓝箭项目管理平台');
  assert.equal(record.projectId, 'line-site-2');
});
