"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { defineChain } from "viem";
import { mainnet, base, bsc, optimism, arbitrum, polygon } from "viem/chains";
import { ChatProvider } from "@/contexts/ChatContext";

const queryClient = new QueryClient();

export const xcn = defineChain({
  id: 80888,
  name: "XCN",
  nativeCurrency: {
    decimals: 18,
    name: "XCN",
    symbol: "XCN",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.onyx.org"],
    },
    public: {
      http: ["https://rpc.onyx.org"],
    },
  },
});

const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <PrivyProvider
        appId="cm6fcd7ux02iadozbu5xelx0t"
        clientId="client-WY5gF5V4vxM4dakdpSkkhTCasyy54KuBqAgRdc2nLcbuT"
        config={{
          defaultChain: bsc,
          supportedChains: [
            xcn,
            mainnet,
            base,
            bsc,
            optimism,
            arbitrum,
            polygon,
          ],
          embeddedWallets: {
            ethereum: { createOnLogin: "all-users" },
            solana: { createOnLogin: "off" },
          },
          loginMethods: ["email", "google", "wallet"],
        }}
      >
        <ChatProvider>{children}</ChatProvider>
      </PrivyProvider>
    </QueryClientProvider>
  );
};

export default Provider;
