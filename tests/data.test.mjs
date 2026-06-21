import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  confirmAiFindingIntoTree,
  currentProject,
  flattenTree,
  getPendingAiFindings,
  getStats,
  getAiFindings,
  githubRepository,
  moduleCatalog,
  moduleDetails,
} from '../src/data.mjs';

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

test('DeepSeek R1 模拟成果先进入待确认状态', () => {
  const findings = getPendingAiFindings();

  assert.ok(findings.length >= 3);
  assert.ok(findings.every((finding) => finding.status === '待项目管理者确认'));
  assert.deepEqual(
    findings[0].targets,
    ['单位工程', '分部工程', '单元工程', '时标网络图', '质量控制图', '档案编码'],
  );
});

test('图片图纸现场取证由硅基流动视觉接口处理，文字资料仍由 DeepSeek R1 处理', () => {
  assert.ok(moduleDetails.overview.some((item) => item.name === '项目总体状态'));
  assert.ok(moduleDetails.overview.some((item) => item.name === '待审批资料'));
  assert.ok(moduleDetails.drawings.some((item) => item.note.includes('硅基流动')));
  assert.ok(moduleDetails.intelligence.some((item) => item.name.includes('硅基流动')));
  assert.ok(moduleDetails.intelligence.some((item) => item.name.includes('DeepSeek R1')));

  const findings = getAiFindings();
  assert.ok(findings.some((finding) => finding.summary.includes('硅基流动') && finding.summary.includes('DeepSeek R1')));
});

test('AI 成果确认后才写入正式项目结构树', () => {
  const projectCopy = structuredClone(currentProject);
  const beforeNodes = flattenTree(projectCopy.tree);

  const result = confirmAiFindingIntoTree(projectCopy, 'ai-waterproofing-001');
  const afterNodes = flattenTree(result.project.tree);

  assert.equal(result.confirmedFinding.status, '已确认写入');
  assert.equal(afterNodes.length, beforeNodes.length + 3);
  assert.ok(afterNodes.some((node) => node.name === '防渗衬砌分部工程'));
  assert.ok(afterNodes.some((node) => node.name === '衬砌厚度检测单元'));
});
