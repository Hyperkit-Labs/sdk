import fs from 'fs';
import path from 'path';

// Config templates for each blockchain
const configs = {
  metis: {
    name: 'Metis Hyperion Testnet',
    chainId: '0x20A55',
    rpcUrl: 'https://hyperion-testnet.metisdevops.link',
    explorer: 'https://hyperion-testnet-explorer.metisdevops.link',
    contracts: {
      bridge: '0xfF064Fd496256e84b68dAE2509eDA84a3c235550',
      liquidityPool: '0x91C39DAA7617C5188d0427Fc82e4006803772B74',
      staking: '0xB94d264074571A5099C458f74b526d1e4EE0314B',
      faucet: '0xE1B8C7168B0c48157A5e4B80649C5a1b83bF4cC4'
    },
    tokens: {
      USDT: '0x9b52D326D4866055F6c23297656002992e4293FC',
      USDC: '0x31424DB0B7a929283C394b4DA412253Ab6D61682',
      DAI: '0xdE896235F5897EC6D13Aa5b43964F9d2d34D82Fb',
      WETH: '0xc8BB7DB0a07d2146437cc20e1f3a133474546dD4'
    }
  },
  
  sui: {
    name: 'Sui Testnet',
    network: 'testnet',
    rpcUrl: 'https://fullnode.testnet.sui.io:443',
    explorer: 'https://suiexplorer.com',
    contracts: {
      bridge: '0x0000000000000000000000000000000000000000000000000000000000000000',
      swap: '0x0000000000000000000000000000000000000000000000000000000000000000',
      staking: '0x0000000000000000000000000000000000000000000000000000000000000000',
      faucet: '0x0000000000000000000000000000000000000000000000000000000000000000'
    },
    note: 'Mock data - Sui integration coming soon'
  },
  
  aptos: {
    name: 'Aptos Testnet',
    network: 'testnet',
    rpcUrl: 'https://fullnode.testnet.aptoslabs.com/v1',
    explorer: 'https://explorer.aptoslabs.com',
    contracts: {
      bridge: '0x0000000000000000000000000000000000000000000000000000000000000000',
      swap: '0x0000000000000000000000000000000000000000000000000000000000000000',
      staking: '0x0000000000000000000000000000000000000000000000000000000000000000',
      faucet: '0x0000000000000000000000000000000000000000000000000000000000000000'
    },
    note: 'Mock data - Aptos integration coming soon'
  },
  
  mantle: {
    name: 'Mantle Testnet',
    chainId: '0x1389',
    rpcUrl: 'https://rpc.testnet.mantle.xyz',
    explorer: 'https://explorer.testnet.mantle.xyz',
    contracts: {
      bridge: '0x0000000000000000000000000000000000000000',
      liquidityPool: '0x0000000000000000000000000000000000000000',
      staking: '0x0000000000000000000000000000000000000000',
      faucet: '0x0000000000000000000000000000000000000000'
    },
    tokens: {
      USDT: '0x0000000000000000000000000000000000000000',
      USDC: '0x0000000000000000000000000000000000000000',
      DAI: '0x0000000000000000000000000000000000000000',
      WETH: '0x0000000000000000000000000000000000000000'
    },
    note: 'Mock data - Mantle integration coming soon'
  }
};

export function generateConfig(blockchain, targetDir = process.cwd()) {
  const config = configs[blockchain];
  
  if (!config) {
    throw new Error(`Unknown blockchain: ${blockchain}`);
  }
  
  // Create src directory if it doesn't exist
  const srcDir = path.join(targetDir, 'src');
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
  }
  
  // Generate config file content
  const configContent = `// HyperKit SDK Configuration
// Generated for: ${config.name}
${config.note ? `// ${config.note}\n` : ''}
export const config = ${JSON.stringify(config, null, 2)};

export default config;
`;
  
  // Write config file
  const configPath = path.join(srcDir, 'hyperkit.config.js');
  fs.writeFileSync(configPath, configContent);
  
  // Generate index file for easy imports
  const indexContent = `// HyperKit SDK
// Import this file to use the SDK with your selected blockchain

import { config } from './hyperkit.config.js';

// Re-export everything from hyperionkit package
export * from 'hyperionkit';

// Export config for direct access
export { config };

// Example usage:
// import { Bridge, Swap, Staking, Faucet, config } from './src';
`;
  
  const indexPath = path.join(srcDir, 'index.js');
  fs.writeFileSync(indexPath, indexContent);
  
  // Generate example usage file
  const exampleContent = `// Example: How to use HyperKit SDK
// Generated for: ${config.name}

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
    <HyperkitProvider defaultNetwork="${blockchain === 'metis' ? 'metis-hyperion-testnet' : blockchain}">
      <div>
        <h1>HyperKit SDK - ${config.name}</h1>
        
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
`;
  
  const examplePath = path.join(targetDir, 'example.js');
  fs.writeFileSync(examplePath, exampleContent);
  
  return {
    configPath,
    indexPath,
    examplePath,
    config
  };
}

export function getAvailableBlockchains() {
  return Object.keys(configs);
}
