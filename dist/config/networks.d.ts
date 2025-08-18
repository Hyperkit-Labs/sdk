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
export declare const NETWORKS: Record<string, NetworkConfig>;
export declare const DEFAULT_NETWORK = "metis-hyperion-testnet";
