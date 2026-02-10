import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { GeneralRecordForm } from '../../features/care-record/components/GeneralRecordForm';
import { useCareRecord } from '../../hooks/use-care-records';

export function CareRecordEditPage() {
  const { clientId, id } = useParams<{ clientId: string; id: string }>();

  const { data: record, isLoading, isError } = useCareRecord(clientId, id);

  return (
    <div>
      <Link
        to="/care-records"
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        記録一覧に戻る
      </Link>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : isError ? (
        <div className="text-center py-12">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-600">記録の読み込みに失敗しました</p>
        </div>
      ) : !record ? (
        <div className="text-center py-12">
          <p className="text-gray-500">記録が見つかりません</p>
        </div>
      ) : (
        <GeneralRecordForm editRecord={record} />
      )}
    </div>
  );
}
