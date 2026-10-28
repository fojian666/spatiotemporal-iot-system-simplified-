import { CloseOutlined, FileTextOutlined, LeftOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import type { KnowledgeChunk } from '../types';

interface CitationPanelProps {
  citations: KnowledgeChunk[];
  selected?: KnowledgeChunk;
  sourceContent: string;
  onSelect: (citation?: KnowledgeChunk) => void;
  onClose: () => void;
}

export const CitationPanel = ({ citations, selected, sourceContent, onSelect, onClose }: CitationPanelProps) => {
  const sourceMatched = Boolean(selected && sourceContent.includes(selected.content));
  const sourceParts = selected ? sourceContent.split(selected.content) : [];
  return (
    <aside className="citation-panel" aria-label="参考来源">
      <div className="citation-header"><span><FileTextOutlined />{selected ? (sourceMatched ? '原文预览' : '切片预览') : '参考来源'}</span><Button type="text" size="small" aria-label="关闭引用" icon={<CloseOutlined />} onClick={onClose} /></div>
      {selected ? (
        <div className="source-preview">
          <Button type="link" size="small" icon={<LeftOutlined />} onClick={() => onSelect(undefined)}>返回引用列表</Button>
          <h3>{selected.title}</h3>
          <div className="source-meta">第 {selected.page} 页 · 切片 {selected.index}</div>
          <div className="source-document">
            {sourceParts.length > 1 ? <>{sourceParts[0]}<mark className="source-highlight">{selected.content}</mark>{sourceParts.slice(1).join(selected.content)}</> : selected.content}
          </div>
          {!sourceMatched && <p className="source-note">原始文本不可用或与当前切片不完全匹配，以下仅展示引用切片，不能视为原文。</p>}
        </div>
      ) : (
        <div className="citation-list">
          {citations.map((citation, index) => (
            <button className="citation-card" key={citation.id} onClick={() => onSelect(citation)}>
              <span className="citation-title"><b>[{index + 1}]</b>{citation.title}</span>
              <span className="citation-excerpt">{citation.content}</span>
              <span className="citation-page">第 {citation.page} 页 · 查看原文</span>
            </button>
          ))}
        </div>
      )}
    </aside>
  );
};
