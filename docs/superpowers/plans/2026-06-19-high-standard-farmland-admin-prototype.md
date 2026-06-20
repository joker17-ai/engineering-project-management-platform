# High Standard Farmland Admin Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a black-background desktop management dashboard prototype for the first version of the engineering project management platform, focused on high-standard farmland projects.

**Architecture:** Use a static HTML/CSS/JavaScript prototype so it can run immediately in the workspace without installing dependencies. Put reusable project data and calculation helpers in JavaScript modules, then render the desktop admin UI from that data.

**Tech Stack:** HTML, CSS, vanilla JavaScript modules, Node built-in test runner, local HTTP preview.

---

## File Structure

- Create: `index.html` - desktop admin shell and semantic regions.
- Create: `styles.css` - black industrial visual system, layout, responsive desktop constraints.
- Create: `src/data.mjs` - sample high-standard farmland project tree, quality controls, progress, investment, archive, and map-storage data.
- Create: `src/app.mjs` - rendering, tab switching, node selection, progress and investment calculations.
- Create: `tests/data.test.mjs` - tests for project tree coverage, quality-control scope, investment calculation, and map-storage stage.

## Tasks

### Task 1: Data Model and Tests

**Files:**
- Create: `src/data.mjs`
- Create: `tests/data.test.mjs`

- [ ] **Step 1: Write failing tests**

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  projectTree,
  qualityScopes,
  progressItems,
  mapStoragePlan,
  calculateInvestmentTotal,
  flattenProjectTree,
} from '../src/data.mjs';

test('project tree contains the first-version high-standard farmland scope', () => {
  const names = flattenProjectTree(projectTree).map((node) => node.name);
  assert.ok(names.includes('灌溉与排水工程'));
  assert.ok(names.includes('田间道路工程'));
  assert.ok(names.includes('田块整治工程'));
});

test('quality control covers the three confirmed high-frequency unit works', () => {
  assert.deepEqual(Object.keys(qualityScopes), ['灌溉与排水工程', '田间道路工程', '田块整治工程']);
  assert.ok(qualityScopes['灌溉与排水工程'].rawMaterials.includes('水泥抗压强度'));
  assert.ok(qualityScopes['田间道路工程'].processControls.includes('回填土密实度'));
});

test('investment total is calculated from completed quantity and tender unit price', () => {
  assert.equal(calculateInvestmentTotal(progressItems), 989500);
});

test('map storage is field-and-document preparation only in first version', () => {
  assert.equal(mapStoragePlan.phase, '字段与资料准备');
  assert.equal(mapStoragePlan.interfaceIntegration, false);
});
```

- [ ] **Step 2: Run tests and verify they fail**

Run: `node --test tests/data.test.mjs`

Expected: FAIL because `src/data.mjs` does not exist.

- [ ] **Step 3: Implement data module**

Define `projectTree`, `qualityScopes`, `progressItems`, `mapStoragePlan`, `flattenProjectTree`, and `calculateInvestmentTotal`.

- [ ] **Step 4: Run tests and verify they pass**

Run: `node --test tests/data.test.mjs`

Expected: PASS.

### Task 2: Static Admin Layout

**Files:**
- Create: `index.html`
- Create: `styles.css`

- [ ] **Step 1: Build desktop shell**

Create a full-height admin page with left navigation, project tree column, central dashboard, and right detail panel.

- [ ] **Step 2: Apply black visual system**

Use black as the base color, with dark graphite panels, amber/green/red status accents, sharp engineering-style grid lines, and compact professional typography.

### Task 3: Interactive Rendering

**Files:**
- Create: `src/app.mjs`

- [ ] **Step 1: Render dashboard from data**

Render project overview metrics, project tree, quality controls, progress investment table, archive checklist, and map-storage preparation status.

- [ ] **Step 2: Add interaction**

Selecting a project tree node updates the right-side detail panel. Tab buttons switch between overview, quality, progress, archive, and map-storage views.

### Task 4: Verification

**Files:**
- Modify: none unless defects are found.

- [ ] **Step 1: Run automated tests**

Run: `node --test tests/data.test.mjs`

Expected: PASS.

- [ ] **Step 2: Start local preview**

Run: `py -m http.server 4173`

Open: `http://127.0.0.1:4173/`

- [ ] **Step 3: Browser QA**

Verify the app renders on a desktop viewport, black background is applied, tab switching works, tree node selection works, and no major text overlap appears.

