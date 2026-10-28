import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppProvider } from '../context/AppContext';
import { DatasetsPage } from './DatasetsPage';

const renderPage = () => render(
  <AppProvider>
    <MemoryRouter>
      <DatasetsPage />
    </MemoryRouter>
  </AppProvider>,
);

describe('DatasetsPage', () => {
  it('filters the real dataset rows by name', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByPlaceholderText('请输入数据集名称'), '土地管理法');
    await user.click(screen.getByRole('button', { name: /查\s*询/ }));

    expect(screen.getByText('中华人民共和国土地管理法.txt')).toBeInTheDocument();
    expect(screen.queryByText('土地利用总体规划编制审批规定.txt')).not.toBeInTheDocument();
  });

  it('adds a readable text upload to the dataset table', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /新建数据集/ }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('新建数据集')).toBeInTheDocument();
    const input = within(dialog).getByLabelText('选择数据文件');
    const file = new File(['国土空间规划应当坚持生态优先。'], '生态优先规划.txt', { type: 'text/plain' });
    await user.upload(input, file);
    await within(dialog).findByText('生态优先规划.txt');
    await user.click(within(dialog).getByRole('button', { name: /确\s*定/ }));

    await waitFor(() => expect(screen.getByText('生态优先规划.txt')).toBeInTheDocument());
  });

  it('does not upload a stale valid file after an invalid reselection', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /新建数据集/ }));
    const dialog = screen.getByRole('dialog');
    const input = within(dialog).getByLabelText('选择数据文件');
    fireEvent.change(input, { target: { files: [new File(['有效文本'], '有效文件.txt', { type: 'text/plain' })] } });
    expect(await within(dialog).findByText('有效文件.txt')).toBeInTheDocument();

    fireEvent.change(input, { target: { files: [new File(['binary'], '错误文件.pdf', { type: 'application/pdf' })] } });
    expect(within(dialog).getByRole('alert')).toHaveTextContent(/文本文件/);
    expect(within(dialog).queryByText('有效文件.txt')).not.toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: /确\s*定/ }));

    expect(screen.queryByText('有效文件.txt')).not.toBeInTheDocument();
  });

  it('resets applied filters', async () => {
    const user = userEvent.setup();
    renderPage();

    const search = screen.getByPlaceholderText('请输入数据集名称');
    await user.type(search, '不存在的文件');
    await user.click(screen.getByRole('button', { name: /查\s*询/ }));
    expect(screen.queryByText('中华人民共和国土地管理法.txt')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /重\s*置/ }));
    expect(screen.getByText('中华人民共和国土地管理法.txt')).toBeInTheDocument();
    expect(search).toHaveValue('');
  });
});
