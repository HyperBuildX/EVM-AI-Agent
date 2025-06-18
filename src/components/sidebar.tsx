"use client";

import { Button } from "@/components/ui/button";
import { useChat } from "@/contexts/ChatContext";
import { useDeleteChat } from "@/hooks/use-chat";
import { cn } from "@/lib/utils";
import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";
import type { Message } from "ai";
import {
  CheckIcon,
  CopyIcon,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  TrashIcon,
  Wallet,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FaGlobe, FaMobile } from "react-icons/fa6";

interface SidebarProps {
  className?: string;
  accessToken: string;
  isChatHistoryLoading: boolean;
  chatHistory: { id: string; messages: Message[]; title: string }[];
  onNewChat?: () => void;
  sidebarOpen?: boolean; // Add this prop
  setSidebarOpen?: (open: boolean) => void; // Add this prop
}

export function Sidebar({
  className,
  accessToken,
  isChatHistoryLoading,
  chatHistory,
  onNewChat,
  sidebarOpen,
  setSidebarOpen,
}: SidebarProps) {
  const { user, logout } = usePrivy();
  const { currentChatId, setCurrentChatId, createNewChat } = useChat();

  // Use the passed sidebarOpen state or default to false
  const [isOpen, setIsOpen] = useState(sidebarOpen || false);

  // Sync local state with parent state
  useEffect(() => {
    if (sidebarOpen !== undefined) {
      setIsOpen(sidebarOpen);
    }
  }, [sidebarOpen]);

  // Sync parent state with local state
  useEffect(() => {
    if (setSidebarOpen && isOpen !== sidebarOpen) {
      setSidebarOpen(isOpen);
    }
  }, [isOpen, setSidebarOpen, sidebarOpen]);

  const { data: promptsData, refetch } = useQuery({
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AGENT_URL}/prompts-left`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      return response.json();
    },
    queryKey: ["prompts-left"],
  });

  // Find connected email or wallet
  const connectedEmail = user?.linkedAccounts?.find(
    (account) => account.type === "email"
  );

  const connectedWallet = user?.linkedAccounts?.find(
    (account) =>
      account.type === "wallet" && account.walletClientType !== "privy"
  );

  const userWallet = user?.linkedAccounts.find(
    (account) => account.type == "wallet" && account.walletClientType == "privy"
  );

  // Format wallet address to show first and last few characters
  const formatWalletAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getEmailAddress = (): string => {
    if (connectedEmail && connectedEmail.type == "email") {
      return connectedEmail.address;
    }
    return "";
  };

  const getWalletAddress = (): string => {
    if (connectedWallet && connectedWallet.type == "wallet") {
      return connectedWallet.address as string;
    }
    return "";
  };

  // Copy to clipboard helpers
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({});

  const handleCopy = async (key: string, value: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopied((prev) => ({ ...prev, [key]: false }));
      }, 1200);
    } catch {
      // fallback: do nothing
    }
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById("sidebar");
      if (sidebar && !sidebar.contains(event.target as Node) && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Truncate chat title helper
  const truncateTitle = (title: string, maxLength = 15) => {
    if (!title) return "";
    return title.length > maxLength ? title.slice(0, maxLength) + "..." : title;
  };

  const chatHistoryRef = useRef<HTMLDivElement>(null);

  const handleNewChat = () => {
    createNewChat();
    onNewChat?.();

    // Close sidebar on mobile after creating a new chat
    if (window.innerWidth < 768) {
      setIsOpen(false);
      if (setSidebarOpen) {
        setSidebarOpen(false);
      }
    }
  };

  const handleChatSelect = (chatId: string) => {
    setCurrentChatId(chatId);

    // Close sidebar on mobile after selecting a chat
    if (window.innerWidth < 768) {
      setIsOpen(false);
      if (setSidebarOpen) {
        setSidebarOpen(false);
      }
    }
  };

  const { mutateAsync: deleteChat } = useDeleteChat({ accessToken });

  const handleChatDelete = async (chatId: string) => {
    await deleteChat(chatId);
    if (currentChatId === chatId) {
      setCurrentChatId("");
    }
    refetch();
  };

  return (
    <>
      {/* Sidebar */}
      <div
        id="sidebar"
        className={cn(
          "bg-[#111827] md:w-64 w-full flex-shrink-0 flex flex-col h-[calc(100vh-56px)] border-r border-[#1A2235]/50 transition-all duration-300 ease-in-out",
          "fixed top-[56px] bottom-0 z-40",
          "md:left-0 -left-full md:rounded-none rounded-r-2xl",
          className
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4">
            {/* Account section */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-zinc-400 mb-2">
                Connected Account
              </h3>
              <div className="bg-[#1A2235] rounded-md p-3 flex items-center gap-2">
                {connectedEmail ? (
                  <>
                    <Mail className="h-4 w-4 text-[#1CD3A8]" />
                    <span
                      className="text-sm text-white truncate flex-1"
                      title={getEmailAddress()}
                    >
                      {getEmailAddress()}
                    </span>
                    <div className="flex items-center ml-auto">
                      <button
                        className="p-1 rounded hover:bg-[#1CD3A8]/10 transition relative z-50 pointer-events-auto"
                        title="Copy email"
                        onClick={() =>
                          handleCopy("connectedEmail", getEmailAddress())
                        }
                      >
                        {copied["connectedEmail"] ? (
                          <CheckIcon className="h-4 w-4 text-[#1CD3A8]" />
                        ) : (
                          <CopyIcon className="h-4 w-4 text-zinc-400 cursor-pointer" />
                        )}
                      </button>
                    </div>
                  </>
                ) : connectedWallet ? (
                  <>
                    <Wallet className="h-4 w-4 text-[#1CD3A8]" />
                    <span
                      className="text-sm text-white truncate flex-1"
                      title={getWalletAddress()}
                    >
                      {formatWalletAddress(getWalletAddress())}
                    </span>
                    <div className="flex items-center ml-auto">
                      <button
                        className="p-1 rounded hover:bg-[#1CD3A8]/10 transition relative z-50 pointer-events-auto"
                        title="Copy wallet address"
                        onClick={() =>
                          handleCopy("connectedWallet", getWalletAddress())
                        }
                      >
                        {copied["connectedWallet"] ? (
                          <CheckIcon className="h-4 w-4 text-[#1CD3A8]" />
                        ) : (
                          <CopyIcon className="h-4 w-4 text-zinc-400 cursor-pointer" />
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <span className="text-sm text-zinc-400">Not connected</span>
                )}
              </div>
              {/* Logout button - moved here and styled */}
              <div className="mt-4 w-full">
                <Button
                  variant="outline"
                  className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 rounded-md bg-[#181F2B] text-zinc-400 hover:text-[#1CD3A8] hover:bg-[#232B3A] border border-[#232B3A] transition-all relative z-50 pointer-events-auto"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="font-medium">Logout</span>
                </Button>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-zinc-400 mb-2">
                Your Wallet
              </h3>
              <div className="bg-[#1A2235] rounded-md p-3 flex items-center gap-2">
                {userWallet ? (
                  <>
                    <Wallet className="h-4 w-4 text-[#1CD3A8]" />
                    <span
                      className="text-sm text-white truncate flex-1"
                      title={
                        "address" in userWallet
                          ? (userWallet.address as string)
                          : ""
                      }
                    >
                      {formatWalletAddress(
                        "address" in userWallet
                          ? (userWallet.address as string)
                          : ""
                      )}
                    </span>
                    <div className="flex items-center ml-auto">
                      <button
                        className="p-1 rounded hover:bg-[#1CD3A8]/10 transition relative z-50 pointer-events-auto"
                        title="Copy wallet address"
                        onClick={() =>
                          handleCopy(
                            "userWallet",
                            "address" in userWallet
                              ? (userWallet.address as string)
                              : ""
                          )
                        }
                      >
                        {copied["userWallet"] ? (
                          <CheckIcon className="h-4 w-4 text-[#1CD3A8]" />
                        ) : (
                          <CopyIcon className="h-4 w-4 text-zinc-400 cursor-pointer" />
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <span className="text-sm text-zinc-400">Not connected</span>
                )}
              </div>
            </div>

            {/* Credits Section */}
            <div className="mb-6">
              <div className="flex justify-between">
                <h3 className="text-sm font-medium text-zinc-400 mb-2">
                  Credits
                </h3>
                <span className="text-sm text-white">
                  {promptsData?.promptsLeft ?? 5} / 5
                </span>
              </div>

              <div className="bg-[#1A2235] rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div className="w-full bg-gray-700 rounded-full h-2.5 dark:bg-gray-700">
                    <div
                      className="bg-[#1CD3A8] h-2.5 rounded-full"
                      style={{
                        width: `${
                          ((promptsData?.promptsLeft ?? 25) / 25) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
                <span className="text-xs text-zinc-400 mt-1 block">
                  You receive 10 free credits every hour after reset
                </span>
                <Button
                  className="w-full mt-2 bg-[#1CD3A8] hover:bg-[#1CD3A8]/90 text-[#1A2235] relative z-50 pointer-events-auto"
                  onClick={() => {
                    // setPromptAmount(5);
                    // setTopUpStatus(null);
                    // setShowTopUp(true);
                  }}
                >
                  Top Up
                </Button>
              </div>
            </div>

            {/* Chat History Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-zinc-400">
                  Chat History
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#1CD3A8] hover:text-[#1CD3A8]/90 hover:bg-[#1CD3A8]/10 relative z-50 pointer-events-auto cursor-pointer"
                  onClick={handleNewChat}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New Chat
                </Button>
              </div>
              <div
                ref={chatHistoryRef}
                style={{
                  scrollbarWidth: "thin",
                }}
                className="bg-[#1A2235] rounded-md p-2 flex flex-col gap-1 h-[260px] overflow-y-auto pb-6 scrollbar-thin scrollbar-thumb-gray-400"
              >
                {isChatHistoryLoading ? (
                  <span className="text-sm text-zinc-400 px-2 py-1">
                    Loading...
                  </span>
                ) : chatHistory.length > 0 ? (
                  chatHistory.map((chat) => (
                    <div key={chat.id} className="flex items-center gap-2">
                      <button
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-md hover:bg-[#232B3A] transition text-left w-full group relative z-50 pointer-events-auto cursor-pointer",
                          currentChatId === chat.id && "bg-[#232B3A]"
                        )}
                        title={chat.title}
                        onClick={() => handleChatSelect(chat.id)}
                      >
                        <MessageSquare
                          className={cn(
                            "h-4 w-4 text-[#1CD3A8] group-hover:scale-110 transition-transform",
                            currentChatId === chat.id && "text-[#1CD3A8]"
                          )}
                        />
                        <span className="text-sm text-white truncate flex-1">
                          {truncateTitle(chat.title || "Untitled Chat")}
                        </span>
                      </button>
                      <button
                        className="p-1 rounded hover:bg-red-500/10 transition relative z-50 pointer-events-auto cursor-pointer"
                        title="Delete chat"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleChatDelete(chat.id);
                        }}
                      >
                        <TrashIcon className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  ))
                ) : (
                  <span className="text-sm text-zinc-400 px-2 py-1">
                    No chats found.
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-zinc-400 mb-2">Links</h3>
              <div className="flex gap-4">
                <a
                  href="https://onyx.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1CD3A8] hover:text-[#1CD3A8]/90 transition"
                >
                  <FaGlobe className="h-5 w-5" /> {/* Icon for website */}
                </a>
                <a
                  href="https://app.onyx.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1CD3A8] hover:text-[#1CD3A8]/90 transition"
                >
                  <FaMobile className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      <div
        className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-300 pointer-events-none opacity-0"
        id="sidebar-overlay"
      />
    </>
  );
}
