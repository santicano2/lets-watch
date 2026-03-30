import React from "react";
import { View } from "react-native";

export function MovieVoteCardSkeleton() {
  return (
    <View className="bg-gray-900 overflow-hidden" style={{ aspectRatio: 0.66 }}>
      <View className="flex-1 bg-gray-800" />
      <View className="px-3 py-2 h-14 justify-center gap-1 bg-gray-900">
        <View className="h-3 w-3/4 bg-gray-700 rounded" />
        <View className="h-2 w-1/3 bg-gray-800 rounded" />
      </View>
      <View className="h-12 border-t border-gray-800 flex-row">
        <View className="flex-1 bg-gray-900" />
        <View className="w-px bg-gray-800" />
        <View className="w-12 bg-gray-900/60" />
        <View className="w-px bg-gray-800" />
        <View className="flex-1 bg-gray-900" />
      </View>
    </View>
  );
}
