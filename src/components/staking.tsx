import React, { useState, useEffect, useMemo } from 'react';
import { Coins, TrendingUp, Award } from 'lucide-react';
import { useWallet } from '../providers/provider';
import { useAlert, Alert } from './ui/alert';
import { Container, ContainerProps } from './container';
import { createBlockchainActions } from '../actions';
import { CONTRACT_ADDRESSES, TOKEN_ADDRESSES, TOKENS, TokenSymbol } from '../config/contracts';

interface StakingProps extends Omit<ContainerProps, 'children'> {
  onSuccess?: (txHash: string) => void;
  onError?: (error: string) => void;
  supportedTokens?: TokenSymbol[];
  defaultStakeToken?: TokenSymbol;
}

export function Staking({ 
  onSuccess, 
  onError, 
  supportedTokens = ['USDT', 'USDC'],
  defaultStakeToken = 'USDT',
  ...containerProps 
}: StakingProps) {
  const { wallet } = useWallet();
  const { showAlert, alertProps } = useAlert();
  
  const [selectedToken, setSelectedToken] = useState<TokenSymbol>(defaultStakeToken);
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [tokenBalance, setTokenBalance] = useState('0');
  const [stakedBalance, setStakedBalance] = useState('0');
  const [pendingRewards, setPendingRewards] = useState('0');
  const [apy, setApy] = useState('12.5'); // Default APY
  const [activeTab, setActiveTab] = useState<'stake' | 'unstake'>('stake');

  const blockchainActions = useMemo(() => {
    if (wallet.provider && wallet.signer) {
      return createBlockchainActions(wallet.provider, wallet.signer);
    }
    return null;
  }, [wallet.provider, wallet.signer]);

  // Load staking data
  const loadStakingData = async () => {
    if (!blockchainActions || !wallet.account) return;

    try {
      const [balance, staked, rewards] = await Promise.all([
        blockchainActions.getTokenBalance(selectedToken, wallet.account),
        blockchainActions.getStakedBalance(wallet.account),
        blockchainActions.getPendingRewards(wallet.account)
      ]);

      setTokenBalance(balance);
      setStakedBalance(staked);
      setPendingRewards(rewards);
    } catch (error) {
      console.error('Failed to load staking data:', error);
    }
  };

  useEffect(() => {
    if (wallet.isConnected) {
      loadStakingData();
      // Refresh data every 30 seconds
      const interval = setInterval(loadStakingData, 30000);
      return () => clearInterval(interval);
    }
  }, [wallet.isConnected, wallet.account, selectedToken, blockchainActions]);

  const handleMaxStakeClick = () => {
    setStakeAmount(tokenBalance);
  };

  const handleMaxUnstakeClick = () => {
    setUnstakeAmount(stakedBalance);
  };

  const handleStake = async () => {
    if (!wallet.isConnected) {
      showAlert('error', 'Please connect your wallet first', { absolute: true, position: 'top' });
      return;
    }

    if (!blockchainActions) {
      showAlert('error', 'Blockchain actions not available', { absolute: true, position: 'top' });
      return;
    }

    const stakeAmountNum = parseFloat(stakeAmount);
    if (isNaN(stakeAmountNum) || stakeAmountNum <= 0) {
      showAlert('error', 'Please enter a valid stake amount', { absolute: true, position: 'top' });
      return;
    }

    const userBalance = parseFloat(tokenBalance);
    if (userBalance < stakeAmountNum) {
      showAlert('error', `Insufficient ${selectedToken} balance`, { absolute: true, position: 'top' });
      return;
    }

    setIsProcessing(true);

    try {
      showAlert('info', 'Initiating stake transaction...', { absolute: true, position: 'top' });

      const allowance = await blockchainActions.getAllowance(
        selectedToken,
        wallet.account,
        CONTRACT_ADDRESSES.STAKING_REWARDS // This should be staking contract address
      );

      if (parseFloat(allowance) < stakeAmountNum) {
        showAlert('info', 'Approving token...', { absolute: true, position: 'top' });
        const approveTx = await blockchainActions.approveToken(
          selectedToken,
          CONTRACT_ADDRESSES.STAKING_REWARDS, // This should be staking contract address
          stakeAmount
        );
        
        showAlert('info', `Approval submitted: ${approveTx.hash.slice(0, 10)}...`, { absolute: true, position: 'top' });
        await approveTx.wait();
        showAlert('success', 'Token approved successfully', { absolute: true, position: 'top' });
      }

      // Step 2: Execute stake
      showAlert('info', 'Executing stake...', { absolute: true, position: 'top' });
      
      const stakeTx = await blockchainActions.stakeTokens(stakeAmount);

      showAlert('info', `Stake submitted: ${stakeTx.hash.slice(0, 10)}...`, { absolute: true, position: 'top' });
      
      const receipt = await stakeTx.wait();
      
      if (receipt?.status === 1) {
        showAlert('success', 'Tokens staked successfully!', { absolute: true, position: 'top' });
        setStakeAmount('');
        await loadStakingData();
        
        if (onSuccess) {
          onSuccess(stakeTx.hash);
        }
      } else {
        throw new Error('Stake transaction failed');
      }

    } catch (error: any) {
      const errorMsg = `Stake failed: ${error.message}`;
      showAlert('error', errorMsg, { absolute: true, position: 'top' });
      if (onError) {
        onError(errorMsg);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnstake = async () => {
    if (!wallet.isConnected) {
      showAlert('error', 'Please connect your wallet first', { absolute: true, position: 'top' });
      return;
    }

    if (!blockchainActions) {
      showAlert('error', 'Blockchain actions not available', { absolute: true, position: 'top' });
      return;
    }

    const unstakeAmountNum = parseFloat(unstakeAmount);
    if (isNaN(unstakeAmountNum) || unstakeAmountNum <= 0) {
      showAlert('error', 'Please enter a valid unstake amount', { absolute: true, position: 'top' });
      return;
    }

    const userStakedBalance = parseFloat(stakedBalance);
    if (userStakedBalance < unstakeAmountNum) {
      showAlert('error', 'Insufficient staked balance', { absolute: true, position: 'top' });
      return;
    }

    setIsProcessing(true);

    try {
      showAlert('info', 'Executing unstake...', { absolute: true, position: 'top' });
      
      const unstakeTx = await blockchainActions.unstakeTokens(unstakeAmount);

      showAlert('info', `Unstake submitted: ${unstakeTx.hash.slice(0, 10)}...`, { absolute: true, position: 'top' });
      
      const receipt = await unstakeTx.wait();
      
      if (receipt?.status === 1) {
        showAlert('success', 'Tokens unstaked successfully!', { absolute: true, position: 'top' });
        setUnstakeAmount('');
        await loadStakingData();
        
        if (onSuccess) {
          onSuccess(unstakeTx.hash);
        }
      } else {
        throw new Error('Unstake transaction failed');
      }

    } catch (error: any) {
      const errorMsg = `Unstake failed: ${error.message}`;
      showAlert('error', errorMsg, { absolute: true, position: 'top' });
      if (onError) {
        onError(errorMsg);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClaimRewards = async () => {
    if (!wallet.isConnected) {
      showAlert('error', 'Please connect your wallet first', { absolute: true, position: 'top' });
      return;
    }

    if (!blockchainActions) {
      showAlert('error', 'Blockchain actions not available', { absolute: true, position: 'top' });
      return;
    }

    const rewardsAmount = parseFloat(pendingRewards);
    if (rewardsAmount <= 0) {
      showAlert('error', 'No rewards to claim', { absolute: true, position: 'top' });
      return;
    }

    setIsProcessing(true);

    try {
      showAlert('info', 'Claiming rewards...', { absolute: true, position: 'top' });
      
      const claimTx = await blockchainActions.claimRewards();

      showAlert('info', `Claim submitted: ${claimTx.hash.slice(0, 10)}...`, { absolute: true, position: 'top' });
      
      const receipt = await claimTx.wait();
      
      if (receipt?.status === 1) {
        showAlert('success', 'Rewards claimed successfully!', { absolute: true, position: 'top' });
        await loadStakingData();
        
        if (onSuccess) {
          onSuccess(claimTx.hash);
        }
      } else {
        throw new Error('Claim transaction failed');
      }

    } catch (error: any) {
      const errorMsg = `Claim failed: ${error.message}`;
      showAlert('error', errorMsg, { absolute: true, position: 'top' });
      if (onError) {
        onError(errorMsg);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const isValidStakeAmount = () => {
    const stakeAmountNum = parseFloat(stakeAmount);
    const userBalance = parseFloat(tokenBalance);
    return !isNaN(stakeAmountNum) && stakeAmountNum > 0 && stakeAmountNum <= userBalance;
  };

  const isValidUnstakeAmount = () => {
    const unstakeAmountNum = parseFloat(unstakeAmount);
    const userStakedBalance = parseFloat(stakedBalance);
    return !isNaN(unstakeAmountNum) && unstakeAmountNum > 0 && unstakeAmountNum <= userStakedBalance;
  };

  const formatBalance = (balance: string) => {
    return parseFloat(balance).toFixed(4);
  };

  const calculateRewardsAPY = () => {
    const stakedValue = parseFloat(stakedBalance);
    if (stakedValue <= 0) return '0';
    
    const annualRewards = (stakedValue * parseFloat(apy)) / 100;
    return annualRewards.toFixed(2);
  };

  return (
    <Container {...containerProps}>
      <div className="card">
        <div className="cardHeader">
          <h2 className="cardTitle">Staking</h2>
          <p className="cardDescription">Stake your tokens to earn rewards</p>
        </div>

        <div className="cardContent">
          {/* Token Selection */}
          <div className="inputGroup">
            <label className="label">Select Token</label>
            <select
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value as TokenSymbol)}
              disabled={isProcessing}
              className="sel_field"
            >
              {supportedTokens.map(token => (
                <option key={token} value={token}>
                  {TOKENS[token].name} ({token})
                </option>
              ))}
            </select>
          </div>

          {/* Compact Stats */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="text-center ">
                <span className="text-gray-600">Available:</span>
                <div className="font-semibold text-blue-600">
                  {formatBalance(tokenBalance)}
                </div>
              </div>
              
              <div className="text-center">
                <span className="text-gray-600">Staked:</span>
                <div className="font-semibold text-green-600">
                  {formatBalance(stakedBalance)}
                </div>
              </div>
              
              <div className="text-center">
                <span className="text-gray-600">Rewards:</span>
                <div className="font-semibold text-purple-600">
                  {formatBalance(pendingRewards)}
                </div>
              </div>
            </div>
          </div>

          {/* Compact APY */}
          <div className="bg-yellow-50 rounded-lg p-2 mb-4 text-center">
            <span className="text-sm text-yellow-600">APY: </span>
            <span className="font-bold text-yellow-900">{apy}%</span>
          </div>

          {/* Tab Navigation */}
          <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('stake')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'stake'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Stake
            </button>
            <button
              onClick={() => setActiveTab('unstake')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'unstake'
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Unstake
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'stake' ? (
            <div className="inputGroup">
              <div className="flex justify-between items-center mb-2">
                <label className="label">Amount to Stake</label>
                <button
                  type="button"
                  onClick={handleMaxStakeClick}
                  disabled={isProcessing}
                  className="text-blue-500 hover:text-blue-600 font-medium text-sm"
                >
                  MAX
                </button>
              </div>
              <input
                type="text"
                placeholder="0.0"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                disabled={isProcessing}
                className="txt_field"
              />
              <button
                onClick={handleStake}
                disabled={isProcessing || !isValidStakeAmount()}
                className="actionButton mt-2"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="loading-spinner" />
                    Staking...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4" />
                    Stake {selectedToken}
                  </div>
                )}
              </button>
              
              {/* Claim Rewards Text - Only visible if rewards available */}
              {/* TODO: Fix claim rewards functionality
              {parseFloat(pendingRewards) > 0 && (
                <div className="mt-2 text-center">
                  <button
                    onClick={handleClaimRewards}
                    disabled={isProcessing}
                    className="text-purple-600 hover:text-purple-800 text-sm font-medium underline"
                  >
                    Claim {formatBalance(pendingRewards)} {selectedToken} rewards
                  </button>
                </div>
              )}
              */}
            </div>
          ) : (
            <div className="inputGroup">
              <div className="flex justify-between items-center mb-2">
                <label className="label">Amount to Unstake</label>
                <button
                  type="button"
                  onClick={handleMaxUnstakeClick}
                  disabled={isProcessing}
                  className="text-red-500 hover:text-red-600 font-medium text-sm"
                >
                  MAX
                </button>
              </div>
              <input
                type="text"
                placeholder="0.0"
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
                disabled={isProcessing}
                className="txt_field"
              />
              <button
                onClick={handleUnstake}
                disabled={isProcessing || !isValidUnstakeAmount()}
                className="actionButton mt-2 bg-red-500 hover:bg-red-600"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="loading-spinner" />
                    Unstaking...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Unstake {selectedToken}
                  </div>
                )}
              </button>
            </div>
          )}
        </div>

        <Alert {...alertProps} />
      </div>
    </Container>
  );
}

export default Staking;