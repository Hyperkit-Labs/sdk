import { ContainerProps } from './container';
import { TokenSymbol } from '../config/contracts';
interface FaucetProps extends Omit<ContainerProps, 'children'> {
    onSuccess?: (txHash: string) => void;
    onError?: (error: string) => void;
    supportedTokens?: TokenSymbol[];
}
export declare function Faucet({ onSuccess, onError, supportedTokens, ...containerProps }: FaucetProps): import("react/jsx-runtime").JSX.Element;
export default Faucet;
