"use client"

import { useState, useEffect } from "react"
import { Settings, Menu, X } from "lucide-react"

// Import our local components
import { ConnectWallet } from '../src/components/connect-wallet'
import { Swap } from '../src/components/swap'
import { Bridge } from '../src/components/bridge'
import { Staking } from '../src/components/staking'
import { Faucet } from '../src/components/faucet'

const ConnectWalletDemo = () => (
  <div className="text-gray-300 text-xs leading-relaxed">
    <pre className="whitespace-pre-wrap">{`import { ConnectWallet } from 'hyperionkit';
    
export default function App() {
  return (
    <ConnectWallet 
      width="400px"
      height="auto"
      theme="light"
      onSuccess={(address) => {
        console.log('Connected:', address);
      }}
    />
  );
}`}</pre>
  </div>
)

const SwapDemo = () => (
  <div className="text-gray-300 text-xs leading-relaxed">
    <pre className="whitespace-pre-wrap">{`import { Swap } from 'hyperionkit';
    
export default function SwapPage() {
  return (
    <Swap 
      width="500px"
      theme="light"
      supportedTokens={['USDT', 'USDC', 'WETH', 'DAI']}
      onSuccess={(txHash) => {
        console.log('Swap successful:', txHash);
      }}
    />
  );
}`}
    </pre>
  </div>
)

const BridgeDemo = () => (
  <div className="text-gray-300 text-xs leading-relaxed">
    <pre className="whitespace-pre-wrap">{`import { Bridge } from 'hyperionkit';
    
export default function BridgePage() {
  return (
    <Bridge 
      width="500px"
      theme="light"
      supportedTokens={['USDT', 'USDC']}
      supportedNetworks={['metis-hyperion-testnet', 'metisSepolia']}
      onSuccess={(txHash) => {
        console.log('Bridge successful:', txHash);
      }}
    />
  );
}`}
    </pre>
  </div>
)

const StakingDemo = () => (
  <div className="text-gray-300 text-xs leading-relaxed">
    <pre className="whitespace-pre-wrap">{`import { Staking } from 'hyperionkit';
    
export default function StakingPage() {
  return (
    <Staking 
      width="500px"
      theme="light"
      supportedTokens={['USDT', 'USDC']}
      onSuccess={(txHash) => {
        console.log('Stake successful:', txHash);
      }}
    />
  );
}`}
    </pre>
  </div>
)

const FaucetDemo = () => (
  <div className="text-gray-300 text-xs leading-relaxed">
    <pre className="whitespace-pre-wrap">{`import { Faucet } from 'hyperionkit';
    
export default function FaucetPage() {
  return (
    <Faucet 
      width="500px"
      theme="light"
      supportedTokens={['USDT', 'USDC', 'WETH', 'DAI']}
      onSuccess={(txHash) => {
        console.log('Faucet drip successful:', txHash);
      }}
    />
  );
}`}
    </pre>
  </div>
)

export default function WalletDemo() {
  const [activeTab, setActiveTab] = useState("Wallet")
  const [isMounted, setIsMounted] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const navItems = ["Wallet", "Swap", "Bridge", "Staking", "Faucet"]
  const rightNavItems = ["Docs", "AI docs", "Playground"]

  const renderTabContent = () => {
    switch (activeTab) {
      case "Wallet":
        return {
          component: (
            <ConnectWallet 
              width="400px"
              height="auto"
              theme="light"
              onSuccess={(address: string) => console.log('Connected:', address)}
            />
          ),
          demo: <ConnectWalletDemo />
        }
      case "Swap":
        return {
          component: (
            <Swap 
              width="auto"
              height="auto"
              scale={0.9}
              theme="light"
              supportedTokens={['USDT', 'USDC', 'WETH', 'DAI']}
              onSuccess={(txHash) => console.log('Swap successful:', txHash)}
            />
          ),
          demo: <SwapDemo />
        }
      case "Bridge":
        return {
          component: (
            <Bridge 
              width="700px"
              height="auto"
              scale={0.8}
              theme="light"
              supportedTokens={['USDT', 'USDC']}
              supportedNetworks={['metis-hyperion-testnet', 'metisSepolia']}
              onSuccess={(txHash) => console.log('Bridge successful:', txHash)}
            />
          ),
          demo: <BridgeDemo />
        }
      case "Staking":
        return {
          component: (
            <Staking 
              width="700px"
              height="auto"
              scale={0.8}
              theme="light"
              supportedTokens={['USDT', 'USDC']}
              onSuccess={(txHash) => console.log('Stake successful:', txHash)}
            />
          ),
          demo: <StakingDemo />
        }
      case "Faucet":
        return {
          component: (
            <Faucet 
              width="700px"
              height="auto"
              scale={0.9}
              theme="light"
              supportedTokens={['USDT', 'USDC', 'WETH', 'DAI']}
              onSuccess={(txHash) => console.log('Faucet drip successful:', txHash)}
            />
          ),
          demo: <FaucetDemo />
        }
      default:
        return {
          component: (
            <ConnectWallet 
              width="400px"
              height="auto"
              theme="light"
              onSuccess={(address: string) => console.log('Connected:', address)}
            />
          ),
          demo: <ConnectWalletDemo />
        }
    }
  }

  const tabContent = renderTabContent()

  return (
    <div className="bg-black text-white rounded-lg shadow-2xl border border-gray-700 overflow-hidden w-full max-w-7xl mx-auto">
      {/* Top Navigation */}
      <nav className="border-b border-gray-800">
        {/* Mobile Navigation */}
        <div className="block sm:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                {isMounted && (isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />)}
                {!isMounted && <span className="w-5 h-5 inline-block" />}
              </button>
              <span className="text-sm font-medium text-white">{activeTab}</span>
            </div>
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              {isMounted && <Settings className="w-4 h-4" />}
              {!isMounted && <span className="w-4 h-4 inline-block" />}
            </button>
          </div>
          
          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="bg-gray-900 border-t border-gray-800">
              <div className="px-4 py-2">
                <div className="mb-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Navigation</p>
                  {navItems.map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        setActiveTab(item)
                        setIsMobileMenuOpen(false)
                      }}
                      className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors mb-1 ${
                        activeTab === item 
                          ? "text-white bg-violet-600" 
                          : "text-gray-400 hover:text-white hover:bg-gray-800"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Resources</p>
                  {rightNavItems.map((item) => (
                    <button 
                      key={item} 
                      className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors mb-1"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Navigation */}
        <div className="hidden sm:flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-1 lg:space-x-8">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => setActiveTab(item)}
                className={`text-sm font-medium transition-colors px-3 py-2 rounded-md whitespace-nowrap ${
                  activeTab === item 
                    ? "text-white bg-gray-800 border-b-2 border-violet-500" 
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3 lg:space-x-6">
            {rightNavItems.map((item) => (
              <button key={item} className="text-sm font-medium text-gray-400 hover:text-white transition-colors whitespace-nowrap hidden md:block">
                {item}
              </button>
            ))}
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              {isMounted && <Settings className="w-4 h-4" />}
              {!isMounted && <span className="w-4 h-4 inline-block" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row min-h-[500px] lg:h-[600px]">
        {/* Left Panel - Interactive Component */}
        <div className="w-full lg:w-1/2 flex flex-col bg-gray-950/30 min-h-[300px] lg:min-h-0 order-2 lg:order-1">
          {/* Centered Content Container */}
          <div className="flex-1 flex items-center justify-center">
            {tabContent.component}
          </div>
        </div>

        {/* Right Panel - Code Display */}
        <div className="w-full lg:w-1/2 bg-gray-900 order-1 lg:order-2 border-b lg:border-b-0 lg:border-l border-gray-800">
          <div className="h-full overflow-y-auto">
            <div className="p-4 sm:p-6 font-mono text-xs sm:text-sm min-h-[200px] lg:min-h-0">
              <div className="mb-3 pb-2 border-b border-gray-800">
                <span className="text-gray-500 text-xs">Code Example</span>
              </div>
              {tabContent.demo}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
