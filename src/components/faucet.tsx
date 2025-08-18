import React, { useState, useEffect, useMemo } from 'react';
import { Droplets, Clock, CheckCircle } from 'lucide-react';
import { useWallet } from '../providers/provider';
import { useAlert, Alert } from './ui/alert';
import { Container, ContainerProps } from './container';
import { createBlockchainActions } from '../actions';
import { TOKEN_ADDRESSES, TOKENS, TokenSymbol } from '../config/contracts';

interface FaucetProps extends Omit<ContainerProps, 'children'> {
  onSuccess?: (txHash: string) => void;
  onError?: (error: string) => void;
  supportedTokens?: TokenSymbol[];
}

export function Faucet({ 
  onSuccess, 
  onError, 
  supportedTokens = ['USDT', 'USDC', 'WETH', 'DAI'],
  ...containerProps 
}: FaucetProps) {
  const { wallet } = useWallet();
  const { showAlert, alertProps } = useAlert();
  
  const [selectedToken, setSelectedToken] = useState<TokenSymbol>(supportedTokens[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [faucetInfo, setFaucetInfo] = useState<{
    [key in TokenSymbol]?: {
      dripAmount: string;
      maxBalance: string;
      isActive: boolean;
      faucetBalance: string;
      canDrip: boolean;
      timeUntilNextDrip: number;
      lastDripTime: number;
    }
  }>({});
  const [userBalances, setUserBalances] = useState<Record<TokenSymbol, string>>({} as Record<TokenSymbol, string>);

  const blockchainActions = useMemo(() => {
    if (wallet.provider && wallet.signer) {
      return createBlockchainActions(wallet.provider, wallet.signer);
    }
    return null;
  }, [wallet.provider, wallet.signer]);

  // Load faucet data
  const loadFaucetData = async () => {
    if (!blockchainActions || !wallet.account) return;

    try {
      const newFaucetInfo: typeof faucetInfo = {};
      const newBalances: Record<TokenSymbol, string> = {} as Record<TokenSymbol, string>;
      
      for (const token of supportedTokens) {
        const tokenAddress = TOKEN_ADDRESSES[token];
        
        // Get token info from faucet
        const tokenInfo = await blockchainActions.getFaucetTokenInfo(tokenAddress);
        
        // Get user's faucet info
        const userInfo = await blockchainActions.getUserFaucetInfo(wallet.account, tokenAddress);
        
        // Get user's token balance
        const balance = await blockchainActions.getTokenBalance(token, wallet.account);
        
        newFaucetInfo[token] = {
          ...tokenInfo,
          ...userInfo
        };
        
        newBalances[token] = balance;
      }
      
      setFaucetInfo(newFaucetInfo);
      setUserBalances(newBalances);
    } catch (error) {
      console.error('Failed to load faucet data:', error);
    }
  };

  useEffect(() => {
    if (wallet.isConnected) {
      loadFaucetData();
      // Refresh data every 30 seconds
      const interval = setInterval(loadFaucetData, 30000);
      return () => clearInterval(interval);
    }
  }, [wallet.isConnected, wallet.account, blockchainActions]);

  const handleRequestTokens = async (token: TokenSymbol) => {
    if (!wallet.isConnected) {
      showAlert('error', 'Please connect your wallet first', { absolute: true, position: 'top' });
      return;
    }

    if (!blockchainActions) {
      showAlert('error', 'Blockchain actions not available', { absolute: true, position: 'top' });
      return;
    }

    const tokenInfo = faucetInfo[token];
    if (!tokenInfo) {
      showAlert('error', 'Token information not available', { absolute: true, position: 'top' });
      return;
    }

    if (!tokenInfo.isActive) {
      showAlert('error', `${token} faucet is currently inactive`, { absolute: true, position: 'top' });
      return;
    }

    if (!tokenInfo.canDrip) {
      const timeLeft = Math.ceil(tokenInfo.timeUntilNextDrip / 60); // Convert to minutes
      showAlert('error', `Please wait ${timeLeft} minutes before requesting ${token} again`, { absolute: true, position: 'top' });
      return;
    }

    const userBalance = parseFloat(userBalances[token] || '0');
    const maxBalance = parseFloat(tokenInfo.maxBalance);
    
    if (userBalance >= maxBalance) {
      showAlert('error', `You already have the maximum allowed ${token} balance`, { absolute: true, position: 'top' });
      return;
    }

    setIsProcessing(true);

    try {
      showAlert('info', `Requesting ${token} from faucet...`, { absolute: true, position: 'top' });

      const tokenAddress = TOKEN_ADDRESSES[token];
      const faucetTx = await blockchainActions.requestFaucetDrip(tokenAddress);

      showAlert('info', `Faucet request submitted: ${faucetTx.hash.slice(0, 10)}...`, { absolute: true, position: 'top' });
      
      const receipt = await faucetTx.wait();
      
      if (receipt?.status === 1) {
        showAlert('success', `Successfully received ${tokenInfo.dripAmount} ${token}!`, { absolute: true, position: 'top' });
        await loadFaucetData();
        
        if (onSuccess) {
          onSuccess(faucetTx.hash);
        }
      } else {
        throw new Error('Faucet transaction failed');
      }

    } catch (error: any) {
      const errorMsg = `Faucet request failed: ${error.message}`;
      showAlert('error', errorMsg, { absolute: true, position: 'top' });
      if (onError) {
        onError(errorMsg);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const formatBalance = (balance: string) => {
    return parseFloat(balance).toFixed(4);
  };

  const formatTimeRemaining = (seconds: number) => {
    if (seconds <= 0) return 'Available now';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getTokenStatus = (token: TokenSymbol) => {
    const tokenInfo = faucetInfo[token];
    if (!tokenInfo) return { status: 'loading', color: 'gray' };
    
    if (!tokenInfo.isActive) return { status: 'inactive', color: 'red' };
    if (tokenInfo.canDrip) return { status: 'available', color: 'green' };
    return { status: 'cooldown', color: 'yellow' };
  };

  return (
    <Container {...containerProps}>
      <div className="card">
        <div className="cardHeader">
          <h2 className="cardTitle">Faucet</h2>
          <p className="cardDescription">Get testnet tokens for development</p>
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

          {/* Selected Token Info */}
          {faucetInfo[selectedToken] && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-center">
                  <span className="text-gray-600">Your Balance:</span>
                  <div className="font-semibold text-blue-600">
                    {formatBalance(userBalances[selectedToken] || '0')}
                  </div>
                </div>
                
                <div className="text-center">
                  <span className="text-gray-600">Drip Amount:</span>
                  <div className="font-semibold text-green-600">
                    {formatBalance(faucetInfo[selectedToken]?.dripAmount || '0')}
                  </div>
                </div>
                
                <div className="text-center">
                  <span className="text-gray-600">Max Balance:</span>
                  <div className="font-semibold text-purple-600">
                    {formatBalance(faucetInfo[selectedToken]?.maxBalance || '0')}
                  </div>
                </div>
                
                <div className="text-center">
                  <span className="text-gray-600">Next Request:</span>
                  <div className="font-semibold text-orange-600">
                    {formatTimeRemaining(faucetInfo[selectedToken]?.timeUntilNextDrip || 0)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Status Indicator */}
          {faucetInfo[selectedToken] && (
            <div className={`rounded-lg p-2 mb-4 text-center text-sm ${
              getTokenStatus(selectedToken).color === 'green' ? 'bg-green-100 text-green-700' :
              getTokenStatus(selectedToken).color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
              getTokenStatus(selectedToken).color === 'red' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              <div className="flex items-center justify-center gap-2">
                {getTokenStatus(selectedToken).status === 'available' && <CheckCircle className="w-4 h-4" />}
                {getTokenStatus(selectedToken).status === 'cooldown' && <Clock className="w-4 h-4" />}
                <span className="capitalize font-medium">
                  {getTokenStatus(selectedToken).status === 'available' ? 'Ready to claim' :
                   getTokenStatus(selectedToken).status === 'cooldown' ? 'On cooldown' :
                   getTokenStatus(selectedToken).status === 'inactive' ? 'Faucet inactive' :
                   'Loading...'}
                </span>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={() => handleRequestTokens(selectedToken)}
            disabled={
              isProcessing || 
              !wallet.isConnected ||
              !faucetInfo[selectedToken] ||
              !faucetInfo[selectedToken]?.isActive ||
              !faucetInfo[selectedToken]?.canDrip ||
              parseFloat(userBalances[selectedToken] || '0') >= parseFloat(faucetInfo[selectedToken]?.maxBalance || '0')
            }
            className="actionButton w-full"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="loading-spinner" />
                Processing...
              </div>
            ) : !faucetInfo[selectedToken] ? (
              'Loading...'
            ) : !faucetInfo[selectedToken]?.isActive ? (
              'Faucet Inactive'
            ) : !faucetInfo[selectedToken]?.canDrip ? (
              `Wait ${formatTimeRemaining(faucetInfo[selectedToken]?.timeUntilNextDrip || 0)}`
            ) : parseFloat(userBalances[selectedToken] || '0') >= parseFloat(faucetInfo[selectedToken]?.maxBalance || '0') ? (
              'Max Balance Reached'
            ) : (
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4" />
                Request {selectedToken}
              </div>
            )}
          </button>

          {/* Compact Info */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700 text-center">
              Testnet tokens • Daily limits apply • No real value
            </p>
          </div>
        </div>

        <Alert {...alertProps} />
      </div>
    </Container>
  );
}

export default Faucet;
