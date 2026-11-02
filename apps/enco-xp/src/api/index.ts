import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Asset, CreateWorkOrderRequest, FindingView, QualityFlag, Savings, Telemetry } from '@enco/contract';
import { post, request } from './client';

export interface Overview { kw_per_rt: number; kw_per_rt_baseline: number; plant_load_rt: number; energy_today_kwh: number; pending_findings: number; savings_thb_mtd: number; trend: { labels: string[]; actual: number[]; baseline: number[] } }
export interface Energy { hourly_load_rt: number[]; kw_per_rt_by_chiller: { asset_id: string; name: string; kw_per_rt: number }[] }
export interface DqRow { asset_id: string; tag: string; unit: string; quality_flag: QualityFlag; completeness: number; last_seen: string }

export const useOverview = () => useQuery({ queryKey: ['overview'], queryFn: () => request<Overview>('/overview') });
export const useAssets = () => useQuery({ queryKey: ['assets'], queryFn: () => request<Asset[]>('/assets') });
export const useAsset = (id: string) => useQuery({ queryKey: ['assets', id], queryFn: () => request<Asset>(`/assets/${id}`) });
export const useTelemetry = (asset_id: string, tag: string) =>
  useQuery({ queryKey: ['telemetry', asset_id, tag], enabled: !!tag, queryFn: () => request<Telemetry[]>(`/telemetry?asset_id=${asset_id}&tag=${encodeURIComponent(tag)}`) });
export const useEnergy = () => useQuery({ queryKey: ['energy'], queryFn: () => request<Energy>('/energy') });
export const useFindings = () => useQuery({ queryKey: ['findings'], queryFn: () => request<FindingView[]>('/findings') });
export const useFinding = (id: string) => useQuery({ queryKey: ['findings', id], queryFn: () => request<FindingView>(`/findings/${id}`) });
export const useSavings = () => useQuery({ queryKey: ['savings'], queryFn: () => request<Savings[]>('/savings') });
export const useDataQuality = () => useQuery({ queryKey: ['dq'], queryFn: () => request<DqRow[]>('/data-quality') });

function useFindingAction<V>(fn: (v: V) => Promise<FindingView>) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => { qc.invalidateQueries({ queryKey: ['findings'] }); qc.invalidateQueries({ queryKey: ['overview'] }); } });
}
export const useCreateWorkOrder = () => useFindingAction((r: CreateWorkOrderRequest) => post<FindingView>(`/findings/${r.finding_id}/work-order`, r));
export const useRejectFinding = () => useFindingAction((r: { finding_id: string; reason: string }) => post<FindingView>(`/findings/${r.finding_id}/reject`, r));
export const useCompleteWorkOrder = () => useFindingAction((id: string) => post<FindingView>(`/findings/${id}/wo-complete`));
export const useCloseFinding = () => useFindingAction((id: string) => post<FindingView>(`/findings/${id}/close`));
export const useReopenWorkOrder = () => useFindingAction((id: string) => post<FindingView>(`/findings/${id}/reopen`));
