import type { AppState, KnowledgeChunk } from '../types';

const planningArticle = `第一章 绪论\n\n第一节 研究背景与研究意义\n\n土地是民生之本、发展之基。科学编制土地利用总体规划，是落实最严格的耕地保护制度、优化国土空间开发保护格局的重要保障。\n\n一、规划管理\n\n土地利用总体规划实行分级审批。省、自治区、直辖市的土地利用总体规划，报国务院批准。省、自治区人民政府所在地的市、人口在一百万以上的城市以及国务院指定的城市的土地利用总体规划，经省、自治区人民政府审查同意后，报国务院批准。\n\n二、耕地保护\n\n国家实行永久基本农田保护制度。永久基本农田一经划定，任何单位和个人不得擅自占用或者改变用途。建设项目选址确实难以避让永久基本农田的，必须依法依规办理审批手续。\n\n三、用途管制\n\n国家实行土地用途管制制度。使用土地的单位和个人必须严格按照土地利用总体规划确定的用途使用土地。农用地转为建设用地，应当符合土地利用总体规划、土地利用年度计划和建设用地供应政策。`;

const chunks: KnowledgeChunk[] = [
  { id: 'chunk-001', documentId: 'doc-001', title: '土地利用总体规划编制审批规定', index: 1, page: 12, content: '土地利用总体规划实行分级审批。省、自治区、直辖市的土地利用总体规划，报国务院批准。', keywords: ['土地利用', '总体规划', '分级审批', '国务院'], enabled: true },
  { id: 'chunk-002', documentId: 'doc-001', title: '土地利用总体规划编制审批规定', index: 2, page: 14, content: '省、自治区人民政府所在地的市、人口在一百万以上的城市以及国务院指定城市的土地利用总体规划，经省、自治区人民政府审查同意后，报国务院批准。', keywords: ['土地利用', '城市规划', '审查', '国务院'], enabled: true },
  { id: 'chunk-003', documentId: 'doc-001', title: '土地利用总体规划编制审批规定', index: 3, page: 18, content: '土地利用年度计划应当根据国民经济和社会发展计划、国家产业政策、土地利用总体规划以及建设用地和土地利用的实际状况编制。', keywords: ['土地利用', '年度计划', '国民经济'], enabled: true },
  { id: 'chunk-004', documentId: 'doc-002', title: '中华人民共和国土地管理法', index: 1, page: 26, content: '国家实行永久基本农田保护制度。永久基本农田一经划定，任何单位和个人不得擅自占用或者改变用途。', keywords: ['永久基本农田', '耕地保护', '占用'], enabled: true },
  { id: 'chunk-005', documentId: 'doc-002', title: '中华人民共和国土地管理法', index: 2, page: 31, content: '国家实行土地用途管制制度。使用土地的单位和个人必须严格按照土地利用总体规划确定的用途使用土地。', keywords: ['用途管制', '土地用途', '总体规划'], enabled: true },
  { id: 'chunk-006', documentId: 'doc-002', title: '中华人民共和国土地管理法', index: 3, page: 44, content: '建设占用土地，涉及农用地转为建设用地的，应当办理农用地转用审批手续。', keywords: ['农用地', '建设用地', '转用审批'], enabled: true },
  { id: 'chunk-007', documentId: 'doc-003', title: '自然资源部行政许可事项清单', index: 1, page: 6, content: '建设项目用地预审与选址意见书由自然资源主管部门按照项目管理权限核发，办理时应提交申请表、项目依据和国土空间规划符合性材料。', keywords: ['用地预审', '选址意见书', '行政许可'], enabled: true },
  { id: 'chunk-008', documentId: 'doc-003', title: '自然资源部行政许可事项清单', index: 2, page: 9, content: '申请材料不齐全或者不符合法定形式的，应当当场或者在五个工作日内一次告知申请人需要补正的全部内容。', keywords: ['申请材料', '补正', '五个工作日'], enabled: true },
  { id: 'chunk-009', documentId: 'doc-004', title: '国土空间调查、规划、用途管制用地用海分类指南', index: 1, page: 16, content: '国土空间调查应当以现状为基础，按照统一的分类标准、调查规程和技术要求，真实、准确反映国土利用状况。', keywords: ['国土空间调查', '分类标准', '国土利用'], enabled: true },
  { id: 'chunk-010', documentId: 'doc-004', title: '国土空间调查、规划、用途管制用地用海分类指南', index: 2, page: 22, content: '耕地包括水田、水浇地和旱地，是主要用于种植农作物并经常进行耕作的土地。', keywords: ['耕地', '水田', '旱地'], enabled: true },
  { id: 'chunk-011', documentId: 'doc-002', title: '中华人民共和国土地管理法', index: 4, page: 57, content: '各级人民政府应当采取措施，全面规划，严格管理，保护、开发土地资源，制止非法占用土地的行为。', keywords: ['土地资源', '非法占用', '监督管理'], enabled: false },
  { id: 'chunk-012', documentId: 'doc-003', title: '自然资源部行政许可事项清单', index: 3, page: 13, content: '自然资源主管部门应当优化审批流程，推进网上办理，提高行政许可服务效率。', keywords: ['审批流程', '网上办理', '行政许可'], enabled: true },
];

export const initialState: AppState = {
  datasets: [
    { id: 'ds-001', name: '土地利用总体规划编制审批规定.txt', category: '政策法规', source: '本地上传', format: 'txt', size: '68 KB', status: 'ready', enabled: true, uploadedAt: '2026-10-28 09:32:18', content: planningArticle },
    { id: 'ds-002', name: '中华人民共和国土地管理法.txt', category: '法律法规', source: '本地上传', format: 'txt', size: '126 KB', status: 'ready', enabled: true, uploadedAt: '2026-10-27 16:20:42', content: planningArticle },
    { id: 'ds-003', name: '自然资源部行政许可事项清单.docx', category: '政务服务', source: '本地上传', format: 'docx', size: '94 KB', status: 'ready', enabled: true, uploadedAt: '2026-10-26 11:08:06', content: planningArticle },
    { id: 'ds-004', name: '国土空间用地用海分类指南.pdf', category: '技术标准', source: '本地上传', format: 'pdf', size: '2.4 MB', status: 'ready', enabled: true, uploadedAt: '2026-10-25 14:46:30', content: planningArticle },
    { id: 'ds-005', name: '永久基本农田保护政策汇编.docx', category: '政策法规', source: '本地上传', format: 'docx', size: '212 KB', status: 'processing', enabled: true, uploadedAt: '2026-10-24 10:15:22', content: planningArticle },
    { id: 'ds-006', name: '耕地保护监督管理工作指引.txt', category: '业务资料', source: '本地上传', format: 'txt', size: '74 KB', status: 'ready', enabled: true, uploadedAt: '2026-10-23 17:03:55', content: planningArticle },
    { id: 'ds-007', name: '建设用地审查报批材料规范.pdf', category: '政务服务', source: '本地上传', format: 'pdf', size: '1.8 MB', status: 'ready', enabled: false, uploadedAt: '2026-10-22 13:28:41', content: planningArticle },
    { id: 'ds-008', name: '国土空间规划城市设计指南.pdf', category: '技术标准', source: '本地上传', format: 'pdf', size: '3.1 MB', status: 'ready', enabled: true, uploadedAt: '2026-10-21 08:51:12', content: planningArticle },
    { id: 'ds-009', name: '自然资源调查监测体系方案.txt', category: '业务资料', source: '本地上传', format: 'txt', size: '83 KB', status: 'failed', enabled: false, uploadedAt: '2026-10-20 15:36:09', content: planningArticle },
    { id: 'ds-010', name: '生态保护红线管理问答.md', category: '知识问答', source: '本地上传', format: 'md', size: '42 KB', status: 'ready', enabled: true, uploadedAt: '2026-10-19 12:17:33', content: planningArticle },
    { id: 'ds-011', name: '不动产登记常见问题.txt', category: '知识问答', source: '本地上传', format: 'txt', size: '58 KB', status: 'ready', enabled: true, uploadedAt: '2026-10-18 09:44:26', content: planningArticle },
    { id: 'ds-012', name: '矿产资源规划编制要求.docx', category: '政策法规', source: '本地上传', format: 'docx', size: '106 KB', status: 'ready', enabled: true, uploadedAt: '2026-10-17 18:02:51', content: planningArticle },
  ],
  knowledgeBases: [
    { id: 'kb-001', name: '自然资源政策法规知识库', description: '收录土地管理、国土空间规划与耕地保护相关政策文件', documentCount: 4, chunkCount: 12, updatedAt: '2026-10-28 09:48:20', enabled: true },
    { id: 'kb-002', name: '不动产登记业务知识库', description: '不动产登记流程、材料与常见问题', documentCount: 0, chunkCount: 0, updatedAt: '2026-10-25 15:20:16', enabled: true },
    { id: 'kb-003', name: '文旅公共服务知识库', description: '景区信息、公共文化与旅游服务资料', documentCount: 0, chunkCount: 0, updatedAt: '2026-10-22 10:11:08', enabled: false },
  ],
  documents: [
    { id: 'doc-001', knowledgeId: 'kb-001', datasetId: 'ds-001', name: '土地利用总体规划编制审批规定.txt', format: 'txt', chunkCount: 3, status: 'ready', enabled: true, updatedAt: '2026-10-28 09:48:20' },
    { id: 'doc-002', knowledgeId: 'kb-001', datasetId: 'ds-002', name: '中华人民共和国土地管理法.txt', format: 'txt', chunkCount: 4, status: 'ready', enabled: true, updatedAt: '2026-10-27 16:35:10' },
    { id: 'doc-003', knowledgeId: 'kb-001', datasetId: 'ds-003', name: '自然资源部行政许可事项清单.docx', format: 'docx', chunkCount: 3, status: 'ready', enabled: true, updatedAt: '2026-10-26 11:20:32' },
    { id: 'doc-004', knowledgeId: 'kb-001', datasetId: 'ds-004', name: '国土空间用地用海分类指南.pdf', format: 'pdf', chunkCount: 2, status: 'ready', enabled: true, updatedAt: '2026-10-25 15:02:45' },
  ],
  chunks,
  agents: [
    { id: 'agent-natural', name: '自然资源智能问答', description: '基于自然资源政策法规知识库，提供土地管理、国土空间规划、耕地保护和政务服务相关问答，并支持引用原文溯源。', category: '行业问答', scenario: '自然资源', updatedAt: '2026-10-28 09:50:00', conversations: 1286, likes: 328, color: '#18a4b8' },
    { id: 'agent-travel', name: '文旅助手', description: '面向公共文化和旅游服务场景，提供景区信息、文化活动、出行提示等咨询服务。', category: '公共服务', scenario: '文化旅游', updatedAt: '2026-10-26 14:30:00', conversations: 864, likes: 215, color: '#5b8ff9' },
  ],
  conversations: [
    { id: 'conv-001', agentId: 'agent-natural', title: '土地利用总体规划审批权限', updatedAt: '2026-10-28 09:58:12', messages: [{ id: 'msg-001', role: 'user', content: '土地利用总体规划如何审批？', createdAt: '2026-10-28 09:57:40' }, { id: 'msg-002', role: 'assistant', content: '一、问题概述\n\n土地利用总体规划实行分级审批。\n\n二、核心回答\n\n省、自治区、直辖市的土地利用总体规划，报国务院批准。〔1〕', createdAt: '2026-10-28 09:58:12', citations: [chunks[0]] }] },
    { id: 'conv-002', agentId: 'agent-natural', title: '永久基本农田保护要求', updatedAt: '2026-10-27 16:42:30', messages: [] },
    { id: 'conv-003', agentId: 'agent-natural', title: '农用地转用审批手续', updatedAt: '2026-10-26 14:18:05', messages: [] },
    { id: 'conv-004', agentId: 'agent-natural', title: '建设项目用地预审材料', updatedAt: '2026-10-25 11:09:44', messages: [] },
    { id: 'conv-005', agentId: 'agent-natural', title: '国土空间调查分类标准', updatedAt: '2026-10-24 10:26:18', messages: [] },
  ],
  settings: { model: 'DeepSeek-V3', knowledgeBaseId: 'kb-001', temperature: 0.7 },
};
