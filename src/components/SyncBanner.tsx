import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDogStore } from '../store/dogStore';
import { useAppTheme } from '../hooks/useAppTheme';
import { formatTimeAgo } from '../utils/dateUtils';
import { radius, spacing, typography } from '../constants/theme';

export const SyncBanner: React.FC = () => {
  const { colors, isDark } = useAppTheme();

  const isSyncing = useDogStore((state) => state.isSyncing);
  const isOffline = useDogStore((state) => state.isOffline);
  const syncError = useDogStore((state) => state.syncError);
  const isPartialSync = useDogStore((state) => state.isPartialSync);
  const lastSyncedAt = useDogStore((state) => state.lastSyncedAt);
  const syncProgress = useDogStore((state) => state.syncProgress);
  const syncAllData = useDogStore((state) => state.syncAllData);

  // If syncing actively
  if (isSyncing) {
    const progressText = syncProgress
      ? `Syncing page ${syncProgress.page}/6 (${syncProgress.current} breeds loaded)...`
      : 'Synchronizing breeds with Dog API...';

    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.primaryLight,
            borderColor: isDark ? colors.border : '#BFDBFE',
          },
        ]}
        accessibilityLiveRegion="polite"
      >
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.message, { color: colors.primary }]}>{progressText}</Text>
      </View>
    );
  }

  // If an error or partial failure occurred
  if (syncError) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.errorBg,
            borderColor: isDark ? colors.border : '#FECACA',
          },
        ]}
        accessibilityRole="alert"
      >
        <Ionicons name="warning-outline" size={18} color={colors.error} />
        <View style={styles.textColumn}>
          <Text style={[styles.errorTitle, { color: colors.error }]}>
            {isPartialSync ? 'Partial Data Loaded' : 'Sync Issue'}
          </Text>
          <Text style={[styles.errorSubtitle, { color: colors.textSecondary }]}>
            Showing cached data ({formatTimeAgo(lastSyncedAt)}). Tap retry to refresh.
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.error }]}
          onPress={() => syncAllData(true)}
          accessibilityRole="button"
          accessibilityLabel="Retry data synchronization"
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // If currently offline
  if (isOffline) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.warningBg,
            borderColor: isDark ? colors.border : '#FDE68A',
          },
        ]}
        accessibilityRole="alert"
      >
        <Ionicons name="cloud-offline-outline" size={18} color={colors.warning} />
        <View style={styles.textColumn}>
          <Text style={[styles.errorTitle, { color: colors.warning }]}>
            Offline Mode
          </Text>
          <Text style={[styles.errorSubtitle, { color: colors.textSecondary }]}>
            Showing cached breeds ({formatTimeAgo(lastSyncedAt)}).
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.warning }]}
          onPress={() => syncAllData(true)}
          accessibilityRole="button"
          accessibilityLabel="Try reconnecting"
        >
          <Text style={[styles.retryButtonText, { color: '#000' }]}>Reconnect</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Normal freshness status
  return (
    <View
      style={[
        styles.compactContainer,
        {
          backgroundColor: colors.surfaceSubtle,
          borderColor: colors.borderSubtle,
        },
      ]}
      accessible={true}
      accessibilityLabel={`Data freshness: Last synced ${formatTimeAgo(lastSyncedAt)}`}
    >
      <View style={styles.freshnessRow}>
        <View style={[styles.onlineDot, { backgroundColor: colors.success }]} />
        <Text style={[styles.freshnessText, { color: colors.textSecondary }]}>
          Last synced: {formatTimeAgo(lastSyncedAt)}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => syncAllData(true)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={styles.refreshIconBtn}
        accessibilityRole="button"
        accessibilityLabel="Sync now"
      >
        <Ionicons name="sync-outline" size={14} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.sm,
    borderWidth: 0.5,
  },
  freshnessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  freshnessText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
  },
  refreshIconBtn: {
    padding: 2,
  },
  message: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
    flex: 1,
  },
  textColumn: {
    flex: 1,
  },
  errorTitle: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
  errorSubtitle: {
    fontSize: 10,
    marginTop: 1,
  },
  retryButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.xs,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
