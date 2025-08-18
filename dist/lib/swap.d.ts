import { ethers } from 'ethers';
export declare const CONTRACTS: {
    LIQUIDITY_POOL: string;
    USDT: string;
    USDC: string;
};
export declare const LIQUIDITY_POOL_ABI: string[];
export declare const ERC20_ABI: string[];
export declare const getProvider: () => ethers.BrowserProvider;
export declare const getSigner: () => Promise<ethers.JsonRpcSigner>;
export declare const getLiquidityPoolContract: () => Promise<ethers.Contract>;
export declare const getTokenContract: (tokenAddress: string) => Promise<ethers.Contract>;
