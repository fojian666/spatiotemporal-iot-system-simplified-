import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppProvider } from '../context/AppContext';
import { AgentsPage } from './AgentsPage';

describe('AgentsPage', () => {
  it('filters agent cards by a real name search', async () => {
    const user = userEvent.setup();
    render(
      <AppProvider>
        <MemoryRouter><AgentsPage /></MemoryRouter>
      </AppProvider>,
    );

    expect(screen.getByText('自然资源智能问答')).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText('搜索智能体'), '文旅');

    expect(screen.getByText('文旅助手')).toBeInTheDocument();
    expect(screen.queryByText('自然资源智能问答')).not.toBeInTheDocument();
  });
});
