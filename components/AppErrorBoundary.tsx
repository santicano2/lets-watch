import { AlertTriangle } from "lucide-react-native";
import React, { Component, type ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Unhandled app error:", error);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 bg-black items-center justify-center px-6">
          <AlertTriangle size={48} color="#f87171" strokeWidth={2} />
          <Text className="text-white text-xl font-bold mt-4 mb-2 text-center">
            Algo salio mal
          </Text>
          <Text className="text-gray-400 text-center mb-6">
            Ocurrio un error inesperado. Puedes intentar de nuevo.
          </Text>
          <TouchableOpacity
            onPress={this.handleReset}
            className="bg-green-500 rounded-xl px-6 py-3"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
