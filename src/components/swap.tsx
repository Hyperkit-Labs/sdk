import { useState, useEffect, useMemo } from 'react';
import { ArrowUpDown, TrendingUp } from 'lucide-react';
import { useWallet } from '../providers/provider';
import { useAlert, Alert } from './ui/alert';
import { Container, ContainerProps } from './container';
import { createBlockchainActions } from '../actions';
import { CONTRACT_ADDRESSES, TOKEN_ADDRESSES, TOKENS, TokenSymbol } from '../config/contracts';

interface SwapProps extends Omit<ContainerProps, 'children'> {
  onSuccess?: (txHash: string) => void;
  onError?: (error: string) => void;
  supportedTokens?: TokenSymbol[];
  defaultFromToken?: TokenSymbol;
  defaultToToken?: TokenSymbol;
}

export function Swap({ 
  onSuccess, 
  onError, 
  supportedTokens = ['USDT', 'USDC', 'WETH', 'DAI'],
  defaultFromToken = 'USDT',
  defaultToToken = 'USDC',
  ...containerProps 
}: SwapProps) {
  const { wallet } = useWallet();
  const { showAlert, alertProps } = useAlert();
  
  const [fromToken, setFromToken] = useState<TokenSymbol>(defaultFromToken);
  const [toToken, setToToken] = useState<TokenSymbol>(defaultToToken);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [balances, setBalances] = useState<Record<TokenSymbol, string>>({} as Record<TokenSymbol, string>);
  const [slippage, setSlippage] = useState('0.5'); // 0.5% default slippage

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

  // Calculate output amount
  const calculateSwapOutput = async () => {
    if (!blockchainActions || !fromAmount || parseFloat(fromAmount) <= 0) {
      setToAmount('');
      return;
    }

    try {
      const quote = await blockchainActions.getSwapQuote(fromToken, toToken, fromAmount);
      setToAmount(quote.outputAmount);
    } catch (error) {
      console.error('Failed to get swap quote:', error);
      setToAmount('');
    }
  };

  useEffect(() => {
    if (wallet.isConnected) {
      loadBalances();
    }
  }, [wallet.isConnected, wallet.account, blockchainActions]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      calculateSwapOutput();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [fromAmount, fromToken, toToken, blockchainActions]);

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleMaxClick = () => {
    const balance = balances[fromToken];
    if (balance) {
      setFromAmount(balance);
    }
  };

  const handleSwap = async () => {
    if (!wallet.isConnected) {
      showAlert('error', 'Please connect your wallet first', { absolute: true, position: 'top' });
      return;
    }

    if (!blockchainActions) {
      showAlert('error', 'Blockchain actions not available', { absolute: true, position: 'top' });
      return;
    }

    const fromAmountNum = parseFloat(fromAmount);
    if (isNaN(fromAmountNum) || fromAmountNum <= 0) {
      showAlert('error', 'Please enter a valid amount', { absolute: true, position: 'top' });
      return;
    }

    const userBalance = parseFloat(balances[fromToken] || '0');
    if (userBalance < fromAmountNum) {
      showAlert('error', `Insufficient ${fromToken} balance`, { absolute: true, position: 'top' });
      return;
    }

    if (fromToken === toToken) {
      showAlert('error', 'Cannot swap the same token', { absolute: true, position: 'top' });
      return;
    }

    setIsProcessing(true);

    try {
      showAlert('info', 'Initiating swap transaction...', { absolute: true, position: 'top' });

      // Step 1: Check and approve token
      const allowance = await blockchainActions.getAllowance(
        fromToken,
        wallet.account,
        CONTRACT_ADDRESSES.LIQUIDITY_POOL // This should be swap router address
      );

      if (parseFloat(allowance) < fromAmountNum) {
        showAlert('info', 'Approving token...', { absolute: true, position: 'top' });
        const approveTx = await blockchainActions.approveToken(
          fromToken,
          CONTRACT_ADDRESSES.LIQUIDITY_POOL, 
          fromAmount
        );
        
        showAlert('info', `Approval submitted: ${approveTx.hash.slice(0, 10)}...`, { absolute: true, position: 'top' });
        await approveTx.wait();
        showAlert('success', 'Token approved successfully', { absolute: true, position: 'top' });
      }

      // Step 2: Execute swap
      showAlert('info', 'Executing swap...', { absolute: true, position: 'top' });
      
      const swapTx = await blockchainActions.swapTokens(
        fromToken,
        toToken,
        fromAmount,
        toAmount,
        wallet.account,
        parseFloat(slippage)
      );

      showAlert('info', `Swap submitted: ${swapTx.hash.slice(0, 10)}...`, { absolute: true, position: 'top' });
      
      const receipt = await swapTx.wait();
      
      if (receipt?.status === 1) {
        showAlert('success', 'Swap completed successfully!', { absolute: true, position: 'top' });
        setFromAmount('');
        setToAmount('');
        await loadBalances();
        
        if (onSuccess) {
          onSuccess(swapTx.hash);
        }
      } else {
        throw new Error('Swap transaction failed');
      }

    } catch (error: any) {
      const errorMsg = `Swap failed: ${error.message}`;
      showAlert('error', errorMsg, { absolute: true, position: 'top' });
      if (onError) {
        onError(errorMsg);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const isValidAmount = () => {
    const fromAmountNum = parseFloat(fromAmount);
    const userBalance = parseFloat(balances[fromToken] || '0');
    return !isNaN(fromAmountNum) && fromAmountNum > 0 && fromAmountNum <= userBalance;
  };

  const formatBalance = (balance: string) => {
    return parseFloat(balance).toFixed(4);
  };

  return (
    <Container {...containerProps}>
      <div className="card">
        <div className="cardHeader">
          <h2 className="cardTitle">Swap</h2>
          <p className="cardDescription">Exchange tokens instantly</p>
        </div>

        <div className="cardContent">
          {/* From Token */}
          <div className="inputGroup">
            <div className="flex justify-between items-center mb-2">
              <label className="label">From</label>
              {wallet.isConnected && balances[fromToken] && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Balance: {formatBalance(balances[fromToken])}</span>
                  <button
                    type="button"
                    onClick={handleMaxClick}
                    disabled={isProcessing}
                    className="text-blue-500 hover:text-blue-600 font-medium"
                  >
                    MAX
                  </button>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="0.0"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                disabled={isProcessing}
                className="txt_field flex-1"
              />
              <select
                value={fromToken}
                onChange={(e) => setFromToken(e.target.value as TokenSymbol)}
                disabled={isProcessing}
                className="sel_field w-32"
              >
                {supportedTokens.map(token => (
                  <option key={token} value={token}>
                    {token}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Direction Button */}
          <div className="swapButtonContainer">
            <button
              type="button"
              onClick={handleSwapTokens}
              disabled={isProcessing}
              className="swapDirectionButton"
              aria-label="Swap tokens"
            >
              <ArrowUpDown className="w-5 h-5" />
            </button>
          </div>

          {/* To Token */}
          <div className="inputGroup">
            <div className="flex justify-between items-center mb-2">
              <label className="label">To</label>
              {wallet.isConnected && balances[toToken] && (
                <span className="text-sm text-gray-500">
                  Balance: {formatBalance(balances[toToken])}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="0.0"
                value={toAmount}
                readOnly
                className="txt_field flex-1 bg-gray-50"
              />
              <select
                value={toToken}
                onChange={(e) => setToToken(e.target.value as TokenSymbol)}
                disabled={isProcessing}
                className="sel_field w-32"
              >
                {supportedTokens.map(token => (
                  <option key={token} value={token}>
                    {token}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Slippage Settings */}
          <div className="inputGroup">
            <label className="label">Slippage Tolerance (%)</label>
            <div className="flex gap-2">
              {['0.1', '0.5', '1.0'].map(value => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSlippage(value)}
                  disabled={isProcessing}
                  className={`px-3 py-1 rounded text-sm border ${
                    slippage === value 
                      ? 'bg-blue-500 text-white border-blue-500' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                  }`}
                >
                  {value}%
                </button>
              ))}
              <input
                type="text"
                placeholder="Custom"
                value={slippage}
                onChange={(e) => setSlippage(e.target.value)}
                disabled={isProcessing}
                className="txt_field flex-1 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="cardFooter">
          {!wallet.isConnected ? (
            <div className="text-center text-gray-500">
              Please connect your wallet to use the swap
            </div>
          ) : (
            <button
              onClick={handleSwap}
              disabled={
                isProcessing || 
                !isValidAmount() || 
                fromToken === toToken ||
                !toAmount ||
                parseFloat(toAmount) <= 0
              }
              className="actionButton"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="loading-spinner" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Swap {fromToken} for {toToken}
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

export default Swap;