import { useForm } from 'react-hook-form';
import { Save, Sparkles, Mic } from 'lucide-react';
import {
  RECORD_CATEGORY_LABELS,
  type RecordCategory,
  type CreateCareRecordInput,
} from '@kaigo-ide/types';

const CATEGORIES = Object.entries(RECORD_CATEGORY_LABELS) as [
  RecordCategory,
  string,
][];

export function GeneralRecordForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateCareRecordInput>({
    defaultValues: {
      recordDate: new Date().toISOString().slice(0, 16),
      category: 'VISIT',
      content: '',
    },
  });

  const onSubmit = (data: CreateCareRecordInput) => {
    // TODO: API call
    console.log('Submit general record:', data);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">一般記録</h2>
      <p className="text-sm text-gray-500 mb-6">
        Googleカレンダー「KaigoIDE_支援経過記録」に保存されます
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
        {/* 利用者 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            利用者 <span className="text-red-500">*</span>
          </label>
          <select
            {...register('clientId', { required: '利用者を選択してください' })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
          >
            <option value="">選択してください</option>
            {/* TODO: Load from API */}
            <option value="client_1">山田 太郎 様</option>
            <option value="client_2">鈴木 花子 様</option>
          </select>
          {errors.clientId && (
            <p className="text-red-500 text-xs mt-1">{errors.clientId.message}</p>
          )}
        </div>

        {/* 記録日時 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            記録日時 <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            {...register('recordDate', { required: '日時を入力してください' })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
          />
        </div>

        {/* 区分 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            区分 <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(([value, label]) => (
              <label
                key={value}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 has-[:checked]:bg-primary-50 has-[:checked]:border-primary-500 has-[:checked]:text-primary-700 transition-colors"
              >
                <input
                  type="radio"
                  value={value}
                  {...register('category', { required: true })}
                  className="sr-only"
                />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 内容 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            内容 <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2 mb-2">
            <button
              type="button"
              className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Mic className="w-3.5 h-3.5" />
              音声入力
            </button>
            <button
              type="button"
              className="flex items-center gap-1 px-3 py-1.5 text-xs border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI生成
            </button>
          </div>
          <textarea
            {...register('content', {
              required: '内容を入力してください',
              maxLength: { value: 5000, message: '5000文字以内で入力してください' },
            })}
            rows={6}
            placeholder="支援経過の内容を入力してください..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 resize-y"
          />
          <p className="text-xs text-gray-400 mt-1">最大5,000文字</p>
          {errors.content && (
            <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>
          )}
        </div>

        {/* 関係機関 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            関係機関
          </label>
          <input
            type="text"
            {...register('relatedOrganization')}
            placeholder="例: ABCデイサービス"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
          />
        </div>

        {/* 介護支援専門員の判断 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            介護支援専門員の判断
          </label>
          <div className="flex items-center gap-2 mb-2">
            <button
              type="button"
              className="flex items-center gap-1 px-3 py-1.5 text-xs border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI提案
            </button>
          </div>
          <textarea
            {...register('professionalJudgment')}
            rows={3}
            placeholder="専門職としての判断を記載..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 resize-y"
          />
        </div>

        {/* 利用者・家族の考え */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            利用者・家族の考え
          </label>
          <textarea
            {...register('clientFamilyOpinion')}
            rows={3}
            placeholder="利用者またはご家族の意見・要望..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 resize-y"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            保存（Googleカレンダーに同期）
          </button>
        </div>
      </form>
    </div>
  );
}
