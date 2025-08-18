import { ethers } from 'ethers';
export declare const CHAINS: {
    readonly METIS: {
        readonly chainId: "0xE9FE";
        readonly chainName: "Metis Sepolia";
        readonly rpcUrls: readonly ["https://metis-sepolia-rpc.publicnode.com"];
        readonly nativeCurrency: {
            readonly name: "Metis";
            readonly symbol: "METIS";
            readonly decimals: 18;
        };
        readonly blockExplorerUrls: readonly ["https://metis-sepolia-explorer.publicnode.com"];
    };
    readonly METIS_HYPERION: {
        readonly chainId: "0x20A55";
        readonly chainName: "Metis Hyperion Testnet";
        readonly rpcUrls: readonly ["https://hyperion-testnet.metisdevops.link"];
        readonly nativeCurrency: {
            readonly name: "tMETIS";
            readonly symbol: "tMETIS";
            readonly decimals: 18;
        };
        readonly blockExplorerUrls: readonly ["https://hyperion-testnet-explorer.metisdevops.link"];
    };
};
export declare const BRIDGE_TOKENS: {
    readonly METIS: {
        readonly USDT: "0x12377C3C8eBB5DC96a6d572a714A41AcE3A67ceE";
        readonly USDC: "0xA032D5Da43d2b2735863E2525457A82C825300bb";
    };
    readonly METIS_HYPERION: {
        readonly USDT: "0xF7692Db18990eB5c239eF3f33e7Dc4A8Dc4E9019";
        readonly USDC: "0x3d5fb85F00ea1119d099d0dfBb12f24c9c6860BB";
    };
};
export declare const BRIDGE_CONTRACTS: {
    readonly METIS: "0xF7692Db18990eB5c239eF3f33e7Dc4A8Dc4E9019";
    readonly METIS_HYPERION: "0xFF1615f1B203b135C005bC95e4E0CF7C3afA7E8b";
};
export interface BridgeToken {
    symbol: 'USDT' | 'USDC';
    address: string;
    decimals: number;
}
export interface BridgeChain {
    key: keyof typeof CHAINS;
    name: string;
    chainId: string;
    tokens: BridgeToken[];
}
export interface BridgeTransaction {
    hash: string;
    from: string;
    to: string;
    amount: string;
    token: string;
    sourceChain: string;
    destinationChain: string;
    status: 'pending' | 'completed' | 'failed';
    timestamp: number;
    depositId?: string;
}
export declare const SUPPORTED_TOKENS: Record<string, {
    decimals: number;
    symbol: string;
}>;
export declare function getBridgeChains(): BridgeChain[];
export declare function getTokenAddress(chainKey: keyof typeof CHAINS, tokenSymbol: 'USDT' | 'USDC'): string;
export declare function getBridgeContract(chainKey: keyof typeof CHAINS): string;
export declare function hexToDecimal(hex: string): number;
export declare function decimalToHex(decimal: number): string;
export declare function getChainKeyFromId(chainId: string | number): keyof typeof CHAINS | null;
export declare function formatTokenAmount(amount: string, decimals: number): string;
export declare function parseTokenAmount(amount: string, decimals: number): string;
export declare function validateBridgeParams(sourceChain: keyof typeof CHAINS, destinationChain: keyof typeof CHAINS, tokenSymbol: 'USDT' | 'USDC', amount: string): {
    valid: boolean;
    error?: string;
};
export declare const ERC20_ABI: string[];
export declare const BRIDGE_ABI: string[];
export declare class BridgeUtils {
    private provider;
    private signer;
    constructor(provider: ethers.Provider, signer?: ethers.Signer);
    getTokenBalance(tokenAddress: string, userAddress: string): Promise<string>;
    getTokenAllowance(tokenAddress: string, userAddress: string, spenderAddress: string): Promise<string>;
    approveToken(tokenAddress: string, spenderAddress: string, amount: string): Promise<ethers.ContractTransactionResponse>;
    getBridgeFee(bridgeAddress: string): Promise<string>;
    bridgeDeposit(bridgeAddress: string, tokenAddress: string, amount: string, destinationChainId: number, destinationAddress: string): Promise<ethers.ContractTransactionResponse>;
    getDepositInfo(bridgeAddress: string, depositId: string): Promise<any>;
    isWithdrawalProcessed(bridgeAddress: string, depositId: string): Promise<boolean>;
}
export declare function createBridgeUtils(provider: ethers.Provider, signer?: ethers.Signer): BridgeUtils;
export declare function generateDepositId(user: string, token: string, amount: string, destinationChainId: number, destinationAddress: string, timestamp: number, depositCount: number): string;
export declare function getOppositeChain(currentChain: keyof typeof CHAINS): keyof typeof CHAINS;
export declare function formatBridgeTransaction(hash: string, from: string, to: string, amount: string, tokenSymbol: string, sourceChain: keyof typeof CHAINS, destinationChain: keyof typeof CHAINS, status?: 'pending' | 'completed' | 'failed'): BridgeTransaction;
export declare const STORAGE_KEYS: {
    readonly BRIDGE_TRANSACTIONS: "bridge_transactions";
    readonly BRIDGE_SETTINGS: "bridge_settings";
};
export declare function saveBridgeTransaction(transaction: BridgeTransaction): void;
export declare function getBridgeTransactions(): BridgeTransaction[];
export declare function updateTransactionStatus(hash: string, status: 'pending' | 'completed' | 'failed'): void;
