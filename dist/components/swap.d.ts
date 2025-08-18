import { ContainerProps } from './container';
import { TokenSymbol } from '../config/contracts';
interface SwapProps extends Omit<ContainerProps, 'children'> {
    onSuccess?: (txHash: string) => void;
    onError?: (error: string) => void;
    supportedTokens?: TokenSymbol[];
    defaultFromToken?: TokenSymbol;
    defaultToToken?: TokenSymbol;
}
export declare function Swap({ onSuccess, onError, supportedTokens, defaultFromToken, defaultToToken, ...containerProps }: SwapProps): import("react/jsx-runtime").JSX.Element;
export default Swap;
