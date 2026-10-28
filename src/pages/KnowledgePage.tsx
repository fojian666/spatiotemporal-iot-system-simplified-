import { ImportOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Switch, Table, Tag } from 'antd';
import type { TableColumnsType } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { KnowledgeBase } from '../types';

export const KnowledgePage = () => {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const columns: TableColumnsType<KnowledgeBase> = [
    { title: '知识库名称', dataIndex: 'name', width: 230, render: (value: string, record) => <Link className="table-file-link" to={`/knowledge/${record.id}`}>{value}</Link> },
    { title: '知识库描述', dataIndex: 'description', ellipsis: true },
    { title: '文档数量', dataIndex: 'documentCount', width: 100, render: (value: number) => `${value} 个` },
    { title: '切片数量', dataIndex: 'chunkCount', width: 100, render: (value: number) => `${value} 条` },
    { title: '更新时间', dataIndex: 'updatedAt', width: 160 },
    { title: '启用状态', dataIndex: 'enabled', width: 90, render: (value: boolean, record) => <Switch size="small" checked={value} aria-label={`启用知识库 ${record.name}`} onChange={() => dispatch({ type: 'knowledge/toggle', payload: record.id })} /> },
    {
      title: '操作', key: 'actions', width: 220, fixed: 'right', render: (_, record) => (
        <div className="table-actions">
          <Button type="link" size="small" onClick={() => navigate(`/knowledge/${record.id}`)}>文档管理</Button>
          <Button type="link" size="small" onClick={() => navigate(`/knowledge/import?knowledgeId=${record.id}`)}>导入知识</Button>
        </div>
      ),
    },
  ];

  return (
    <section className="page knowledge-page">
      <div className="page-header-row">
        <h1 className="page-title">知识库管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/knowledge/import')}>导入知识</Button>
      </div>
      <div className="content-card">
        <div className="table-toolbar"><div className="panel-heading"><span className="section-marker" />知识库列表</div><Tag color="purple">共 {state.knowledgeBases.length} 个知识库</Tag></div>
        <Table rowKey="id" columns={columns} dataSource={state.knowledgeBases} scroll={{ x: 1100 }} pagination={false} />
        <div className="table-bottom-hint"><ImportOutlined /> 导入文档后，可在文档管理中查看和编辑知识切片</div>
      </div>
    </section>
  );
};
