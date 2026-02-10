import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api-client';
import type { CarePlanSimple } from '@kaigo-ide/types';

export function useCarePlans(clientId: string | undefined) {
  return useQuery({
    queryKey: ['care-plans', clientId],
    queryFn: () => api.get<CarePlanSimple[]>(`/clients/${clientId}/care-plans`),
    enabled: !!clientId,
  });
}

export function useCarePlan(clientId: string | undefined, planId: string | undefined) {
  return useQuery({
    queryKey: ['care-plans', clientId, planId],
    queryFn: () =>
      api.get<CarePlanSimple>(`/clients/${clientId}/care-plans/${planId}`),
    enabled: !!clientId && !!planId,
  });
}
