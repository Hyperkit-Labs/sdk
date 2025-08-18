import { ContainerProps } from './container';
interface ConnectWalletProps extends Omit<ContainerProps, 'children'> {
    onSuccess?: (address: string) => void;
    onError?: (error: string) => void;
    onDisconnect?: () => void;
    showDropdown?: boolean;
}
export declare function ConnectWallet({ onSuccess, onError, onDisconnect, showDropdown, ...containerProps }: ConnectWalletProps): import("react/jsx-runtime").JSX.Element;
export {};
