import { generateUUID } from "@/components/chat";
import { Message } from "@ai-sdk/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CoreMessage, CoreToolMessage, ToolInvocation } from "ai";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
/**
 * 
 * @param param0 toolMessage: CoreToolMessage, messages: Message[]
 * @returns Message[]
 */
function addToolMessageToChat({
  toolMessage,
  messages,
}: {
  toolMessage: CoreToolMessage;
  messages: Array<Message>;
}): Array<Message> {
  return messages.map((message) => {
    if (message.toolInvocations) {
      return {
        ...message,
        toolInvocations: message.toolInvocations.map((toolInvocation) => {
          const toolResult = toolMessage.content.find(
            (tool) => tool.toolCallId === toolInvocation.toolCallId
          );

          if (toolResult) {
            return {
              ...toolInvocation,
              state: "result",
              result: toolResult.result,
            };
          }

          return toolInvocation;
        }),
      };
    }

    return message;
  });
}

/**
 * 
 * @param messages : CoreMessage
 * @returns Array<Message>
 */
export function convertToUIMessages(
  messages: Array<CoreMessage>
): Array<Message> {
  return messages.reduce((chatMessages: Array<Message>, message) => {
    if (message.role === "tool") {
      return addToolMessageToChat({
        toolMessage: message as CoreToolMessage,
        messages: chatMessages,
      });
    }

    let textContent = "";
    const toolInvocations: Array<ToolInvocation> = [];

    if (typeof message.content === "string") {
      textContent = message.content;
    } else if (Array.isArray(message.content)) {
      for (const content of message.content) {
        if (content.type === "text") {
          textContent += content.text;
        } else if (content.type === "tool-call") {
          toolInvocations.push({
            state: "call",
            toolCallId: content.toolCallId,
            toolName: content.toolName,
            args: content.args,
          });
        }
      }
    }

    chatMessages.push({
      id: generateUUID(),
      role: message.role,
      content: textContent,
      toolInvocations,
    });

    return chatMessages;
  }, []);
}

/**
 * 
 * @param messages 
 * @returns 
 */
export function getTitleFromChat(messages: Array<CoreMessage>) {
  const uiMessages = convertToUIMessages(messages);
  const firstMessage = uiMessages[0];

  if (!firstMessage) {
    return "Untitled";
  }

  return firstMessage.content;
}
