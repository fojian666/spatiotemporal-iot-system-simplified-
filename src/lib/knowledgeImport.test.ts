import { describe, expect, it } from 'vitest';
import type { Dataset } from '../types';
import { createKnowledgeImport } from './knowledgeImport';

const dataset: Dataset = {
  id: 'dataset-1',
  name: '土地管理.txt',
  category: '政策法规',
  source: '本地上传',
  format: 'txt',
  size: '1 KB',
  status: 'ready',
  enabled: true,
  uploadedAt: '2026-10-28 10:00:00',
  content: '土地利用总体规划实行分级审批。',
};

describe('createKnowledgeImport', () => {
  it('creates linked document and retrieval-ready chunks from selected datasets', () => {
    const result = createKnowledgeImport('kb-1', [dataset], '2026-10-28 12:00:00', 'import-1');

    expect(result.documents).toEqual([{
      id: 'import-1-doc-1',
      knowledgeId: 'kb-1',
      datasetId: 'dataset-1',
      name: '土地管理.txt',
      format: 'txt',
      chunkCount: 1,
      status: 'ready',
      enabled: true,
      updatedAt: '2026-10-28 12:00:00',
    }]);
    expect(result.chunks[0]).toMatchObject({
      documentId: 'import-1-doc-1',
      content: '土地利用总体规划实行分级审批。',
      keywords: ['土地利用', '总体规划', '分级审批'],
      enabled: true,
    });
  });
});
