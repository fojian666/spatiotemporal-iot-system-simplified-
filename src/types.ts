export type DatasetStatus = 'ready' | 'processing' | 'failed';

export interface Dataset {
  id: string;
  name: string;
  category: string;
  source: string;
  format: string;
  size: string;
  status: DatasetStatus;
  enabled: boolean;
  uploadedAt: string;
  content: string;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  documentCount: number;
  chunkCount: number;
  updatedAt: string;
  enabled: boolean;
}

export interface KnowledgeDocument {
  id: string;
  knowledgeId: string;
  datasetId: string;
  name: string;
  format: string;
  chunkCount: number;
  status: DatasetStatus;
  enabled: boolean;
  updatedAt: string;
}

export interface KnowledgeChunk {
  id: string;
  documentId: string;
  title: string;
  index: number;
  page: number;
  content: string;
  keywords: string[];
  enabled: boolean;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  scenario: string;
  updatedAt: string;
  conversations: number;
  likes: number;
  color: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  citations?: KnowledgeChunk[];
}

export interface Conversation {
  id: string;
  agentId: string;
  title: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface AppSettings {
  model: string;
  knowledgeBaseId: string;
  temperature: number;
}

export interface AppState {
  datasets: Dataset[];
  knowledgeBases: KnowledgeBase[];
  documents: KnowledgeDocument[];
  chunks: KnowledgeChunk[];
  agents: Agent[];
  conversations: Conversation[];
  settings: AppSettings;
}

export interface KnowledgeAnswer {
  content: string;
  citations: KnowledgeChunk[];
}
