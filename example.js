// Example: How to use HyperKit SDK
// Generated for: Metis Hyperion Testnet

import { 
  HyperkitProvider, 
  ConnectWallet,
  Bridge, 
  Swap, 
  Staking, 
  Faucet,
  config 
} from './src/index.js';

// React Component Example
function App() {
  return (
    <HyperkitProvider defaultNetwork="metis-hyperion-testnet">
      <div>
        <h1>HyperKit SDK - Metis Hyperion Testnet</h1>
        
        {/* Wallet Connection */}
        <ConnectWallet />
        
        {/* DeFi Components */}
        <Bridge />
        <Swap />
        <Staking />
        <Faucet />
      </div>
    </HyperkitProvider>
  );
}

// Programmatic Usage Example
import { createBlockchainActions } from './src/index.js';

async function example() {
  // Get provider and signer from your wallet
  const provider = window.ethereum;
  const signer = await provider.getSigner();
  
  // Create actions instance
  const actions = createBlockchainActions(provider, signer);
  
  // Use the actions
  const balance = await actions.getTokenBalance('USDT', userAddress);
  await actions.swapTokens('USDT', 'USDC', '100', expectedOut, recipient, 0.5);
  await actions.stakeTokens('1000');
  
  console.log('Config:', config);
  console.log('Contracts:', config.contracts);
}

export default App;
