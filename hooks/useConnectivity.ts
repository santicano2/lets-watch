import * as Network from "expo-network";
import { useEffect, useState } from "react";

export function useConnectivity() {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkConnection = async () => {
      try {
        const state = await Network.getNetworkStateAsync();
        if (!mounted) return;
        setIsConnected(
          Boolean(state.isConnected && state.isInternetReachable !== false),
        );
      } catch {
        if (!mounted) return;
        setIsConnected(true);
      } finally {
        if (mounted) setChecking(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 7000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return { isConnected, checking };
}
