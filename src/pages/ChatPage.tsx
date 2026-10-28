import {
  CommentOutlined,
  DownOutlined,
  FileTextOutlined,
  PlusOutlined,
  RobotOutlined,
  SearchOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { Button, Empty, Input, Select, Tag } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AgentLogo } from '../components/AgentLogo';
import { CitationPanel } from '../components/CitationPanel';
import { useApp } from '../context/AppContext';
import { answerFromKnowledge } from '../lib/retrieval';
import type { Conversation, KnowledgeChunk } from '../types';

const suggestions = ['土地利用总体规划如何审批？', '永久基本农田有哪些保护要求？', '建设项目用地预审需要什么材料？'];
const latestCitations = (conversation?: Conversation) => [...(conversation?.messages ?? [])].reverse().find((message) => message.role === 'assistant')?.citations ?? [];

export const ChatPage = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, dispatch } = useApp();
  const agent = state.agents.find((item) => item.id === id);
  const routeConversationId = searchParams.get('conversation');
  const routeConversation = state.conversations.find((conversation) => conversation.id === routeConversationId && conversation.agentId === id);
  const routeKey = `${id}:${routeConversationId ?? ''}`;
  const previousRouteKey = useRef(routeKey);
  const [activeId, setActiveId] = useState<string | undefined>(routeConversation?.id);
  const [historyQuery, setHistoryQuery] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [input, setInput] = useState('');
  const [citations, setCitations] = useState<KnowledgeChunk[]>(() => latestCitations(routeConversation));
  const [selectedCitation, setSelectedCitation] = useState<KnowledgeChunk>();
  const activeConversation = state.conversations.find((conversation) => conversation.id === activeId && conversation.agentId === id);
  const conversations = state.conversations.filter((conversation) => conversation.agentId === id && conversation.title.includes(historyQuery.trim()));

  useEffect(() => {
    if (previousRouteKey.current === routeKey) return;
    previousRouteKey.current = routeKey;
    const conversation = state.conversations.find((item) => item.id === routeConversationId && item.agentId === id);
    setActiveId(conversation?.id);
    setCitations(latestCitations(conversation));
    setSelectedCitation(undefined);
    setInput('');
  }, [routeKey, state.conversations, id, routeConversationId]);

  const enabledChunks = useMemo(() => {
    const knowledgeEnabled = state.knowledgeBases.find((base) => base.id === state.settings.knowledgeBaseId)?.enabled;
    if (!knowledgeEnabled) return [];
    const enabledDocumentIds = new Set(state.documents.filter((document) => document.knowledgeId === state.settings.knowledgeBaseId && document.enabled).map((document) => document.id));
    return state.chunks.filter((chunk) => enabledDocumentIds.has(chunk.documentId));
  }, [state.chunks, state.documents, state.knowledgeBases, state.settings.knowledgeBaseId]);

  if (!agent) return <Empty description="未找到该智能体" className="page-empty"><Button onClick={() => navigate('/agents')}>返回智能体广场</Button></Empty>;

  const openConversation = (conversation: Conversation) => {
    setHistoryOpen(false);
    setActiveId(conversation.id);
    setCitations(latestCitations(conversation));
    setSelectedCitation(undefined);
  };

  const newConversation = () => {
    setHistoryOpen(false);
    setActiveId(undefined);
    setInput('');
    setCitations([]);
    setSelectedCitation(undefined);
  };

  const send = (question = input) => {
    const trimmed = question.trim();
    if (!trimmed) return;
    const now = new Date().toLocaleString('zh-CN', { hour12: false });
    const answer = answerFromKnowledge(trimmed, enabledChunks);
    const conversationId = activeConversation?.id ?? globalThis.crypto.randomUUID();
    const previousMessages = activeConversation?.messages ?? [];
    const conversation: Conversation = {
      id: conversationId,
      agentId: id,
      title: activeConversation?.title ?? trimmed.slice(0, 26),
      updatedAt: now,
      messages: [
        ...previousMessages,
        { id: globalThis.crypto.randomUUID(), role: 'user', content: trimmed, createdAt: now },
        { id: globalThis.crypto.randomUUID(), role: 'assistant', content: answer.content, createdAt: now, citations: answer.citations },
      ],
    };
    if (!dispatch({ type: 'conversation/upsert', payload: conversation })) return;
    setActiveId(conversationId);
    setInput('');
    setCitations(answer.citations);
    setSelectedCitation(undefined);
  };

  const selectedDocument = state.documents.find((document) => document.id === selectedCitation?.documentId);
  const sourceContent = state.datasets.find((dataset) => dataset.id === selectedDocument?.datasetId)?.content ?? '';

  return (
    <section className="chat-page">
      <header className="chat-agent-header">
        <div className="chat-agent-title"><AgentLogo color={agent.color} small /><h1>{agent.name}</h1><Tag color="purple">{agent.category}</Tag><Tag>{agent.scenario}</Tag><span className="chat-agent-stats"><CommentOutlined /> {agent.conversations} 次对话</span><Button className="mobile-history-toggle" type="text" size="small" aria-label="历史会话" aria-expanded={historyOpen} aria-controls="conversation-history" icon={<CommentOutlined />} onClick={() => setHistoryOpen((open) => !open)} /></div>
        <p>{agent.description}</p>
      </header>
      <div className="chat-tabs"><button className="active">问答</button><button onClick={() => navigate('/agents')}>智能体广场</button><button onClick={() => navigate('/settings')}>问答配置</button></div>
      <div className={`chat-workspace ${citations.length ? 'with-citations' : ''} ${historyOpen ? 'history-open' : ''}`}>
        <aside id="conversation-history" className="conversation-sidebar">
          <Button type="primary" block icon={<PlusOutlined />} onClick={newConversation}>新建会话</Button>
          <Input prefix={<SearchOutlined />} placeholder="搜索会话" value={historyQuery} onChange={(event) => setHistoryQuery(event.target.value)} allowClear />
          <div className="conversation-group-title">今天</div>
          <div className="conversation-list">
            {conversations.map((conversation) => <button key={conversation.id} className={activeId === conversation.id ? 'active' : ''} onClick={() => openConversation(conversation)}><CommentOutlined /><span>{conversation.title}</span></button>)}
          </div>
          {conversations.length === 0 && <div className="conversation-empty">暂无历史会话</div>}
        </aside>
        <div className="chat-main">
          <div className="chat-messages">
            {!activeConversation?.messages.length ? (
              <div className="chat-welcome">
                <div className="robot-avatar"><RobotOutlined /></div>
                <h2>您好，我是{agent.id === 'agent-natural' ? '自然资源智能管家' : agent.name}</h2>
                <p>作为您的智能助手，我将基于已连接的知识库为您解答问题。</p>
                <div className="suggestion-card"><div>您可以这样提问 <DownOutlined /></div>{suggestions.map((suggestion) => <button key={suggestion} onClick={() => send(suggestion)}><PlusOutlined />{suggestion}</button>)}</div>
              </div>
            ) : (
              <div className="message-list">
                {activeConversation.messages.map((message) => (
                  <div className={`message ${message.role}`} key={message.id}>
                    {message.role === 'assistant' && <div className="message-avatar"><RobotOutlined /></div>}
                    <div className="message-bubble">
                      {message.content.split('\n').map((line, index) => <p className={/^[一二三四五六七八九十]+、/.test(line) ? 'answer-heading' : ''} key={`${message.id}-${index}`}>{line || '　'}</p>)}
                      {message.role === 'assistant' && message.citations?.length ? <div className="message-sources"><FileTextOutlined />{message.citations.length} 条引用已显示在右侧</div> : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="chat-composer">
            <Input.TextArea value={input} onChange={(event) => setInput(event.target.value)} placeholder="请输入您的问题，Shift + Enter 换行" autoSize={{ minRows: 2, maxRows: 5 }} onPressEnter={(event) => { if (!event.shiftKey) { event.preventDefault(); send(); } }} />
            <div className="composer-bottom"><div><Select size="small" aria-label="问答模型" value={state.settings.model} onChange={(model) => dispatch({ type: 'settings/update', payload: { model } })} suffixIcon={<DownOutlined />} options={[{ value: 'DeepSeek-V3', label: 'DeepSeek-V3' }, { value: 'Qwen-Max', label: 'Qwen-Max' }]} /><Select size="small" aria-label="问答知识库" value={state.settings.knowledgeBaseId} onChange={(knowledgeBaseId) => dispatch({ type: 'settings/update', payload: { knowledgeBaseId } })} options={state.knowledgeBases.map((base) => ({ value: base.id, label: base.name }))} /></div><Button type="primary" shape="circle" icon={<SendOutlined />} aria-label="发送" disabled={!input.trim()} onClick={() => send()} /></div>
          </div>
        </div>
        {citations.length > 0 && <CitationPanel citations={citations} selected={selectedCitation} sourceContent={sourceContent} onSelect={setSelectedCitation} onClose={() => { setCitations([]); setSelectedCitation(undefined); }} />}
      </div>
    </section>
  );
};
