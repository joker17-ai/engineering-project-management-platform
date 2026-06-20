export const githubRepository = {
  owner: 'joker17-ai',
  name: 'engineering-project-management-platform',
  url: 'https://github.com/joker17-ai/engineering-project-management-platform',
  cloneUrl: 'https://github.com/joker17-ai/engineering-project-management-platform.git',
  branch: 'main',
  dataFolders: ['data/projects', 'data/documents', 'data/progress', 'data/public-notices'],
};

export const moduleCatalog = [
  { id: 'overview', name: '项目总览舱' },
  { id: 'structure', name: '项目结构树' },
  { id: 'participants', name: '参建单位与管理' },
  { id: 'network', name: '时标网络图' },
  { id: 'quantity', name: '工程量进度控制图' },
  { id: 'quality', name: '质量控制图' },
  { id: 'safety', name: '安全隐患树状图' },
  { id: 'acceptance', name: '隐蔽工程与验收管理' },
  { id: 'drawings', name: '图纸与现场取证' },
  { id: 'investment', name: '进度与投资报表' },
  { id: 'archive', name: '档案资料管理' },
  { id: 'templates', name: '模板与扩展中心' },
  { id: 'intelligence', name: '数据智能中心' },
];

export const currentProject = {
  id: 'line-site-2',
  name: '工程线位点二综合治理项目',
  shortName: '自动测试项目',
  region: '工程线位点二',
  stage: '资料建库与后台管理',
  section: '第一标段',
  manager: '蓝箭项目办公室',
  repositoryPath: 'data/projects/line-site-2.json',
  tree: {
    id: 'project-root',
    name: '工程线位点二综合治理项目',
    type: '项目',
    status: '推进中',
    children: [
      {
        id: 'section-001',
        name: '第一标段',
        type: '标段',
        status: '重点推进',
        children: [
          {
            id: 'civil-unit',
            name: '溢洪道加固工程',
            type: '单位工程',
            status: '动态目录',
            children: [
              { id: 'civil-001', name: '开挖、衬砌、消能防护', type: '单元工程', status: '未开工' },
              { id: 'civil-002', name: '边坡清理与排水复核', type: '单元工程', status: '未开工' },
            ],
          },
          {
            id: 'electrical-unit',
            name: '电气与安全监测工程',
            type: '单位工程',
            status: '动态目录',
            children: [{ id: 'electrical-001', name: '控制柜、照明及接地检测', type: '单元工程', status: '未开工' }],
          },
          {
            id: 'survey-unit',
            name: '测量与上图入库资料',
            type: '单位工程',
            status: '动态目录',
            children: [{ id: 'survey-001', name: '地块矢量坐标与工程点位', type: '单元工程', status: '未开工' }],
          },
          {
            id: 'archive-unit',
            name: '档案资料管理',
            type: '单位工程',
            status: '动态目录',
            children: [{ id: 'archive-001', name: '项目资料归档与公开摘要', type: '单元工程', status: '进行中' }],
          },
        ],
      },
    ],
  },
};

export const moduleDetails = {
  overview: [
    { name: '当前项目状态', status: '推进中', note: '聚焦当前项目，不混合显示其他项目内容。' },
    { name: 'GitHub 数据托管', status: '已关联', note: githubRepository.cloneUrl },
    { name: 'DeepSeek R1 接入', status: '预留接口', note: '资料解析成果进入待确认状态后再写入正式结构。' },
  ],
  structure: [
    { name: '溢洪道加固工程', status: '动态目录', note: '下挂开挖、衬砌、消能防护等单元工程。' },
    { name: '电气与安全监测工程', status: '动态目录', note: '下挂控制柜、照明、接地检测。' },
    { name: '测量与上图入库资料', status: '动态目录', note: '下挂坐标、地块矢量、工程点位。' },
  ],
  participants: [
    { name: '项目法人', status: '已预留', note: '项目代码与初始密码由管理者统一分配。' },
    { name: '总承包单位', status: '已预留', note: '可查看结构树、进度、质量和资料填报项。' },
    { name: '其他管理者', status: '可新增', note: '预留后续权限分配和审计日志。' },
  ],
  network: [
    { name: '设计交底与资料导入', status: '关键节点', note: '作为网络图第一道前置条件。' },
    { name: '基础处理与开挖', status: '关键线路', note: '后续由 AI 解析施工组织设计形成工期关系。' },
    { name: '联合验收与备案', status: '收口节点', note: '关联档案归集和公众公开摘要。' },
  ],
  quantity: [
    { name: '开挖、衬砌、消能防护', status: '未开工', note: '计划工程量 100，完成 0。' },
    { name: '控制柜、照明及接地检测', status: '未开工', note: '计划工程量 100，完成 0。' },
    { name: '地块矢量坐标与工程点位', status: '未开工', note: '计划工程量 100，完成 0。' },
  ],
  quality: [
    { name: '基础处理质量控制', status: '待确认', note: '隐蔽验收、影像取证、处理范围闭合。' },
    { name: '接地检测质量控制', status: '待确认', note: '接地电阻、接地电导率和送电前验收。' },
    { name: '资料上链质量控制', status: '进行中', note: '公开资料脱敏、文件命名、提交记录可追溯。' },
  ],
  safety: [
    { name: '临边作业风险', status: '关注', note: '围挡、防护栏和警示标识每日巡检。' },
    { name: '雨季排水风险', status: '关注', note: '临排、防护和巡检记录闭环。' },
    { name: '临时用电风险', status: '关注', note: '接地、漏保和电箱巡查。' },
  ],
  acceptance: [
    { name: '基础面隐蔽验收', status: '待验收', note: '进入下一道工序前必须完成。' },
    { name: '接地与监测管线验收', status: '待验收', note: '设备送电和隐蔽覆盖前完成。' },
    { name: '联合验收备案', status: '待备案', note: '上级质量监督单位备案。' },
  ],
  drawings: [
    { name: '施工图纸目录', status: '待导入', note: '支持 PDF、DWG、JPG、PNG、ZIP。' },
    { name: '现场照片取证', status: '待导入', note: '预留点位、时间、坐标、角度字段。' },
    { name: '图纸版本比对', status: '预留接口', note: '后续接 OCR、CAD、PDF 解析服务。' },
  ],
  investment: [
    { name: '周报汇总', status: '进行中', note: '按单元工程完成量汇总。' },
    { name: '月报汇总', status: '待生成', note: '读取投标清单单价后生成投资进度。' },
    { name: '拨款依据', status: '预留接口', note: '完成工程量乘以投标单价。' },
  ],
  archive: [
    { name: '立项文件', status: '待补全', note: 'data/documents/approvals' },
    { name: '测绘成果', status: '进行中', note: 'data/documents/survey' },
    { name: '公众公开公告', status: '已建立', note: 'data/public-notices' },
  ],
  templates: [
    { name: '水利工程模板', status: '可扩展', note: '预留 SL/T 824-2024 档案编码规则。' },
    { name: '高标准农田模板', status: '可扩展', note: '预留 NY/T 4730-2025 档案规范。' },
    { name: '质量安全模板', status: '可扩展', note: '可复用到其他工程项目。' },
  ],
  intelligence: [
    { name: '资料导入解析', status: '可演示', note: '前端原型阶段先按文件目录与关键字段模拟。' },
    { name: 'DeepSeek R1 专项服务', status: '待接入', note: '正式阶段由后端调用并回写待确认成果。' },
    { name: 'GitHub 数据同步', status: '已关联', note: '项目数据以 data/ 目录承载。' },
  ],
};

export const progressItems = [
  { id: 'DY-001', task: '开挖、衬砌、消能防护', status: '未开工', done: 0, amount: 236000 },
  { id: 'DY-002', task: '控制柜、照明及接地检测', status: '未开工', done: 0, amount: 128000 },
  { id: 'DY-003', task: '地块矢量坐标与工程点位', status: '未开工', done: 0, amount: 86000 },
];

export function flattenTree(node, depth = 0, parentId = null) {
  const current = { ...node, depth, parentId };
  return [current, ...(node.children ?? []).flatMap((child) => flattenTree(child, depth + 1, node.id))];
}

export function getStats(project = currentProject) {
  const nodes = flattenTree(project.tree);
  return {
    unitCount: nodes.filter((node) => node.type === '单位工程').length,
    divisionCount: nodes.filter((node) => node.type === '分部工程').length,
    cellCount: nodes.filter((node) => node.type === '单元工程').length,
    mapStorage: 0,
  };
}

export function getSecondaryItems(moduleId) {
  if (moduleId === 'structure') return flattenTree(currentProject.tree).filter((node) => node.depth > 1);
  return moduleDetails[moduleId] ?? [];
}
