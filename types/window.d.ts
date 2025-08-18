export {}; 

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      isMetaMask?: boolean;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}
