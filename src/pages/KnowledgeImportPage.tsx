import { ImportOutlined, LeftOutlined } from '@ant-design/icons';
import { Button, Input, Radio, Select, Table } from 'antd';
import type { TableColumnsType } from 'antd';
import { useState } from 'react';
import type { Key } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UploadDatasetModal } from '../components/UploadDatasetModal';
import { useApp } from '../context/AppContext';
import { createKnowledgeImport } from '../lib/knowledgeImport';
import type { Dataset } from '../types';

export const KnowledgeImportPage = () => {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [knowledgeId, setKnowledgeId] = useState(searchParams.get('knowledgeId') ?? state.knowledgeBases[0]?.id ?? '');
  const [sourceType, setSourceType] = useState('datasets');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const datasets = state.datasets.filter((dataset) => dataset.enabled && dataset.status === 'ready' && dataset.content.trim() && dataset.name.includes(query.trim()));

  const columns: TableColumnsType<Dataset> = [
    { title: '数据集名称', dataIndex: 'name', width: 280 },
    { title: '数据分类', dataIndex: 'category', width: 120 },
    { title: '数据格式', dataIndex: 'format', width: 100, render: (value: string) => value.toUpperCase() },
    { title: '文件大小', dataIndex: 'size', width: 100 },
    { title: '上传时间', dataIndex: 'uploadedAt', width: 170 },
  ];

  const importSelected = () => {
    const targetExists = state.knowledgeBases.some((base) => base.id === knowledgeId);
    const selected = state.datasets.filter((dataset) => selectedKeys.includes(dataset.id) && dataset.enabled && dataset.status === 'ready' && dataset.content.trim());
    if (!targetExists) {
      setError('目标知识库不存在，请重新选择');
      return;
    }
    if (selected.length === 0 || selected.length !== selectedKeys.length) {
      setError('请选择至少一个已启用且解析完成的数据集');
      return;
    }
    const now = new Date().toLocaleString('zh-CN', { hour12: false });
    const payload = createKnowledgeImport(knowledgeId, selected, now, globalThis.crypto.randomUUID());
    if (!dispatch({ type: 'document/import', payload: { knowledgeId, ...payload } })) return;
    navigate(`/knowledge/${knowledgeId}`);
  };

  return (
    <section className="page knowledge-import-page">
      <div className="page-header-row">
        <div className="breadcrumb-title"><Button type="text" size="small" aria-label="返回知识库管理" icon={<LeftOutlined />} onClick={() => navigate('/knowledge')} />知识库管理 <span>/</span> 导入知识</div>
        <Button onClick={() => navigate('/knowledge')}>取消</Button>
      </div>
      <div className="content-card form-section-card">
        <div className="panel-heading"><span className="section-marker" />知识库信息</div>
        <div className="knowledge-info-form">
          <label>知识库名称</label>
          <Select value={knowledgeId} onChange={setKnowledgeId} options={state.knowledgeBases.map((base) => ({ value: base.id, label: base.name }))} placeholder="请选择知识库" />
          <label>知识库描述</label>
          <Input value={state.knowledgeBases.find((base) => base.id === knowledgeId)?.description} readOnly placeholder="选择知识库后显示描述" />
        </div>
      </div>
      <div className="content-card dataset-select-card">
        <div className="panel-heading"><span className="section-marker" />数据选择</div>
        <div className="source-type-row">选择方式<Radio.Group value={sourceType} onChange={(event) => { setSourceType(event.target.value); if (event.target.value === 'upload') setUploadOpen(true); }} options={[{ value: 'datasets', label: '数据集' }, { value: 'upload', label: '本地上传' }]} /></div>
        <div className="filter-bar import-filter"><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="请输入数据集名称" allowClear /><Button onClick={() => setQuery('')}>重置</Button></div>
        <div className="table-toolbar"><Button type="primary" icon={<ImportOutlined />} onClick={importSelected}>导入选中数据</Button><span className="dataset-total">已选择 {selectedKeys.length} 项</span></div>
        {error && <div role="alert" className="form-error">{error}</div>}
        <Table rowKey="id" columns={columns} dataSource={datasets} rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys }} scroll={{ x: 800 }} pagination={{ pageSize: 8, showTotal: (total) => `共 ${total} 条` }} />
      </div>
      <UploadDatasetModal open={uploadOpen} onCancel={() => { setUploadOpen(false); setSourceType('datasets'); }} onCreate={(dataset) => {
        if (!dispatch({ type: 'dataset/add', payload: dataset })) return false;
        setSelectedKeys((keys) => [...keys, dataset.id]);
        return true;
      }} />
    </section>
  );
};
