export function createReservoirProjectTree(projectName = '清水河县石峡口水库除险加固工程') {
  return {
    id: 'project-root',
    name: projectName,
    type: '项目',
    status: '进行中',
    children: [
      {
        id: 'bid-001',
        name: '第一标段',
        type: '标段',
        status: '重点推进',
        children: [
          {
            id: 'dam-reinforcement',
            name: '大坝除险加固工程',
            type: '单位工程',
            status: '关键线路',
            children: [
              {
                id: 'dam-crest',
                name: '坝顶工程',
                type: '分部工程',
                status: '施工中',
                children: [
                  { id: 'dam-wave-wall', name: '坝顶防浪墙拆除重建', type: '单元工程', status: '施工中' },
                  { id: 'dam-crest-road', name: '坝顶路面及路缘石重建', type: '单元工程', status: '未开工' },
                ],
              },
              {
                id: 'upstream-slope',
                name: '上游护坡工程',
                type: '分部工程',
                status: '施工中',
                children: [
                  { id: 'upstream-cleaning', name: '近坝散落石和浮土层清理', type: '单元工程', status: '施工中' },
                  { id: 'upstream-riprap', name: '坝脚抛石防护', type: '单元工程', status: '未开工' },
                  { id: 'upstream-dry-masonry', name: '干砌石塌陷破损拆除重建', type: '单元工程', status: '未开工' },
                ],
              },
              {
                id: 'downstream-slope',
                name: '下游护坡工程',
                type: '分部工程',
                status: '未开工',
                children: [
                  { id: 'downstream-dry-masonry', name: '马道以上干砌石护坡重做', type: '单元工程', status: '未开工' },
                  { id: 'downstream-drainage', name: '马道清理平整及排水沟重做', type: '单元工程', status: '未开工' },
                  { id: 'arch-ring-repair', name: '浆砌石拱形圈修补及植草', type: '单元工程', status: '未开工' },
                  { id: 'c15-rockfill', name: '泄洪洞出口右岸坝坡C15块石混凝土回填', type: '单元工程', status: '未开工' },
                ],
              },
              {
                id: 'flood-tunnel',
                name: '泄洪洞及斜廊道工程',
                type: '分部工程',
                status: '关键线路',
                children: [
                  { id: 'tunnel-wall-raise', name: '泄洪洞右岸上游挡墙加高', type: '单元工程', status: '未开工' },
                  { id: 'gallery-grouting', name: '斜廊道固结灌浆', type: '单元工程', status: '施工中' },
                  { id: 'gallery-crack-repair', name: '斜廊道裂缝化学灌浆处理', type: '单元工程', status: '未开工' },
                  { id: 'gate-room-bridge', name: '检修闸门启闭机房和人行桥拆除重建', type: '单元工程', status: '未开工' },
                ],
              },
            ],
          },
          {
            id: 'spillway-reinforcement',
            name: '溢洪道加固工程',
            type: '单位工程',
            status: '关键线路',
            children: [
              {
                id: 'spillway-excavation',
                name: '溢洪道开挖及基础处理',
                type: '分部工程',
                status: '施工中',
                children: [
                  { id: 'slope-clearing', name: '边坡危岩清理及排水设施检查', type: '单元工程', status: '施工中' },
                  { id: 'foundation-excavation', name: '基础面开挖轮廓及高程复核', type: '单元工程', status: '施工中' },
                  { id: 'geology-treatment', name: '地质缺陷处理及隐蔽验收', type: '单元工程', status: '未开工' },
                ],
              },
              {
                id: 'approach-channel',
                name: '引渠段工程',
                type: '分部工程',
                status: '未开工',
                children: [
                  { id: 'approach-wing-wall', name: '引渠八字翼墙钢筋混凝土衬砌', type: '单元工程', status: '未开工' },
                  { id: 'approach-slab', name: '引渠底板浇筑及高程复核', type: '单元工程', status: '未开工' },
                ],
              },
              {
                id: 'control-section',
                name: '控制段驼峰堰工程',
                type: '分部工程',
                status: '未开工',
                children: [
                  { id: 'old-slab-removal', name: '现状底板拆除', type: '单元工程', status: '未开工' },
                  { id: 'hump-weir', name: '驼峰堰钢筋混凝土浇筑', type: '单元工程', status: '未开工' },
                ],
              },
              {
                id: 'chute-section',
                name: '泄槽段工程',
                type: '分部工程',
                status: '未开工',
                children: [
                  { id: 'rectangular-chute', name: '矩形泄槽段衬砌', type: '单元工程', status: '未开工' },
                  { id: 'transition-chute', name: '矩形至梯形过渡段衬砌', type: '单元工程', status: '未开工' },
                  { id: 'trapezoid-chute', name: '等腰梯形泄槽段衬砌', type: '单元工程', status: '未开工' },
                  { id: 'dark-drainage', name: '泄槽底板管网状暗排水系统', type: '单元工程', status: '未开工' },
                ],
              },
              {
                id: 'energy-dissipation',
                name: '消能防护段工程',
                type: '分部工程',
                status: '未开工',
                children: [
                  { id: 'energy-slab-wall', name: '消能防护段底板及边墙浇筑', type: '单元工程', status: '未开工' },
                  { id: 'energy-drainage-hole', name: '排水孔及无砂混凝土回填', type: '单元工程', status: '未开工' },
                  { id: 'river-channel-smoothing', name: '末端疏浚归顺入河床', type: '单元工程', status: '未开工' },
                ],
              },
            ],
          },
          {
            id: 'traffic-bridge',
            name: '溢洪道交通桥工程',
            type: '单位工程',
            status: '待开工',
            children: [
              {
                id: 'bridge-rebuild',
                name: '交通桥拆除重建',
                type: '分部工程',
                status: '未开工',
                children: [
                  { id: 'bridge-sidewall-removal', name: '交通桥及侧墙拆除', type: '单元工程', status: '未开工' },
                  { id: 'bridge-hollow-slab', name: '预应力混凝土空心板安装', type: '单元工程', status: '未开工' },
                  { id: 'bridge-bearing-road', name: '橡胶支座及左右岸道路衔接', type: '单元工程', status: '未开工' },
                ],
              },
            ],
          },
          {
            id: 'electrical-monitoring',
            name: '电气与安全监测工程',
            type: '单位工程',
            status: '资料准备',
            children: [
              {
                id: 'electrical-rebuild',
                name: '启闭机房电气设备重建',
                type: '分部工程',
                status: '未开工',
                children: [
                  { id: 'control-cabinet', name: '启闭机房控制柜拆除重建', type: '单元工程', status: '未开工' },
                  { id: 'lighting-box', name: '检修桥车控制箱及照明设备重建', type: '单元工程', status: '未开工' },
                  { id: 'grounding-test', name: '电气接地电阻与接地电导率检测', type: '单元工程', status: '未开工' },
                ],
              },
              {
                id: 'gate-metal',
                name: '闸门及启闭设备维护',
                type: '分部工程',
                status: '未开工',
                children: [
                  { id: 'gate-anticorrosion', name: '检修闸门和工作闸门门体防腐', type: '单元工程', status: '未开工' },
                  { id: 'gate-waterstop', name: '工作闸门止水更换', type: '单元工程', status: '未开工' },
                  { id: 'hoist-maintenance', name: '卷扬机维护保养', type: '单元工程', status: '未开工' },
                ],
              },
              {
                id: 'safety-monitoring',
                name: '安全监测设施',
                type: '分部工程',
                status: '未开工',
                children: [
                  { id: 'monitoring-layout', name: '安全监测设施安装与调试', type: '单元工程', status: '未开工' },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
}

export function createProjectTree(projectName = '清水河县石峡口水库除险加固工程') {
  return createReservoirProjectTree(projectName);
}

export function createFarmlandProjectTree(projectName = '内蒙古*****高标准农田项目管理') {
  return {
    id: 'farmland-root',
    name: projectName,
    type: '项目',
    status: '模板预留',
    children: [
      {
        id: 'farmland-bid-001',
        name: '第一标段',
        type: '标段',
        status: '模板预留',
        children: [
          {
            id: 'farmland-irrigation',
            name: '灌溉与排水工程',
            type: '单位工程',
            status: '模板预留',
            children: [
              { id: 'farmland-channel', name: '渠道工程', type: '分部工程', status: '模板预留' },
              { id: 'farmland-pipe', name: '管道工程', type: '分部工程', status: '模板预留' },
            ],
          },
          {
            id: 'farmland-road',
            name: '田间道路工程',
            type: '单位工程',
            status: '模板预留',
            children: [{ id: 'farmland-main-road', name: '机耕道路基', type: '单元工程', status: '模板预留' }],
          },
          {
            id: 'farmland-land',
            name: '田块整治工程',
            type: '单位工程',
            status: '模板预留',
            children: [{ id: 'farmland-leveling', name: '土地平整', type: '单元工程', status: '模板预留' }],
          },
        ],
      },
    ],
  };
}

export const projectPortfolio = [
  {
    id: 'project-001',
    name: '清水河县石峡口水库除险加固工程',
    region: '内蒙古自治区呼和浩特市清水河县',
    stage: '设计交底资料导入',
    tree: createReservoirProjectTree('清水河县石峡口水库除险加固工程'),
  },
  {
    id: 'project-002',
    name: '内蒙古*****高标准农田项目管理',
    region: '内蒙古自治区',
    stage: '行业模板预留',
    tree: createFarmlandProjectTree('内蒙古*****高标准农田项目管理'),
  },
];

export const projectTree = projectPortfolio[0].tree;

export const sourceDocuments = [
  { name: '清水河县石峡口水库除险加固工程设计交底报告', type: 'DOCX', source: '设计交底', status: '已解析', evidence: '大坝、溢洪道、交通桥、斜廊道固结灌浆、裂缝处理' },
  { name: '清水河县石峡口水库除险加固工程初步设计报告的批复', type: 'PDF', source: '初设批复', status: '已入库', evidence: '批复文件来自初设报告及批复压缩包' },
  { name: '石峡口水库除险加固初步设计-报批稿', type: 'PDF', source: '初设报告', status: '已解析', evidence: '用于补充项目划分、工程规模和控制指标' },
  { name: '初设附图', type: 'PDF', source: '设计图纸', status: '已入库', evidence: '用于图纸资料库和现场取证点位挂接' },
  { name: '石峡口水库电气专业图纸', type: 'PDF', source: '电气图纸', status: '已解析', evidence: '用于电气与安全监测工程质量控制' },
  { name: '地质勘察报告及地质附图', type: 'PDF', source: '地质资料', status: '已入库', evidence: '用于基础开挖、边坡、灌浆和隐蔽验收控制' },
];

export const qualityScopes = {
  大坝除险加固工程: {
    rawMaterials: ['普通硅酸盐水泥42.5及以上', 'C15块石混凝土', '干砌石与浆砌石材料', '闸门防腐材料', '工作闸门止水材料', '灌浆水泥细度80um筛余量不大于5%'],
    processControls: ['坝顶防浪墙拆除重建质量', '坝顶路面及路缘石成型质量', '上游护坡清理与坝脚抛石', '下游干砌石护坡和马道排水沟', '固结灌浆孔距2m、孔深3m复核', '灌浆抬动变形值不大于0.2mm', '固结灌浆检查孔不少于灌浆孔总数5%', '隐蔽工程验收状态'],
  },
  溢洪道加固工程: {
    rawMaterials: ['钢筋屈服强度', '钢筋抗拉强度', '水泥安定性', '混凝土骨料级配', '无砂混凝土材料', '橡胶止水及排水材料'],
    processControls: ['土方明挖自上而下分层分段', '边坡危岩清理达到安全标准', '开挖高程和边线符合施工图', '基础面无积水且不扰动土体', '岩石边坡坡脚标高偏差控制', '引渠底板高程1422.30m、厚0.5m', '控制段堰顶高程1423.80m、过流净宽13m', '泄槽段总长318m衬砌质量', '消能防护段总长40m及排水孔', '隐蔽工程验收状态'],
  },
  溢洪道交通桥工程: {
    rawMaterials: ['预应力混凝土空心板', '板式橡胶支座', '桥面混凝土强度', '钢筋保护层厚度', '侧墙混凝土抗压强度'],
    processControls: ['交通桥及侧墙拆除验收', '桥面宽度10m复核', '净跨度12m复核', '预制板高度0.7m复核', '左右岸现状道路平顺衔接', '桥台支承位置和支座安装', '隐蔽工程验收状态'],
  },
  电气与安全监测工程: {
    rawMaterials: ['启闭机房控制柜', '检修桥车控制箱', '照明设备', '电缆与接地材料', '安全监测仪器', '闸门防腐涂层材料'],
    processControls: ['电气设备拆除重建记录', '控制柜回路检查', '照明设备安装测试', '接地电阻检测', '接地电导率检测', '监测仪器和电缆管线避让复核', '安全监测设施安装调试', '隐蔽工程验收状态'],
  },
};

export const progressItems = [
  { id: 'dy-001', unitWork: '大坝除险加固工程', item: '坝顶防浪墙拆除重建', plannedQuantity: 280, completedQuantity: 96, unit: 'm', tenderUnitPrice: 1180, status: 'warning' },
  { id: 'dy-002', unitWork: '溢洪道加固工程', item: '溢洪道开挖及基础处理', plannedQuantity: 370, completedQuantity: 148, unit: 'm', tenderUnitPrice: 920, status: 'warning' },
  { id: 'dy-003', unitWork: '溢洪道加固工程', item: '泄槽段钢筋混凝土衬砌', plannedQuantity: 318, completedQuantity: 64, unit: 'm', tenderUnitPrice: 2860, status: 'danger' },
  { id: 'dy-004', unitWork: '溢洪道交通桥工程', item: '交通桥拆除重建', plannedQuantity: 1, completedQuantity: 0, unit: '座', tenderUnitPrice: 420000, status: 'danger' },
  { id: 'dy-005', unitWork: '大坝除险加固工程', item: '斜廊道固结灌浆', plannedQuantity: 120, completedQuantity: 38, unit: '孔', tenderUnitPrice: 760, status: 'warning' },
  { id: 'dy-006', unitWork: '电气与安全监测工程', item: '启闭机房电气设备重建', plannedQuantity: 1, completedQuantity: 0, unit: '项', tenderUnitPrice: 185000, status: 'danger' },
];

export const scheduleItems = [
  { code: 'A1', task: '设计交底、图纸会审与开工准备', start: '2025-03-25', end: '2025-04-05', predecessor: '初设批复', floatDays: 0, critical: true },
  { code: 'A2', task: '溢洪道开挖及基础处理', start: '2025-04-06', end: '2025-04-28', predecessor: 'A1', floatDays: 0, critical: true },
  { code: 'A3', task: '引渠段、控制段和泄槽段衬砌', start: '2025-04-29', end: '2025-06-15', predecessor: 'A2', floatDays: 0, critical: true },
  { code: 'A4', task: '消能防护段及排水孔施工', start: '2025-06-16', end: '2025-07-05', predecessor: 'A3', floatDays: 3, critical: false },
  { code: 'B1', task: '大坝上游和下游护坡处理', start: '2025-04-10', end: '2025-06-05', predecessor: 'A1', floatDays: 6, critical: false },
  { code: 'B2', task: '斜廊道固结灌浆与裂缝处理', start: '2025-05-12', end: '2025-06-20', predecessor: 'A1', floatDays: 0, critical: true },
  { code: 'C1', task: '交通桥拆除重建', start: '2025-06-01', end: '2025-07-10', predecessor: 'A2', floatDays: 2, critical: false },
  { code: 'D1', task: '电气设备重建与安全监测设施安装', start: '2025-07-01', end: '2025-07-25', predecessor: 'B2/C1', floatDays: 0, critical: true },
  { code: 'E1', task: '联合验收、备案与档案归集', start: '2025-07-26', end: '2025-08-05', predecessor: 'D1', floatDays: 0, critical: true },
];

export const hiddenAcceptanceItems = [
  { part: '溢洪道基础面', trigger: '土方明挖完成后', check: '开挖剖面、边坡坡度、基础面无积水、地质缺陷处理', witnesses: '施工单位、监理工程师、设计单位', status: '待验收' },
  { part: '岩石边坡及基础轮廓', trigger: '相邻部位继续开挖前', check: '坡脚标高、坡面局部超欠挖、斜面不平整度', witnesses: '监理工程师、设计单位', status: '待验收' },
  { part: '泄槽底板暗排水系统', trigger: '底板混凝土浇筑前', check: '纵横向管网、排水孔间排距、无砂混凝土回填', witnesses: '施工单位、监理工程师', status: '待验收' },
  { part: '斜廊道固结灌浆', trigger: '灌浆结束7d后', check: '检查孔压水试验、透水率、孔段合格率、封孔质量', witnesses: '监理单位、设计单位、质量检测单位', status: '施工中' },
  { part: '斜廊道裂缝化学灌浆', trigger: '封闭试气和灌浆完成后', check: '裂缝分类、布孔间距、灌浆压力、封口修补质量', witnesses: '监理单位、设计单位、项目法人', status: '待验收' },
  { part: '电气接地与监测管线', trigger: '设备送电和隐蔽覆盖前', check: '接地电阻、接地电导率、电缆管线位置、监测仪器保护', witnesses: '监理单位、施工单位、检测单位', status: '待验收' },
];

export const archiveChecklist = [
  { name: '项目开工申请', owner: '监理工程师批复', status: '待批复' },
  { name: '设计交底报告及图纸会审记录', owner: '设计单位、监理单位、施工单位', status: '已入库' },
  { name: '初步设计报告及批复文件', owner: '项目法人', status: '已入库' },
  { name: '大坝及溢洪道施工图纸', owner: '设计单位', status: '已入库' },
  { name: '电气专业图纸', owner: '设计单位', status: '已入库' },
  { name: '地质勘察报告及地质附图', owner: '设计单位', status: '已入库' },
  { name: '隐蔽工程验收', owner: '设计单位、监理单位、项目法人共同验收', status: '待验收' },
  { name: '隐蔽工程验收备案', owner: '上一级质量监督单位', status: '待备案' },
  { name: '固结灌浆自动记录与质量检查报告', owner: '施工单位、质量检测单位', status: '施工中' },
  { name: '项目地块空间矢量坐标与高程', owner: '测绘单位', status: '待补充' },
  { name: '多方联合确认会议纪要', owner: '监理单位责任人', status: '待签认' },
];

export const mapStoragePlan = {
  phase: '字段与资料准备',
  interfaceIntegration: false,
  fields: ['项目立项信息', '实施过程信息', '验收信息', '地块矢量坐标', '工程点位坐标', '管护责任主体'],
};

export const mockDatabaseConnections = [
  {
    id: 'source-doc-db',
    name: '设计资料解析库',
    mode: '模拟连接',
    manualUpload: true,
    futureInterface: '设计单位文档接口',
    storagePath: '/mock-db/source-documents',
    acceptedFiles: ['PDF', 'DOC', 'DOCX', 'ZIP'],
    status: '已建立虚拟库',
    description: '用于存放设计交底、初设报告、批复、附图、电气图纸和地质资料，并生成项目划分基础数据。',
  },
  {
    id: 'drawing-db',
    name: '图纸资料库',
    mode: '模拟连接',
    manualUpload: true,
    futureInterface: '设计单位图纸接口',
    storagePath: '/mock-db/drawings',
    acceptedFiles: ['PDF', 'DWG', 'JPG', 'PNG'],
    status: '可手动上传',
    description: '用于暂存大坝、溢洪道、交通桥、电气专业图纸和现场取证点位资料。',
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
    description: '用于暂存开工申请、初设批复、隐蔽验收、会议纪要、签字盖章资料和备案回执。',
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
    description: '用于暂存原材料检测、灌浆自动记录、压水试验、平行检测、见证取样和质量评定资料。',
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
    description: '用于暂存投标清单单价、工程量清单和计量支付表，支撑进度投资自动计算。',
  },
  {
    id: 'map-storage-db',
    name: '上图入库预备库',
    mode: '模拟连接',
    manualUpload: true,
    futureInterface: '水利工程监管/档案接口',
    storagePath: '/mock-db/map-storage',
    acceptedFiles: ['SHP', 'GeoJSON', 'KML', 'XLSX', 'ZIP'],
    status: '字段预留',
    description: '用于暂存工程点位坐标、地块矢量坐标、高程、管护责任主体和上图入库电子档案。',
  },
];

export const moduleCatalog = [
  {
    id: 'dashboard',
    name: '项目总览舱',
    purpose: '集中展示项目划分、资料解析、质量、安全、进度、投资、档案和接口资料库的关键状态。',
    subitems: ['项目总体状态', '资料解析结果', '单位工程汇总', '分部工程汇总', '单元工程清单', '待审批资料'],
  },
  {
    id: 'tree',
    name: '项目结构树',
    purpose: '承载项目、标段、单位工程、分部工程、单元工程和工序的工程本体结构。',
    subitems: ['第一标段', '大坝除险加固工程', '溢洪道加固工程', '溢洪道交通桥工程', '电气与安全监测工程', '节点资料挂接'],
  },
  {
    id: 'participants',
    name: '参建单位与管理',
    purpose: '管理项目法人、项目总承包商、项目分包商、监理、设计、施工、检测、审价和供应商等单位及其权限。',
    subitems: ['项目法人', '项目总承包商', '项目分包商', '监理公司', '设计单位', '施工单位', '施工分包商', '质量检测单位', '审价机构', '材料供应商'],
  },
  {
    id: 'network',
    name: '时标网络图',
    purpose: '根据设计交底和工程逻辑建立关键线路、关键节点、总时差、自由时差和前置条件分析。',
    subitems: ['设计交底与开工准备', '溢洪道开挖及基础处理', '泄槽段衬砌', '斜廊道灌浆与裂缝处理', '电气与安全监测', '联合验收备案'],
  },
  {
    id: 'quantity-progress',
    name: '工程量进度控制图',
    purpose: '按标段、单位工程和单元工程展示计划工程量、实际完成量和红绿预警状态。',
    subitems: ['坝顶工程量', '溢洪道开挖工程量', '泄槽衬砌工程量', '交通桥工程量', '灌浆工程量', '电气设备工程量'],
  },
  {
    id: 'quality',
    name: '质量控制图',
    purpose: '把原材料、施工过程和隐蔽验收控制指标挂到单位工程和关键工序节点。',
    subitems: ['大坝除险加固质量指标', '溢洪道加固质量指标', '交通桥质量指标', '电气与监测质量指标', '班组执行表', '整改闭环'],
  },
  {
    id: 'safety',
    name: '安全隐患树状图',
    purpose: '按工程层级拆解安全风险，为安全员检查和班前教育提供依据。',
    subitems: ['高边坡开挖风险', '基坑与排水风险', '爆破与危岩清理风险', '灌浆施工风险', '临时用电风险', '交通桥吊装风险'],
  },
  {
    id: 'acceptance',
    name: '隐蔽工程与验收管理',
    purpose: '管理隐蔽验收、旁站、平行检测、见证取样和备案资料。',
    subitems: ['基础面隐蔽验收', '边坡开挖验收', '暗排水系统验收', '固结灌浆验收', '裂缝处理验收', '电气接地验收'],
  },
  {
    id: 'drawings',
    name: '图纸与现场取证',
    purpose: '管理图纸版本、图纸点位、现场照片、视频和测量取证。',
    subitems: ['大坝平面布置及剖面图', '溢洪道开挖图', '溢洪道结构图', '交通桥结构钢筋图', '电气专业图纸', '现场照片锚定'],
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
    subitems: ['开工申请', '设计交底', '初设批复', '施工图纸', '隐蔽验收', '备案资料'],
  },
  {
    id: 'templates',
    name: '模板与扩展中心',
    purpose: '沉淀水库除险加固、高标准农田、水利、农业、市政等工程模板和可扩展要素库。',
    subitems: ['水库除险加固模板', '高标准农田模板', '节点类型模板', '质量指标模板', '安全风险模板', '报表模板'],
  },
  {
    id: 'data-intelligence',
    name: '数据智能中心',
    purpose: '汇总工程本体关系、虚拟数据库、资料解析状态、风险预警和后续 AI 辅助分析入口。',
    subitems: ['资料自动解析库', '工程对象关系图', '虚拟数据库连接', '多源数据汇总', '风险自动预警', 'AI 辅助分析'],
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
  { id: 'source-document-table', name: '设计资料解析表', source: '数据智能中心', editable: true, rows: sourceDocuments },
  { id: 'project-node-table', name: '项目结构节点表', source: '项目结构树', editable: true, rows: projectNodeRows },
  { id: 'schedule-network-table', name: '时标网络计划表', source: '时标网络图', editable: true, rows: scheduleItems },
  { id: 'progress-investment-table', name: '进度投资清单表', source: '工程量进度控制图', editable: true, rows: progressRows },
  { id: 'quality-control-table', name: '质量控制指标表', source: '质量控制图', editable: true, rows: qualityRows },
  { id: 'hidden-acceptance-table', name: '隐蔽工程验收表', source: '隐蔽工程与验收管理', editable: true, rows: hiddenAcceptanceItems },
  { id: 'archive-document-table', name: '档案资料状态表', source: '档案资料管理', editable: true, rows: archiveChecklist.map((item, index) => ({ id: `archive-${index}`, ...item })) },
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
  { label: '质量范围', value: String(Object.keys(qualityScopes).length), suffix: '类单位工程' },
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
