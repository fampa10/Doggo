import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDogStore } from '../store/dogStore';
import { useAppTheme } from '../hooks/useAppTheme';
import { Header } from '../components/Header';
import { SyncBanner } from '../components/SyncBanner';
import { BreedCard } from '../components/BreedCard';
import { FilterModal } from '../components/FilterModal';
import {
  groupBreedsByGroup,
  matchesFilters,
} from '../utils/filterUtils';
import { Breed } from '../types/dog';
import { radius, spacing, typography } from '../constants/theme';

export const BreedListScreen: React.FC = () => {
  const { colors, isDark } = useAppTheme();

  const breedsById = useDogStore((state) => state.breedsById);
  const breedIds = useDogStore((state) => state.breedIds);
  const groupsById = useDogStore((state) => state.groupsById);
  const filters = useDogStore((state) => state.filters);
  const favoriteIds = useDogStore((state) => state.favoriteIds);
  const isSyncing = useDogStore((state) => state.isSyncing);
  const isHydrated = useDogStore((state) => state.isHydrated);
  const viewMode = useDogStore((state) => state.viewMode);

  const syncAllData = useDogStore((state) => state.syncAllData);
  const setSelectedBreedId = useDogStore((state) => state.setSelectedBreedId);
  const toggleFavorite = useDogStore((state) => state.toggleFavorite);
  const resetFilters = useDogStore((state) => state.resetFilters);

  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  // Filter all breeds
  const filteredBreeds = useMemo(() => {
    const list: Breed[] = [];
    for (const id of breedIds) {
      const breed = breedsById[id];
      if (breed && matchesFilters(breed, filters, favoriteSet)) {
        list.push(breed);
      }
    }
    return list;
  }, [breedIds, breedsById, filters, favoriteSet]);

  // Grouped sections for SectionList
  const sections = useMemo(() => {
    return groupBreedsByGroup(filteredBreeds, groupsById);
  }, [filteredBreeds, groupsById]);

  const handleRefresh = useCallback(() => {
    syncAllData(true);
  }, [syncAllData]);

  const renderBreedItem = useCallback(
    ({ item }: { item: Breed }) => {
      const groupId = item.relationships?.group?.data?.id;
      const group = groupId ? groupsById[groupId] : undefined;
      const isFav = favoriteSet.has(item.id);

      return (
        <BreedCard
          breed={item}
          group={group}
          isFavorite={isFav}
          onPress={() => setSelectedBreedId(item.id)}
          onToggleFavorite={() => toggleFavorite(item.id)}
        />
      );
    },
    [groupsById, favoriteSet, setSelectedBreedId, toggleFavorite]
  );

  const renderSectionHeader = useCallback(
    ({ section: { title, data } }: { section: { title: string; data: Breed[] } }) => (
      <View
        style={[
          styles.sectionHeader,
          {
            backgroundColor: isDark ? colors.surfaceElevated : '#F1F5F9',
            borderBottomColor: colors.borderSubtle,
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          {title}
        </Text>
        <View
          style={[
            styles.countPill,
            { backgroundColor: isDark ? colors.surface : '#E2E8F0' },
          ]}
        >
          <Text style={[styles.countText, { color: colors.textSecondary }]}>
            {data.length}
          </Text>
        </View>
      </View>
    ),
    [colors, isDark]
  );

  const keyExtractor = useCallback((item: Breed) => item.id, []);

  // Empty State
  const renderEmptyComponent = () => {
    if (!isHydrated) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading cached breeds...
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.centerContainer}>
        <View
          style={[
            styles.emptyIconWrap,
            { backgroundColor: colors.surfaceSubtle },
          ]}
        >
          <Ionicons name="search-outline" size={48} color={colors.textMuted} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
          No matching breeds found
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
          Try adjusting your search criteria, size, or trait filters.
        </Text>
        <TouchableOpacity
          style={[styles.resetButton, { backgroundColor: colors.primary }]}
          onPress={resetFilters}
          accessibilityRole="button"
          accessibilityLabel="Clear all active filters"
        >
          <Text style={styles.resetButtonText}>Clear All Filters</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <Header />

      {/* Sync / Freshness / Offline Banner */}
      <SyncBanner />

      {/* Results Count Bar */}
      <View style={styles.resultsCountBar}>
        <Text style={[styles.resultsCountText, { color: colors.textMuted }]}>
          Showing {filteredBreeds.length} of {breedIds.length} breeds
        </Text>
      </View>

      {/* Virtualized List Optimized for 60fps */}
      {viewMode === 'grouped' ? (
        <SectionList
          sections={sections}
          keyExtractor={keyExtractor}
          renderItem={renderBreedItem}
          renderSectionHeader={renderSectionHeader}
          stickySectionHeadersEnabled={true}
          refreshControl={
            <RefreshControl
              refreshing={isSyncing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={renderEmptyComponent}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={7}
          removeClippedSubviews={true}
          contentContainerStyle={
            filteredBreeds.length === 0 ? styles.emptyScroll : styles.listContent
          }
        />
      ) : (
        <FlatList
          data={filteredBreeds}
          keyExtractor={keyExtractor}
          renderItem={renderBreedItem}
          refreshControl={
            <RefreshControl
              refreshing={isSyncing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={renderEmptyComponent}
          initialNumToRender={12}
          maxToRenderPerBatch={12}
          windowSize={7}
          removeClippedSubviews={true}
          contentContainerStyle={
            filteredBreeds.length === 0 ? styles.emptyScroll : styles.listContent
          }
        />
      )}

      {/* Filter Modal */}
      <FilterModal />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  resultsCountBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 2,
    marginBottom: spacing.xs,
  },
  resultsCountText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
  },
  listContent: {
    paddingBottom: 40,
  },
  emptyScroll: {
    flexGrow: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: 0.3,
  },
  countPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
    marginTop: 60,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSizes.sm,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: typography.fontSizes.sm,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  resetButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  resetButtonText: {
    color: '#FFF',
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
  },
});
