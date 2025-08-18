import React, { useState, useEffect, useMemo } from 'react';
import { ArrowUpDown, ArrowRight } from 'lucide-react';
import { useWallet } from '../providers/provider';
import { useAlert, Alert } from './ui/alert';
import { Container, ContainerProps } from './container';
import { createBlockchainActions } from '../actions';
import { CONTRACT_ADDRESSES, TOKEN_ADDRESSES, TOKENS, TokenSymbol } from '../config/contracts';
import { NETWORKS } from '../config/networks';

interface BridgeProps extends Omit<ContainerProps, 'children'> {
  onSuccess?: (txHash: string) => void;
  onError?: (error: string) => void;
  supportedTokens?: TokenSymbol[];
  supportedNetworks?: string[];
}

export function Bridge({ 
  onSuccess, 
  onError, 
  supportedTokens = ['USDT', 'USDC'],
  supportedNetworks = ['metis-hyperion-testnet', 'metisSepolia'],
  ...containerProps 
}: BridgeProps) {
  const { wallet, switchNetwork, isCorrectNetwork } = useWallet();
  const { showAlert, alertProps } = useAlert();
  
  const [fromNetwork, setFromNetwork] = useState('metis-hyperion-testnet');
  const [toNetwork, setToNetwork] = useState('metisSepolia');
  const [selectedToken, setSelectedToken] = useState<TokenSymbol>('USDT');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [balances, setBalances] = useState<Record<TokenSymbol, string>>({} as Record<TokenSymbol, string>);

  const blockchainActions = useMemo(() => {
    if (wallet.provider && wallet.signer) {
      return createBlockchainActions(wallet.provider, wallet.signer);
    }
    return null;
  }, [wallet.provider, wallet.signer]);

  // Load token balances
  const loadBalances = async () => {
    if (!blockchainActions || !wallet.account) return;

    try {
      const newBalances: Record<TokenSymbol, string> = {} as Record<TokenSymbol, string>;
      
      for (const token of supportedTokens) {
        const balance = await blockchainActions.getTokenBalance(token, wallet.account);
        newBalances[token] = balance;
      }
      
      setBalances(newBalances);
    } catch (error) {
      console.error('Failed to load balances:', error);
    }
  };

  useEffect(() => {
    if (wallet.isConnected) {
      loadBalances();
    }
  }, [wallet.isConnected, wallet.account, blockchainActions]);

  const handleSwapNetworks = () => {
    const temp = fromNetwork;
    setFromNetwork(toNetwork);
    setToNetwork(temp);
  };

  const handleBridge = async () => {
    if (!wallet.isConnected) {
      showAlert('error', 'Please connect your wallet first', { absolute: true, position: 'top' });
      return;
    }

    if (!blockchainActions) {
      showAlert('error', 'Blockchain actions not available', { absolute: true, position: 'top' });
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showAlert('error', 'Please enter a valid amount', { absolute: true, position: 'top' });
      return;
    }

    const userBalance = parseFloat(balances[selectedToken] || '0');
    if (userBalance < amountNum) {
      showAlert('error', `Insufficient ${selectedToken} balance`, { absolute: true, position: 'top' });
      return;
    }

    // Check if on correct network
    if (!isCorrectNetwork(fromNetwork)) {
      const switched = await switchNetwork(fromNetwork);
      if (!switched) {
        showAlert('error', 'Please switch to the correct network', { absolute: true, position: 'top' });
        return;
      }
      // Wait for network switch
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    setIsProcessing(true);

    try {
      showAlert('info', 'Initiating bridge transaction...', { absolute: true, position: 'top' });

      // Step 1: Check and approve token
      const allowance = await blockchainActions.getAllowance(
        selectedToken,
        wallet.account,
        CONTRACT_ADDRESSES.BRIDGE // Approve the bridge contract, not the token
      );

      if (parseFloat(allowance) < amountNum) {
        showAlert('info', 'Approving token...', { absolute: true, position: 'top' });
        const approveTx = await blockchainActions.approveToken(
          selectedToken,
          CONTRACT_ADDRESSES.BRIDGE, // Approve the bridge contract, not the token
          amount
        );
        
        showAlert('info', `Approval submitted: ${approveTx.hash.slice(0, 10)}...`, { absolute: true, position: 'top' });
        await approveTx.wait();
        showAlert('success', 'Token approved successfully', { absolute: true, position: 'top' });
      }

      // Step 2: Execute bridge deposit
      showAlert('info', 'Executing bridge deposit...', { absolute: true, position: 'top' });
      
      const destinationChainId = parseInt(NETWORKS[toNetwork].chainId, 16);
      const bridgeTx = await blockchainActions.bridgeDeposit(
        selectedToken,
        amount,
        destinationChainId,
        wallet.account
      );

      showAlert('info', `Bridge deposit submitted: ${bridgeTx.hash.slice(0, 10)}...`, { absolute: true, position: 'top' });
      
      const receipt = await bridgeTx.wait();
      
      if (receipt?.status === 1) {
        showAlert('success', 'Bridge transaction completed successfully!', { absolute: true, position: 'top' });
        setAmount('');
        await loadBalances();
        
        if (onSuccess) {
          onSuccess(bridgeTx.hash);
        }
      } else {
        throw new Error('Bridge transaction failed');
      }

    } catch (error: any) {
      const errorMsg = `Bridge failed: ${error.message}`;
      showAlert('error', errorMsg, { absolute: true, position: 'top' });
      if (onError) {
        onError(errorMsg);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const isValidAmount = () => {
    const amountNum = parseFloat(amount);
    const userBalance = parseFloat(balances[selectedToken] || '0');
    return !isNaN(amountNum) && amountNum > 0 && amountNum <= userBalance;
  };

  return (
    <Container {...containerProps}>
      <div className="card">
        <div className="cardHeader">
          <h2 className="cardTitle">Bridge</h2>
          <p className="cardDescription">Transfer tokens across networks</p>
        </div>

        <div className="cardContent">
          {/* From Network */}
          <div className="inputGroup">
            <label className="label">From Network</label>
            <select
              value={fromNetwork}
              onChange={(e) => setFromNetwork(e.target.value)}
              disabled={isProcessing}
              className="sel_field"
            >
              {supportedNetworks.map(network => (
                <option key={network} value={network}>
                  {NETWORKS[network]?.chainName || network}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Networks Button */}
          <div className="swapButtonContainer">
            <button
              type="button"
              onClick={handleSwapNetworks}
              disabled={isProcessing}
              className="swapDirectionButton"
              aria-label="Swap networks"
            >
              <ArrowUpDown className="w-5 h-5" />
            </button>
          </div>

          {/* To Network */}
          <div className="inputGroup">
            <label className="label">To Network</label>
            <select
              value={toNetwork}
              onChange={(e) => setToNetwork(e.target.value)}
              disabled={isProcessing}
              className="sel_field"
            >
              {supportedNetworks.map(network => (
                <option key={network} value={network}>
                  {NETWORKS[network]?.chainName || network}
                </option>
              ))}
            </select>
          </div>

          {/* Token Selection */}
          <div className="inputGroup">
            <label className="label">Token</label>
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

          {/* Amount Input */}
          <div className="inputGroup">
            <label className="label">
              Amount
              {wallet.isConnected && balances[selectedToken] && (
                <span className="text-sm text-gray-500 ml-2">
                  Balance: {parseFloat(balances[selectedToken]).toFixed(4)} {selectedToken}
                </span>
              )}
            </label>
            <input
              type="text"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isProcessing}
              className="txt_field"
            />
          </div>

          {/* Network Status */}
          {wallet.isConnected && !isCorrectNetwork(fromNetwork) && (
            <div className="hyperkit-alert hyperkit-alert-warning">
              <div className="hyperkit-alert-content">
                <div className="hyperkit-alert-message">
                  Please switch to {NETWORKS[fromNetwork]?.chainName} to continue
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="cardFooter">
          {!wallet.isConnected ? (
            <div className="text-center text-gray-500">
              Please connect your wallet to use the bridge
            </div>
          ) : (
            <button
              onClick={handleBridge}
              disabled={
                isProcessing || 
                !isValidAmount() || 
                fromNetwork === toNetwork ||
                !isCorrectNetwork(fromNetwork)
              }
              className="actionButton"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="loading-spinner" />
                  Processing...
                </div>
              ) : !isCorrectNetwork(fromNetwork) ? (
                `Switch to ${NETWORKS[fromNetwork]?.chainName}`
              ) : (
                <div className="flex items-center gap-2">
                  Bridge to {NETWORKS[toNetwork]?.chainName}
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </button>
          )}
        </div>

        <Alert {...alertProps} />
      </div>
    </Container>
  );
}

export default Bridge;