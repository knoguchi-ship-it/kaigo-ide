import { useForm, useFieldArray } from 'react-hook-form';
import { Save, Sparkles, Star } from 'lucide-react';
import { RATING_LABELS } from '@kaigo-ide/types';

// TODO: Load from API (ケアプラン簡易管理の目標リスト)
const MOCK_GOALS = [
  { id: 'goal_1', type: 'LONG_TERM' as const, text: '自宅での生活を安全に継続する' },
  { id: 'goal_2', type: 'SHORT_TERM' as const, text: '週3回デイサービスに参加する' },
  { id: 'goal_3', type: 'SHORT_TERM' as const, text: '自力で入浴できる状態を維持する' },
  { id: 'goal_4', type: 'LONG_TERM' as const, text: '地域活動に月1回参加する' },
];

interface MonitoringFormData {
  clientId: string;
  carePlanId: string;
  recordDate: string;
  evaluations: {
    goalId: string;
    goalText: string;
    rating: number;
    comment: string;
  }[];
  overallComment: string;
  professionalJudgment: string;
  nextAction: string;
}

export function MonitoringRecordForm() {
  const { register, handleSubmit, control, watch, formState: { errors } } =
    useForm<MonitoringFormData>({
      defaultValues: {
        recordDate: new Date().toISOString().slice(0, 16),
        evaluations: MOCK_GOALS.map((g) => ({
          goalId: g.id,
          goalText: g.text,
          rating: 3,
          comment: '',
        })),
        overallComment: '',
        professionalJudgment: '',
        nextAction: '',
      },
    });

  const { fields } = useFieldArray({ control, name: 'evaluations' });

  const onSubmit = (data: MonitoringFormData) => {
    // TODO: API call
    console.log('Submit monitoring record:', data);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">モニタリング評価</h2>
      <p className="text-sm text-gray-500 mb-6">
        第2表の目標ごとに達成度を評価します
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6">
        {/* 利用者 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              利用者 <span className="text-red-500">*</span>
            </label>
            <select
              {...register('clientId', { required: '利用者を選択してください' })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
            >
              <option value="">選択してください</option>
              <option value="client_1">山田 太郎 様</option>
              <option value="client_2">鈴木 花子 様</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              対象ケアプラン <span className="text-red-500">*</span>
            </label>
            <select
              {...register('carePlanId', { required: 'ケアプランを選択してください' })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
            >
              <option value="">選択してください</option>
              <option value="plan_1">第1版 (2026-01-15作成)</option>
            </select>
          </div>
        </div>

        {/* 実施日 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            モニタリング実施日 <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            {...register('recordDate', { required: true })}
            className="w-full max-w-xs border border-gray-300 rounded-lg px-3 py-2.5"
          />
        </div>

        {/* 目標別評価 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">目標別評価</h3>
            <div className="text-xs text-gray-400">
              1=未達成 / 3=概ね達成 / 5=大幅に達成
            </div>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => {
              const goal = MOCK_GOALS.find((g) => g.id === field.goalId);
              const currentRating = watch(`evaluations.${index}.rating`);

              return (
                <div
                  key={field.id}
                  className="bg-white border border-gray-200 rounded-xl p-5"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        goal?.type === 'LONG_TERM'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {goal?.type === 'LONG_TERM' ? '長期' : '短期'}
                    </span>
                    <p className="text-sm font-medium text-gray-800">
                      {field.goalText}
                    </p>
                  </div>

                  {/* 5段階評価 */}
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <label
                        key={rating}
                        className="flex flex-col items-center cursor-pointer group"
                      >
                        <input
                          type="radio"
                          value={rating}
                          {...register(`evaluations.${index}.rating`, {
                            valueAsNumber: true,
                          })}
                          className="sr-only"
                        />
                        <Star
                          className={`w-8 h-8 transition-colors ${
                            rating <= Number(currentRating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300 group-hover:text-yellow-200'
                          }`}
                        />
                        <span className="text-[10px] text-gray-400 mt-0.5">
                          {RATING_LABELS[rating]}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* 評価コメント */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <label className="text-xs text-gray-500">評価コメント</label>
                      <button
                        type="button"
                        className="flex items-center gap-1 px-2 py-0.5 text-[10px] border border-purple-300 text-purple-700 rounded hover:bg-purple-50 transition-colors"
                      >
                        <Sparkles className="w-3 h-3" />
                        AI生成
                      </button>
                    </div>
                    <textarea
                      {...register(`evaluations.${index}.comment`)}
                      rows={2}
                      placeholder="この目標に対する評価コメント..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-y"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 総合所見 */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <label className="text-sm font-medium text-gray-700">総合所見</label>
            <button
              type="button"
              className="flex items-center gap-1 px-2 py-1 text-xs border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI生成（全評価から）
            </button>
          </div>
          <textarea
            {...register('overallComment')}
            rows={4}
            placeholder="モニタリング全体の所見..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 resize-y"
          />
        </div>

        {/* 専門職としての判断 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            介護支援専門員の判断
          </label>
          <textarea
            {...register('professionalJudgment')}
            rows={3}
            placeholder="ケアプランの変更要否、サービス内容の見直し等..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 resize-y"
          />
        </div>

        {/* 今後の対応 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            今後の対応方針
          </label>
          <textarea
            {...register('nextAction')}
            rows={3}
            placeholder="次月以降の支援方針、サービス調整の予定等..."
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
