import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppProvider } from '../context/AppContext';
import { ChunksPage } from './ChunksPage';

const renderPage = () => render(
  <AppProvider>
    <MemoryRouter initialEntries={['/knowledge/kb-001/chunks/doc-001']}>
      <Routes>
        <Route path="/knowledge/:id/chunks/:documentId" element={<ChunksPage />} />
      </Routes>
    </MemoryRouter>
  </AppProvider>,
);

describe('ChunksPage', () => {
  it('edits a knowledge chunk and shows the saved content in the table', async () => {
    const user = userEvent.setup();
    renderPage();

    const rows = screen.getAllByRole('row');
    const firstChunkRow = rows.find((row) => within(row).queryByText('土地利用总体规划实行分级审批。省、自治区、直辖市的土地利用总体规划，报国务院批准。'));
    expect(firstChunkRow).toBeDefined();
    await user.click(within(firstChunkRow!).getByRole('button', { name: /编辑/ }));

    const dialog = screen.getByRole('dialog');
    const editor = within(dialog).getByLabelText('切片内容');
    await user.clear(editor);
    await user.type(editor, '编辑后的知识切片');
    await user.click(within(dialog).getByRole('button', { name: /保\s*存/ }));

    expect(within(firstChunkRow!).getByText('编辑后的知识切片')).toBeInTheDocument();
  });
});
