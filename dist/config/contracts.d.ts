export declare const TOKEN_ADDRESSES: {
    readonly USDT: "0x9b52D326D4866055F6c23297656002992e4293FC";
    readonly USDC: "0x31424DB0B7a929283C394b4DA412253Ab6D61682";
    readonly DAI: "0xdE896235F5897EC6D13Aa5b43964F9d2d34D82Fb";
    readonly WETH: "0xc8BB7DB0a07d2146437cc20e1f3a133474546dD4";
};
export declare const CONTRACT_ADDRESSES: {
    readonly LIQUIDITY_POOL: "0x91C39DAA7617C5188d0427Fc82e4006803772B74";
    readonly BUY_VAULT: "0x0adFd197aAbbC194e8790041290Be57F18d576a3";
    readonly STAKING_REWARDS: "0xB94d264074571A5099C458f74b526d1e4EE0314B";
    readonly BRIDGE: "0xfF064Fd496256e84b68dAE2509eDA84a3c235550";
    readonly FAUCET: "0xE1B8C7168B0c48157A5e4B80649C5a1b83bF4cC4";
};
export declare const TOKENS: {
    readonly USDT: {
        readonly symbol: "USDT";
        readonly name: "Tether USD";
        readonly decimals: 6;
    };
    readonly USDC: {
        readonly symbol: "USDC";
        readonly name: "USD Coin";
        readonly decimals: 6;
    };
    readonly DAI: {
        readonly symbol: "DAI";
        readonly name: "Dai Stablecoin";
        readonly decimals: 18;
    };
    readonly WETH: {
        readonly symbol: "WETH";
        readonly name: "Wrapped Ether";
        readonly decimals: 18;
    };
};
export type TokenSymbol = keyof typeof TOKENS;
