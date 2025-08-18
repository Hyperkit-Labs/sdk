import { ethers } from 'ethers';
import { TokenSymbol } from '../config/contracts';
export declare class BlockchainActions {
    private provider;
    private signer;
    constructor(provider: ethers.BrowserProvider, signer: ethers.Signer);
    getTokenBalance(tokenSymbol: TokenSymbol, userAddress: string): Promise<string>;
    approveToken(tokenSymbol: TokenSymbol, spenderAddress: string, amount: string): Promise<ethers.ContractTransactionResponse>;
    getAllowance(tokenSymbol: TokenSymbol, ownerAddress: string, spenderAddress: string): Promise<string>;
    getSwapQuote(tokenIn: TokenSymbol, tokenOut: TokenSymbol, amountIn: string): Promise<{
        outputAmount: string;
        exchangeRate: string;
        priceImpact: string;
    }>;
    swapTokens(tokenIn: TokenSymbol, tokenOut: TokenSymbol, amountIn: string, expectedAmountOut: string, recipient: string, slippageTolerance: number): Promise<ethers.ContractTransactionResponse>;
    executeSwap(tokenIn: TokenSymbol, tokenOut: TokenSymbol, amountIn: string, minAmountOut: string): Promise<ethers.ContractTransactionResponse>;
    getStakedBalance(userAddress: string): Promise<string>;
    getPendingRewards(userAddress: string): Promise<string>;
    stakeTokens(amount: string): Promise<ethers.ContractTransactionResponse>;
    unstakeTokens(amount: string): Promise<ethers.ContractTransactionResponse>;
    claimRewards(): Promise<ethers.ContractTransactionResponse>;
    bridgeDeposit(tokenSymbol: TokenSymbol, amount: string, destinationChainId: number, destinationAddress: string): Promise<ethers.ContractTransactionResponse>;
    getBridgeStats(): Promise<{
        totalDeposits: string;
        totalWithdrawals: string;
        currentFee: string;
        currentTimeout: string;
    }>;
    getSupportedFaucetTokens(): Promise<string[]>;
    getFaucetTokenInfo(tokenAddress: string): Promise<{
        symbol: string;
        decimals: number;
        dripAmount: string;
        maxBalance: string;
        isActive: boolean;
        faucetBalance: string;
    }>;
    getUserFaucetInfo(userAddress: string, tokenAddress: string): Promise<{
        lastDripTime: number;
        totalDripped: string;
        tokenDripped: string;
        canDrip: boolean;
        timeUntilNextDrip: number;
    }>;
    requestFaucetDrip(tokenAddress: string): Promise<ethers.ContractTransactionResponse>;
    requestAllFaucetDrips(): Promise<ethers.ContractTransactionResponse>;
    waitForTransaction(txHash: string): Promise<ethers.TransactionReceipt | null>;
    getTransactionReceipt(txHash: string): Promise<ethers.TransactionReceipt | null>;
    estimateGas(contract: ethers.Contract, method: string, params: any[]): Promise<string>;
}
export declare function createBlockchainActions(provider: ethers.BrowserProvider, signer: ethers.Signer): BlockchainActions;
