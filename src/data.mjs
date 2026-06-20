export const projectTree = {
  id: 'project-root',
  name: '内蒙古*****高标准农田项目',
  type: '项目',
  status: '进行中',
  children: [
    {
      id: 'area-a',
      name: '第一标段',
      type: '标段',
      status: '重点推进',
      children: [
        {
          id: 'irrigation',
          name: '灌溉与排水工程',
          type: '单位工程',
          status: '关键线路',
          children: [
            { id: 'channel', name: '渠道工程', type: '分部工程', status: '施工中' },
            { id: 'pipe', name: '管道工程', type: '分部工程', status: '待验收' },
            { id: 'sluice', name: '水闸工程', type: '分部工程', status: '资料待补' },
          ],
        },
        {
          id: 'road',
          name: '田间道路工程',
          type: '单位工程',
          status: '滞后预警',
          children: [
            { id: 'main-road', name: '机耕主路', type: '单元工程', status: '施工中' },
            { id: 'branch-road', name: '生产支路', type: '单元工程', status: '待开工' },
          ],
        },
        {
          id: 'land-leveling',
          name: '田块整治工程',
          type: '单位工程',
          status: '正常',
          children: [
            { id: 'leveling', name: '土地平整', type: '单元工程', status: '施工中' },
            { id: 'ridge', name: '田埂修筑', type: '单元工程', status: '待检测' },
          ],
        },
      ],
    },
  ],
};

export const qualityScopes = {
  灌溉与排水工程: {
    rawMaterials: [
      '钢筋屈服强度',
      '钢筋抗拉强度',
      '钢筋断后伸长率',
      '钢筋强屈比',
      '水泥细度',
      '水泥初凝时间',
      '水泥终凝时间',
      '水泥安定性',
      '水泥抗折强度',
      '水泥抗压强度',
      '砂、石颗粒级配',
      '碎石压碎值指标',
    ],
    processControls: ['混凝土坍落度', '管道开挖深度', '垫层厚度', '隐蔽工程验收状态'],
  },
  田间道路工程: {
    rawMaterials: [
      '碎石有机质含量',
      '碎石超逊径颗粒含量',
      '碎石软弱颗粒含量',
      '碎石抗冻性能',
      '碎石坚固性',
      '碎石针片状颗粒含量',
    ],
    processControls: ['含水量', '回填土密实度', '分层回填厚度', '路基压实度', '隐蔽工程验收状态'],
  },
  田块整治工程: {
    rawMaterials: ['土壤改良材料合格证明', '有机肥质量证明', '长丝纺粘针刺非织造土工布断裂强度'],
    processControls: ['平整度', '耕作层厚度', '田面高差', '边界坐标复核', '隐蔽工程验收状态'],
  },
};

export const progressItems = [
  {
    id: 'p1',
    unitWork: '灌溉与排水工程',
    item: '渠道衬砌',
    plannedQuantity: 1200,
    completedQuantity: 760,
    unit: 'm',
    tenderUnitPrice: 850,
    status: 'warning',
  },
  {
    id: 'p2',
    unitWork: '田间道路工程',
    item: '机耕路基层',
    plannedQuantity: 800,
    completedQuantity: 430,
    unit: 'm',
    tenderUnitPrice: 560,
    status: 'danger',
  },
  {
    id: 'p3',
    unitWork: '田块整治工程',
    item: '土地平整',
    plannedQuantity: 95,
    completedQuantity: 62,
    unit: '亩',
    tenderUnitPrice: 1650,
    status: 'ok',
  },
];

export const archiveChecklist = [
  { name: '项目正式立项批复文件', owner: '项目法人', status: '已归档' },
  { name: '初步设计及批复材料', owner: '设计单位', status: '已归档' },
  { name: '单位工程/分部工程/单元工程划分清单', owner: '监理公司', status: '待审批' },
  { name: '项目区地块空间矢量坐标', owner: '测绘单位', status: '待补充' },
  { name: '多方联合确认会议纪要', owner: '项目法人', status: '待签章' },
];

export const mapStoragePlan = {
  phase: '字段与资料准备',
  interfaceIntegration: false,
  fields: ['项目立项信息', '实施过程信息', '验收信息', '地块矢量坐标', '工程点位坐标', '管护责任主体'],
};

export const mockDatabaseConnections = [
  {
    id: 'drawing-db',
    name: '图纸资料库',
    mode: '模拟连接',
    manualUpload: true,
    futureInterface: '设计单位图纸接口',
    storagePath: '/mock-db/drawings',
    acceptedFiles: ['PDF', 'DWG', 'JPG', 'PNG'],
    status: '可手动上传',
    description: '用于暂存设计图纸、变更图纸、图纸版本比对资料，后续可对接设计单位或图纸云盘。',
  },
  {
    id: 'archive-db',
    name: '项目档案库',
    mode: '模拟连接',
    manualUpload: true,
    futureInterface: '档案管理系统接口',
    storagePath: '/mock-db/archives',
    acceptedFiles: ['PDF', 'DOC', 'DOCX', 'XLSX', 'ZIP'],
    status: '可手动上传',
    description: '用于暂存立项批复、初设批复、会议纪要、签字盖章资料、备案回执等归档文件。',
  },
  {
    id: 'quality-db',
    name: '质量检测库',
    mode: '模拟连接',
    manualUpload: true,
    futureInterface: '检测机构报告接口',
    storagePath: '/mock-db/quality-tests',
    acceptedFiles: ['PDF', 'XLSX', 'JPG', 'PNG'],
    status: '可手动上传',
    description: '用于暂存原材料检测、见证取样、平行检测、隐蔽验收和质量评定资料。',
  },
  {
    id: 'bill-db',
    name: '工程量清单库',
    mode: '模拟连接',
    manualUpload: true,
    futureInterface: '造价/投标清单接口',
    storagePath: '/mock-db/bill-of-quantities',
    acceptedFiles: ['XLS', 'XLSX', 'CSV'],
    status: '可手动上传',
    description: '用于暂存投标清单单价、工程量清单、计量支付表，支撑进度投资自动计算。',
  },
  {
    id: 'map-storage-db',
    name: '上图入库预备库',
    mode: '模拟连接',
    manualUpload: true,
    futureInterface: '农田建设监管平台接口',
    storagePath: '/mock-db/map-storage',
    acceptedFiles: ['SHP', 'GeoJSON', 'KML', 'XLSX', 'ZIP'],
    status: '字段预留',
    description: '用于暂存地块矢量坐标、工程点位坐标、管护主体和上图入库电子档案。',
  },
];

export const moduleCatalog = [
  {
    id: 'dashboard',
    name: '项目总览驾驶舱',
    purpose: '集中展示质量、安全、进度、投资、档案和接口资料库的关键状态。',
    subitems: ['项目总体状态', '关键节点预警', '质量问题汇总', '安全隐患汇总', '投资完成概览', '待审批资料'],
  },
  {
    id: 'tree',
    name: '项目结构树',
    purpose: '承载项目、标段、单位工程、分部工程、单元工程和工序的工程本体结构。',
    subitems: ['项目根节点', '标段管理', '单位工程划分', '分部工程划分', '单元工程划分', '节点资料挂接'],
  },
  {
    id: 'participants',
    name: '参建单位与权限管理',
    purpose: '管理项目法人、项目总承包商、项目分包商、监理、设计、施工、检测、审价和供应商等单位及其权限。',
    subitems: ['项目法人', '项目总承包商', '项目分包商', '监理公司', '设计单位', '施工单位', '施工分包商', '质量检测单位', '审价机构', '材料供应商'],
  },
  {
    id: 'network',
    name: '时标网络图',
    purpose: '建立关键线路、关键节点、总时差、自由时差和前置条件分析。',
    subitems: ['关键线路识别', '关键节点台账', '总时差标注', '自由时差标注', '雨季影响因素', '资金人员前置条件'],
  },
  {
    id: 'quantity-progress',
    name: '工程量进度控制图',
    purpose: '按标段和单位工程展示计划工程量、实际完成量和红绿预警状态。',
    subitems: ['计划工程量', '每日完成量', '横道图总图', '单位工程子图', '滞后红色预警', '完成绿色标识'],
  },
  {
    id: 'quality',
    name: '质量控制图',
    purpose: '把原材料、施工过程和隐蔽验收控制指标挂到单位工程和工序节点。',
    subitems: ['三类单位工程质量指标库', '原材料检测指标', '过程控制指标', '隐蔽工程验收状态', '班组执行表', '整改闭环'],
  },
  {
    id: 'safety',
    name: '安全隐患树状图',
    purpose: '按工程层级拆解安全风险，为安全员检查和班前教育提供依据。',
    subitems: ['危险源识别', '高边坡风险', '深基坑风险', '临时用电风险', '机械吊装风险', '每日安全教育'],
  },
  {
    id: 'acceptance',
    name: '隐蔽工程与验收管理',
    purpose: '管理隐蔽验收、旁站、平行检测、见证取样和备案资料。',
    subitems: ['隐蔽验收记录', '旁站监理记录', '平行检测记录', '见证取样记录', '设计质监见证', '验收备案资料'],
  },
  {
    id: 'drawings',
    name: '图纸与现场取证',
    purpose: '管理图纸版本、图纸点位、现场照片、视频和测量取证。',
    subitems: ['图纸版本库', '图纸标注', '现场照片锚定', '视频资料', '测量数据', '图纸变更比对'],
  },
  {
    id: 'investment',
    name: '进度与投资报表',
    purpose: '用完成工程量乘以投标清单单价，生成日报、周报、月报和投资进度。',
    subitems: ['日报', '周报', '月报', '投标清单单价', '完成工程直接费', '拨款依据'],
  },
  {
    id: 'archive',
    name: '档案资料管理',
    purpose: '管理前期文件、审批、签字、盖章、流转、保管和归档状态。',
    subitems: ['前期文件', '图纸文件', '会议纪要', '审批签章', '流转保管', '归档状态'],
  },
  {
    id: 'templates',
    name: '模板与扩展中心',
    purpose: '沉淀高标准农田、水利、农业、市政等工程模板和可扩展要素库。',
    subitems: ['行业模板', '节点类型模板', '质量指标模板', '安全风险模板', '资料目录模板', '报表模板'],
  },
  {
    id: 'data-intelligence',
    name: '数据智能中心',
    purpose: '汇总工程本体关系、虚拟数据库、风险预警和后续 AI 辅助分析入口。',
    subitems: ['工程对象关系图', '虚拟数据库连接', '多源数据汇总', '风险自动预警', 'AI 辅助分析', '项目知识库'],
  },
];

const projectNodeRows = flattenProjectTree(projectTree).map((node) => ({
  id: node.id,
  name: node.name,
  type: node.type,
  status: node.status,
  parentId: node.parentId ?? '无',
}));

const progressRows = progressItems.map((item) => ({
  id: item.id,
  name: item.item,
  unitWork: item.unitWork,
  plannedQuantity: item.plannedQuantity,
  completedQuantity: item.completedQuantity,
  unit: item.unit,
  tenderUnitPrice: item.tenderUnitPrice,
  totalAmount: item.completedQuantity * item.tenderUnitPrice,
}));

const qualityRows = Object.entries(qualityScopes).flatMap(([unitWork, scope]) => [
  ...scope.rawMaterials.map((name, index) => ({ id: `${unitWork}-raw-${index}`, unitWork, name, category: '原材料', status: '可编辑' })),
  ...scope.processControls.map((name, index) => ({ id: `${unitWork}-process-${index}`, unitWork, name, category: '过程控制', status: '可编辑' })),
]);

export const virtualDatabaseTables = [
  {
    id: 'project-node-table',
    name: '项目结构节点表',
    source: '项目结构树',
    editable: true,
    rows: projectNodeRows,
  },
  {
    id: 'progress-investment-table',
    name: '进度投资清单表',
    source: '工程量进度控制图',
    editable: true,
    rows: progressRows,
  },
  {
    id: 'quality-control-table',
    name: '质量控制指标表',
    source: '质量控制图',
    editable: true,
    rows: qualityRows,
  },
  {
    id: 'archive-document-table',
    name: '档案资料状态表',
    source: '档案资料管理',
    editable: true,
    rows: archiveChecklist.map((item, index) => ({ id: `archive-${index}`, ...item })),
  },
  {
    id: 'interface-source-table',
    name: '接口资料库连接表',
    source: '接口资料库',
    editable: true,
    rows: mockDatabaseConnections.map((connection) => ({
      id: connection.id,
      name: connection.name,
      mode: connection.mode,
      status: connection.status,
      storagePath: connection.storagePath,
      futureInterface: connection.futureInterface,
    })),
  },
];

export const dashboardStats = [
  { label: '项目节点容量', value: '30000', suffix: '节点预留' },
  { label: '一级栏目', value: '13', suffix: '个' },
  { label: '质量范围', value: '3', suffix: '类单位工程' },
  { label: '上图入库', value: '0', suffix: '接口对接' },
];

export function flattenProjectTree(node, depth = 0, parentId = null) {
  const current = { ...node, depth, parentId };
  const children = node.children ?? [];
  return [current, ...children.flatMap((child) => flattenProjectTree(child, depth + 1, node.id))];
}

export function calculateInvestmentTotal(items) {
  return items.reduce((total, item) => total + item.completedQuantity * item.tenderUnitPrice, 0);
}

export function calculateProgressPercent(item) {
  return Math.round((item.completedQuantity / item.plannedQuantity) * 100);
}
