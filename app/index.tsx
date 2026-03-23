import React from 'react';
import { View, Text, Image } from 'react-native';
import { Link } from 'expo-router';
import { Button } from '@/components/ui';

/**
 * Pantalla de bienvenida
 * Punto de entrada de la app con opciones para crear o unirse a sala
 */
export default function WelcomeScreen() {
  return (
    <View className="flex-1 bg-black">
      {/* Hero Section */}
      <View className="flex-1 justify-center items-center px-6">
        {/* Logo/Icon */}
        <View className="mb-8">
          <Text className="text-6xl mb-4 text-center">🍿</Text>
          <Text className="text-4xl font-bold text-white text-center mb-2">
            Let's Watch
          </Text>
          <Text className="text-lg text-gray-400 text-center">
            Voten juntos, vean mejor
          </Text>
        </View>

        {/* Descripción */}
        <Text className="text-center text-gray-300 mb-12 px-4">
          Crea una sala, invita a tus amigos y voten qué película ver esta noche
        </Text>

        {/* Botones principales */}
        <View className="w-full gap-4 px-4 max-w-md">
          <Link href={"/create" as any} asChild>
            <Button size="lg" className="w-full">
              Crear Sala
            </Button>
          </Link>

          <Link href={"/join" as any} asChild>
            <Button size="lg" variant="outline" className="w-full">
              Unirse con Código
            </Button>
          </Link>
        </View>
      </View>

      {/* Features */}
      <View className="px-6 pb-12">
        <View className="flex-row justify-around">
          <View className="items-center flex-1">
            <Text className="text-2xl mb-2">🎬</Text>
            <Text className="text-xs text-gray-400 text-center">
              Miles de películas
            </Text>
          </View>
          
          <View className="items-center flex-1">
            <Text className="text-2xl mb-2">⚡</Text>
            <Text className="text-xs text-gray-400 text-center">
              Tiempo real
            </Text>
          </View>
          
          <View className="items-center flex-1">
            <Text className="text-2xl mb-2">👥</Text>
            <Text className="text-xs text-gray-400 text-center">
              Voten juntos
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
