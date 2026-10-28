import { CheckCircleFilled, SettingOutlined } from '@ant-design/icons';
import { Button, Form, Select, Slider } from 'antd';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { AppSettings } from '../types';

export const SettingsPage = () => {
  const { state, dispatch } = useApp();
  const [settings, setSettings] = useState<AppSettings>(state.settings);
  const [saved, setSaved] = useState(false);

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const save = () => {
    setSaved(dispatch({ type: 'settings/update', payload: settings }));
  };

  return (
    <section className="page settings-page">
      <div className="page-header-row"><h1 className="page-title">配置中心</h1></div>
      <div className="content-card settings-card">
        <div className="panel-heading"><span className="section-marker" />问答配置</div>
        <Form layout="vertical" onFinish={save} className="settings-form">
          <Form.Item label="默认模型" required>
            <Select aria-label="默认模型" value={settings.model} onChange={(value) => update('model', value)} options={[{ value: 'DeepSeek-V3', label: 'DeepSeek-V3' }, { value: 'Qwen-Max', label: 'Qwen-Max' }]} />
          </Form.Item>
          <Form.Item label="默认知识库" required>
            <Select aria-label="默认知识库" value={settings.knowledgeBaseId} onChange={(value) => update('knowledgeBaseId', value)} options={state.knowledgeBases.map((base) => ({ value: base.id, label: base.name }))} />
          </Form.Item>
          <Form.Item label="回答随机性（Temperature）">
            <Slider disabled min={0} max={1} step={0.1} value={settings.temperature} marks={{ 0: '严谨', 0.5: '均衡', 1: '发散' }} />
          </Form.Item>
          <Form.Item><Button type="primary" htmlType="submit" icon={<SettingOutlined />}>保存配置</Button>{saved && <span className="settings-saved" role="status"><CheckCircleFilled />配置已保存</span>}</Form.Item>
        </Form>
        <div className="settings-note">当前版本在浏览器内执行本地知识检索，不调用外部模型接口；模型选项仅作为界面配置保存，回答随机性暂不生效。</div>
      </div>
    </section>
  );
};
