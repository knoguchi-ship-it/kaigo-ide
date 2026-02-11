import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api-client';
import type {
  CareRecord,
  PaginatedResponse,
  RecordCategory,
} from '@kaigo-ide/types';

interface CareRecordQueryParams {
  category?: RecordCategory;
  from?: string;
  to?: string;
  keyword?: string;
  page?: number;
  limit?: number;
}

function buildQueryString(params: CareRecordQueryParams): string {
  const qs = new URLSearchParams();
  if (params.category) qs.set('category', params.category);
  if (params.from) qs.set('from', params.from);
  if (params.to) qs.set('to', params.to);
  if (params.keyword) qs.set('keyword', params.keyword);
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  const str = qs.toString();
  return str ? `?${str}` : '';
}

export function useCareRecords(
  clientId: string | undefined,
  params: CareRecordQueryParams = {},
) {
  return useQuery({
    queryKey: ['care-records', clientId, params],
    queryFn: () =>
      api.get<PaginatedResponse<CareRecord>>(
        `/clients/${clientId}/care-records${buildQueryString(params)}`,
      ),
    enabled: !!clientId,
  });
}

export function useCareRecord(clientId: string | undefined, id: string | undefined) {
  return useQuery({
    queryKey: ['care-records', clientId, id],
    queryFn: () => api.get<CareRecord>(`/clients/${clientId}/care-records/${id}`),
    enabled: !!clientId && !!id,
  });
}

export function useCreateCareRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      clientId,
      ...data
    }: {
      clientId: string;
      recordDate: string;
      category: RecordCategory;
      content: string;
      relatedOrganization?: string;
      professionalJudgment?: string;
      clientFamilyOpinion?: string;
    }) => api.post<CareRecord>(`/clients/${clientId}/care-records`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['care-records'] });
    },
  });
}

export function useUpdateCareRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      clientId,
      id,
      data,
    }: {
      clientId: string;
      id: string;
      data: Partial<{
        recordDate: string;
        category: RecordCategory;
        content: string;
        relatedOrganization: string;
        professionalJudgment: string;
        clientFamilyOpinion: string;
      }>;
    }) => api.patch<CareRecord>(`/clients/${clientId}/care-records/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['care-records'] });
    },
  });
}

export function useDeleteCareRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, id }: { clientId: string; id: string }) =>
      api.delete<void>(`/clients/${clientId}/care-records/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['care-records'] });
    },
  });
}

export function useExportPdf() {
  return useMutation({
    mutationFn: async ({
      clientId,
      from,
      to,
    }: {
      clientId: string;
      from?: string;
      to?: string;
    }) => {
      const qs = new URLSearchParams();
      if (from) qs.set('from', from);
      if (to) qs.set('to', to);
      const query = qs.toString();
      const path = `/clients/${clientId}/care-records/export/pdf${query ? `?${query}` : ''}`;
      const blob = await api.getBlob(path);

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `care-record-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
  });
}
