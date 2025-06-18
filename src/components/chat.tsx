"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Textarea } from "@/components/ui/textarea";
import { Message, useChat } from "@ai-sdk/react";
import {
  ConnectedWallet,
  useHeadlessDelegatedActions,
  usePrivy,
  useWallets,
} from "@privy-io/react-auth";
import { Send, User } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Suggestions as seen in the image
const SUGGESTIONS = [
  {
    title: "Check my balance",
    description: "See the balance in your wallet.",
    value: "Check my balance",
  },
  {
    title: "Deploy a smart contract",
    description: "Deploy a smart contract on the blockchain.",
    value: "Deploy a smart contract",
  },
  {
    title: "Launch a ERC20 token",
    description: "Launch a new ERC20 token on the mainnet.",
    value: "Launch a ERC20 token",
  },
  {
    title: "Swap 1 ETH for USDC",
    description: "Swap 1 ETH for USDC.",
    value: "Swap 1 ETH for USDC",
  },
];

const Chat = ({
  accessToken,
  id,
  initialMessages,
}: {
  accessToken: string;
  id: string;
  initialMessages: Message[];
}) => {
  const { user, ready: privyReady } = usePrivy();
  const { delegateWallet } = useHeadlessDelegatedActions();
  const { wallets, ready } = useWallets();
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    if (!ready || !privyReady) return;

    const fetchToken = async () => {
      try {
        setIsAuthLoading(true);
        const walletToDelegate = wallets.find(
          (wallet) => wallet.walletClientType === "privy"
        ) as ConnectedWallet;
        if (walletToDelegate) {
          delegateWallet({
            address: walletToDelegate?.address ?? "",
            chainType: "ethereum",
          });
        }
      } catch (error) {
        console.error("Error fetching token ", error);
      } finally {
        setIsAuthLoading(false);
      }
    };

    fetchToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, ready, privyReady]);

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      id: id,
      api: `${process.env.NEXT_PUBLIC_AGENT_URL}/chat`,
      headers: { Authorization: `Bearer ${accessToken}` },
      initialMessages,
    });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to the bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Memoize the messages to prevent unnecessary re-renders
  const memoizedMessages = useMemo(() => messages, [messages]);

  useEffect(() => {
    // Use a small timeout to ensure DOM is updated before scrolling
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [memoizedMessages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  // Auto-resize textarea based on content
  const handleTextareaResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange(e);

    // Auto adjust height
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`; // Limit height to 120px
  };

  // Handle suggestion click
  const handleSuggestionClick = (value: string) => {
    if (textareaRef.current) {
      textareaRef.current.value = value;
      handleInputChange({
        target: {
          value: value,
        },
      } as React.ChangeEvent<HTMLTextAreaElement>);

      textareaRef.current.focus();
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex flex-col h-full bg-[#1A2235] items-center justify-center">
        <LoadingSpinner size="lg" text="Connecting to wallet..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#1A2235] pointer-events-auto">
      {/* Suggestions (top area) */}
      {memoizedMessages.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-2 sm:px-4 overflow-hidden z-10 bg-[#1A2235]">
          <div className="flex flex-col items-center justify-center mb-6 w-full">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2 text-center">
              I&apos;m Onyx AI Agent, How can I assist you?
            </h2>
          </div>
          {/* Suggestions */}
          <div className="w-full flex justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 w-full max-w-2xl">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.title}
                  className="bg-[#181F2B] hover:bg-[#232B3A] border border-[#232B3A] rounded-lg px-4 py-3 text-left transition flex flex-col cursor-pointer"
                  onClick={() => handleSuggestionClick(s.value)}
                  tabIndex={0}
                  type="button"
                >
                  <span className="font-medium text-zinc-100 text-base mb-1">
                    {s.title}
                  </span>
                  <span className="text-zinc-400 text-xs">{s.description}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Messages Container - Only this should scroll */}
      <div
        className={`flex-1 min-h-0 relative pointer-events-auto ${
          memoizedMessages.length === 0 ? "overflow-hidden" : "overflow-y-auto"
        }`}
      >
        <div className="max-w-4xl mx-auto flex flex-col space-y-4 p-2 sm:p-4 pb-20">
          {memoizedMessages.length === 0 ? null : (
            <>
              {memoizedMessages
                .filter((message) => !!message.content)
                .map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex gap-2 sm:gap-4 max-w-[95%] sm:max-w-[80%] ${
                        message.role === "user"
                          ? "flex-row-reverse"
                          : "flex-row"
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <Avatar className="h-6 w-6 sm:h-10 sm:w-10 flex-shrink-0 bg-[#111827]">
                          <AvatarFallback>O</AvatarFallback>
                          <AvatarImage
                            src="/white_onyx.png"
                            alt="AI Assistant"
                          />
                        </Avatar>
                      ) : (
                        <Avatar className="h-6 w-6 sm:h-10 sm:w-10 flex-shrink-0 bg-[#1CD3A8]">
                          <AvatarFallback>
                            <User className="h-3 w-3 sm:h-5 sm:w-5" />
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={`rounded-md p-2 sm:p-3 ${
                          message.role === "user"
                            ? "bg-[#1CD3A8] text-[#1A2235]"
                            : "bg-[#111827] text-zinc-100"
                        }`}
                      >
                        <div className="prose prose-invert prose-sm max-w-none break-words">
                          {message.role === "assistant" ? (
                            <ReactMarkdown
                              rehypePlugins={[
                                rehypeRaw,
                                rehypeSanitize,
                                rehypeHighlight,
                              ]}
                            >
                              {message.content}
                            </ReactMarkdown>
                          ) : (
                            <div className="h-fit text-sm sm:text-base">
                              {message.content}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              {isLoading && (
                <div className="flex items-center gap-2 sm:gap-4">
                  <Avatar className="h-6 w-6 sm:h-10 sm:w-10 bg-[#111827]">
                    <AvatarFallback>O</AvatarFallback>
                    <AvatarImage src="/robot-avatar.png" alt="AI Assistant" />
                  </Avatar>
                  <div className="bg-[#111827] rounded-md p-2 flex space-x-2">
                    <div
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-zinc-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-zinc-500 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-zinc-500 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Input Area at Bottom of Chat */}
      <div
        className="border-t border-[#111827]/50 bg-[#111827] flex-shrink-0 w-full px-2 sm:px-4 py-2 sm:py-4 fixed bottom-0 left-0 md:static md:z-10 pointer-events-auto"
        style={{ zIndex: 20 }}
      >
        <form
          onSubmit={handleSubmit}
          className="flex gap-2 sm:gap-3 max-w-4xl mx-auto relative"
        >
          <div className="relative flex-1">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaResize}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className={`resize-none w-full min-h-[36px] sm:min-h-[40px] bg-[#1A2235] border-[#1CD3A8] text-zinc-100 focus-visible:ring-[#1CD3A8]/50 rounded-xl text-sm px-3 py-2 pointer-events-auto transition-all duration-300
              `}
              rows={1}
              style={{
                borderWidth: "2.5px",
                borderStyle: "solid",
              }}
            />
            {/* Revolving border effect CSS */}
            <style jsx global>{`
              @keyframes revolve {
                0% {
                  border-image-source: conic-gradient(
                    from 0deg,
                    #1cd3a8,
                    #1a2235,
                    #1cd3a8
                  );
                }
                100% {
                  border-image-source: conic-gradient(
                    from 360deg,
                    #1cd3a8,
                    #1a2235,
                    #1cd3a8
                  );
                }
              }
              .revolving-border {
                border-width: 2.5px !important;
                border-style: solid !important;
                border-image-slice: 1 !important;
                border-image-width: 2.5px !important;
                border-image-outset: 0 !important;
                border-image-repeat: stretch !important;
                box-shadow: 0 0 0 2px #1cd3a833, 0 0 8px 2px #1cd3a844;
                transition: box-shadow 0.3s;
              }
            `}</style>
          </div>
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 rounded-xl bg-[#1CD3A8] hover:bg-[#1CD3A8]/90 flex items-center justify-center text-[#1A2235] pointer-events-auto"
          >
            <Send className="h-3 w-3 sm:h-5 sm:w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
