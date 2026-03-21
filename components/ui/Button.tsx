import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type TouchableOpacityProps,
} from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

/**
 * Componente Button reutilizable con variantes y tamaños
 */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  // Estilos base
  const baseStyles = 'rounded-xl items-center justify-center flex-row';

  // Variantes de color
  const variantStyles = {
    primary: 'bg-green-500 active:bg-green-600',
    secondary: 'bg-blue-500 active:bg-blue-600',
    outline: 'bg-transparent border-2 border-green-500 active:bg-green-500/10',
    ghost: 'bg-transparent active:bg-gray-100 dark:active:bg-gray-800',
  };

  // Tamaños
  const sizeStyles = {
    sm: 'px-3 py-2 min-h-[36px]',
    md: 'px-4 py-3 min-h-[44px]',
    lg: 'px-6 py-4 min-h-[52px]',
  };

  // Estilos de texto
  const textVariantStyles = {
    primary: 'text-white font-semibold',
    secondary: 'text-white font-semibold',
    outline: 'text-green-500 font-semibold',
    ghost: 'text-gray-900 dark:text-white font-medium',
  };

  const textSizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  // Estilo cuando está deshabilitado
  const disabledStyles = isDisabled ? 'opacity-50' : '';

  const buttonClasses = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${className}`;
  const textClasses = `${textVariantStyles[variant]} ${textSizeStyles[size]}`;

  return (
    <TouchableOpacity
      className={buttonClasses}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? '#22c55e' : '#ffffff'}
        />
      ) : (
        <Text className={textClasses}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}
