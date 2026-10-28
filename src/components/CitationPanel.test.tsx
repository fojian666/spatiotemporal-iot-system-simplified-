import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { KnowledgeChunk } from '../types';
import { CitationPanel } from './CitationPanel';

const editedChunk: KnowledgeChunk = {
  id: 'chunk-edited',
  documentId: 'doc-1',
  title: '政策文档',
  index: 1,
  page: 1,
  content: '用户在切片中编辑后的内容',
  keywords: [],
  enabled: true,
};

describe('CitationPanel', () => {
  it('does not present an unmatched edited chunk as original source text', () => {
    const { container } = render(
      <CitationPanel citations={[editedChunk]} selected={editedChunk} sourceContent="原始文档正文" onSelect={vi.fn()} onClose={vi.fn()} />,
    );

    expect(screen.getByText('切片预览')).toBeInTheDocument();
    expect(screen.queryByText('原文预览')).not.toBeInTheDocument();
    expect(container.querySelector('mark.source-highlight')).toBeNull();
  });
});
