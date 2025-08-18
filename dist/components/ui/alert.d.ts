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
export declare function Alert({ type, message, isVisible, onClose, autoClose, autoCloseDuration, absolute, position }: AlertProps): import("react/jsx-runtime").JSX.Element | null;
interface UseAlertReturn {
    showAlert: (type: AlertType, message: string, options?: {
        absolute?: boolean;
        position?: 'top' | 'bottom';
    }) => void;
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
export declare function useAlert(): UseAlertReturn;
export {};
