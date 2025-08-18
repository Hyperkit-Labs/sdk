import { HyperkitProvider } from '../src/providers/provider';
import WalletDemo from './wallet-demo';

// Demo App component that wraps everything in the provider
export default function App() {
  return (
    <HyperkitProvider>
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              HyperionKit Components Demo
            </h1>
            <p className="text-gray-600">
              Interactive preview of all HyperionKit components
            </p>
          </header>
          
          <WalletDemo />
        </div>
      </div>
    </HyperkitProvider>
  );
}
