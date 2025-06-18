# 🤖 EVM AI Agent

**EVM AI Agent** is an intelligent, natural-language interface for interacting with multiple EVM-compatible blockchains. It helps users execute transactions, deploy and verify contracts, check wallet balances, and more — all via friendly, chat-based interaction.

---

## 🔥 Features

### 🔧 Blockchain Interactions
- Token transfers, swaps, and bridges
- Smart contract generation, deployment, and verification
- Custom token deployment with metadata

### 🧠 AI-Powered Understanding
- Accepts natural language commands (e.g., "swap 1 ETH to USDC on Ethereum")
- Breaks down multi-step operations with confirmations
- Explains blockchain operations in plain English

### 🪙 Wallet & Token Utilities
- Detect wallet balances (ETH, tokens)
- Fetch live token prices using CoinGecko
- Resolve token names to addresses
- Chain-aware behavior (Ethereum, Polygon, Onyx, etc.)

### 🔐 Embedded Wallet Support (via Privy)
- Auto-create embedded wallet for each user
- Supports external wallet connection
- Charge & manage funds through chat interface

### 📚 Onyx Chain Integration
- Automatically fetches context from Onyx Chain whitepaper PDF
- Answers Onyx-specific queries more accurately than LLM alone

### 💬 Prompt & Session Management
- 10 free prompts per user per day
- Session-based memory like ChatGPT
- Persistent history and session restarts

---

## 🧠 Tech Stack

| Layer             | Tech Used                          |
|------------------|------------------------------------|
| Language Model    | OpenAI (GPT-4o)              |
| Backend           | Nest.js, TypeScript, Express        |
| Wallets           | Privy Embedded Wallets              |
| Web3              | Ethers.js, Alchemy, RPCs            |
| APIs              | CoinGecko, CoinMarketCap, Etherscan |
| Verification      | Etherscan Contract Verification     |
| Data Extraction   | PDF to Text AI Parsing              |
| Memory            | mongodb     |

---

## 📦 Example Prompts

| Use Case         | Prompt Example                                                    |
|------------------|-------------------------------------------------------------------|
| **Token Swap**   | `swap 1 ETH to USDC on Ethereum mainnet`                          |
| **Balance Check**| `check 0xabc...abc ETH balance`                                   |
| **Token Deploy** | `deploy token (name TEST, symbol TST, supply 1000, decimals 18)`  |
| **Generate Code**| `generate USDC staking contract that rewards 2x per week`         |
| **Deploy & Verify**| `deploy and verify it on Base`                                 |
| **Price Info**   | `what’s the price of PEPE on Polygon?`                            |
| **Onyx Support** | `what is Onyx Chain?` (used PDF whitepaper for accurate answers)  |

---

## 📝 Note
This repo includes only Frontend part due to the security concerns.
If you have any questions or want the whole product including Backend part, please feel free to contact us to below contacts.

- E-Mail: hyperbuildx@adamglab.dev
- Telegram: [@bettyjk_0915](https://t.me/bettyjk_0915)