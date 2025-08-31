// src/app/features/Tasks/useTasks.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  endpoints,
  type Task,
  type SubmitAnswerPayload,
  type SubmitAnswerResponse,
} from "../../services/endpoints";

/** Ключи кэша (можно централизовать) */
export const QK = {
  tasks: ["tasks"] as const,
  battle: ["battle"] as const, // для инвалидации после отправки ответа
};

/**
 * Хук для работы с задачами:
 * - useQuery: получение списка задач через getTasks
 * - useMutation: отправка ответа через submitAnswer
 * - onSuccess: инвалидация ["battle"] (по плану), чтобы обновить данные битвы
 */
export function useTasks() {
  const qc = useQueryClient();

  const tasksQuery = useQuery<Task[]>({
    queryKey: QK.tasks,
    queryFn: () => endpoints.getTasks(),
    // при желании: staleTime / gcTime / retry
  });

  const submitAnswerMutation = useMutation<
    SubmitAnswerResponse,
    unknown,
    SubmitAnswerPayload
  >({
    mutationFn: (payload) => endpoints.submitAnswer(payload),
    onSuccess: async () => {
      // по плану: обновляем данные битвы
      await qc.invalidateQueries({ queryKey: QK.battle });
      // при необходимости можно также обновить список задач:
      // await qc.invalidateQueries({ queryKey: QK.tasks });
    },
  });

  return {
    // данные задач
    tasks: tasksQuery.data ?? [],
    isLoading: tasksQuery.isLoading,
    isError: tasksQuery.isError,
    error: tasksQuery.error,
    refetch: tasksQuery.refetch,

    // отправка ответа
    submitAnswer: submitAnswerMutation.mutate,
    submitAnswerAsync: submitAnswerMutation.mutateAsync,
    isSubmitting: submitAnswerMutation.isPending,
    submitError: submitAnswerMutation.error,
  };
}
