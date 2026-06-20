import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { flattenTree, getProjectStats, githubRepository, projects } from '../src/data.mjs';

test('blue arrow platform uses the requested GitHub repository', () => {
  assert.equal(githubRepository.cloneUrl, 'https://github.com/joker17-ai/engineering-project-management-platform.git');
});

test('line site two project is the primary project', () => {
  assert.equal(projects[0].id, 'line-site-2');
  assert.match(projects[0].region, /工程线位点二/);
});

test('project tree can be flattened into dashboard stats', () => {
  const nodes = flattenTree(projects[0].tree);
  const stats = getProjectStats(projects[0]);
  assert.ok(nodes.length >= 10);
  assert.equal(stats.nodeCount, nodes.length);
  assert.ok(stats.unitCount >= 3);
});

test('github data folder contains the primary project record', async () => {
  const raw = await readFile(new URL('../data/projects/line-site-2.json', import.meta.url), 'utf8');
  const record = JSON.parse(raw);
  assert.equal(record.platform, '蓝箭项目管理平台');
  assert.equal(record.projectId, 'line-site-2');
});
