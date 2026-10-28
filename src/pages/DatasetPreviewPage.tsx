import { DownloadOutlined, LeftOutlined } from '@ant-design/icons';
import { Button, Empty } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const DatasetPreviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useApp();
  const dataset = state.datasets.find((item) => item.id === id);

  if (!dataset) return <Empty description="未找到该数据集" className="page-empty"><Button onClick={() => navigate('/datasets')}>返回数据集管理</Button></Empty>;

  const download = () => {
    const url = URL.createObjectURL(new Blob([dataset.content], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    const isText = ['txt', 'md', 'csv', 'json'].includes(dataset.format.toLowerCase());
    anchor.download = isText ? dataset.name : `${dataset.name.replace(/\.[^.]+$/, '')}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="page preview-page">
      <div className="page-header-row">
        <div className="breadcrumb-title"><Button type="text" size="small" aria-label="返回数据集管理" icon={<LeftOutlined />} onClick={() => navigate('/datasets')} />数据集管理 <span>/</span> 数据预览</div>
        <div><Button icon={<DownloadOutlined />} onClick={download}>下载</Button><Button type="primary" onClick={() => navigate('/datasets')}>返回</Button></div>
      </div>
      <article className="document-preview">
        <h1>{dataset.name.replace(/\.[^.]+$/, '')}</h1>
        <div className="document-meta">数据分类：{dataset.category} · 上传时间：{dataset.uploadedAt}</div>
        {dataset.content.split('\n').map((line, index) => (
          <p key={`${index}-${line.slice(0, 12)}`} className={/第[一二三四五六七八九十]+[章节]/.test(line) ? 'document-heading' : ''}>{line || '　'}</p>
        ))}
      </article>
    </section>
  );
};
