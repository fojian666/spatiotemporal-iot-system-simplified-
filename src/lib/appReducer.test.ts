import { describe, expect, it } from 'vitest';
import type { AppState, Dataset, KnowledgeChunk } from '../types';
import { appReducer } from './appReducer';

const dataset: Dataset = {
  id: 'dataset-1',
  name: '自然资源管理文件.txt',
  category: '自然资源',
  source: '本地上传',
  format: 'txt',
  size: '12 KB',
  status: 'ready',
  enabled: true,
  uploadedAt: '2026-10-28 10:00:00',
  content: '自然资源管理文件正文',
};

const chunk: KnowledgeChunk = {
  id: 'chunk-1',
  documentId: 'doc-1',
  title: '自然资源管理文件',
  index: 1,
  page: 1,
  content: '原始切片',
  keywords: ['自然资源'],
  enabled: true,
};

const state: AppState = {
  datasets: [dataset],
  knowledgeBases: [],
  documents: [],
  chunks: [chunk],
  agents: [],
  conversations: [],
  settings: { model: 'DeepSeek-V3', knowledgeBaseId: 'kb-1', temperature: 0.7 },
};

describe('appReducer', () => {
  it('adds an uploaded dataset at the beginning of the list', () => {
    const uploaded = { ...dataset, id: 'dataset-2', name: '新数据集.md' };
    const next = appReducer(state, { type: 'dataset/add', payload: uploaded });

    expect(next.datasets.map((item) => item.id)).toEqual(['dataset-2', 'dataset-1']);
  });

  it('removes only the requested dataset', () => {
    const next = appReducer(state, { type: 'dataset/remove', payload: 'dataset-1' });

    expect(next.datasets).toEqual([]);
    expect(next.chunks).toEqual([chunk]);
  });

  it('toggles dataset availability without changing its processing status', () => {
    const next = appReducer(state, { type: 'dataset/toggle', payload: 'dataset-1' });

    expect(next.datasets[0]).toEqual({ ...dataset, enabled: false });
  });

  it('imports documents and refreshes knowledge base totals', () => {
    const next = appReducer(
      {
        ...state,
        knowledgeBases: [{ id: 'kb-1', name: '政策库', description: '', documentCount: 0, chunkCount: 0, updatedAt: '', enabled: true }],
      },
      {
        type: 'document/import',
        payload: {
          knowledgeId: 'kb-1',
          documents: [{ id: 'doc-1', knowledgeId: 'kb-1', datasetId: 'dataset-1', name: '政策.txt', format: 'txt', chunkCount: 1, status: 'ready', enabled: true, updatedAt: '2026-10-28 12:00:00' }],
          chunks: [chunk],
        },
      },
    );

    expect(next.documents).toHaveLength(1);
    expect(next.knowledgeBases[0]).toMatchObject({ documentCount: 1, chunkCount: 1 });
  });

  it('rejects an import whose target knowledge base does not exist', () => {
    const payload = {
      knowledgeId: 'missing',
      documents: [{ id: 'doc-1', knowledgeId: 'missing', datasetId: 'dataset-1', name: '政策.txt', format: 'txt', chunkCount: 1, status: 'ready' as const, enabled: true, updatedAt: '2026-10-28 12:00:00' }],
      chunks: [chunk],
    };

    expect(appReducer(state, { type: 'document/import', payload })).toBe(state);
  });

  it('rejects imports from disabled datasets', () => {
    const next = appReducer(
      { ...state, knowledgeBases: [{ id: 'kb-1', name: '政策库', description: '', documentCount: 0, chunkCount: 0, updatedAt: '', enabled: true }], datasets: [{ ...dataset, enabled: false }] },
      {
        type: 'document/import',
        payload: {
          knowledgeId: 'kb-1',
          documents: [{ id: 'doc-1', knowledgeId: 'kb-1', datasetId: 'dataset-1', name: '政策.txt', format: 'txt', chunkCount: 1, status: 'ready', enabled: true, updatedAt: '2026-10-28 12:00:00' }],
          chunks: [chunk],
        },
      },
    );

    expect(next.documents).toEqual([]);
    expect(next.knowledgeBases[0].documentCount).toBe(0);
  });

  it('rejects empty imports and chunks that point to documents outside the payload', () => {
    const knowledgeState = {
      ...state,
      knowledgeBases: [{ id: 'kb-1', name: '政策库', description: '', documentCount: 0, chunkCount: 0, updatedAt: '', enabled: true }],
    };
    const document = { id: 'doc-1', knowledgeId: 'kb-1', datasetId: 'dataset-1', name: '政策.txt', format: 'txt', chunkCount: 1, status: 'ready' as const, enabled: true, updatedAt: '2026-10-28 12:00:00' };

    expect(appReducer(knowledgeState, {
      type: 'document/import',
      payload: { knowledgeId: 'kb-1', documents: [], chunks: [] },
    })).toBe(knowledgeState);
    expect(appReducer(knowledgeState, {
      type: 'document/import',
      payload: { knowledgeId: 'kb-1', documents: [{ ...document, id: 'doc-1' }], chunks: [{ ...chunk, documentId: 'doc-missing' }] },
    })).toBe(knowledgeState);
  });

  it('updates chunk content without mutating the original state', () => {
    const next = appReducer(state, {
      type: 'chunk/update',
      payload: { id: 'chunk-1', content: '编辑后的切片' },
    });

    expect(next.chunks[0].content).toBe('编辑后的切片');
    expect(state.chunks[0].content).toBe('原始切片');
  });

  it('regenerates retrieval keywords when chunk content is edited', () => {
    const next = appReducer(state, {
      type: 'chunk/update',
      payload: { id: 'chunk-1', content: '土地利用总体规划实行分级审批。' },
    });

    expect(next.chunks[0].keywords).toEqual(['土地利用', '总体规划', '分级审批']);
  });

  it('toggles a chunk while preserving its source content', () => {
    const next = appReducer(state, { type: 'chunk/toggle', payload: 'chunk-1' });

    expect(next.chunks[0]).toEqual({ ...chunk, enabled: false });
  });

  it('updates model settings without replacing unrelated state', () => {
    const next = appReducer(state, { type: 'settings/update', payload: { model: 'Qwen-Max' } });

    expect(next.settings).toEqual({ model: 'Qwen-Max', knowledgeBaseId: 'kb-1', temperature: 0.7 });
    expect(next.datasets).toEqual(state.datasets);
  });

  it('stores conversations newest first and caps history at thirty', () => {
    const conversations = Array.from({ length: 30 }, (_, index) => ({
      id: `conversation-${index}`,
      agentId: 'agent-1',
      title: `会话 ${index}`,
      updatedAt: '2026-10-28 10:00:00',
      messages: [],
    }));
    const next = appReducer(
      { ...state, conversations },
      {
        type: 'conversation/upsert',
        payload: { id: 'new', agentId: 'agent-1', title: '新会话', updatedAt: '2026-10-28 11:00:00', messages: [] },
      },
    );

    expect(next.conversations).toHaveLength(30);
    expect(next.conversations[0].id).toBe('new');
    expect(next.conversations.some((conversation) => conversation.id === 'conversation-29')).toBe(false);
  });
});
