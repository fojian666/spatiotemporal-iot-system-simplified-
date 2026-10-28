import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppProvider } from '../context/AppContext';
import { KnowledgeImportPage } from './KnowledgeImportPage';

describe('KnowledgeImportPage', () => {
  it('does not offer disabled or unparsed datasets for import', () => {
    render(
      <AppProvider>
        <MemoryRouter><KnowledgeImportPage /></MemoryRouter>
      </AppProvider>,
    );

    expect(screen.getByText('土地利用总体规划编制审批规定.txt')).toBeInTheDocument();
    expect(screen.queryByText('建设用地审查报批材料规范.pdf')).not.toBeInTheDocument();
    expect(screen.queryByText('自然资源调查监测体系方案.txt')).not.toBeInTheDocument();
  });
});
