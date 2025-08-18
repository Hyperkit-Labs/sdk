import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, TOKEN_ADDRESSES, TOKENS, TokenSymbol } from '../config/contracts';
import { 
  ERC20_ABI, 
  LIQUIDITY_POOL_ABI, 
  STAKING_ABI, 
  BRIDGE_ABI, 
  FAUCET_ABI 
} from '../config/abis';

export class BlockchainActions {
  private provider: ethers.BrowserProvider;
  private signer: ethers.Signer;

  constructor(provider: ethers.BrowserProvider, signer: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;
  }

  // Token Actions
  async getTokenBalance(tokenSymbol: TokenSymbol, userAddress: string): Promise<string> {
    const tokenAddress = TOKEN_ADDRESSES[tokenSymbol];
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
    const balance = await contract.balanceOf(userAddress);
    const decimals = TOKENS[tokenSymbol].decimals;
    return ethers.formatUnits(balance, decimals);
  }

  async approveToken(tokenSymbol: TokenSymbol, spenderAddress: string, amount: string): Promise<ethers.ContractTransactionResponse> {
    const tokenAddress = TOKEN_ADDRESSES[tokenSymbol];
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.signer);
    const decimals = TOKENS[tokenSymbol].decimals;
    const amountWei = ethers.parseUnits(amount, decimals);
    return await contract.approve(spenderAddress, amountWei);
  }

  async getAllowance(tokenSymbol: TokenSymbol, ownerAddress: string, spenderAddress: string): Promise<string> {
    const tokenAddress = TOKEN_ADDRESSES[tokenSymbol];
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
    const allowance = await contract.allowance(ownerAddress, spenderAddress);
    const decimals = TOKENS[tokenSymbol].decimals;
    return ethers.formatUnits(allowance, decimals);
  }

  // Swap Actions
  async getSwapQuote(tokenIn: TokenSymbol, tokenOut: TokenSymbol, amountIn: string): Promise<{
    outputAmount: string;
    exchangeRate: string;
    priceImpact: string;
  }> {
    const contract = new ethers.Contract(CONTRACT_ADDRESSES.LIQUIDITY_POOL, LIQUIDITY_POOL_ABI, this.provider);
    const tokenInAddress = TOKEN_ADDRESSES[tokenIn];
    const tokenOutAddress = TOKEN_ADDRESSES[tokenOut];
    const decimalsIn = TOKENS[tokenIn].decimals;
    const decimalsOut = TOKENS[tokenOut].decimals;
    
    const amountInWei = ethers.parseUnits(amountIn, decimalsIn);
    const amountOutWei = await contract.getAmountOut(amountInWei, tokenInAddress, tokenOutAddress);
    const rawOutputAmount = ethers.formatUnits(amountOutWei, decimalsOut);
    
    // Truncate output amount to match token decimals
    const outputAmount = parseFloat(rawOutputAmount).toFixed(decimalsOut);
    
    // Calculate exchange rate
    const exchangeRate = (parseFloat(outputAmount) / parseFloat(amountIn)).toString();
    
    // Calculate price impact (simplified calculation)
    const priceImpact = '0.1'; // This would need real pool reserve data
    
    return {
      outputAmount,
      exchangeRate,
      priceImpact
    };
  }

  async swapTokens(
    tokenIn: TokenSymbol,
    tokenOut: TokenSymbol,
    amountIn: string,
    expectedAmountOut: string,
    recipient: string,
    slippageTolerance: number
  ): Promise<ethers.ContractTransactionResponse> {
    const contract = new ethers.Contract(CONTRACT_ADDRESSES.LIQUIDITY_POOL, LIQUIDITY_POOL_ABI, this.signer);
    const tokenInAddress = TOKEN_ADDRESSES[tokenIn];
    const tokenOutAddress = TOKEN_ADDRESSES[tokenOut];
    const decimalsIn = TOKENS[tokenIn].decimals;
    const decimalsOut = TOKENS[tokenOut].decimals;
    
    const amountInWei = ethers.parseUnits(amountIn, decimalsIn);
    
    // Calculate minimum amount out with slippage
    // Truncate expectedAmountOut to match token decimals
    const truncatedExpectedAmount = parseFloat(expectedAmountOut).toFixed(decimalsOut);
    const minAmountOut = (parseFloat(truncatedExpectedAmount) * (100 - slippageTolerance) / 100).toFixed(decimalsOut);
    const minAmountOutWei = ethers.parseUnits(minAmountOut, decimalsOut);
    
    return await contract.swap(tokenInAddress, tokenOutAddress, amountInWei, minAmountOutWei);
  }

  async executeSwap(
    tokenIn: TokenSymbol, 
    tokenOut: TokenSymbol, 
    amountIn: string, 
    minAmountOut: string
  ): Promise<ethers.ContractTransactionResponse> {
    const contract = new ethers.Contract(CONTRACT_ADDRESSES.LIQUIDITY_POOL, LIQUIDITY_POOL_ABI, this.signer);
    const tokenInAddress = TOKEN_ADDRESSES[tokenIn];
    const tokenOutAddress = TOKEN_ADDRESSES[tokenOut];
    const decimalsIn = TOKENS[tokenIn].decimals;
    const decimalsOut = TOKENS[tokenOut].decimals;
    
    // Truncate amounts to match token decimals
    const truncatedAmountIn = parseFloat(amountIn).toFixed(decimalsIn);
    const truncatedMinAmountOut = parseFloat(minAmountOut).toFixed(decimalsOut);
    
    const amountInWei = ethers.parseUnits(truncatedAmountIn, decimalsIn);
    const minAmountOutWei = ethers.parseUnits(truncatedMinAmountOut, decimalsOut);
    
    return await contract.swap(tokenInAddress, tokenOutAddress, amountInWei, minAmountOutWei);
  }

  // Staking Actions
  async getStakedBalance(userAddress: string): Promise<string> {
    const contract = new ethers.Contract(CONTRACT_ADDRESSES.STAKING_REWARDS, STAKING_ABI, this.provider);
    const balance = await contract.getStakedBalance(userAddress);
    return ethers.formatUnits(balance, 6); // Assuming 18 decimals
  }

  async getPendingRewards(userAddress: string): Promise<string> {
    const contract = new ethers.Contract(CONTRACT_ADDRESSES.STAKING_REWARDS, STAKING_ABI, this.provider);
    const rewards = await contract.getPendingReward(userAddress);
    return ethers.formatUnits(rewards, 6);
  }

  async stakeTokens(amount: string): Promise<ethers.ContractTransactionResponse> {
    const contract = new ethers.Contract(CONTRACT_ADDRESSES.STAKING_REWARDS, STAKING_ABI, this.signer);
    const amountWei = ethers.parseUnits(amount, 6);
    return await contract.stake(amountWei);
  }

  async unstakeTokens(amount: string): Promise<ethers.ContractTransactionResponse> {
    const contract = new ethers.Contract(CONTRACT_ADDRESSES.STAKING_REWARDS, STAKING_ABI, this.signer);
    const amountWei = ethers.parseUnits(amount, 6);
    return await contract.unstake(amountWei);
  }

  async claimRewards(): Promise<ethers.ContractTransactionResponse> {
    const contract = new ethers.Contract(CONTRACT_ADDRESSES.STAKING_REWARDS, STAKING_ABI, this.signer);
    return await contract.claimReward();
  }

  // Bridge Actions
  async bridgeDeposit(
    tokenSymbol: TokenSymbol, 
    amount: string, 
    destinationChainId: number, 
    destinationAddress: string
  ): Promise<ethers.ContractTransactionResponse> {
    // Create contract instance with explicit typing
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.BRIDGE, 
      BRIDGE_ABI, 
      this.signer
    ) as any; // Temporary type assertion to bypass potential ABI issues
    
    const tokenAddress = TOKEN_ADDRESSES[tokenSymbol];
    const decimals = TOKENS[tokenSymbol].decimals;
    const amountWei = ethers.parseUnits(amount, decimals);
    
    // Send native tMETIS as value for the gas fee (0.001 ETH to match your working script)
    const bridgeFee = ethers.parseEther("0.001");
    
    // Log parameters for debugging
    console.log('Bridge deposit parameters:', {
      contractAddress: CONTRACT_ADDRESSES.BRIDGE,
      tokenAddress,
      amountWei: amountWei.toString(),
      destinationChainId,
      destinationAddress,
      bridgeFee: bridgeFee.toString()
    });
    
    try {
      const tx = await contract.deposit(
        tokenAddress, 
        amountWei, 
        destinationChainId, 
        destinationAddress, 
        { value: bridgeFee }
      );
      console.log('Bridge deposit transaction submitted:', tx.hash);
      return tx;
    } catch (error) {
      console.error('Bridge deposit failed:', error);
      throw error;
    }
  }

  async getBridgeStats(): Promise<{
    totalDeposits: string;
    totalWithdrawals: string;
    currentFee: string;
    currentTimeout: string;
  }> {
    const contract = new ethers.Contract(CONTRACT_ADDRESSES.BRIDGE, BRIDGE_ABI, this.provider);
    const stats = await contract.getBridgeStats();
    
    return {
      totalDeposits: stats.totalDeposits.toString(),
      totalWithdrawals: stats.totalWithdrawals.toString(),
      currentFee: ethers.formatEther(stats.currentFee),
      currentTimeout: stats.currentTimeout.toString()
    };
  }

  // Faucet Actions
  async getSupportedFaucetTokens(): Promise<string[]> {
    const contract = new ethers.Contract(CONTRACT_ADDRESSES.FAUCET, FAUCET_ABI, this.provider);
    return await contract.getSupportedTokens();
  }

  async getFaucetTokenInfo(tokenAddress: string): Promise<{
    symbol: string;
    decimals: number;
    dripAmount: string;
    maxBalance: string;
    isActive: boolean;
    faucetBalance: string;
  }> {
    const contract = new ethers.Contract(CONTRACT_ADDRESSES.FAUCET, FAUCET_ABI, this.provider);
    const info = await contract.getTokenInfo(tokenAddress);
    const faucetDecimals = 6; //fix this
    
    return {
      symbol: info.symbol,
      decimals: info.decimals,
      dripAmount: ethers.formatUnits(info.dripAmount, faucetDecimals),
      maxBalance: ethers.formatUnits(info.maxBalance, faucetDecimals),
      isActive: info.isActive,
      faucetBalance: ethers.formatUnits(info.faucetBalance, faucetDecimals)
    };
  }

  async getUserFaucetInfo(userAddress: string, tokenAddress: string): Promise<{
    lastDripTime: number;
    totalDripped: string;
    tokenDripped: string;
    canDrip: boolean;
    timeUntilNextDrip: number;
  }> {
    const contract = new ethers.Contract(CONTRACT_ADDRESSES.FAUCET, FAUCET_ABI, this.provider);
    const info = await contract.getUserTokenInfo(userAddress, tokenAddress);
    
    return {
      lastDripTime: Number(info.lastDripTime),
      totalDripped: ethers.formatUnits(info.totalDripped, 18),
      tokenDripped: ethers.formatUnits(info.tokenDripped, 18),
      canDrip: info.canDrip,
      timeUntilNextDrip: Number(info.timeUntilNextDrip)
    };
  }

  async requestFaucetDrip(tokenAddress: string): Promise<ethers.ContractTransactionResponse> {
    const contract = new ethers.Contract(CONTRACT_ADDRESSES.FAUCET, FAUCET_ABI, this.signer);
    return await contract.drip(tokenAddress);
  }

  async requestAllFaucetDrips(): Promise<ethers.ContractTransactionResponse> {
    const contract = new ethers.Contract(CONTRACT_ADDRESSES.FAUCET, FAUCET_ABI, this.signer);
    return await contract.dripAll();
  }

  // Utility Functions
  async waitForTransaction(txHash: string): Promise<ethers.TransactionReceipt | null> {
    return await this.provider.waitForTransaction(txHash);
  }

  async getTransactionReceipt(txHash: string): Promise<ethers.TransactionReceipt | null> {
    return await this.provider.getTransactionReceipt(txHash);
  }

  async estimateGas(contract: ethers.Contract, method: string, params: any[]): Promise<string> {
    const gasLimit = await contract[method].estimateGas(...params);
    return gasLimit.toString();
  }
}

// Factory function to create BlockchainActions instance
export function createBlockchainActions(
  provider: ethers.BrowserProvider, 
  signer: ethers.Signer
): BlockchainActions {
  return new BlockchainActions(provider, signer);
}
