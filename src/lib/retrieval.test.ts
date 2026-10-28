import { describe, expect, it } from 'vitest';
import type { KnowledgeChunk } from '../types';
import { answerFromKnowledge, retrieveKnowledge } from './retrieval';

const chunks: KnowledgeChunk[] = [
  {
    id: 'chunk-land',
    documentId: 'doc-land',
    title: '土地利用总体规划',
    index: 1,
    page: 12,
    content: '土地利用总体规划实行分级审批，省级规划报国务院批准。',
    keywords: ['土地利用', '总体规划', '分级审批', '国务院'],
    enabled: true,
  },
  {
    id: 'chunk-water',
    documentId: 'doc-water',
    title: '水资源保护条例',
    index: 2,
    page: 8,
    content: '饮用水水源保护区应当设置明确的地理界标和警示标志。',
    keywords: ['水资源', '饮用水', '保护区'],
    enabled: true,
  },
  {
    id: 'chunk-disabled',
    documentId: 'doc-land',
    title: '土地利用补充规定',
    index: 3,
    page: 18,
    content: '土地利用年度计划应当根据国民经济和社会发展计划编制。',
    keywords: ['土地利用', '年度计划'],
    enabled: false,
  },
];

describe('retrieveKnowledge', () => {
  it(' ranks matching Chinese knowledge above unrelated chunks', () => {
    const result = retrieveKnowledge('土地利用总体规划如何审批？', chunks);

    expect(result.map((chunk) => chunk.id)).toEqual(['chunk-land']);
  });

  it('excludes disabled chunks even when they match the query', () => {
    const result = retrieveKnowledge('年度计划', chunks);

    expect(result).toEqual([]);
  });

  it('returns no matches for blank or unrelated questions', () => {
    expect(retrieveKnowledge('  ', chunks)).toEqual([]);
    expect(retrieveKnowledge('火星移民需要什么条件', chunks)).toEqual([]);
  });

  it('limits the number of citations returned', () => {
    const result = retrieveKnowledge('保护区和规划', chunks, 1);

    expect(result).toHaveLength(1);
  });
});

describe('answerFromKnowledge', () => {
  it('builds an answer grounded in the retrieved source text', () => {
    const answer = answerFromKnowledge('土地利用如何审批', chunks);

    expect(answer.content).toContain('省级规划报国务院批准');
    expect(answer.citations.map((citation) => citation.id)).toEqual(['chunk-land']);
  });

  it('states when no local evidence is available instead of inventing an answer', () => {
    const answer = answerFromKnowledge('火星移民条件', chunks);

    expect(answer.content).toContain('暂未在已连接知识库中找到相关内容');
    expect(answer.citations).toEqual([]);
  });
});
