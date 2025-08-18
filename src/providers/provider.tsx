import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ethers } from 'ethers';
import { NETWORKS, DEFAULT_NETWORK } from '../config/networks';

interface WalletState {
  isConnected: boolean;
  account: string;
  chainId: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  isLoading: boolean;
  error: string | null;
}

interface HyperkitContextType {
  wallet: WalletState;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (networkKey: string) => Promise<boolean>;
  isCorrectNetwork: (networkKey?: string) => boolean;
}

const HyperkitContext = createContext<HyperkitContextType | null>(null);

interface HyperkitProviderProps {
  children: ReactNode;
  defaultNetwork?: string;
}

export function HyperkitProvider({ children, defaultNetwork = DEFAULT_NETWORK }: HyperkitProviderProps) {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    account: '',
    chainId: null,
    provider: null,
    signer: null,
    isLoading: false,
    error: null
  });

  // Initialize ethereum provider
  const initializeProvider = async () => {
    if (!window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      
      setWallet(prev => ({
        ...prev,
        provider,
        signer,
        chainId: `0x${network.chainId.toString(16).toUpperCase()}`
      }));
    } catch (error) {
      console.error("Error initializing provider:", error);
      setWallet(prev => ({
        ...prev,
        error: "Failed to initialize provider"
      }));
    }
  };

  // Check wallet connection on load
  const checkWalletConnection = async () => {
    if (!window.ethereum) return;

    try {
      setWallet(prev => ({ ...prev, isLoading: true }));
      
      const accounts = await window.ethereum.request({ 
        method: "eth_accounts" 
      }) as string[];
      
      if (accounts.length > 0) {
        setWallet(prev => ({
          ...prev,
          account: accounts[0],
          isConnected: true,
          error: null
        }));
        await initializeProvider();
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error);
      setWallet(prev => ({
        ...prev,
        error: "Failed to check wallet connection"
      }));
    } finally {
      setWallet(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      setWallet(prev => ({
        ...prev,
        error: "MetaMask not found. Please install MetaMask."
      }));
      return;
    }

    try {
      setWallet(prev => ({ ...prev, isLoading: true, error: null }));

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[];

      if (accounts.length > 0) {
        setWallet(prev => ({
          ...prev,
          account: accounts[0],
          isConnected: true
        }));
        await initializeProvider();
      }
    } catch (error: any) {
      setWallet(prev => ({
        ...prev,
        error: `Connection failed: ${error.message}`
      }));
    } finally {
      setWallet(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setWallet({
      isConnected: false,
      account: '',
      chainId: null,
      provider: null,
      signer: null,
      isLoading: false,
      error: null
    });
  };

  // Switch network
  const switchNetwork = async (networkKey: string): Promise<boolean> => {
    if (!window.ethereum) return false;

    const network = NETWORKS[networkKey];
    if (!network) return false;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainId }],
      });
      return true;
    } catch (switchError: any) {
      // Chain not added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [network],
          });
          return true;
        } catch (addError) {
          console.error("Error adding network:", addError);
          return false;
        }
      }
      console.error("Error switching network:", switchError);
      return false;
    }
  };

  // Check if on correct network
  const isCorrectNetwork = (networkKey: string = defaultNetwork): boolean => {
    if (!wallet.chainId) return false;
    const network = NETWORKS[networkKey];
    return network && wallet.chainId === network.chainId;
  };

  // Handle account changes
  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length > 0) {
      setWallet(prev => ({
        ...prev,
        account: accounts[0],
        isConnected: true
      }));
      initializeProvider();
    } else {
      disconnectWallet();
    }
  };

  // Handle chain changes
  const handleChainChanged = (chainId: string) => {
    setWallet(prev => ({ ...prev, chainId }));
    initializeProvider();
  };

  // Set up event listeners
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
      
      // Check connection on mount
      checkWalletConnection();

      return () => {
        window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum?.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, []);

  const value: HyperkitContextType = {
    wallet,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    isCorrectNetwork
  };

  return (
    <HyperkitContext.Provider value={value}>
      {children}
    </HyperkitContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(HyperkitContext);
  if (!context) {
    throw new Error('useWallet must be used within a HyperkitProvider');
  }
  return context;
}
