"use client";
import Chat from "@/components/chat";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Sidebar } from "@/components/sidebar";
import { useChat } from "@/contexts/ChatContext";
import { useChatHistory } from "@/hooks/use-chat";
import { usePrivy } from "@privy-io/react-auth";
import { Code, Shield, Zap } from "lucide-react";
import { useEffect, useState } from "react";

const Page = () => {
  const { ready, authenticated, login, getAccessToken, user } = usePrivy();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentChatId } = useChat();
  const {
    data: chatHistory,
    isLoading: isChatHistoryLoading,
    refetch: refetchChatHistory,
  } = useChatHistory({ accessToken: accessToken ?? "" });

  useEffect(() => {
    const fetchAccessToken = async () => {
      const token = await getAccessToken();
      setAccessToken(token as string);
    };
    fetchAccessToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user?.id]);

  useEffect(() => {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebar-overlay");
    if (sidebar && overlay) {
      if (sidebarOpen) {
        sidebar.classList.add("left-0");
        sidebar.classList.remove("-left-full");
        overlay.classList.add("opacity-100", "pointer-events-auto");
        overlay.classList.remove("opacity-0", "pointer-events-none");
      } else {
        sidebar.classList.remove("left-0");
        sidebar.classList.add("-left-full");
        overlay.classList.remove("opacity-100", "pointer-events-auto");
        overlay.classList.add("opacity-0", "pointer-events-none");
      }
    }
  }, [sidebarOpen]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1A2235]">
        <LoadingSpinner size="lg" text="Loading Onyx AI..." />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#1A2235]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#111827] flex-shrink-0 relative z-[100]">
        <div className="flex items-center gap-4 md:gap-6 ml-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/white_onyx.png"
            alt="Onyx AI Agent"
            className="h-8 w-8 rounded-full"
          />
          <h1
            className="text-2xl font-bold text-white tracking-tight"
            style={{ lineHeight: "2.5rem" }}
          >
            Onyx AI Agent
          </h1>
        </div>
        {authenticated && (
          <button
            className="md:hidden text-white hover:text-[#1CD3A8] transition-colors"
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? (
              <svg
                width="28"
                height="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Main content */}
      {authenticated ? (
        <div className="flex relative flex-1 min-h-0 pointer-events-auto">
          {/* Sidebar should only be visible when open, but for now, ensure it does not block the chat */}
          <div className="fixed inset-0 z-40 md:relative md:z-auto pointer-events-none md:pointer-events-auto">
            <Sidebar
              accessToken={accessToken ?? ""}
              isChatHistoryLoading={isChatHistoryLoading}
              chatHistory={chatHistory ?? []}
              onNewChat={refetchChatHistory}
            />
          </div>
          <div className="flex-1 md:ml-64 flex flex-col min-h-0 relative z-30 pointer-events-auto">
            <Chat
              accessToken={accessToken ?? ""}
              id={currentChatId}
              initialMessages={
                chatHistory?.find((chat) => chat.id === currentChatId)
                  ?.messages ?? []
              }
            />
          </div>
          {/* Overlay for mobile, click to close */}
          <div
            id="sidebar-overlay"
            className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-300 opacity-0 pointer-events-none"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto h-[calc(100vh-56px)]">
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-8">
            {/* Hero Section */}
            <div
              className="flex flex-col md:flex-row items-center justify-between gap-12 mb-16 animate-fade-in-up"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="w-full md:w-1/2 space-y-8">
                <div
                  className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-[#1CD3A8]/20 to-[#1CD3A8]/20 text-[#1CD3A8] text-sm font-medium mb-2 animate-fade-in"
                  style={{ animationDelay: "0.2s" }}
                >
                  Blockchain Assistant
                </div>
                <h1
                  className="text-4xl md:text-6xl font-bold text-white leading-tight animate-fade-in-up"
                  style={{ animationDelay: "0.3s" }}
                >
                  Your Intelligent{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1CD3A8] to-[#1CD3A8]">
                    Blockchain Assistant
                  </span>
                </h1>
                <p
                  className="text-zinc-400 text-lg animate-fade-in-up"
                  style={{ animationDelay: "0.4s" }}
                >
                  Onyx AI Agent helps you navigate the blockchain ecosystem with
                  natural language interactions, smart contract assistance, and
                  web3 guidance.
                </p>
                <Button
                  size="lg"
                  className="cursor-pointer bg-[#1CD3A8] hover:bg-[#1CD3A8]/90 text-[#1A2235] font-medium shadow-lg shadow-[#1CD3A8]/20 border-0 transition-all duration-200 transform hover:scale-[1.02] px-6 animate-fade-in-up"
                  style={{ animationDelay: "0.5s" }}
                  onClick={() => login()}
                >
                  Connect Wallet
                </Button>
              </div>

              <div
                className="md:w-1/2 relative animate-fade-in-up"
                style={{ animationDelay: "0.6s" }}
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#1CD3A8] to-[#1CD3A8] rounded-lg blur-lg opacity-75"></div>
                <Card className="relative bg-[#1A2235] border-[#1A2235]/50 backdrop-blur-sm overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="h-8 w-8 rounded-full bg-[#111827] flex items-center justify-center flex-shrink-0">
                        <span className="text-zinc-300 text-sm">O</span>
                      </div>
                      <div className="bg-[#111827] rounded-md p-3 text-zinc-100">
                        <p className="text-sm">
                          Hello! I&apos;m Onyx AI Agent, your smart contract
                          deployment assistant. Connect your wallet to start
                          building on the blockchain.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 justify-end">
                      <div className="bg-[#1CD3A8] rounded-md p-3 text-[#1A2235]">
                        <p className="text-sm">
                          I need help deploying an ERC-20 token.
                        </p>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-[#1CD3A8] flex items-center justify-center flex-shrink-0">
                        <span className="text-[#1A2235] text-sm">U</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Features Section */}
            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 animate-fade-in-up"
              style={{ animationDelay: "0.7s" }}
            >
              <Card
                className="bg-[#111827]/80 border-[#1A2235]/50 hover:border-[#1CD3A8]/50 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: "0.8s" }}
              >
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-[#1CD3A8]/20 flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-[#1CD3A8]" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Fast Deployment
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    Deploy smart contracts to multiple blockchain networks with
                    simple natural language instructions.
                  </p>
                </CardContent>
              </Card>

              <Card
                className="bg-[#111827]/80 border-[#1A2235]/50 hover:border-[#1CD3A8]/50 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: "0.9s" }}
              >
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-[#1CD3A8]/20 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-[#1CD3A8]" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Secure Interactions
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    End-to-end encrypted communications with your wallet for
                    maximum security.
                  </p>
                </CardContent>
              </Card>

              <Card
                className="bg-[#111827]/80 border-[#1A2235]/50 hover:border-[#1CD3A8]/50 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: "1.0s" }}
              >
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-[#1CD3A8]/20 flex items-center justify-center mb-4">
                    <Code className="h-6 w-6 text-[#1CD3A8]" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Smart Contract Templates
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    Access pre-built templates for ERC-20, NFTs, and governance
                    contracts.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* CTA Section */}
            <Card className="bg-gradient-to-br from-[#111827] to-[#0F1623] border-[#1A2235]/50 mb-8">
              <CardContent className="p-8 flex flex-col items-center text-center">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Ready to start building?
                </h2>
                <p className="text-zinc-400 mb-6 max-w-lg">
                  Connect your wallet to access all features and deploy your
                  first smart contract in minutes.
                </p>
                <Button
                  size="lg"
                  className="cursor-pointer bg-[#1CD3A8] hover:bg-[#1CD3A8]/90 text-[#1A2235] font-medium shadow-lg shadow-[#1CD3A8]/20 border-0 transition-all duration-200 transform hover:scale-[1.02] px-6"
                  onClick={() => login()}
                >
                  Connect Wallet
                </Button>
                <p className="text-zinc-500 text-xs mt-4">
                  5 free prompts available in guest mode
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
