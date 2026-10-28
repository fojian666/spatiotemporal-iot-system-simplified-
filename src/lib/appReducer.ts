import type { AppSettings, AppState, Conversation, Dataset, KnowledgeChunk, KnowledgeDocument } from '../types';
import { extractKeywords } from './chunking';

export type AppAction =
  | { type: 'dataset/add'; payload: Dataset }
  | { type: 'dataset/remove'; payload: string }
  | { type: 'dataset/toggle'; payload: string }
  | { type: 'knowledge/toggle'; payload: string }
  | { type: 'document/toggle'; payload: string }
  | { type: 'document/import'; payload: { knowledgeId: string; documents: KnowledgeDocument[]; chunks: KnowledgeChunk[] } }
  | { type: 'chunk/update'; payload: { id: string; content: string } }
  | { type: 'chunk/toggle'; payload: string }
  | { type: 'conversation/upsert'; payload: Conversation }
  | { type: 'settings/update'; payload: Partial<AppSettings> };

export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'dataset/add':
      return { ...state, datasets: [action.payload, ...state.datasets] };
    case 'dataset/remove':
      return {
        ...state,
        datasets: state.datasets.filter((dataset) => dataset.id !== action.payload),
      };
    case 'dataset/toggle':
      return {
        ...state,
        datasets: state.datasets.map((dataset) =>
          dataset.id === action.payload ? { ...dataset, enabled: !dataset.enabled } : dataset,
        ),
      };
    case 'knowledge/toggle':
      return {
        ...state,
        knowledgeBases: state.knowledgeBases.map((base) =>
          base.id === action.payload ? { ...base, enabled: !base.enabled } : base,
        ),
      };
    case 'document/toggle':
      return {
        ...state,
        documents: state.documents.map((document) =>
          document.id === action.payload ? { ...document, enabled: !document.enabled } : document,
        ),
      };
    case 'document/import': {
      const targetExists = state.knowledgeBases.some((base) => base.id === action.payload.knowledgeId);
      const validDocuments = action.payload.documents.length > 0 && action.payload.documents.every((document) => {
        const dataset = state.datasets.find((item) => item.id === document.datasetId);
        return document.knowledgeId === action.payload.knowledgeId
          && dataset?.enabled
          && dataset.status === 'ready'
          && Boolean(dataset.content.trim());
      });
      const documentIds = new Set(action.payload.documents.map((document) => document.id));
      const validChunks = action.payload.chunks.length > 0
        && action.payload.chunks.every((chunk) => documentIds.has(chunk.documentId));
      const countsMatch = action.payload.documents.every((document) => (
        action.payload.chunks.filter((chunk) => chunk.documentId === document.id).length === document.chunkCount
      ));
      if (!targetExists || !validDocuments || !validChunks || !countsMatch) return state;
      return {
        ...state,
        documents: [...action.payload.documents, ...state.documents],
        chunks: [...action.payload.chunks, ...state.chunks],
        knowledgeBases: state.knowledgeBases.map((base) =>
          base.id === action.payload.knowledgeId
            ? {
                ...base,
                documentCount: base.documentCount + action.payload.documents.length,
                chunkCount: base.chunkCount + action.payload.chunks.length,
                updatedAt: action.payload.documents[0]?.updatedAt ?? base.updatedAt,
              }
            : base,
        ),
      };
    }
    case 'chunk/update':
      return {
        ...state,
        chunks: state.chunks.map((chunk) =>
          chunk.id === action.payload.id
            ? { ...chunk, content: action.payload.content, keywords: extractKeywords(action.payload.content) }
            : chunk,
        ),
      };
    case 'chunk/toggle':
      return {
        ...state,
        chunks: state.chunks.map((chunk) =>
          chunk.id === action.payload ? { ...chunk, enabled: !chunk.enabled } : chunk,
        ),
      };
    case 'conversation/upsert': {
      const conversations = [
        action.payload,
        ...state.conversations.filter((conversation) => conversation.id !== action.payload.id),
      ];
      return { ...state, conversations: conversations.slice(0, 30) };
    }
    case 'settings/update':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    default:
      return state;
  }
};
