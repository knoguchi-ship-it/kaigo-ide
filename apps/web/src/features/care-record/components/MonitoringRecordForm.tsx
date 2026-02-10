import { useEffect, useRef, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Save, Sparkles, Star, Loader2 } from 'lucide-react';
import { RATING_LABELS, GOAL_TYPE_LABELS, type GoalType } from '@kaigo-ide/types';
import { useClients } from '../../../hooks/use-clients';
import { useCarePlans } from '../../../hooks/use-care-plans';
import { useCreateMonitoringRecord } from '../../../hooks/use-monitoring-records';
import { toast } from '../../../components/ui/Toast';
import { AiGenerateDialog } from '../../../components/ui/AiGenerateDialog';

interface MonitoringFormData {
  clientId: string;
  carePlanId: string;
  recordDate: string;
  evaluations: {
    goalId: string;
    goalText: string;
    goalType: GoalType;
    rating: number;
    comment: string;
  }[];
  overallComment: string;
  professionalJudgment: string;
  nextAction: string;
}

export function MonitoringRecordForm() {
  const navigate = useNavigate();
  const { data: clients, isLoading: clientsLoading } = useClients();
  const createMutation = useCreateMonitoringRecord();
  const [aiCommentIndex, setAiCommentIndex] = useState<number | null>(null);
  const [showAiOverall, setShowAiOverall] = useState(false);

  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors } } =
    useForm<MonitoringFormData>({
      defaultValues: {
        clientId: '',
        carePlanId: '',
        recordDate: new Date().toISOString().slice(0, 16),
        evaluations: [],
        overallComment: '',
        professionalJudgment: '',
        nextAction: '',
      },
    });

  const { fields, replace } = useFieldArray({ control, name: 'evaluations' });
  const selectedClientId = watch('clientId');
  const selectedCarePlanId = watch('carePlanId');

  const { data: carePlans, isLoading: plansLoading } = useCarePlans(
    selectedClientId || undefined,
  );

  // 利用者またはケアプラン変更時に目標リストを同期
  // 単一effectで競合を回避
  const prevClientRef = useRef('');
  useEffect(() => {
    // 利用者が変更された場合はケアプランをリセット
    if (selectedClientId !== prevClientRef.current) {
      prevClientRef.current = selectedClientId;
      setValue('carePlanId', '');
      replace([]);
      return;
    }

    // ケアプランが選択されていれば目標を設定
    if (selectedCarePlanId && carePlans) {
      const plan = carePlans.find((p) => p.id === selectedCarePlanId);
      if (plan) {
        replace(
          plan.goals.map((g) => ({
            goalId: g.id,
            goalText: g.text,
            goalType: g.type,
            rating: 3,
            comment: '',
          })),
        );
      } else {
        replace([]);
      }
    }
  }, [selectedClientId, selectedCarePlanId, carePlans, setValue, replace]);

  const onSubmit = async (data: MonitoringFormData) => {
    const recordDateISO = new Date(data.recordDate).toISOString();
    try {
      await createMutation.mutateAsync({
        clientId: data.clientId,
        carePlanId: data.carePlanId,
        recordDate: recordDateISO,
        evaluations: data.evaluations.map((e) => ({
          goalId: e.goalId,
          goalText: e.goalText,
          rating: Number(e.rating),
          comment: e.comment,
        })),
        overallComment: data.overallComment,
        professionalJudgment: data.professionalJudgment,
        nextAction: data.nextAction,
      });
      toast('success', 'モニタリング評価を保存しました');
      navigate('/care-records');
    } catch {
      toast('error', '保存に失敗しました');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">モニタリング評価</h2>
      <p className="text-sm text-gray-500 mb-6">
        第2表の目標ごとに達成度を評価します
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6">
        {/* 利用者・ケアプラン */}
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
              {clientsLoading && <option disabled>読み込み中...</option>}
              {clients?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.familyName} {c.givenName} 様
                </option>
              ))}
            </select>
            {errors.clientId && (
              <p className="text-red-500 text-xs mt-1">{errors.clientId.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              対象ケアプラン <span className="text-red-500">*</span>
            </label>
            <select
              {...register('carePlanId', { required: 'ケアプランを選択してください' })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
              disabled={!selectedClientId}
            >
              <option value="">
                {!selectedClientId
                  ? '先に利用者を選択'
                  : plansLoading
                    ? '読み込み中...'
                    : '選択してください'}
              </option>
              {carePlans?.map((p) => (
                <option key={p.id} value={p.id}>
                  第{p.version}版 ({new Date(p.createdDate).toLocaleDateString('ja-JP')}作成)
                  {p.goals.length > 0 && ` - 目標${p.goals.length}件`}
                </option>
              ))}
            </select>
            {errors.carePlanId && (
              <p className="text-red-500 text-xs mt-1">{errors.carePlanId.message}</p>
            )}
          </div>
        </div>

        {/* 実施日 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            モニタリング実施日 <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            {...register('recordDate', { required: '実施日を入力してください' })}
            className="w-full max-w-xs border border-gray-300 rounded-lg px-3 py-2.5"
          />
          {errors.recordDate && (
            <p className="text-red-500 text-xs mt-1">{errors.recordDate.message}</p>
          )}
        </div>

        {/* 目標別評価 */}
        {fields.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">目標別評価</h3>
              <div className="text-xs text-gray-400">
                1=未達成 / 3=概ね達成 / 5=大幅に達成
              </div>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => {
                const currentRating = watch(`evaluations.${index}.rating`);

                return (
                  <div
                    key={field.id}
                    className="bg-white border border-gray-200 rounded-xl p-5"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          field.goalType === 'LONG_TERM'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {GOAL_TYPE_LABELS[field.goalType]}
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
                          onClick={() => setAiCommentIndex(aiCommentIndex === index ? null : index)}
                          className="flex items-center gap-1 px-2 py-0.5 text-[10px] border border-purple-300 text-purple-700 rounded hover:bg-purple-50 transition-colors"
                        >
                          <Sparkles className="w-3 h-3" />
                          AI生成
                        </button>
                      </div>
                      {aiCommentIndex === index && (
                        <AiGenerateDialog
                          request={{
                            type: 'monitoring_comment',
                            context: {
                              goalText: field.goalText,
                              rating: Number(currentRating),
                            },
                          }}
                          onAccept={(text) => {
                            setValue(`evaluations.${index}.comment`, text);
                            setAiCommentIndex(null);
                          }}
                          onClose={() => setAiCommentIndex(null)}
                        />
                      )}
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
        )}

        {selectedCarePlanId && fields.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <p className="text-amber-700 text-sm">
              このケアプランには目標が登録されていません。ケアプランに目標を追加してください。
            </p>
          </div>
        )}

        {/* 総合所見 */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <label className="text-sm font-medium text-gray-700">総合所見</label>
            <button
              type="button"
              onClick={() => setShowAiOverall((v) => !v)}
              className="flex items-center gap-1 px-2 py-1 text-xs border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI生成（全評価から）
            </button>
          </div>
          {showAiOverall && (
            <AiGenerateDialog
              request={{
                type: 'monitoring_overall',
                context: {
                  evaluations: watch('evaluations').map((e) => ({
                    goalText: e.goalText,
                    rating: Number(e.rating),
                    comment: e.comment,
                  })),
                },
              }}
              onAccept={(text) => {
                setValue('overallComment', text);
                setShowAiOverall(false);
              }}
              onClose={() => setShowAiOverall(false)}
            />
          )}
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
            disabled={createMutation.isPending || fields.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {createMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            保存（Googleカレンダーに同期）
          </button>
        </div>
      </form>
    </div>
  );
}
