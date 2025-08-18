import React from 'react';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  type: AlertType;
  message: string;
  isVisible: boolean;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDuration?: number;
  absolute?: boolean;
  position?: 'top' | 'bottom';
}

export function Alert({ 
  type, 
  message, 
  isVisible, 
  onClose, 
  autoClose = true, 
  autoCloseDuration = 5000,
  absolute = false,
  position = 'top'
}: AlertProps) {
  React.useEffect(() => {
    if (autoClose && isVisible && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDuration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, autoCloseDuration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
    }
  };

  const getClassNames = () => {
    const baseClasses = absolute 
      ? `hyperkit-alert hyperkit-alert-absolute hyperkit-alert-${position}` 
      : "hyperkit-alert";
    
    switch (type) {
      case 'success':
        return `${baseClasses} hyperkit-alert-success`;
      case 'error':
        return `${baseClasses} hyperkit-alert-error`;
      case 'warning':
        return `${baseClasses} hyperkit-alert-warning`;
      case 'info':
        return `${baseClasses} hyperkit-alert-info`;
      default:
        return baseClasses;
    }
  };

  return (
    <div className={getClassNames()}>
      <div className="hyperkit-alert-content">
        <div className="hyperkit-alert-icon">
          {getIcon()}
        </div>
        <div className="hyperkit-alert-message">
          {message}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="hyperkit-alert-close"
            aria-label="Close alert"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

interface UseAlertReturn {
  showAlert: (type: AlertType, message: string, options?: { absolute?: boolean; position?: 'top' | 'bottom' }) => void;
  hideAlert: () => void;
  alertProps: {
    type: AlertType;
    message: string;
    isVisible: boolean;
    absolute: boolean;
    position: 'top' | 'bottom';
    onClose: () => void;
  };
}

export function useAlert(): UseAlertReturn {
  const [alert, setAlert] = React.useState({
    type: 'info' as AlertType,
    message: '',
    isVisible: false,
    absolute: false,
    position: 'top' as 'top' | 'bottom'
  });

  const showAlert = (type: AlertType, message: string, options?: { absolute?: boolean; position?: 'top' | 'bottom' }) => {
    setAlert({ 
      type, 
      message, 
      isVisible: true,
      absolute: options?.absolute ?? false,
      position: options?.position ?? 'top'
    });
  };

  const hideAlert = () => {
    setAlert(prev => ({ ...prev, isVisible: false }));
  };

  return {
    showAlert,
    hideAlert,
    alertProps: {
      ...alert,
      onClose: hideAlert
    }
  };
}
