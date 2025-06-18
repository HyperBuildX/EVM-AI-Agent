import { useUser } from "@privy-io/react-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Message } from "@ai-sdk/react";
import { convertToUIMessages, getTitleFromChat } from "@/lib/utils";
import { CoreMessage } from "ai";

export const useChatHistory = ({ accessToken }: { accessToken: string }) => {
  const { user } = useUser();
  const { data, isLoading, refetch } = useQuery<
    { id: string; title: string; messages: Message[] }[]
  >({
    refetchInterval: 10_000,
    queryKey: ["chat-history", user?.id],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_AGENT_URL}/chats`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      return (
        response.data.map(
          (c: { id: string; title: string; messages: CoreMessage[] }) => ({
            ...c,
            messages: convertToUIMessages(c.messages),
            title: getTitleFromChat(c.messages),
          })
        ) ?? []
      );
    },
    enabled: !!user?.id,
  });

  return { data, isLoading, refetch };
};

export const useDeleteChat = ({ accessToken }: { accessToken: string }) => {
  const { refetch } = useChatHistory({ accessToken });
  const deleteChat = useMutation({
    mutationFn: async (chatId: string) => {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_AGENT_URL}/chats/${chatId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      refetch();
    },
  });

  return deleteChat;
};
