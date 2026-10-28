import { CloudUploadOutlined, FileTextOutlined } from '@ant-design/icons';
import { Form, Input, Modal, Select } from 'antd';
import { useRef, useState } from 'react';
import type { Dataset } from '../types';

interface UploadDatasetModalProps {
  open: boolean;
  onCancel: () => void;
  onCreate: (dataset: Dataset) => boolean;
}

interface UploadFormValues {
  name: string;
  category: string;
}

const textExtensions = new Set(['txt', 'md', 'csv', 'json']);

const readText = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result ?? ''));
  reader.onerror = () => reject(new Error('文件读取失败，请重新选择'));
  reader.readAsText(file, 'UTF-8');
});

export const UploadDatasetModal = ({ open, onCancel, onCreate }: UploadDatasetModalProps) => {
  const [form] = Form.useForm<UploadFormValues>();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File>();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const close = () => {
    setFile(undefined);
    setError('');
    form.resetFields();
    onCancel();
  };

  const selectFile = (selected?: File) => {
    if (!selected) return;
    setFile(undefined);
    form.setFieldValue('name', '');
    const extension = selected.name.split('.').pop()?.toLowerCase() ?? '';
    if (!textExtensions.has(extension)) {
      setError('仅支持 TXT、Markdown、CSV 和 JSON 文本文件');
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    if (selected.size > 2 * 1024 * 1024) {
      setError('单个文本文件不能超过 2 MB');
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    setError('');
    setFile(selected);
    form.setFieldValue('name', selected.name);
  };

  const submit = async (values: UploadFormValues) => {
    if (!file) {
      setError('请先选择要上传的数据文件');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
      const content = await readText(file);
      const saved = onCreate({
        id: globalThis.crypto.randomUUID(),
        name: values.name.trim(),
        category: values.category,
        source: '本地上传',
        format: extension,
        size: file.size >= 1024 * 1024 ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`,
        status: 'ready',
        enabled: true,
        uploadedAt: new Date().toLocaleString('zh-CN', { hour12: false }),
        content,
      });
      if (saved) close();
      else setError('文件未保存，请释放浏览器存储空间后重试');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '文件读取失败，请重新选择');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="新建数据集"
      open={open}
      onCancel={close}
      onOk={() => form.submit()}
      okText="确定"
      cancelText="取消"
      confirmLoading={submitting}
      width={560}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={submit} initialValues={{ category: '政策法规' }} className="upload-form">
        <Form.Item name="name" label="数据集名称" rules={[{ required: true, whitespace: true, message: '请输入数据集名称' }]}>
          <Input placeholder="请输入数据集名称" maxLength={80} />
        </Form.Item>
        <Form.Item name="category" label="数据分类" rules={[{ required: true }]}>
          <Select options={['政策法规', '法律法规', '政务服务', '技术标准', '业务资料', '知识问答'].map((value) => ({ value, label: value }))} />
        </Form.Item>
        <Form.Item label="数据文件" required>
          <input
            ref={inputRef}
            id="dataset-file"
            aria-label="选择数据文件"
            className="visually-hidden-file"
            type="file"
            accept=".txt,.md,.csv,.json"
            onChange={(event) => selectFile(event.target.files?.[0])}
          />
          <label
            htmlFor="dataset-file"
            className="upload-dropzone"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              selectFile(event.dataTransfer.files[0]);
            }}
          >
            {file ? <FileTextOutlined className="upload-icon" /> : <CloudUploadOutlined className="upload-icon" />}
            <span className="upload-title">{file ? file.name : '点击选择或拖拽文件到此处'}</span>
            <span className="upload-hint">支持 TXT、Markdown、CSV、JSON，单个文件不超过 2 MB</span>
          </label>
          {error && <div className="form-error" role="alert">{error}</div>}
        </Form.Item>
      </Form>
    </Modal>
  );
};
