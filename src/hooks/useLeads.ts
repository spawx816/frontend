import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/api-client';
import type { Lead, Pipeline, LeadAttachment } from '../types/index.ts';

export function usePipelines() {
    return useQuery<Pipeline[]>({
        queryKey: ['pipelines'],
        queryFn: async () => {
            const { data } = await apiClient.get('/pipelines');
            return data;
        },
    });
}

export function usePipeline(id?: string) {
    return useQuery<Pipeline>({
        queryKey: ['pipelines', id],
        queryFn: async () => {
            const { data } = await apiClient.get(`/pipelines/${id}`);
            return data;
        },
        enabled: !!id,
    });
}

export function useLeads(pipelineId?: string) {
    return useQuery<Lead[]>({
        queryKey: ['leads', { pipelineId }],
        queryFn: async () => {
            const { data } = await apiClient.get('/leads', {
                params: { pipelineId },
            });
            return data;
        },
    });
}

export function useMoveLead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ leadId, stageId }: { leadId: string; stageId: string }) => {
            const { data } = await apiClient.patch(`/leads/${leadId}/stage`, { stageId });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
        },
    });
}

export function useUpdateLead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Lead> }) => {
            const { data: updatedData } = await apiClient.patch(`/leads/${id}`, data);
            return updatedData;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
        },
    });
}

export function useConvertLead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (leadId: string) => {
            const { data } = await apiClient.post(`/students/convert/${leadId}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            queryClient.invalidateQueries({ queryKey: ['students'] });
        },
    });
}

export function useLeadAttachments(leadId?: string) {
    return useQuery<LeadAttachment[]>({
        queryKey: ['lead-attachments', leadId],
        queryFn: async () => {
            const { data } = await apiClient.get(`/leads/${leadId}/attachments`);
            return data;
        },
        enabled: !!leadId,
    });
}

export function useUploadAttachment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ leadId, file }: { leadId: string; file: File }) => {
            const formData = new FormData();
            formData.append('file', file);
            const { data } = await apiClient.post(`/leads/${leadId}/attachments`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['lead-attachments', variables.leadId] });
        },
    });
}

export function useDeleteAttachment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ attachmentId }: { attachmentId: string; leadId: string }) => {
            await apiClient.delete(`/leads/attachments/${attachmentId}`);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['lead-attachments', variables.leadId] });
        },
    });
}

export function useUpdateStage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const { data: updatedData } = await apiClient.patch(`/pipelines/stages/${id}`, data);
            return updatedData;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pipelines'] });
        },
    });
}

export function useDeleteStage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await apiClient.delete(`/pipelines/stages/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pipelines'] });
        },
    });
}
