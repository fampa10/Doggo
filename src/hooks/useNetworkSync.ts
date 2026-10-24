import { useEffect, useRef } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useDogStore } from '../store/dogStore';

/**
 * Listens for network transitions.
 * When going from offline -> online, triggers background synchronization.
 */
export function useNetworkSync(): void {
  const setOfflineStatus = useDogStore((state) => state.setOfflineStatus);
  const syncAllData = useDogStore((state) => state.syncAllData);
  const wasOffline = useRef(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const isConnected = state.isConnected ?? true;
      const isInternetReachable = state.isInternetReachable ?? true;
      const isOfflineNow = !isConnected || !isInternetReachable;

      setOfflineStatus(isOfflineNow);

      if (wasOffline.current && !isOfflineNow) {
        console.log('Network restored: triggering background synchronization');
        syncAllData();
      }

      wasOffline.current = isOfflineNow;
    });

    return () => {
      unsubscribe();
    };
  }, [setOfflineStatus, syncAllData]);
}
