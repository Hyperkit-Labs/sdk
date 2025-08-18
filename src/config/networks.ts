export interface NetworkConfig {
  chainId: string;
  chainName: string;
  rpcUrls: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorerUrls?: string[];
}

export const NETWORKS: Record<string, NetworkConfig> = {
  "metis-hyperion-testnet": {
    chainId: "0x20A55", // 133717 in hex
    chainName: "Metis Hyperion Testnet",
    rpcUrls: [
     "https://hyperion-testnet.metisdevops.link"
    ],
    nativeCurrency: {
      name: "tMETIS",
      symbol: "tMETIS",
      decimals: 18,
    },
    blockExplorerUrls: ["https://hyperion-testnet-explorer.metisdevops.link"],
  },
  lazchain: {
    chainId: "0x20A56", // 133718 in hex
    chainName: "LAZ Chain Testnet",
    rpcUrls: [
      "https://lazai-testnet.metisdevops.link"
    ],
    nativeCurrency: {
      name: "LAZ",
      symbol: "LAZ",
      decimals: 18,
    },
  },
  metisSepolia: {
    chainId: "0xE9FE", // 59902 in hex
    chainName: "Metis Sepolia",
    rpcUrls: [
      "https://metis-sepolia-rpc.publicnode.com"
    ],
    nativeCurrency: {
      name: "Metis",
      symbol: "METIS",
      decimals: 18,
    },
  },
};

export const DEFAULT_NETWORK = "metis-hyperion-testnet";
