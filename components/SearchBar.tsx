import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  debounceMs?: number;
}

/**
 * Barra de búsqueda con debounce
 * Espera que el usuario deje de escribir antes de ejecutar la búsqueda
 */
export function SearchBar({
  placeholder = 'Buscar películas...',
  onSearch,
  debounceMs = 500,
}: SearchBarProps) {
  const [query, setQuery] = useState('');

  // Debounce: ejecutar búsqueda después de que el usuario deje de escribir
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs, onSearch]);

  const handleClear = () => {
    setQuery('');
  };

  return (
    <View className="flex-row items-center gap-2 bg-white dark:bg-gray-800 rounded-xl px-4 py-3 border-2 border-gray-300 dark:border-gray-600">
      {/* Icono de búsqueda */}
      <Text className="text-xl text-gray-400">🔍</Text>

      {/* Input */}
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        className="flex-1 text-base text-gray-900 dark:text-white"
        autoCapitalize="none"
        autoCorrect={false}
      />

      {/* Botón clear */}
      {query.length > 0 && (
        <TouchableOpacity
          onPress={handleClear}
          className="w-6 h-6 items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full"
          activeOpacity={0.7}
        >
          <Text className="text-gray-600 dark:text-gray-300 text-xs">✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
