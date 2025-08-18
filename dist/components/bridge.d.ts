import { ContainerProps } from './container';
import { TokenSymbol } from '../config/contracts';
interface BridgeProps extends Omit<ContainerProps, 'children'> {
    onSuccess?: (txHash: string) => void;
    onError?: (error: string) => void;
    supportedTokens?: TokenSymbol[];
    supportedNetworks?: string[];
}
export declare function Bridge({ onSuccess, onError, supportedTokens, supportedNetworks, ...containerProps }: BridgeProps): import("react/jsx-runtime").JSX.Element;
export default Bridge;
