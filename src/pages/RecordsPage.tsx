import { CommentOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Drawer, Empty, Input, Table, Tag } from 'antd';
import type { TableColumnsType } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { Conversation } from '../types';

export const RecordsPage = () => {
  const { state } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Conversation>();
  const conversations = state.conversations.filter((conversation) => conversation.title.includes(query.trim()));

  const columns: TableColumnsType<Conversation> = [
    { title: '会话标题', dataIndex: 'title', width: 260, render: (value: string) => <span className="record-title"><CommentOutlined />{value}</span> },
    { title: '智能体', dataIndex: 'agentId', width: 180, render: (value: string) => state.agents.find((agent) => agent.id === value)?.name ?? value },
    { title: '提问次数', dataIndex: 'messages', width: 100, render: (messages: Conversation['messages']) => <Tag>{messages.filter((message) => message.role === 'user').length} 次</Tag> },
    { title: '最近更新', dataIndex: 'updatedAt', width: 180 },
    { title: '操作', key: 'actions', width: 180, render: (_, record) => <div className="table-actions"><Button type="link" size="small" onClick={() => setSelected(record)}>查看</Button><Button type="link" size="small" onClick={() => navigate(`/agents/${record.agentId}/chat?conversation=${record.id}`)}>继续问答</Button></div> },
  ];

  return (
    <section className="page records-page">
      <div className="page-header-row"><h1 className="page-title">问答记录</h1><Input prefix={<SearchOutlined />} placeholder="搜索会话标题" value={query} onChange={(event) => setQuery(event.target.value)} allowClear /></div>
      <div className="content-card"><div className="table-toolbar"><div className="panel-heading"><span className="section-marker" />历史会话</div><span className="dataset-total">最多保留最近 30 个会话</span></div><Table rowKey="id" columns={columns} dataSource={conversations} scroll={{ x: 900 }} pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }} /></div>
      <Drawer title={selected?.title} open={Boolean(selected)} onClose={() => setSelected(undefined)} size={560}>
        {selected?.messages.length ? <div className="record-messages">{selected.messages.map((message) => <div className={`record-message ${message.role}`} key={message.id}><span>{message.role === 'user' ? '用户' : '智能助手'} · {message.createdAt}</span><p>{message.content}</p></div>)}</div> : <Empty description="该会话尚未保存问答内容" />}
      </Drawer>
    </section>
  );
};
