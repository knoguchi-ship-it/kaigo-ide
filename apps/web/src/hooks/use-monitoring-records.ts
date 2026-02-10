import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api-client';
import type { MonitoringRecord, PaginatedResponse } from '@kaigo-ide/types';

export function useMonitoringRecords(
  clientId: string | undefined,
  params?: { page?: number; limit?: number },
) {
  return useQuery({
    queryKey: ['monitoring-records', clientId, params],
    queryFn: () => {
      const qs = new URLSearchParams();
      if (params?.page) qs.set('page', String(params.page));
      if (params?.limit) qs.set('limit', String(params.limit));
      const str = qs.toString();
      return api.get<PaginatedResponse<MonitoringRecord>>(
        `/clients/${clientId}/monitoring-records${str ? `?${str}` : ''}`,
      );
    },
    enabled: !!clientId,
  });
}

export function useMonitoringRecord(clientId: string | undefined, id: string | undefined) {
  return useQuery({
    queryKey: ['monitoring-records', clientId, id],
    queryFn: () =>
      api.get<MonitoringRecord>(`/clients/${clientId}/monitoring-records/${id}`),
    enabled: !!clientId && !!id,
  });
}

export function useCreateMonitoringRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      clientId,
      ...data
    }: {
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
    }) =>
      api.post<MonitoringRecord>(
        `/clients/${clientId}/monitoring-records`,
        data,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoring-records'] });
    },
  });
}
