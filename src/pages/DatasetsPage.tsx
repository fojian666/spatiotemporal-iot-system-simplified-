import { DeleteOutlined, EyeOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Input, Popconfirm, Select, Switch, Table, Tag, Tree } from 'antd';
import type { TableColumnsType } from 'antd';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UploadDatasetModal } from '../components/UploadDatasetModal';
import { useApp } from '../context/AppContext';
import type { Dataset, DatasetStatus } from '../types';

const statusLabels: Record<DatasetStatus, { label: string; color: string }> = {
  ready: { label: '处理完成', color: 'green' },
  processing: { label: '解析中', color: 'processing' },
  failed: { label: '解析失败', color: 'error' },
};

const treeData = [
  { title: '全部数据', key: 'all' },
  {
    title: '自然资源',
    key: '自然资源',
    children: [
      { title: '政策法规', key: '政策法规' },
      { title: '法律法规', key: '法律法规' },
      { title: '政务服务', key: '政务服务' },
      { title: '技术标准', key: '技术标准' },
      { title: '业务资料', key: '业务资料' },
      { title: '知识问答', key: '知识问答' },
    ],
  },
];

export const DatasetsPage = () => {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [name, setName] = useState('');
  const [appliedName, setAppliedName] = useState('');
  const [category, setCategory] = useState('all');
  const [format, setFormat] = useState('all');
  const [status, setStatus] = useState('all');
  const [categorySearch, setCategorySearch] = useState('');

  const filteredDatasets = useMemo(() => state.datasets.filter((dataset) => {
    const matchesName = dataset.name.toLowerCase().includes(appliedName.trim().toLowerCase());
    const matchesCategory = category === 'all' || category === '自然资源' || dataset.category === category;
    const matchesFormat = format === 'all' || dataset.format === format;
    const matchesStatus = status === 'all' || dataset.status === status;
    return matchesName && matchesCategory && matchesFormat && matchesStatus;
  }), [state.datasets, appliedName, category, format, status]);

  const reset = () => {
    setName('');
    setAppliedName('');
    setCategory('all');
    setFormat('all');
    setStatus('all');
  };

  const columns: TableColumnsType<Dataset> = [
    {
      title: '数据集名称',
      dataIndex: 'name',
      width: 230,
      render: (value: string, record) => <Link className="table-file-link" to={`/datasets/${record.id}`}>{value}</Link>,
    },
    { title: '数据分类', dataIndex: 'category', width: 90 },
    { title: '上传方式', dataIndex: 'source', width: 90 },
    { title: '数据格式', dataIndex: 'format', width: 70, render: (value: string) => value.toUpperCase() },
    {
      title: '处理状态',
      dataIndex: 'status',
      width: 96,
      render: (value: DatasetStatus) => <Tag color={statusLabels[value].color}>{statusLabels[value].label}</Tag>,
    },
    {
      title: '启用状态',
      dataIndex: 'enabled',
      width: 80,
      render: (value: boolean, record) => <Switch size="small" checked={value} aria-label={`启用 ${record.name}`} onChange={() => dispatch({ type: 'dataset/toggle', payload: record.id })} />,
    },
    { title: '上传时间', dataIndex: 'uploadedAt', width: 145 },
    {
      title: '操作',
      key: 'actions',
      fixed: 'right',
      width: 126,
      render: (_, record) => (
        <div className="table-actions">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => navigate(`/datasets/${record.id}`)}>预览</Button>
          <Popconfirm title="确认删除该数据集？" okText="删除" cancelText="取消" onConfirm={() => dispatch({ type: 'dataset/remove', payload: record.id })}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <section className="page dataset-page">
      <h1 className="page-title">数据集管理</h1>
      <div className="dataset-workspace">
        <aside className="category-panel">
          <div className="panel-heading"><span className="section-marker" />数据分类</div>
          <Input
            prefix={<SearchOutlined />}
            placeholder="搜索分类"
            value={categorySearch}
            onChange={(event) => setCategorySearch(event.target.value)}
            className="category-search"
            allowClear
          />
          <Tree
            blockNode
            defaultExpandAll
            selectedKeys={[category]}
            treeData={treeData}
            titleRender={(node) => <span className={categorySearch && !String(node.title).includes(categorySearch) ? 'category-dimmed' : ''}>{node.title}</span>}
            onSelect={(keys) => keys[0] && setCategory(String(keys[0]))}
          />
        </aside>
        <div className="dataset-content">
          <div className="filter-bar">
            <Input value={name} onChange={(event) => setName(event.target.value)} onPressEnter={() => setAppliedName(name)} placeholder="请输入数据集名称" allowClear />
            <Select value={format} onChange={setFormat} aria-label="数据格式筛选" options={[{ value: 'all', label: '全部格式' }, ...['txt', 'md', 'pdf', 'docx'].map((value) => ({ value, label: value.toUpperCase() }))]} />
            <Select value={status} onChange={setStatus} aria-label="处理状态筛选" options={[{ value: 'all', label: '全部状态' }, { value: 'ready', label: '处理完成' }, { value: 'processing', label: '解析中' }, { value: 'failed', label: '解析失败' }]} />
            <Button type="primary" onClick={() => setAppliedName(name)}>查询</Button>
            <Button onClick={reset}>重置</Button>
          </div>
          <div className="table-toolbar">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setUploadOpen(true)}>新建数据集</Button>
            <span className="dataset-total">共 {filteredDatasets.length} 个数据集</span>
          </div>
          <Table<Dataset>
            rowKey="id"
            columns={columns}
            dataSource={filteredDatasets}
            scroll={{ x: 940 }}
            pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条`, pageSizeOptions: [10, 20, 50] }}
            size="middle"
          />
        </div>
      </div>
      <UploadDatasetModal
        open={uploadOpen}
        onCancel={() => setUploadOpen(false)}
        onCreate={(dataset) => dispatch({ type: 'dataset/add', payload: dataset })}
      />
    </section>
  );
};
