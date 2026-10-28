import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppProvider } from '../context/AppContext';
import { initialState } from '../data/fixtures';
import { ChatPage } from './ChatPage';

const renderChat = (path = '/agents/agent-natural/chat') => render(
  <AppProvider>
    <MemoryRouter initialEntries={[path]}>
      <Routes><Route path="/agents/:id/chat" element={<ChatPage />} /></Routes>
    </MemoryRouter>
  </AppProvider>,
);

describe('ChatPage', () => {
  it('does not send while confirming text with an input method', () => {
    renderChat();
    const input = screen.getByPlaceholderText('请输入您的问题，Shift + Enter 换行');
    fireEvent.change(input, { target: { value: '土地利用' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', keyCode: 13, isComposing: true });
    expect(input).toHaveValue('土地利用');
    expect(screen.queryByText('二、核心回答')).not.toBeInTheDocument();
  });

  it('answers from enabled knowledge and opens a highlighted citation', async () => {
    const user = userEvent.setup();
    renderChat();

    const input = screen.getByPlaceholderText('请输入您的问题，Shift + Enter 换行');
    await user.type(input, '土地利用总体规划如何审批');
    await user.click(screen.getByRole('button', { name: '发送' }));

    expect(await screen.findByText('二、核心回答')).toBeInTheDocument();
    expect(screen.getAllByText(/省、自治区、直辖市的土地利用总体规划/).length).toBeGreaterThan(0);
    const sources = screen.getByLabelText('参考来源');
    const citation = within(sources).getAllByRole('button', { name: /土地利用总体规划编制审批规定/ })[0];
    await user.click(citation);

    expect(within(sources).getByText('原文预览')).toBeInTheDocument();
    expect(within(sources).getByText(/省、自治区、直辖市的土地利用总体规划/)).toHaveClass('source-highlight');
  });

  it('does not label a retained citation as original text after its source is deleted', async () => {
    localStorage.setItem('industry-llm-platform-state-v1', JSON.stringify({
      ...initialState,
      datasets: initialState.datasets.filter((dataset) => dataset.id !== 'ds-001'),
    }));
    const user = userEvent.setup();
    renderChat('/agents/agent-natural/chat?conversation=conv-001');
    const sources = screen.getByLabelText('参考来源');
    await user.click(within(sources).getByRole('button', { name: /土地利用总体规划编制审批规定/ }));
    expect(within(sources).getByText('切片预览')).toBeInTheDocument();
    expect(sources.querySelector('mark')).toBeNull();
  });

  it('restores citations when continuing a persisted conversation', () => {
    renderChat('/agents/agent-natural/chat?conversation=conv-001');

    expect(screen.getByText('一、问题概述')).toBeInTheDocument();
    expect(screen.getByLabelText('参考来源')).toBeInTheDocument();
  });

  it('does not read or overwrite a conversation owned by another agent', async () => {
    const user = userEvent.setup();
    renderChat('/agents/agent-travel/chat?conversation=conv-001');

    expect(screen.getByText('您好，我是文旅助手')).toBeInTheDocument();
    expect(screen.queryByText('一、问题概述')).not.toBeInTheDocument();
    await user.type(screen.getByPlaceholderText('请输入您的问题，Shift + Enter 换行'), '新的问题');
    await user.click(screen.getByRole('button', { name: '发送' }));

    await waitFor(() => {
      const stored = JSON.parse(window.localStorage.getItem('industry-llm-platform-state-v1') ?? '{}');
      expect(stored.conversations.find((conversation: { id: string }) => conversation.id === 'conv-001').agentId).toBe('agent-natural');
    });
  });

  it('starts a fresh conversation from the welcome screen', async () => {
    const user = userEvent.setup();
    renderChat();

    await user.click(screen.getByRole('button', { name: /新建会话/ }));

    expect(screen.getByText('您好，我是自然资源智能管家')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请输入您的问题，Shift + Enter 换行')).toHaveValue('');
  });
});
