import { LeftOutlined } from '@ant-design/icons';
import { Button, Input, Modal, Switch, Table } from 'antd';
import type { TableColumnsType } from 'antd';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { KnowledgeChunk } from '../types';

export const ChunksPage = () => {
  const { id = '', documentId = '' } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const chunks = state.chunks.filter((chunk) => chunk.documentId === documentId);
  const document = state.documents.find((item) => item.id === documentId);
  const [selected, setSelected] = useState<KnowledgeChunk>();
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState('');

  const openChunk = (chunk: KnowledgeChunk, edit: boolean) => {
    setSelected(chunk);
    setContent(chunk.content);
    setEditing(edit);
  };

  const save = () => {
    if (!selected || !content.trim()) return;
    if (!dispatch({ type: 'chunk/update', payload: { id: selected.id, content: content.trim() } })) return;
    setSelected(undefined);
  };

  const columns: TableColumnsType<KnowledgeChunk> = [
    { title: '切片序号', dataIndex: 'index', width: 90, render: (value: number) => String(value).padStart(2, '0') },
    { title: '切片内容', dataIndex: 'content', ellipsis: false, render: (value: string) => <div className="chunk-content-cell">{value}</div> },
    { title: '启用状态', dataIndex: 'enabled', width: 100, render: (value: boolean, record) => <Switch size="small" checked={value} aria-label={`启用切片 ${record.index}`} onChange={() => dispatch({ type: 'chunk/toggle', payload: record.id })} /> },
    { title: '操作', key: 'actions', width: 130, render: (_, record) => <div className="table-actions"><Button type="link" size="small" onClick={() => openChunk(record, false)}>查看</Button><Button type="link" size="small" onClick={() => openChunk(record, true)}>编辑</Button></div> },
  ];

  return (
    <section className="page chunks-page">
      <div className="page-header-row">
        <div className="breadcrumb-title"><Button type="text" size="small" aria-label="返回知识库详情" icon={<LeftOutlined />} onClick={() => navigate(`/knowledge/${id}`)} />{document?.name ?? '知识文档'}<span>/</span>切片详情</div>
        <Button onClick={() => navigate(`/knowledge/${id}`)}>返回</Button>
      </div>
      <div className="content-card">
        <div className="table-toolbar"><div className="panel-heading"><span className="section-marker" />切片列表</div><span className="dataset-total">共 {chunks.length} 条切片</span></div>
        <Table rowKey="id" columns={columns} dataSource={chunks} pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }} scroll={{ x: 900 }} />
      </div>
      <Modal
        title="切片详情"
        open={Boolean(selected)}
        onCancel={() => setSelected(undefined)}
        width={680}
        destroyOnHidden
        footer={editing ? <><Button onClick={() => setSelected(undefined)}>取消</Button><Button type="primary" disabled={!content.trim()} onClick={save}>保存</Button></> : <Button type="primary" onClick={() => setSelected(undefined)}>关闭</Button>}
      >
        {selected && <div className="chunk-modal-body">
          <div className="chunk-meta-grid"><span>文档名称</span><span>{selected.title}</span><span>切片序号</span><span>{selected.index}</span></div>
          <label className="chunk-editor-label" htmlFor="chunk-content">切片内容</label>
          {editing ? <Input.TextArea id="chunk-content" aria-label="切片内容" value={content} onChange={(event) => setContent(event.target.value)} rows={12} maxLength={2000} showCount /> : <div className="chunk-view-content">{selected.content}</div>}
          {!editing && <Button type="link" className="chunk-edit-entry" onClick={() => setEditing(true)}>编辑切片</Button>}
        </div>}
      </Modal>
    </section>
  );
};
