import { getTitleFromChat } from "@/lib/utils";
import { Message } from "@ai-sdk/react";
import { CoreMessage } from "ai";
import { createContext, ReactNode, useContext, useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface Chat {
  id: string;
  title: string;
  messages: Message[];
}

interface ChatContextType {
  currentChatId: string;
  setCurrentChatId: (id: string) => void;
  createNewChat: () => void;
  chats: Chat[];
  addMessageToChat: (chatId: string, message: Message) => void;
  updateChatTitle: (chatId: string, messages: CoreMessage[]) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [currentChatId, setCurrentChatId] = useState<string>(uuidv4());
  const [chats, setChats] = useState<Chat[]>([]);

  const createNewChat = () => {
    const newChatId = uuidv4();
    setCurrentChatId(newChatId);
    setChats((prev) => [
      ...prev,
      { id: newChatId, title: "New Chat", messages: [] },
    ]);
  };

  const addMessageToChat = (chatId: string, message: Message) => {
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages: [...chat.messages, message],
          };
        }
        return chat;
      })
    );
  };

  const updateChatTitle = (chatId: string, messages: CoreMessage[]) => {
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === chatId) {
          return {
            ...chat,
            title: getTitleFromChat(messages),
          };
        }
        return chat;
      })
    );
  };

  return (
    <ChatContext.Provider
      value={{
        currentChatId,
        setCurrentChatId,
        createNewChat,
        chats,
        addMessageToChat,
        updateChatTitle,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
