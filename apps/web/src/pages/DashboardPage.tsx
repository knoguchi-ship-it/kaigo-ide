import { Link } from 'react-router-dom';
import { FileText, ClipboardList, Plus } from 'lucide-react';

export function DashboardPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">ダッシュボード</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 支援経過記録 カード */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-50 rounded-lg">
                <FileText className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold">支援経過記録（第5表）</h3>
            </div>
            <Link
              to="/care-records/new"
              className="flex items-center gap-1 px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              新規記録
            </Link>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            日々の支援経過とモニタリング評価を記録します
          </p>
          <Link
            to="/care-records"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            記録一覧を表示 →
          </Link>
        </div>

        {/* 担当者会議 カード */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <ClipboardList className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">担当者会議（第4表）</h3>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            サービス担当者会議の記録と厚労省様式でのPDF出力
          </p>
          <span className="text-sm text-gray-400">（後続実装予定）</span>
        </div>
      </div>
    </div>
  );
}
