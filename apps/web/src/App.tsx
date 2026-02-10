import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { CareRecordListPage } from './pages/care-record/CareRecordListPage';
import { CareRecordNewPage } from './pages/care-record/CareRecordNewPage';

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/care-records" element={<CareRecordListPage />} />
        <Route path="/care-records/new" element={<CareRecordNewPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
