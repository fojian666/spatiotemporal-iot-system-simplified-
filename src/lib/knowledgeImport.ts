import type { Dataset, KnowledgeChunk, KnowledgeDocument } from '../types';
import { extractKeywords, splitTextIntoChunks } from './chunking';

export const createKnowledgeImport = (
  knowledgeId: string,
  datasets: Dataset[],
  now: string,
  idPrefix: string,
): { documents: KnowledgeDocument[]; chunks: KnowledgeChunk[] } => {
  const documents: KnowledgeDocument[] = [];
  const chunks: KnowledgeChunk[] = [];

  datasets.forEach((dataset, datasetIndex) => {
    const documentId = `${idPrefix}-doc-${datasetIndex + 1}`;
    const contents = splitTextIntoChunks(dataset.content);
    documents.push({
      id: documentId,
      knowledgeId,
      datasetId: dataset.id,
      name: dataset.name,
      format: dataset.format,
      chunkCount: contents.length,
      status: 'ready',
      enabled: true,
      updatedAt: now,
    });
    contents.forEach((content, chunkIndex) => {
      chunks.push({
        id: `${documentId}-chunk-${chunkIndex + 1}`,
        documentId,
        title: dataset.name,
        index: chunkIndex + 1,
        page: chunkIndex + 1,
        content,
        keywords: extractKeywords(content),
        enabled: true,
      });
    });
  });

  return { documents, chunks };
};
