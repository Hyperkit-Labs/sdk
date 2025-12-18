![Alt](https://repobeats.axiom.co/api/embed/51fed2fdafda95301619d10f3e2a1fffa70089a5.svg "Repobeats analytics image")

# Hyperkit SDK

A modern React SDK for building decentralized applications with ease. Hyperkit provides high-level components and hooks for wallet connections, token swaps, bridging, staking, and more.

## Installation

```bash
npm install hyperkit
# or
pnpm add hyperkit
# or
yarn add hyperkit
```

## Quick Start

### 1. Setup Provider

Wrap your application with `HyperkitProvider` and import the required styles.

```tsx
import { HyperkitProvider } from 'hyperkit';
import 'hyperkit/dist/hyperkit.css';

function App() {
  return (
    <HyperkitProvider>
      <YourAppContent />
    </HyperkitProvider>
  );
}
```

### 2. Connect Wallet

Use the pre-built `ConnectWallet` component to handle wallet interactions.

```tsx
import { ConnectWallet } from 'hyperkit';

function Header() {
  return (
    <header>
      <ConnectWallet />
    </header>
  );
}
```

### 3. Access Wallet State

Use the `useWallet` hook to access account information and provider details.

```tsx
import { useWallet } from 'hyperkit';

function Profile() {
  const { wallet } = useWallet();
  
  if (!wallet.isConnected) return <p>Please connect your wallet</p>;
  
  return <p>Connected as: {wallet.account}</p>;
}
```

## Available Components

- **`<ConnectWallet />`**: Interactive button for wallet connection and account management.
- **`<Bridge />`**: Cross-chain bridging interface.
- **`<Swap />`**: Token exchange interface.
- **`<Staking />`**: Yield and staking management.
- **`<Faucet />`**: Testnet token distribution.
- **`<Container />`**: Layout wrapper for kit components.
- **`<Alert />`**: Context-aware notification system.

## Configuration

Hyperkit comes with built-in configurations for multiple networks:

```tsx
import { NETWORKS, TOKENS } from 'hyperkit';

// Access network details
console.log(NETWORKS.BASE_SEPOLIA);

// Access common token addresses
console.log(TOKENS.USDC);
```

## Features

- **Multi-Chain Support**: Ready-to-use configurations for popular EVM chains.
- **Modular Styles**: Tailwind-compatible CSS that can be easily customized.
- **Type Safe**: Written entirely in TypeScript with full declaration support.
- **Developer Friendly**: Simplified `ethers.js` integration.

## License

ISC