import React from 'react';
import {
  View,
  TextInput,
  Text,
  type TextInputProps,
} from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
}

/**
 * Componente Input con label, error y helper text
 */
export function Input({
  label,
  error,
  helperText,
  className = '',
  ...props
}: InputProps) {
  const hasError = !!error;

  const inputBaseStyles = 'bg-white dark:bg-gray-800 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white border-2';
  const inputBorderStyles = hasError
    ? 'border-red-500'
    : 'border-gray-300 dark:border-gray-600 focus:border-green-500';

  const inputClasses = `${inputBaseStyles} ${inputBorderStyles} ${className}`;

  return (
    <View className="gap-2">
      {label && (
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </Text>
      )}
      
      <TextInput
        className={inputClasses}
        placeholderTextColor="#9ca3af"
        {...props}
      />

      {error && (
        <Text className="text-sm text-red-500">
          {error}
        </Text>
      )}

      {helperText && !error && (
        <Text className="text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </Text>
      )}
    </View>
  );
}
