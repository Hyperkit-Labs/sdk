// Token addresses on Metis Hyperion Testnet
export const TOKEN_ADDRESSES = {
  USDT: "0x9b52D326D4866055F6c23297656002992e4293FC",
  USDC: "0x31424DB0B7a929283C394b4DA412253Ab6D61682",
  DAI: "0xdE896235F5897EC6D13Aa5b43964F9d2d34D82Fb",
  WETH: "0xc8BB7DB0a07d2146437cc20e1f3a133474546dD4",
} as const;

// Contract addresses
export const CONTRACT_ADDRESSES = {
  LIQUIDITY_POOL: "0x91C39DAA7617C5188d0427Fc82e4006803772B74",
  BUY_VAULT: "0x0adFd197aAbbC194e8790041290Be57F18d576a3",
  STAKING_REWARDS: "0xB94d264074571A5099C458f74b526d1e4EE0314B",
  BRIDGE: "0xfF064Fd496256e84b68dAE2509eDA84a3c235550",
  FAUCET: "0xE1B8C7168B0c48157A5e4B80649C5a1b83bF4cC4",
} as const;

// Token information
export const TOKENS = {
  USDT: { symbol: "USDT", name: "Tether USD", decimals: 6 },
  USDC: { symbol: "USDC", name: "USD Coin", decimals: 6 },
  DAI: { symbol: "DAI", name: "Dai Stablecoin", decimals: 18 },
  WETH: { symbol: "WETH", name: "Wrapped Ether", decimals: 18 },
} as const;

export type TokenSymbol = keyof typeof TOKENS;
