import React, { ReactNode, CSSProperties } from 'react';

export interface ContainerProps {
  children: ReactNode;
  width?: string | number;
  height?: string | number;
  scale?: number;
  theme?: 'light' | 'dark';
  className?: string;
  style?: CSSProperties;
}

export function Container({ 
  children, 
  width = '100%', 
  height = 'auto', 
  scale = 1, 
  theme = 'light',
  className = '',
  style = {}
}: ContainerProps) {
  const containerStyle: CSSProperties = {
    width: 'auto',
    height: 'auto',
    transform: `scale(${scale})`,
    transformOrigin: 'center',
    ...style,
    // Apply scale and dimensions as CSS custom properties
    '--hyperkit-scale': scale.toString(),
    '--hyperkit-container-width': typeof width === 'number' ? `${width}px` : width,
    '--hyperkit-container-height': typeof height === 'number' ? `${height}px` : height,
  } as any;

  const themeClass = theme === 'dark' ? 'hyperkit-dark' : 'hyperkit-light';

  return (
    <div 
      className={`hyperkit-container ${themeClass} ${className}`}
      style={containerStyle}
      data-theme={theme}
    >
      {children}
    </div>
  );
}
