import { ContainerProps } from './container';
import { TokenSymbol } from '../config/contracts';
interface StakingProps extends Omit<ContainerProps, 'children'> {
    onSuccess?: (txHash: string) => void;
    onError?: (error: string) => void;
    supportedTokens?: TokenSymbol[];
    defaultStakeToken?: TokenSymbol;
}
export declare function Staking({ onSuccess, onError, supportedTokens, defaultStakeToken, ...containerProps }: StakingProps): import("react/jsx-runtime").JSX.Element;
export default Staking;
