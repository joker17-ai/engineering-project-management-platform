import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('第一个页面有独立入口容器，后台默认隐藏', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

  assert.match(html, /id="accessGate"/);
  assert.match(html, /class="admin-shell" hidden/);
  assert.match(html, /assets\/blue-arrow-logo\.jpg/);
});

test('入口页模式强制隐藏第二页面后台', async () => {
  const css = await readFile(new URL('../styles.css', import.meta.url), 'utf8');

  assert.match(css, /\[hidden\]\s*\{[\s\S]*display:\s*none\s*!important/);
  assert.match(css, /body\.access-mode \.admin-shell\s*\{[\s\S]*display:\s*none\s*!important/);
  assert.match(css, /body:not\(\.access-mode\) \.access-gate\s*\{[\s\S]*display:\s*none\s*!important/);
});

test('入口流程包含项目建立和登录验证', async () => {
  const app = await readFile(new URL('../src/app.mjs', import.meta.url), 'utf8');

  assert.match(app, /建立第一个项目/);
  assert.match(app, /项目登录验证/);
  assert.match(app, /MOCK_VERIFY_CODE = '202620'/);
  assert.match(app, /blue_arrow_project_profile_v1/);
  assert.match(app, /blue_arrow_project_session_v1/);
});
