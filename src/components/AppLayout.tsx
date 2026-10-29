import {
  BellOutlined,
  BookOutlined,
  CommentOutlined,
  DatabaseOutlined,
  DeploymentUnitOutlined,
  DownOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  RobotOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Alert, Avatar, Button, Tooltip } from 'antd';
import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const navigation = [
  { key: 'data', label: '数据管理', icon: <DatabaseOutlined />, path: '/datasets', children: [{ label: '数据集管理', path: '/datasets' }] },
  { key: 'knowledge', label: '知识库管理', icon: <BookOutlined />, path: '/knowledge', children: [{ label: '知识库管理', path: '/knowledge' }] },
  { key: 'agents', label: '智能体中心', icon: <RobotOutlined />, path: '/agents', children: [{ label: '智能体广场', path: '/agents' }] },
];

export const AppLayout = () => {
  const location = useLocation();
  const { storageError } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`app-shell ${collapsed ? 'is-collapsed' : ''}`}>
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark"><DeploymentUnitOutlined /></span>
          <span>时空智能物联网系统</span>
        </div>
        <div className="header-actions">
          <Tooltip title="暂无新通知">
            <span tabIndex={0} aria-label="暂无新通知"><BellOutlined className="header-icon" /></span>
          </Tooltip>
          <Avatar size={28} className="header-avatar">管</Avatar>
          <span className="header-user">admin</span>
        </div>
      </header>
      {storageError && <Alert className="storage-alert" type="error" title={storageError} showIcon />}
      <div className="app-body">
        <aside className="app-sidebar">
          <nav aria-label="主导航" className="main-nav">
            {navigation.map((item) => {
              const active = location.pathname.startsWith(item.path);
              return (
                <div className={`nav-group ${active ? 'active' : ''}`} key={item.key}>
                  <NavLink to={item.path} className="nav-group-title" aria-label={item.label} title={item.label}>
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                    <DownOutlined className="nav-arrow" />
                  </NavLink>
                  <div className="nav-children">
                    {item.children.map((child) => (
                      <NavLink key={child.path} to={child.path} className="nav-child">
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              );
            })}
            <NavLink to="/settings" className={({ isActive }) => `nav-single ${isActive ? 'active' : ''}`} aria-label="配置中心" title="配置中心">
              <span className="nav-icon"><SettingOutlined /></span><span className="nav-label">配置中心</span>
            </NavLink>
            <NavLink to="/records" className={({ isActive }) => `nav-single ${isActive ? 'active' : ''}`} aria-label="问答记录" title="问答记录">
              <span className="nav-icon"><CommentOutlined /></span><span className="nav-label">问答记录</span>
            </NavLink>
          </nav>
          <Button
            type="text"
            className="sidebar-collapse"
            aria-label={collapsed ? '展开侧栏' : '收起侧栏'}
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed((value) => !value)}
          />
        </aside>
        <main className="app-main"><Outlet key={location.pathname} /></main>
      </div>
    </div>
  );
};
