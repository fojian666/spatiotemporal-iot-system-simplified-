import { LeftOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Empty, Switch, Table, Tag } from 'antd';
import type { TableColumnsType } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { KnowledgeDocument } from '../types';

export const KnowledgeDetailPage = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const knowledgeBase = state.knowledgeBases.find((base) => base.id === id);
  const documents = state.documents.filter((document) => document.knowledgeId === id);

  if (!knowledgeBase) return <Empty description="未找到该知识库" className="page-empty"><Button onClick={() => navigate('/knowledge')}>返回知识库管理</Button></Empty>;

  const columns: TableColumnsType<KnowledgeDocument> = [
    { title: '文档名称', dataIndex: 'name', width: 280 },
    { title: '文档格式', dataIndex: 'format', width: 100, render: (value: string) => value.toUpperCase() },
    { title: '切片数量', dataIndex: 'chunkCount', width: 100, render: (value: number) => `${value} 条` },
    { title: '处理状态', dataIndex: 'status', width: 110, render: (value: string) => <Tag color={value === 'ready' ? 'green' : 'processing'}>{value === 'ready' ? '处理完成' : '解析中'}</Tag> },
    { title: '导入时间', dataIndex: 'updatedAt', width: 165 },
    { title: '启用状态', dataIndex: 'enabled', width: 90, render: (value: boolean, record) => <Switch size="small" checked={value} aria-label={`启用文档 ${record.name}`} onChange={() => dispatch({ type: 'document/toggle', payload: record.id })} /> },
    { title: '操作', key: 'actions', width: 200, fixed: 'right', render: (_, record) => <div className="table-actions"><Button type="link" size="small" onClick={() => navigate(`/datasets/${record.datasetId}`)}>原文</Button><Button type="link" size="small" onClick={() => navigate(`/knowledge/${id}/chunks/${record.id}`)}>切片详情</Button></div> },
  ];

  return (
    <section className="page knowledge-detail-page">
      <div className="page-header-row">
        <div className="breadcrumb-title"><Button type="text" size="small" aria-label="返回知识库管理" icon={<LeftOutlined />} onClick={() => navigate('/knowledge')} />{knowledgeBase.name}<span>/</span>知识库详情</div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(`/knowledge/import?knowledgeId=${id}`)}>导入知识</Button>
      </div>
      <div className="content-card">
        <div className="table-toolbar"><div className="panel-heading"><span className="section-marker" />文档列表</div><span className="dataset-total">共 {documents.length} 个文档</span></div>
        <Table rowKey="id" columns={columns} dataSource={documents} scroll={{ x: 1100 }} pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }} />
      </div>
    </section>
  );
};
