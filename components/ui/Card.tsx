import React from 'react';
import { View, type ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated';
}

/**
 * Componente Card - contenedor con bordes y sombra
 */
export function Card({
  children,
  variant = 'default',
  className = '',
  ...props
}: CardProps) {
  const baseStyles = 'bg-white dark:bg-gray-800 rounded-2xl p-4';
  
  const variantStyles = {
    default: 'border border-gray-200 dark:border-gray-700',
    elevated: 'shadow-lg shadow-black/10',
  };

  const cardClasses = `${baseStyles} ${variantStyles[variant]} ${className}`;

  return (
    <View className={cardClasses} {...props}>
      {children}
    </View>
  );
}
