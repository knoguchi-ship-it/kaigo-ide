import { useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, FileDown, Calendar, Pencil, Trash2, Loader2, AlertCircle } from 'lucide-react';
import {
  RECORD_CATEGORY_LABELS,
  type RecordCategory,
  type Client,
} from '@kaigo-ide/types';
import { useClients } from '../../hooks/use-clients';
import { useCareRecords, useDeleteCareRecord, useExportPdf } from '../../hooks/use-care-records';
import { toast } from '../../components/ui/Toast';
import { useDebounce } from '../../hooks/use-debounce';

export function CareRecordListPage() {
  const navigate = useNavigate();
  const { data: clients } = useClients();

  const [selectedClientId, setSelectedClientId] = useState('');
  const [category, setCategory] = useState<RecordCategory | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebounce(keyword, 300);
  const [page, setPage] = useState(1);

  const { data: recordsData, isLoading, isError } = useCareRecords(
    selectedClientId || undefined,
    {
      category: category || undefined,
      from: dateFrom || undefined,
      to: dateTo || undefined,
      keyword: debouncedKeyword || undefined,
      page,
      limit: 20,
    },
  );

  const deleteMutation = useDeleteCareRecord();
  const exportPdfMutation = useExportPdf();

  const handleDelete = useCallback(async (clientId: string, recordId: string) => {
    if (!window.confirm('この記録を削除しますか？')) return;
    try {
      await deleteMutation.mutateAsync({ clientId, id: recordId });
      toast('success', '記録を削除しました');
    } catch {
      toast('error', '削除に失敗しました');
    }
  }, [deleteMutation]);

  const handleExportPdf = useCallback(async () => {
    if (!selectedClientId) return;
    try {
      await exportPdfMutation.mutateAsync({
        clientId: selectedClientId,
        from: dateFrom || undefined,
        to: dateTo || undefined,
      });
      toast('success', 'PDFをダウンロードしました');
    } catch {
      toast('error', 'PDF出力に失敗しました');
    }
  }, [selectedClientId, dateFrom, dateTo, exportPdfMutation]);

  const records = recordsData?.data ?? [];
  const meta = recordsData?.meta;

  // O(1) client lookup
  const clientMap = useMemo(() => {
    const map = new Map<string, Client>();
    clients?.forEach((c) => map.set(c.id, c));
    return map;
  }, [clients]);

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
          <button
            onClick={handleExportPdf}
            disabled={!selectedClientId || exportPdfMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {exportPdfMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            PDF出力
          </button>
          <button
            disabled
            title="今後実装予定"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Calendar className="w-4 h-4" />
            カレンダー表示
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">利用者</label>
            <select
              value={selectedClientId}
              onChange={(e) => { setSelectedClientId(e.target.value); setPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">選択してください</option>
              {clients?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.familyName} {c.givenName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">区分</label>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value as RecordCategory | ''); setPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">すべて</option>
              {Object.entries(RECORD_CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">期間</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <span className="text-gray-400">~</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">キーワード</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
              placeholder="検索..."
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {!selectedClientId ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">利用者を選択すると記録が表示されます</p>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : isError ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-600">記録の読み込みに失敗しました</p>
          <p className="text-sm text-gray-400 mt-1">ネットワークを確認してください</p>
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">記録がありません</p>
          <Link
            to="/care-records/new"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-4 h-4" />
            新規記録を作成
          </Link>
        </div>
      ) : (
        <>
          {/* Timeline */}
          <div className="space-y-3">
            {records.map((record) => {
              const client = clientMap.get(record.clientId);
              return (
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
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          {RECORD_CATEGORY_LABELS[record.category]}
                        </span>
                        {client && (
                          <span className="text-sm text-gray-500">
                            {client.familyName} {client.givenName}様
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-800 leading-relaxed">
                        {record.content}
                      </p>
                      {record.professionalJudgment && (
                        <p className="mt-2 text-sm text-gray-600 border-l-2 border-primary-300 pl-3">
                          <span className="font-medium">判断:</span>{' '}
                          {record.professionalJudgment}
                        </p>
                      )}
                      {record.relatedOrganization && (
                        <p className="mt-1 text-xs text-gray-400">
                          関係機関: {record.relatedOrganization}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      <button
                        onClick={() => navigate(`/clients/${record.clientId}/care-records/${record.id}/edit`)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        aria-label="編集"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(record.clientId, record.id)}
                        disabled={deleteMutation.isPending}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                        aria-label="削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                前へ
              </button>
              <span className="text-sm text-gray-600">
                {page} / {meta.totalPages} ページ（全{meta.total}件）
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page >= meta.totalPages}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                次へ
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
