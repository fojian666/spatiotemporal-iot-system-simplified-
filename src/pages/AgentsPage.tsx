import { ClockCircleOutlined, CommentOutlined, HeartOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Empty, Input, Modal, Tabs, Tag } from 'antd';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgentLogo } from '../components/AgentLogo';
import { useApp } from '../context/AppContext';
import type { Agent } from '../types';

export const AgentsPage = () => {
  const { state } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState('all');
  const [category, setCategory] = useState('全部');
  const [scenario, setScenario] = useState('全部');
  const [query, setQuery] = useState('');
  const [detail, setDetail] = useState<Agent>();

  const agents = useMemo(() => state.agents.filter((agent) => {
    const recent = tab === 'all' || state.conversations.some((conversation) => conversation.agentId === agent.id);
    return recent
      && (category === '全部' || agent.category === category)
      && (scenario === '全部' || agent.scenario === scenario)
      && `${agent.name}${agent.description}`.includes(query.trim());
  }), [state.agents, state.conversations, tab, category, scenario, query]);

  return (
    <section className="page agents-page">
      <div className="agents-topbar">
        <Tabs activeKey={tab} onChange={setTab} items={[{ key: 'all', label: '全部' }, { key: 'recent', label: '最近使用' }]} />
        <Button type="primary" onClick={() => navigate('/knowledge/import')}>导入知识</Button>
      </div>
      <div className="agent-filter-card">
        <div className="agent-filter-heading"><div className="panel-heading"><span className="section-marker" />智能体筛选</div><Input prefix={<SearchOutlined />} placeholder="搜索智能体" value={query} onChange={(event) => setQuery(event.target.value)} allowClear /></div>
        <div className="agent-filter-row"><span>智能体类型</span>{['全部', '行业问答', '公共服务'].map((value) => <button className={category === value ? 'selected' : ''} aria-pressed={category === value} key={value} onClick={() => setCategory(value)}>{value}</button>)}</div>
        <div className="agent-filter-row"><span>业务场景</span>{['全部', '自然资源', '文化旅游'].map((value) => <button className={scenario === value ? 'selected' : ''} aria-pressed={scenario === value} key={value} onClick={() => setScenario(value)}>{value}</button>)}</div>
      </div>
      <div className="agent-grid">
        {agents.map((agent) => (
          <article className="agent-card" key={agent.id} style={{ borderTopColor: agent.color }}>
            <div className="agent-card-main">
              <div className="agent-card-title"><AgentLogo color={agent.color} /><div><h2>{agent.name}</h2><div><Tag>{agent.category}</Tag><Tag>{agent.scenario}</Tag></div></div></div>
              <p>{agent.description}</p>
              <div className="agent-card-stats"><span><ClockCircleOutlined />{agent.updatedAt.slice(0, 10)}</span><span><CommentOutlined />{agent.conversations}</span><span><HeartOutlined />{agent.likes}</span></div>
            </div>
            <div className="agent-card-actions"><Button type="text" onClick={() => setDetail(agent)}>详情</Button><Button type="text" onClick={() => navigate(`/agents/${agent.id}/chat`)}>体验</Button></div>
          </article>
        ))}
      </div>
      {agents.length === 0 && <Empty description="未找到符合条件的智能体" />}
      <div className="agents-footer">共 {agents.length} 个智能体</div>
      <Modal title={detail?.name} open={Boolean(detail)} onCancel={() => setDetail(undefined)} footer={<><Button onClick={() => setDetail(undefined)}>关闭</Button><Button type="primary" onClick={() => detail && navigate(`/agents/${detail.id}/chat`)}>立即体验</Button></>}>
        {detail && <div className="agent-detail"><AgentLogo color={detail.color} /><p>{detail.description}</p><div><Tag>{detail.category}</Tag><Tag>{detail.scenario}</Tag></div><span>最近更新：{detail.updatedAt}</span></div>}
      </Modal>
    </section>
  );
};
