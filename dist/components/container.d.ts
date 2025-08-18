import { ReactNode, CSSProperties } from 'react';
export interface ContainerProps {
    children: ReactNode;
    width?: string | number;
    height?: string | number;
    scale?: number;
    theme?: 'light' | 'dark';
    className?: string;
    style?: CSSProperties;
}
export declare function Container({ children, width, height, scale, theme, className, style }: ContainerProps): import("react/jsx-runtime").JSX.Element;
