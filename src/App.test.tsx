import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from './App';
import { AppProvider } from './context/AppContext';

describe('application shell', () => {
  it('opens the dataset manager inside the branded administration layout', () => {
    render(
      <AppProvider>
        <MemoryRouter initialEntries={['/datasets']}>
          <App />
        </MemoryRouter>
      </AppProvider>,
    );

    expect(screen.getByText('行业大模型管理平台')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: '主导航' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '数据集管理' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /土地利用总体规划编制审批规定.txt/ })).toHaveAttribute('href', '/datasets/ds-001');
    expect(screen.getByRole('link', { name: '智能体中心' })).toHaveAttribute('href', '/agents');
  });
});
