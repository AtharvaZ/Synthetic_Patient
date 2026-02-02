import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateChatRequest, type InsertMessage } from "@shared/routes";

export function useChat(id: number) {
  return useQuery({
    queryKey: [api.chats.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.chats.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch chat");
      return api.chats.get.responses[200].parse(await res.json());
    },
    enabled: !isNaN(id),
    refetchInterval: 1000, // Polling for new messages since we don't have WS yet
  });
}

export function useCreateChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateChatRequest) => {
      const res = await fetch(api.chats.create.path, {
        method: api.chats.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.chats.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create chat");
      }
      return api.chats.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.chats.get.path] });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ chatId, ...message }: InsertMessage & { chatId: number }) => {
      const url = buildUrl(api.messages.create.path, { id: chatId });
      const res = await fetch(url, {
        method: api.messages.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to send message");
      return api.messages.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      // Invalidate the chat to fetch the new message (and potentially AI response)
      queryClient.invalidateQueries({ queryKey: [api.chats.get.path, variables.chatId] });
    },
  });
}
