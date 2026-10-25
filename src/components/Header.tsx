import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDogStore } from '../store/dogStore';
import { useAppTheme } from '../hooks/useAppTheme';
import { radius, spacing, typography } from '../constants/theme';

export const Header: React.FC = () => {
  const { colors, isDark, toggleTheme, themeMode } = useAppTheme();

  const searchQuery = useDogStore((state) => state.filters.searchQuery);
  const setSearchQuery = useDogStore((state) => state.setSearchQuery);
  const filters = useDogStore((state) => state.filters);
  const onlyFavorites = useDogStore((state) => state.filters.onlyFavorites);
  const toggleOnlyFavorites = useDogStore((state) => state.toggleOnlyFavorites);
  const setFilterModalOpen = useDogStore((state) => state.setFilterModalOpen);
  const viewMode = useDogStore((state) => state.viewMode);
  const setViewMode = useDogStore((state) => state.setViewMode);

  // Local state for debounced search
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        setSearchQuery(localSearch);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [localSearch, searchQuery, setSearchQuery]);

  // Count active filters (excluding search query and favorites toggle)
  const activeFiltersCount =
    filters.selectedGroupIds.length +
    filters.selectedSizes.length +
    filters.selectedCoatLengths.length +
    (filters.hypoallergenicOnly !== null ? 1 : 0) +
    Object.values(filters.traitThresholds).filter((v) => v !== undefined && v > 0).length;

  const getThemeIcon = () => {
    if (themeMode === 'light') return 'sunny';
    if (themeMode === 'dark') return 'moon';
    return 'contrast-outline';
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.borderSubtle,
        },
      ]}
    >
      {/* Top row: Brand & Actions */}
      <View style={styles.topRow}>
        <View style={styles.brandGroup}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logoImage}
            accessibilityLabel="Dog Breed Explorer App Logo"
          />
          <View>
            <Text style={[styles.appTitle, { color: colors.textPrimary }]}>
              Dog Breed Explorer
            </Text>
            <Text style={[styles.appSubtitle, { color: colors.textMuted }]}>
              Tripare AI Assessment
            </Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          {/* View mode toggle (Grouped vs Flat) */}
          <TouchableOpacity
            style={[
              styles.iconBtn,
              { backgroundColor: colors.surfaceSubtle },
            ]}
            onPress={() => setViewMode(viewMode === 'grouped' ? 'flat' : 'grouped')}
            accessibilityRole="button"
            accessibilityLabel={`Switch to ${viewMode === 'grouped' ? 'flat' : 'grouped'} list`}
          >
            <Ionicons
              name={viewMode === 'grouped' ? 'albums-outline' : 'list-outline'}
              size={18}
              color={colors.textPrimary}
            />
          </TouchableOpacity>

          {/* Favorites toggle */}
          <TouchableOpacity
            style={[
              styles.iconBtn,
              {
                backgroundColor: onlyFavorites
                  ? colors.errorBg
                  : colors.surfaceSubtle,
              },
            ]}
            onPress={toggleOnlyFavorites}
            accessibilityRole="button"
            accessibilityLabel="Filter favorite breeds"
          >
            <Ionicons
              name={onlyFavorites ? 'heart' : 'heart-outline'}
              size={18}
              color={onlyFavorites ? colors.error : colors.textPrimary}
            />
          </TouchableOpacity>

          {/* Theme mode toggle */}
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: colors.surfaceSubtle }]}
            onPress={toggleTheme}
            accessibilityRole="button"
            accessibilityLabel={`Toggle theme mode. Current: ${themeMode}`}
          >
            <Ionicons name={getThemeIcon()} size={18} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search and Filter Row */}
      <View style={styles.searchRow}>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.surfaceSubtle,
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search 283 breeds or aliases..."
            placeholderTextColor={colors.textMuted}
            value={localSearch}
            onChangeText={setLocalSearch}
            clearButtonMode="while-editing"
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Search breeds by name or alternative names"
          />
          {localSearch.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setLocalSearch('');
                setSearchQuery('');
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Button with Active Badge */}
        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor:
                activeFiltersCount > 0 ? colors.primary : colors.surfaceSubtle,
              borderColor: activeFiltersCount > 0 ? colors.primary : colors.border,
            },
          ]}
          onPress={() => setFilterModalOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={`Open filters. ${activeFiltersCount} filters active.`}
        >
          <Ionicons
            name="options-outline"
            size={18}
            color={activeFiltersCount > 0 ? '#FFF' : colors.textPrimary}
          />
          {activeFiltersCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoImage: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
  },
  appTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
  },
  appSubtitle: {
    fontSize: typography.fontSizes.xs - 1,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchBar: {
    flex: 1,
    height: 42,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: typography.fontSizes.sm,
  },
  filterButton: {
    height: 42,
    width: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
