import { Link } from "expo-router";
import { Film, Popcorn, Users, Zap } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

import { Button } from "@/components/ui";

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
        <View className="mb-8 items-center">
          <View className="mb-4">
            <Popcorn size={72} color="#22c55e" strokeWidth={1.5} />
          </View>
          <Text className="text-4xl font-bold text-white text-center mb-2">
            Let&apos;s Watch
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
            <View className="mb-2">
              <Film size={32} color="#9ca3af" strokeWidth={1.5} />
            </View>
            <Text className="text-xs text-gray-400 text-center">
              Miles de películas
            </Text>
          </View>

          <View className="items-center flex-1">
            <View className="mb-2">
              <Zap size={32} color="#9ca3af" strokeWidth={1.5} />
            </View>
            <Text className="text-xs text-gray-400 text-center">
              Tiempo real
            </Text>
          </View>

          <View className="items-center flex-1">
            <View className="mb-2">
              <Users size={32} color="#9ca3af" strokeWidth={1.5} />
            </View>
            <Text className="text-xs text-gray-400 text-center">
              Voten juntos
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
