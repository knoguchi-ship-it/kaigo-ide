import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ClipboardCheck, FileText } from 'lucide-react';
import { GeneralRecordForm } from '../../features/care-record/components/GeneralRecordForm';
import { MonitoringRecordForm } from '../../features/care-record/components/MonitoringRecordForm';
import type { CareRecordType } from '@kaigo-ide/types';

export function CareRecordNewPage() {
  const [selectedType, setSelectedType] = useState<CareRecordType | null>(null);

  if (!selectedType) {
    return (
      <div>
        <Link
          to="/care-records"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          記録一覧に戻る
        </Link>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">新規記録作成</h2>
        <p className="text-sm text-gray-500 mb-8">記録タイプを選択してください</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
          {/* モニタリング評価 */}
          <button
            onClick={() => setSelectedType('MONITORING')}
            className="bg-white rounded-xl border-2 border-gray-200 p-6 text-left hover:border-purple-400 hover:shadow-md transition-all group"
          >
            <div className="p-3 bg-purple-50 rounded-lg w-fit mb-4 group-hover:bg-purple-100 transition-colors">
              <ClipboardCheck className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              モニタリング評価
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              第2表の目標ごとに達成度を5段階で評価します。月1回のモニタリングに使用します。
            </p>
          </button>

          {/* 一般記録 */}
          <button
            onClick={() => setSelectedType('GENERAL')}
            className="bg-white rounded-xl border-2 border-gray-200 p-6 text-left hover:border-blue-400 hover:shadow-md transition-all group"
          >
            <div className="p-3 bg-blue-50 rounded-lg w-fit mb-4 group-hover:bg-blue-100 transition-colors">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              一般記録
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              訪問、電話、FAX、メール、会議等の日常の支援経過を記録します。
            </p>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setSelectedType(null)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        記録タイプ選択に戻る
      </button>

      {selectedType === 'GENERAL' ? (
        <GeneralRecordForm />
      ) : (
        <MonitoringRecordForm />
      )}
    </div>
  );
}
