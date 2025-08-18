import { ethers } from 'ethers';
export declare const CONTRACT_ADDRESSES: {
    readonly STAKING_CONTRACT: "0xe469933aA0BfC55C4338d50B664570347036034c";
    readonly STAKING_TOKEN: "0xF7692Db18990eB5c239eF3f33e7Dc4A8Dc4E9019";
};
export declare const ERC20_ABI: readonly ["function approve(address spender, uint256 amount) returns (bool)", "function allowance(address owner, address spender) view returns (uint256)", "function decimals() view returns (uint8)"];
export declare const STAKING_ABI: readonly ["function stake(uint256 _amount)", "function unstake(uint256 _amount)"];
export declare class StakingUtils {
    private provider;
    private signer;
    constructor(provider: ethers.Provider, signer: ethers.Signer);
    approveTokens(amount: string): Promise<ethers.ContractTransactionResponse>;
    stakeTokens(amount: string): Promise<ethers.ContractTransactionResponse>;
    unstakeTokens(amount: string): Promise<ethers.ContractTransactionResponse>;
    needsApproval(userAddress: string, amount: string): Promise<boolean>;
}
export declare function createStakingUtils(provider: ethers.Provider, signer: ethers.Signer): StakingUtils;
