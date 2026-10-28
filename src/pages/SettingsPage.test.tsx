import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { AppProvider } from '../context/AppContext';
import { SettingsPage } from './SettingsPage';

describe('SettingsPage', () => {
  it('reports a rejected storage write without claiming success and allows retry', async () => {
    const user = userEvent.setup();
    render(<AppProvider><MemoryRouter initialEntries={['/settings']}><App /></MemoryRouter></AppProvider>);
    fireEvent.mouseDown(screen.getByRole('combobox', { name: '默认模型' }));
    const options = await screen.findAllByText('Qwen-Max');
    fireEvent.click(options[options.length - 1]);
    const storage = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });
    try {
      await user.click(screen.getByRole('button', { name: /保存配置/ }));
      expect(await screen.findByRole('alert')).toHaveTextContent('未保存');
      expect(screen.queryByText('配置已保存')).not.toBeInTheDocument();
    } finally {
      storage.mockRestore();
    }
    await user.click(screen.getByRole('button', { name: /保存配置/ }));
    expect(await screen.findByText('配置已保存')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('industry-llm-platform-state-v1')!).settings.model).toBe('Qwen-Max');
  });

  it('remains readable when access to browser storage is denied', async () => {
    const storage = vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new DOMException('Access denied', 'SecurityError');
    });
    try {
      const user = userEvent.setup();
      render(<AppProvider><MemoryRouter initialEntries={['/settings']}><App /></MemoryRouter></AppProvider>);
      expect(screen.getByRole('heading', { name: '配置中心' })).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: /保存配置/ }));
      expect(await screen.findByRole('alert')).toHaveTextContent('未保存');
      expect(screen.queryByText('配置已保存')).not.toBeInTheDocument();
    } finally {
      storage.mockRestore();
    }
  });

  it('persists a changed default model', async () => {
    const user = userEvent.setup();
    render(<AppProvider><SettingsPage /></AppProvider>);

    fireEvent.mouseDown(screen.getByRole('combobox', { name: '默认模型' }));
    const options = await screen.findAllByText('Qwen-Max');
    fireEvent.click(options[options.length - 1]);
    await user.click(screen.getByRole('button', { name: /保\s*存配置/ }));

    expect(await screen.findByText('配置已保存')).toBeInTheDocument();
    await waitFor(() => {
      const stored = JSON.parse(window.localStorage.getItem('industry-llm-platform-state-v1') ?? '{}');
      expect(stored.settings.model).toBe('Qwen-Max');
    });
  });
});
