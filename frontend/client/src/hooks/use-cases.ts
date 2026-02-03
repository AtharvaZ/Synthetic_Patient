import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { getUserStats, getCompletedCaseIds, getStreak } from "@/lib/localStorage";

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
    enabled: !isNaN(id) && id > 0,
  });
}

export function useUserStats() {
  return useQuery({
    queryKey: ["localStorage", "userStats"],
    queryFn: () => {
      const stats = getUserStats();
      const streak = getStreak();
      const completedIds = getCompletedCaseIds();
      return {
        streak: streak.current,
        casesSolved: completedIds.length,
        accuracy: stats.totalCases > 0 
          ? Math.round((stats.correctDiagnoses / stats.totalCases) * 100) 
          : 0,
        completedCaseIds: completedIds,
      };
    },
    staleTime: 0,
  });
}

export function useCompletedCases() {
  return useQuery({
    queryKey: ["localStorage", "completedCases"],
    queryFn: () => getCompletedCaseIds(),
    staleTime: 0,
  });
}
