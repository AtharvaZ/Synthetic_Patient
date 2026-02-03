import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useCases() {
  return useQuery({
    queryKey: [api.cases.list.path],
    queryFn: async () => {
      const res = await fetch(api.cases.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch cases");
      return api.cases.list.responses[200].parse(await res.json());
    },
  });
}

export function useCasesByDifficulty(difficulty: string) {
  return useQuery({
    queryKey: [api.cases.byDifficulty.path, difficulty],
    queryFn: async () => {
      const url = buildUrl(api.cases.byDifficulty.path, { difficulty });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch cases by difficulty");
      return api.cases.byDifficulty.responses[200].parse(await res.json());
    },
    enabled: !!difficulty,
  });
}

export function useCase(id: number) {
  return useQuery({
    queryKey: [api.cases.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.cases.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch case");
      return api.cases.get.responses[200].parse(await res.json());
    },
    enabled: !isNaN(id),
  });
}

export function useUserStats() {
  return useQuery({
    queryKey: [api.completions.userStats.path],
    queryFn: async () => {
      const res = await fetch(api.completions.userStats.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch user stats");
      return api.completions.userStats.responses[200].parse(await res.json());
    },
  });
}

export function useCompletedCases() {
  return useQuery({
    queryKey: [api.completions.completedCases.path],
    queryFn: async () => {
      const res = await fetch(api.completions.completedCases.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch completed cases");
      return api.completions.completedCases.responses[200].parse(await res.json());
    },
  });
}

export function useCompleteCase() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { caseId: number; chatId: number; diagnosis: string }) => {
      const res = await fetch(api.completions.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to complete case");
      return res.json() as Promise<{ completion: unknown; result: "correct" | "partial" | "wrong" }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.completions.userStats.path] });
      queryClient.invalidateQueries({ queryKey: [api.completions.completedCases.path] });
    },
  });
}

export function useRetryDiagnosis() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (chatId: number) => {
      const res = await fetch(`/api/completions/retry/${chatId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to retry");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.completions.userStats.path] });
      queryClient.invalidateQueries({ queryKey: [api.completions.completedCases.path] });
    },
  });
}
