export const githubRepository = {
  owner: 'joker17-ai',
  name: 'engineering-project-management-platform',
  url: 'https://github.com/joker17-ai/engineering-project-management-platform',
  cloneUrl: 'https://github.com/joker17-ai/engineering-project-management-platform.git',
  branch: 'main',
  dataFolders: ['data/projects', 'data/documents', 'data/progress', 'data/public-notices'],
};

export const modules = [
  { id: 'overview', name: '项目总览' },
  { id: 'structure', name: '工程结构' },
  { id: 'github', name: 'GitHub 数据中心' },
  { id: 'progress', name: '进度与投资' },
  { id: 'quality', name: '质量安全' },
  { id: 'archive', name: '资料归档' },
  { id: 'public', name: '公众公开' },
];

export const projects = [
  {
    id: 'line-site-2',
    name: '工程线位点二综合治理项目',
    publicName: '蓝箭公众项目样板工程',
    region: '工程线位点二',
    stage: '资料建库与公开协同',
    manager: '蓝箭项目办公室',
    section: '第二线位标段',
    repositoryPath: 'data/projects/line-site-2.json',
    tree: {
      id: 'root',
      name: '工程线位点二综合治理项目',
      type: '项目',
      status: '推进中',
      children: [
        {
          id: 'section-2',
          name: '第二线位标段',
          type: '标段',
          status: '重点推进',
          children: [
            {
              id: 'survey',
              name: '线位复核与现场测绘',
              type: '单位工程',
              status: '进行中',
              children: [
                { id: 'survey-control', name: '控制点复测', type: '分部工程', status: '进行中' },
                { id: 'survey-boundary', name: '边界与红线核验', type: '分部工程', status: '待确认' },
              ],
            },
            {
              id: 'civil',
              name: '土建与附属工程',
              type: '单位工程',
              status: '进行中',
              children: [
                { id: 'civil-foundation', name: '基础处理', type: '分部工程', status: '关键线路' },
                { id: 'civil-road', name: '通行便道与围挡', type: '分部工程', status: '进行中' },
                { id: 'civil-drainage', name: '临排与防护', type: '分部工程', status: '待开工' },
              ],
            },
            {
              id: 'digital',
              name: '数字化资料与公众公开',
              type: '单位工程',
              status: '资料建库',
              children: [
                { id: 'digital-github', name: 'GitHub 数据目录', type: '分部工程', status: '已关联' },
                { id: 'digital-public', name: '公众公开看板', type: '分部工程', status: '搭建中' },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: 'template-public',
    name: '公众项目模板库',
    publicName: '蓝箭公共工程模板',
    region: '跨项目模板',
    stage: '可复用模板',
    manager: '蓝箭数据中心',
    section: '模板标段',
    repositoryPath: 'data/projects/template-public.json',
    tree: {
      id: 'template-root',
      name: '公众项目模板库',
      type: '项目',
      status: '维护中',
      children: [
        {
          id: 'template-section',
          name: '模板标段',
          type: '标段',
          status: '可复用',
          children: [
            { id: 'template-docs', name: '资料目录模板', type: '单位工程', status: '可复用' },
            { id: 'template-risk', name: '质量安全模板', type: '单位工程', status: '可复用' },
          ],
        },
      ],
    },
  },
];

export const progressItems = [
  { id: 'P-001', task: '控制点复测与坐标成果入库', owner: '测绘单位', planned: 100, done: 72, amount: 128000, status: 'warn' },
  { id: 'P-002', task: '基础处理施工准备', owner: '施工单位', planned: 100, done: 38, amount: 236000, status: 'risk' },
  { id: 'P-003', task: '临时通行便道与围挡', owner: '总承包单位', planned: 100, done: 61, amount: 184000, status: 'warn' },
  { id: 'P-004', task: 'GitHub 数据目录初始化', owner: '蓝箭数据中心', planned: 100, done: 100, amount: 0, status: 'ok' },
  { id: 'P-005', task: '公众公开看板内容校核', owner: '项目办公室', planned: 100, done: 45, amount: 32000, status: 'warn' },
];

export const qualityItems = [
  { scope: '控制点复测', control: '坐标系、点位编号、高程成果三方复核', owner: '测绘单位 / 监理单位', status: 'warn' },
  { scope: '基础处理', control: '隐蔽验收、影像取证、处理范围闭合', owner: '施工单位 / 监理单位', status: 'risk' },
  { scope: '临排与防护', control: '雨季排水、防护栏、临边警示每日巡检', owner: '安全员', status: 'warn' },
  { scope: '资料上链', control: '公开资料脱敏、文件命名、提交记录可追溯', owner: '蓝箭数据中心', status: 'ok' },
];

export const archiveItems = [
  { name: '项目立项与授权资料', folder: 'data/documents/approvals', status: '待补全' },
  { name: '工程线位点二测绘成果', folder: 'data/documents/survey', status: '进行中' },
  { name: '进度周报与投资台账', folder: 'data/progress/weekly', status: '进行中' },
  { name: '质量安全巡检记录', folder: 'data/documents/quality-safety', status: '待审核' },
  { name: '公众公开公告', folder: 'data/public-notices', status: '已建立' },
];

export const publicNotices = [
  { title: '工程线位点二项目公开台账已建立', date: '2026-06-20', level: '公开' },
  { title: '施工准备阶段资料正在归集', date: '2026-06-20', level: '公开摘要' },
  { title: '质量安全问题采用闭环编号追踪', date: '2026-06-20', level: '公开摘要' },
];

export function flattenTree(node, depth = 0, parentId = null) {
  const current = { ...node, depth, parentId };
  const children = node.children ?? [];
  return [current, ...children.flatMap((child) => flattenTree(child, depth + 1, node.id))];
}

export function getProjectStats(project = projects[0]) {
  const nodes = flattenTree(project.tree);
  return {
    nodeCount: nodes.length,
    unitCount: nodes.filter((node) => node.type === '单位工程').length,
    activeProgress: Math.round(progressItems.reduce((sum, item) => sum + item.done, 0) / progressItems.length),
    githubFolders: githubRepository.dataFolders.length,
  };
}

export function calculateInvestment(items = progressItems) {
  return items.reduce((sum, item) => sum + item.amount * (item.done / 100), 0);
}
