import { ethers } from 'ethers';
export declare const TOKEN_ADDRESS = "0xF7692Db18990eB5c239eF3f33e7Dc4A8Dc4E9019";
export declare const SELLER_ADDRESS = "YOUR_WALLET_ADDRESS_HERE";
export declare const ERC20_ABI: readonly ["function transfer(address to, uint256 amount) returns (bool)", "function balanceOf(address owner) view returns (uint256)", "function decimals() view returns (uint8)", "function symbol() view returns (string)", "function name() view returns (string)"];
export declare class BuyUtils {
    private provider;
    private signer;
    constructor(provider: ethers.Provider, signer: ethers.Signer);
    transferTokens(toAddress: string, amount: string): Promise<ethers.ContractTransactionResponse>;
    getTokenBalance(address: string): Promise<string>;
    getTokenInfo(): Promise<{
        name: any;
        symbol: any;
        decimals: number;
    }>;
}
export declare function createBuyUtils(provider: ethers.Provider, signer: ethers.Signer): BuyUtils;
