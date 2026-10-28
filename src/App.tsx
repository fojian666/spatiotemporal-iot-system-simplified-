import { App as AntdApp, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { AgentsPage } from './pages/AgentsPage';
import { ChatPage } from './pages/ChatPage';
import { ChunksPage } from './pages/ChunksPage';
import { DatasetPreviewPage } from './pages/DatasetPreviewPage';
import { DatasetsPage } from './pages/DatasetsPage';
import { KnowledgeDetailPage } from './pages/KnowledgeDetailPage';
import { KnowledgeImportPage } from './pages/KnowledgeImportPage';
import { KnowledgePage } from './pages/KnowledgePage';
import { RecordsPage } from './pages/RecordsPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#6355e7',
          colorInfo: '#6355e7',
          colorText: '#292b36',
          colorTextSecondary: '#858894',
          colorBorder: '#e9eaf0',
          borderRadius: 4,
          fontSize: 13,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
        },
        components: {
          Button: { controlHeight: 32, primaryShadow: 'none' },
          Table: { headerBg: '#f7f7fb', headerColor: '#3a3c47', rowHoverBg: '#faf9ff' },
          Menu: { itemSelectedColor: '#6355e7', itemSelectedBg: '#f0efff' },
        },
      }}
    >
      <AntdApp>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/datasets" replace />} />
            <Route path="/datasets" element={<DatasetsPage />} />
            <Route path="/datasets/:id" element={<DatasetPreviewPage />} />
            <Route path="/knowledge" element={<KnowledgePage />} />
            <Route path="/knowledge/import" element={<KnowledgeImportPage />} />
            <Route path="/knowledge/:id" element={<KnowledgeDetailPage />} />
            <Route path="/knowledge/:id/chunks/:documentId" element={<ChunksPage />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/agents/:id/chat" element={<ChatPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/records" element={<RecordsPage />} />
            <Route path="*" element={<Navigate to="/datasets" replace />} />
          </Route>
        </Routes>
      </AntdApp>
    </ConfigProvider>
  );
}
