import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppProvider } from '../context/AppContext';
import { RecordsPage } from './RecordsPage';

describe('RecordsPage', () => {
  it('finds persisted conversations by title', async () => {
    const user = userEvent.setup();
    render(<AppProvider><MemoryRouter><RecordsPage /></MemoryRouter></AppProvider>);

    await user.type(screen.getByPlaceholderText('搜索会话标题'), '永久基本农田');

    expect(screen.getByText('永久基本农田保护要求')).toBeInTheDocument();
    expect(screen.queryByText('土地利用总体规划审批权限')).not.toBeInTheDocument();
  });
});
