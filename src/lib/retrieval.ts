import type { KnowledgeAnswer, KnowledgeChunk } from '../types';

const normalize = (value: string) => value.toLowerCase().replace(/[^\p{Letter}\p{Number}]/gu, '');

const bigrams = (value: string) => {
  const pairs = new Set<string>();
  for (let index = 0; index < value.length - 1; index += 1) {
    pairs.add(value.slice(index, index + 2));
  }
  return pairs;
};

const scoreChunk = (query: string, chunk: KnowledgeChunk) => {
  const keywordScore = chunk.keywords.reduce(
    (score, keyword) => score + (query.includes(normalize(keyword)) ? 8 : 0),
    0,
  );
  const source = normalize(`${chunk.title}${chunk.content}${chunk.keywords.join('')}`);
  let overlapScore = 0;
  bigrams(query).forEach((pair) => {
    if (source.includes(pair)) overlapScore += 1;
  });
  return keywordScore + overlapScore;
};

export const retrieveKnowledge = (
  query: string,
  chunks: KnowledgeChunk[],
  limit = 3,
): KnowledgeChunk[] => {
  const normalizedQuery = normalize(query.trim());
  if (!normalizedQuery || limit < 1) return [];

  return chunks
    .filter((chunk) => chunk.enabled)
    .map((chunk) => ({ chunk, score: scoreChunk(normalizedQuery, chunk) }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || left.chunk.index - right.chunk.index)
    .slice(0, limit)
    .map(({ chunk }) => chunk);
};

export const answerFromKnowledge = (query: string, chunks: KnowledgeChunk[]): KnowledgeAnswer => {
  const citations = retrieveKnowledge(query, chunks);
  if (citations.length === 0) {
    return {
      content: '暂未在已连接知识库中找到相关内容。请尝试补充关键词，或先导入并启用相关知识文档。',
      citations: [],
    };
  }

  const evidence = citations
    .map((chunk, index) => `${index + 1}. ${chunk.content}〔${index + 1}〕`)
    .join('\n\n');

  return {
    content: `一、问题概述\n\n针对“${query.trim()}”，已在本地知识库中检索到 ${citations.length} 条相关内容。\n\n二、核心回答\n\n${evidence}\n\n三、参考来源\n\n以上内容依据右侧引用文档整理，可点击引用查看原文位置。`,
    citations,
  };
};
