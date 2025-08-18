import { ReactNode } from 'react';
import { ethers } from 'ethers';
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
interface HyperkitProviderProps {
    children: ReactNode;
    defaultNetwork?: string;
}
export declare function HyperkitProvider({ children, defaultNetwork }: HyperkitProviderProps): import("react/jsx-runtime").JSX.Element;
export declare function useWallet(): HyperkitContextType;
export {};
