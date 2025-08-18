import React, { useState, useRef, useEffect } from 'react';
import { Wallet, Copy, LogOut, CheckCircle } from 'lucide-react';
import { useWallet } from '../providers/provider';
import { useAlert, Alert } from './ui/alert';
import { Container, ContainerProps } from './container';

interface ConnectWalletProps extends Omit<ContainerProps, 'children'> {
  onSuccess?: (address: string) => void;
  onError?: (error: string) => void;
  onDisconnect?: () => void;
  showDropdown?: boolean;
}

export function ConnectWallet({ 
  onSuccess, 
  onError, 
  onDisconnect, 
  showDropdown = true,
  ...containerProps 
}: ConnectWalletProps) {
  const { wallet, connectWallet, disconnectWallet } = useWallet();
  const { showAlert, alertProps } = useAlert();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle successful connection
  useEffect(() => {
    if (wallet.isConnected && wallet.account && onSuccess) {
      onSuccess(wallet.account);
    }
  }, [wallet.isConnected, wallet.account, onSuccess]);

  // Handle errors
  useEffect(() => {
    if (wallet.error) {
      showAlert('error', wallet.error, { absolute: true, position: 'top' });
      if (onError) {
        onError(wallet.error);
      }
    }
  }, [wallet.error, showAlert, onError]);

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error: any) {
      showAlert('error', error.message, { absolute: true, position: 'top' });
      if (onError) {
        onError(error.message);
      }
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setIsDropdownOpen(false);
    showAlert('info', 'Wallet disconnected', { absolute: true, position: 'top' });
    if (onDisconnect) {
      onDisconnect();
    }
  };

  const copyAddress = async () => {
    if (wallet.account) {
      try {
        await navigator.clipboard.writeText(wallet.account);
        setCopied(true);
        showAlert('success', 'Address copied to clipboard', { absolute: true, position: 'top' });
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        showAlert('error', 'Failed to copy address', { absolute: true, position: 'top' });
      }
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!wallet.isConnected) {
    return (
      <Container {...containerProps}>
        <div className="flex flex-col gap-4">
          <button
            onClick={handleConnect}
            disabled={wallet.isLoading}
            className="connectButton"
          >
            <Wallet className="w-5 h-5" />
            {wallet.isLoading ? 'Connecting...' : 'Connect Wallet'}
          </button>
          
          <Alert {...alertProps} />
        </div>
      </Container>
    );
  }

  if (!showDropdown) {
    return (
      <Container {...containerProps}>
        <div className="flex flex-col gap-4">
          <div className="connectButton actionButton">
            <Wallet className="w-5 h-5" />
            {formatAddress(wallet.account)}
          </div>
          
          <Alert {...alertProps} />
        </div>
      </Container>
    );
  }

  return (
    <Container {...containerProps}>
      <div className="flex flex-col gap-4">
        <div className="wallet-dropdown" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="connectButton actionButton justify-between"
          >
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              {formatAddress(wallet.account)}
            </div>
          </button>

          {isDropdownOpen && (
            <div className="wallet-dropdown-content">
              <div className="wallet-dropdown-item" onClick={copyAddress}>
                {copied ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? 'Copied!' : 'Copy Address'}
              </div>
              
              <div className="wallet-dropdown-item" onClick={handleDisconnect}>
                <LogOut className="w-4 h-4" />
                Disconnect
              </div>
            </div>
          )}
        </div>
        
        <Alert {...alertProps} />
      </div>
    </Container>
  );
}
