import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDogStore } from '../store/dogStore';
import { useAppTheme } from '../hooks/useAppTheme';
import { CoatLength, SizeBand, TraitFilterThresholds } from '../types/dog';
import { radius, spacing, typography } from '../constants/theme';

const SIZE_OPTIONS: { id: SizeBand; label: string; desc: string }[] = [
  { id: 'small', label: 'Small', desc: '< 10 kg' },
  { id: 'medium', label: 'Medium', desc: '10 - 25 kg' },
  { id: 'large', label: 'Large', desc: '25 - 45 kg' },
  { id: 'giant', label: 'Giant', desc: '> 45 kg' },
];

const COAT_OPTIONS: { id: CoatLength; label: string }[] = [
  { id: 'short', label: 'Short' },
  { id: 'medium', label: 'Medium' },
  { id: 'long', label: 'Long' },
  { id: 'wire', label: 'Wire' },
];

const TRAIT_FILTER_KEYS: {
  key: keyof TraitFilterThresholds;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: 'good_with_children', label: 'Good with Children', icon: 'people-outline' },
  { key: 'good_with_dogs', label: 'Good with Dogs', icon: 'paw-outline' },
  { key: 'good_with_strangers', label: 'Good with Strangers', icon: 'walk-outline' },
  { key: 'apartment_friendly', label: 'Apartment Friendly', icon: 'home-outline' },
  { key: 'trainability', label: 'High Trainability', icon: 'school-outline' },
  { key: 'energy', label: 'High Energy', icon: 'flash-outline' },
];

export const FilterModal: React.FC = () => {
  const { colors, isDark } = useAppTheme();

  const isFilterModalOpen = useDogStore((state) => state.isFilterModalOpen);
  const setFilterModalOpen = useDogStore((state) => state.setFilterModalOpen);

  const groupsById = useDogStore((state) => state.groupsById);
  const filters = useDogStore((state) => state.filters);

  const toggleGroupFilter = useDogStore((state) => state.toggleGroupFilter);
  const toggleSizeFilter = useDogStore((state) => state.toggleSizeFilter);
  const toggleCoatFilter = useDogStore((state) => state.toggleCoatFilter);
  const setHypoallergenicFilter = useDogStore((state) => state.setHypoallergenicFilter);
  const setTraitThreshold = useDogStore((state) => state.setTraitThreshold);
  const resetFilters = useDogStore((state) => state.resetFilters);

  const groupsList = Object.values(groupsById).sort((a, b) =>
    a.attributes.name.localeCompare(b.attributes.name)
  );

  return (
    <Modal
      visible={isFilterModalOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setFilterModalOpen(false)}
    >
      <SafeAreaView
        style={[styles.modalContainer, { backgroundColor: colors.background }]}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.borderSubtle,
            },
          ]}
        >
          <TouchableOpacity
            onPress={resetFilters}
            style={styles.headerButton}
            accessibilityRole="button"
            accessibilityLabel="Reset all filters"
          >
            <Text style={[styles.resetText, { color: colors.error }]}>Reset All</Text>
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Filter Breeds
          </Text>

          <TouchableOpacity
            onPress={() => setFilterModalOpen(false)}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Done and apply filters"
          >
            <Text style={[styles.doneText, { color: colors.primary }]}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Breed Groups (Multi-select) */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Breed Groups ({groupsList.length})
            </Text>
            <View style={styles.chipsWrap}>
              {groupsList.map((group) => {
                const isSelected = filters.selectedGroupIds.includes(group.id);
                return (
                  <TouchableOpacity
                    key={group.id}
                    onPress={() => toggleGroupFilter(group.id)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected
                          ? colors.primary
                          : colors.surface,
                        borderColor: isSelected
                          ? colors.primary
                          : colors.border,
                      },
                    ]}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                    accessibilityLabel={`${group.attributes.name} breed group`}
                  >
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={14}
                        color="#FFF"
                        style={styles.chipCheck}
                      />
                    )}
                    <Text
                      style={[
                        styles.chipText,
                        { color: isSelected ? '#FFF' : colors.textPrimary },
                      ]}
                    >
                      {group.attributes.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 2. Size Band (Derived Buckets) */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Size Band
            </Text>
            <View style={styles.chipsWrap}>
              {SIZE_OPTIONS.map((opt) => {
                const isSelected = filters.selectedSizes.includes(opt.id);
                return (
                  <TouchableOpacity
                    key={opt.id}
                    onPress={() => toggleSizeFilter(opt.id)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected
                          ? colors.primary
                          : colors.surface,
                        borderColor: isSelected
                          ? colors.primary
                          : colors.border,
                      },
                    ]}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                    accessibilityLabel={`${opt.label} size (${opt.desc})`}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: isSelected ? '#FFF' : colors.textPrimary },
                      ]}
                    >
                      {opt.label} ({opt.desc})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 3. Coat Length */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Coat Length
            </Text>
            <View style={styles.chipsWrap}>
              {COAT_OPTIONS.map((opt) => {
                const isSelected = filters.selectedCoatLengths.includes(opt.id);
                return (
                  <TouchableOpacity
                    key={opt.id}
                    onPress={() => toggleCoatFilter(opt.id)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected
                          ? colors.primary
                          : colors.surface,
                        borderColor: isSelected
                          ? colors.primary
                          : colors.border,
                      },
                    ]}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: isSelected ? '#FFF' : colors.textPrimary },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 4. Hypoallergenic */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Hypoallergenic
            </Text>
            <View style={styles.segmentedRow}>
              {[
                { label: 'All Breeds', value: null },
                { label: 'Hypoallergenic Only', value: true },
                { label: 'Non-Hypoallergenic', value: false },
              ].map((item, idx) => {
                const isSelected = filters.hypoallergenicOnly === item.value;
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setHypoallergenicFilter(item.value)}
                    style={[
                      styles.segmentBtn,
                      {
                        backgroundColor: isSelected
                          ? colors.primary
                          : colors.surface,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        { color: isSelected ? '#FFF' : colors.textPrimary },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 5. Trait Thresholds (Above a chosen score) */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Trait Thresholds (Minimum Score ≥)
            </Text>
            <Text style={[styles.sectionDesc, { color: colors.textMuted }]}>
              Only show breeds scoring at or above the selected level (1-5)
            </Text>

            {TRAIT_FILTER_KEYS.map((item) => {
              const currentScore = filters.traitThresholds[item.key] ?? 0;
              return (
                <View
                  key={item.key}
                  style={[
                    styles.traitRow,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.borderSubtle,
                    },
                  ]}
                >
                  <View style={styles.traitLabelWrap}>
                    <Ionicons name={item.icon} size={18} color={colors.primary} />
                    <Text
                      style={[styles.traitLabel, { color: colors.textPrimary }]}
                    >
                      {item.label}
                    </Text>
                  </View>

                  {/* Level selector buttons: Any (0), 3+, 4+, 5 */}
                  <View style={styles.stepperGroup}>
                    {[0, 3, 4, 5].map((lvl) => {
                      const isActive = currentScore === lvl;
                      const label = lvl === 0 ? 'Any' : `${lvl}+`;
                      return (
                        <TouchableOpacity
                          key={lvl}
                          onPress={() =>
                            setTraitThreshold(item.key, lvl === 0 ? undefined : lvl)
                          }
                          style={[
                            styles.stepBtn,
                            {
                              backgroundColor: isActive
                                ? colors.primary
                                : colors.surfaceSubtle,
                              borderColor: isActive
                                ? colors.primary
                                : colors.border,
                            },
                          ]}
                          accessibilityRole="button"
                          accessibilityLabel={`${item.label} threshold ${label}`}
                        >
                          <Text
                            style={[
                              styles.stepText,
                              { color: isActive ? '#FFF' : colors.textSecondary },
                            ]}
                          >
                            {label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Footer Apply CTA */}
        <View
          style={[
            styles.footer,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.borderSubtle,
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.applyBtn, { backgroundColor: colors.primary }]}
            onPress={() => setFilterModalOpen(false)}
            accessibilityRole="button"
            accessibilityLabel="Apply filters"
          >
            <Text style={styles.applyBtnText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
  },
  headerButton: {
    paddingVertical: spacing.xs,
  },
  resetText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
  },
  closeButton: {
    paddingVertical: spacing.xs,
  },
  doneText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.sm + 1,
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.sm,
  },
  sectionDesc: {
    fontSize: typography.fontSizes.xs,
    marginBottom: spacing.sm,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - 1,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  chipCheck: {
    marginRight: 4,
  },
  chipText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
  },
  segmentedRow: {
    flexDirection: 'column',
    gap: spacing.xs,
  },
  segmentBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  segmentText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
  },
  traitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.xs,
  },
  traitLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  traitLabel: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
  },
  stepperGroup: {
    flexDirection: 'row',
    gap: 4,
  },
  stepBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    minWidth: 34,
    alignItems: 'center',
  },
  stepText: {
    fontSize: 11,
    fontWeight: '600',
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
  },
  applyBtn: {
    height: 48,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#FFF',
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
  },
});
