import type { AppState, KnowledgeChunk } from '../types';

// The schema has no tree rows; Ant Design treats a children property as nested table data.
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value) && !('children' in value);
const hasStrings = (value: unknown, keys: string[]) => isRecord(value) && keys.every((key) => typeof value[key] === 'string');
const hasNumbers = (value: unknown, keys: string[]) => isRecord(value) && keys.every((key) => typeof value[key] === 'number' && Number.isFinite(value[key]));
const hasEnabled = (value: unknown) => isRecord(value) && typeof value.enabled === 'boolean';
const hasStatus = (value: unknown) => isRecord(value) && ['ready', 'processing', 'failed'].includes(String(value.status));

const isDataset = (value: unknown) => hasStrings(value, ['id', 'name', 'category', 'source', 'format', 'size', 'uploadedAt', 'content']) && hasStatus(value) && hasEnabled(value);
const isKnowledgeBase = (value: unknown) => hasStrings(value, ['id', 'name', 'description', 'updatedAt']) && hasNumbers(value, ['documentCount', 'chunkCount']) && hasEnabled(value);
const isDocument = (value: unknown) => hasStrings(value, ['id', 'knowledgeId', 'datasetId', 'name', 'format', 'updatedAt']) && hasNumbers(value, ['chunkCount']) && hasStatus(value) && hasEnabled(value);
const isChunk = (value: unknown): value is KnowledgeChunk => hasStrings(value, ['id', 'documentId', 'title', 'content']) && hasNumbers(value, ['index', 'page']) && hasEnabled(value) && isRecord(value) && Array.isArray(value.keywords) && value.keywords.every((keyword) => typeof keyword === 'string');
const isAgent = (value: unknown) => hasStrings(value, ['id', 'name', 'description', 'category', 'scenario', 'updatedAt', 'color']) && hasNumbers(value, ['conversations', 'likes']);
const isMessage = (value: unknown) => {
  if (!hasStrings(value, ['id', 'role', 'content', 'createdAt']) || !isRecord(value)) return false;
  const validRole = value.role === 'user' || value.role === 'assistant';
  const validCitations = value.citations === undefined || (Array.isArray(value.citations) && value.citations.every(isChunk));
  return validRole && validCitations;
};
const isConversation = (value: unknown) => hasStrings(value, ['id', 'agentId', 'title', 'updatedAt']) && isRecord(value) && Array.isArray(value.messages) && value.messages.every(isMessage);

const isAppState = (value: unknown): value is AppState => {
  if (!isRecord(value)) return false;
  return Array.isArray(value.datasets) && value.datasets.every(isDataset)
    && Array.isArray(value.knowledgeBases) && value.knowledgeBases.every(isKnowledgeBase)
    && Array.isArray(value.documents) && value.documents.every(isDocument)
    && Array.isArray(value.chunks) && value.chunks.every(isChunk)
    && Array.isArray(value.agents) && value.agents.every(isAgent)
    && Array.isArray(value.conversations) && value.conversations.every(isConversation)
    && hasStrings(value.settings, ['model', 'knowledgeBaseId'])
    && hasNumbers(value.settings, ['temperature']);
};

export const parseAppState = (value: unknown, fallback: AppState): AppState => isAppState(value) ? value : fallback;
