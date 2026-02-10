import { Link } from 'react-router-dom';
import { Plus, FileDown, Calendar } from 'lucide-react';
import {
  RECORD_CATEGORY_LABELS,
  type RecordCategory,
} from '@kaigo-ide/types';

// TODO: Replace with real data from API
const MOCK_RECORDS = [
  {
    id: '1',
    recordType: 'GENERAL' as const,
    clientName: '山田 太郎',
    recordDate: '2026-02-04T14:30:00',
    category: 'VISIT' as RecordCategory,
    content:
      '自宅訪問。体調良好。血圧128/82。食事量も安定しており、デイサービスの利用も継続的に行えている。',
    judgment: 'サービス継続で問題なし。次回モニタリング時に歩行状態を再確認。',
  },
  {
    id: '2',
    recordType: 'MONITORING' as const,
    clientName: '山田 太郎',
    recordDate: '2026-02-01T10:00:00',
    overallComment:
      '全体的に目標はおおむね達成できている。デイサービスの参加は安定。歩行能力の維持が今後の課題。',
  },
  {
    id: '3',
    recordType: 'GENERAL' as const,
    clientName: '鈴木 花子',
    recordDate: '2026-02-03T10:15:00',
    category: 'PHONE' as RecordCategory,
    content:
      'デイサービスより連絡。先週の利用状況について報告あり。食事量がやや減少傾向。',
    relatedOrg: 'ABCデイサービス',
  },
];

export function CareRecordListPage() {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            支援経過記録（第5表）
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Googleカレンダー「KaigoIDE_支援経過記録」と同期
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/care-records/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            新規記録
          </Link>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <FileDown className="w-4 h-4" />
            PDF出力
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar className="w-4 h-4" />
            カレンダー表示
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">利用者</label>
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">全員</option>
              <option>山田 太郎</option>
              <option>鈴木 花子</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">記録タイプ</label>
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">すべて</option>
              <option value="GENERAL">一般記録</option>
              <option value="MONITORING">モニタリング評価</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">期間</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <span className="text-gray-400">〜</span>
              <input
                type="date"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">キーワード</label>
            <input
              type="text"
              placeholder="検索..."
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {MOCK_RECORDS.map((record) => (
          <div
            key={record.id}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <time className="text-sm font-medium text-gray-700">
                    {new Date(record.recordDate).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                  {record.recordType === 'GENERAL' && record.category && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      {RECORD_CATEGORY_LABELS[record.category]}
                    </span>
                  )}
                  {record.recordType === 'MONITORING' && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                      モニタリング評価
                    </span>
                  )}
                  <span className="text-sm text-gray-500">
                    {record.clientName}様
                  </span>
                </div>
                <p className="text-sm text-gray-800 leading-relaxed">
                  {record.recordType === 'GENERAL'
                    ? record.content
                    : record.overallComment}
                </p>
                {record.recordType === 'GENERAL' && record.judgment && (
                  <p className="mt-2 text-sm text-gray-600 border-l-2 border-primary-300 pl-3">
                    <span className="font-medium">判断:</span>{' '}
                    {record.judgment}
                  </p>
                )}
                {record.recordType === 'GENERAL' &&
                  'relatedOrg' in record &&
                  record.relatedOrg && (
                    <p className="mt-1 text-xs text-gray-400">
                      関係機関: {record.relatedOrg}
                    </p>
                  )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
