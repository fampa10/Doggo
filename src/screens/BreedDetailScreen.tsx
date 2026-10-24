import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useDogStore } from '../store/dogStore';
import { useAppTheme } from '../hooks/useAppTheme';
import { TraitMeter } from '../components/TraitMeter';
import { ImageGallery } from '../components/ImageGallery';
import { deriveSizeBand } from '../utils/filterUtils';
import { radius, spacing, typography } from '../constants/theme';

type DetailTab = 'overview' | 'traits' | 'gallery';

export const BreedDetailScreen: React.FC = () => {
  const { colors, isDark } = useAppTheme();
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');

  const selectedBreedId = useDogStore((state) => state.selectedBreedId);
  const setSelectedBreedId = useDogStore((state) => state.setSelectedBreedId);
  const breedsById = useDogStore((state) => state.breedsById);
  const groupsById = useDogStore((state) => state.groupsById);
  const favoriteIds = useDogStore((state) => state.favoriteIds);
  const toggleFavorite = useDogStore((state) => state.toggleFavorite);
  const isDetailRefreshing = useDogStore((state) => state.isDetailRefreshing);
  const refreshSingleBreed = useDogStore((state) => state.refreshSingleBreed);

  if (!selectedBreedId || !breedsById[selectedBreedId]) {
    return null;
  }

  const breed = breedsById[selectedBreedId];
  const { attributes } = breed;
  const groupId = breed.relationships?.group?.data?.id;
  const group = groupId ? groupsById[groupId] : undefined;
  const isFav = favoriteIds.includes(breed.id);

  const heroImage =
    attributes.images?.[0]?.medium ||
    attributes.images?.[0]?.large ||
    attributes.images?.[0]?.url;

  const sizeBand = deriveSizeBand(breed);
  const sizeBandLabel = sizeBand.charAt(0).toUpperCase() + sizeBand.slice(1);

  const handleShare = async () => {
    try {
      await Share.share({
        title: attributes.name,
        message: `Check out the ${attributes.name} on Dog Breed Explorer! Life span: ${attributes.life?.min}-${attributes.life?.max} years.`,
      });
    } catch (err: unknown) {
      console.warn('Share error:', err);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Hero Header */}
      <View style={styles.heroContainer}>
        {heroImage ? (
          <Image
            source={{ uri: heroImage }}
            style={styles.heroImage}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        ) : (
          <View
            style={[
              styles.heroPlaceholder,
              { backgroundColor: colors.surfaceSubtle },
            ]}
          >
            <Ionicons name="paw" size={64} color={colors.textMuted} />
          </View>
        )}

        <View style={styles.heroOverlay} />

        {/* Navigation Bar */}
        <View style={styles.topNav}>
          <TouchableOpacity
            style={[styles.roundNavBtn, { backgroundColor: 'rgba(0,0,0,0.45)' }]}
            onPress={() => setSelectedBreedId(null)}
            accessibilityRole="button"
            accessibilityLabel="Go back to breed list"
          >
            <Ionicons name="chevron-back" size={22} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.navActionGroup}>
            <TouchableOpacity
              style={[styles.roundNavBtn, { backgroundColor: 'rgba(0,0,0,0.45)' }]}
              onPress={() => refreshSingleBreed(breed.id)}
              disabled={isDetailRefreshing}
              accessibilityRole="button"
              accessibilityLabel="Refresh breed details from Dog API"
            >
              {isDetailRefreshing ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Ionicons name="sync-outline" size={20} color="#FFF" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roundNavBtn, { backgroundColor: 'rgba(0,0,0,0.45)' }]}
              onPress={handleShare}
              accessibilityRole="button"
              accessibilityLabel="Share breed"
            >
              <Ionicons name="share-outline" size={20} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roundNavBtn, { backgroundColor: 'rgba(0,0,0,0.45)' }]}
              onPress={() => toggleFavorite(breed.id)}
              accessibilityRole="button"
              accessibilityLabel={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Ionicons
                name={isFav ? 'heart' : 'heart-outline'}
                size={22}
                color={isFav ? colors.error : '#FFF'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Bottom Title */}
        <View style={styles.heroTitleWrap}>
          <Text style={styles.heroName}>{attributes.name}</Text>
          <View style={styles.heroBadgesRow}>
            {group && (
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>{group.attributes.name}</Text>
              </View>
            )}
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>{sizeBandLabel}</Text>
            </View>
            {attributes.hypoallergenic && (
              <View style={[styles.heroBadge, { backgroundColor: colors.success }]}>
                <Ionicons name="shield-checkmark" size={12} color="#FFF" />
                <Text style={styles.heroBadgeText}>Hypoallergenic</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Segmented Tabs: Overview | Traits | Gallery */}
      <View
        style={[
          styles.tabsRow,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.borderSubtle,
          },
        ]}
      >
        {(['overview', 'traits', 'gallery'] as DetailTab[]).map((tab) => {
          const isActive = activeTab === tab;
          const label = tab.charAt(0).toUpperCase() + tab.slice(1);
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tabButton,
                isActive && {
                  borderBottomColor: colors.primary,
                  borderBottomWidth: 3,
                },
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: isActive ? colors.primary : colors.textSecondary,
                    fontWeight: isActive ? '700' : '500',
                  },
                ]}
              >
                {label}
                {tab === 'gallery' && attributes.images
                  ? ` (${attributes.images.length})`
                  : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tab Content */}
      <ScrollView
        style={styles.tabContentArea}
        contentContainerStyle={styles.contentPadding}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= OVERVIEW TAB ================= */}
        {activeTab === 'overview' && (
          <View>
            {/* Description */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.borderSubtle,
                },
              ]}
            >
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                About the Breed
              </Text>
              <Text
                style={[styles.descriptionText, { color: colors.textSecondary }]}
              >
                {attributes.description ||
                  'No description currently recorded for this breed.'}
              </Text>
            </View>

            {/* Quick Metrics Grid */}
            <View style={styles.metricsGrid}>
              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.borderSubtle,
                  },
                ]}
              >
                <Ionicons name="time-outline" size={20} color={colors.primary} />
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
                  Life Span
                </Text>
                <Text
                  style={[styles.metricValue, { color: colors.textPrimary }]}
                >
                  {attributes.life?.min && attributes.life?.max
                    ? `${attributes.life.min} - ${attributes.life.max} yrs`
                    : attributes.life?.max
                    ? `Up to ${attributes.life.max} yrs`
                    : 'N/A'}
                </Text>
              </View>

              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.borderSubtle,
                  },
                ]}
              >
                <Ionicons name="barbell-outline" size={20} color={colors.secondary} />
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
                  Weight (Male/Fem)
                </Text>
                <Text
                  style={[styles.metricValue, { color: colors.textPrimary }]}
                >
                  {attributes.male_weight?.min && attributes.male_weight?.max
                    ? `${attributes.male_weight.min}-${attributes.male_weight.max} kg`
                    : 'Variable'}
                </Text>
              </View>

              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.borderSubtle,
                  },
                ]}
              >
                <Ionicons name="resize-outline" size={20} color={colors.accent} />
                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
                  Height Range
                </Text>
                <Text
                  style={[styles.metricValue, { color: colors.textPrimary }]}
                >
                  {attributes.male_height?.min && attributes.male_height?.max
                    ? `${attributes.male_height.min}-${attributes.male_height.max} cm`
                    : 'Variable'}
                </Text>
              </View>
            </View>

            {/* Origin & History */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.borderSubtle,
                },
              ]}
            >
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                Origin & Lineage
              </Text>
              <View style={styles.originRow}>
                <Ionicons name="globe-outline" size={18} color={colors.primary} />
                <Text style={[styles.originText, { color: colors.textPrimary }]}>
                  Country:{' '}
                  <Text style={styles.highlightText}>
                    {attributes.origin?.country || 'Unknown'}
                  </Text>
                </Text>
              </View>
              {attributes.origin?.region ? (
                <View style={styles.originRow}>
                  <Ionicons name="map-outline" size={18} color={colors.secondary} />
                  <Text style={[styles.originText, { color: colors.textPrimary }]}>
                    Region:{' '}
                    <Text style={styles.highlightText}>
                      {attributes.origin.region}
                    </Text>
                  </Text>
                </View>
              ) : null}
              {attributes.origin?.era ? (
                <View style={styles.originRow}>
                  <Ionicons name="calendar-outline" size={18} color={colors.accent} />
                  <Text style={[styles.originText, { color: colors.textPrimary }]}>
                    Era:{' '}
                    <Text style={styles.highlightText}>
                      {attributes.origin.era}
                    </Text>
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Coat & Grooming Characteristics */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.borderSubtle,
                },
              ]}
            >
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                Coat & Coloration
              </Text>
              <Text style={[styles.originText, { color: colors.textSecondary }]}>
                Length:{' '}
                <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>
                  {attributes.coat?.length || 'Standard'}
                </Text>
                {'  •  '}
                Type:{' '}
                <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>
                  {attributes.coat?.type || 'Standard'}
                </Text>
              </Text>

              {attributes.coat?.colors && attributes.coat.colors.length > 0 && (
                <View style={styles.colorsWrap}>
                  {attributes.coat.colors.map((c, i) => (
                    <View
                      key={i}
                      style={[
                        styles.colorChip,
                        {
                          backgroundColor: colors.surfaceSubtle,
                          borderColor: colors.borderSubtle,
                        },
                      ]}
                    >
                      <Text style={[styles.colorChipText, { color: colors.textSecondary }]}>
                        {c}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Other Names & Kennel Clubs */}
            {((attributes.other_names && attributes.other_names.length > 0) ||
              (attributes.recognized_by && attributes.recognized_by.length > 0)) && (
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.borderSubtle,
                  },
                ]}
              >
                {attributes.other_names && attributes.other_names.length > 0 && (
                  <View style={styles.subSection}>
                    <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                      Alternative Names
                    </Text>
                    <View style={styles.colorsWrap}>
                      {attributes.other_names.map((name, i) => (
                        <View
                          key={i}
                          style={[
                            styles.colorChip,
                            { backgroundColor: colors.surfaceSubtle },
                          ]}
                        >
                          <Text style={[styles.colorChipText, { color: colors.textSecondary }]}>
                            {name}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {attributes.recognized_by && attributes.recognized_by.length > 0 && (
                  <View style={styles.subSection}>
                    <Text
                      style={[
                        styles.cardTitle,
                        { color: colors.textPrimary, marginTop: spacing.md },
                      ]}
                    >
                      Recognizing Kennel Clubs
                    </Text>
                    <View style={styles.colorsWrap}>
                      {attributes.recognized_by.map((club, i) => (
                        <View
                          key={i}
                          style={[
                            styles.clubBadge,
                            {
                              backgroundColor: colors.primaryLight,
                              borderColor: colors.primary,
                            },
                          ]}
                        >
                          <Ionicons
                            name="ribbon-outline"
                            size={14}
                            color={colors.primary}
                          />
                          <Text
                            style={[styles.clubText, { color: colors.primary }]}
                          >
                            {club}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* ================= TRAITS TAB (11 NUMERIC TRAITS VISUAL SCALE) ================= */}
        {activeTab === 'traits' && (
          <View>
            {/* Temperament Tags */}
            {attributes.traits?.temperament &&
              attributes.traits.temperament.length > 0 && (
                <View
                  style={[
                    styles.card,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.borderSubtle,
                    },
                  ]}
                >
                  <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                    Temperament & Personality
                  </Text>
                  <View style={styles.temperamentWrap}>
                    {attributes.traits.temperament.map((temp, i) => (
                      <View
                        key={i}
                        style={[
                          styles.tempPill,
                          {
                            backgroundColor: colors.primaryLight,
                            borderColor: colors.primary,
                          },
                        ]}
                      >
                        <Text style={[styles.tempPillText, { color: colors.primary }]}>
                          #{temp}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

            {/* Visual Scales for 11 Numeric Traits */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.borderSubtle,
                },
              ]}
            >
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                Behavioral & Physical Scales
              </Text>
              <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
                Visual metrics rating breed traits (1 to 5)
              </Text>

              <TraitMeter
                label="Energy Level"
                value={attributes.traits?.energy}
                icon="flash-outline"
              />
              <TraitMeter
                label="Barking Frequency"
                value={attributes.traits?.barking}
                icon="volume-high-outline"
              />
              <TraitMeter
                label="Drooling Tendency"
                value={attributes.traits?.drooling}
                icon="water-outline"
              />
              <TraitMeter
                label="Grooming Needs"
                value={attributes.traits?.grooming}
                icon="cut-outline"
              />
              <TraitMeter
                label="Shedding Level"
                value={attributes.traits?.shedding}
                icon="sparkles-outline"
              />
              <TraitMeter
                label="Trainability"
                value={attributes.traits?.trainability}
                icon="school-outline"
              />
              <TraitMeter
                label="Good With Other Dogs"
                value={attributes.traits?.good_with_dogs}
                icon="paw-outline"
              />
              <TraitMeter
                label="Good With Children"
                value={attributes.traits?.good_with_children}
                icon="people-outline"
              />
              <TraitMeter
                label="Good With Strangers"
                value={attributes.traits?.good_with_strangers}
                icon="walk-outline"
              />
              <TraitMeter
                label="Apartment Friendly"
                value={attributes.traits?.apartment_friendly}
                icon="home-outline"
              />
              <TraitMeter
                label="Exercise Needed (Daily)"
                value={attributes.traits?.exercise_minutes}
                max={120}
                unit="min"
                icon="bicycle-outline"
                isSpecialScale={true}
              />
            </View>
          </View>
        )}

        {/* ================= GALLERY TAB ================= */}
        {activeTab === 'gallery' && (
          <View>
            <ImageGallery
              images={attributes.images}
              breedName={attributes.name}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroContainer: {
    height: 270,
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  topNav: {
    position: 'absolute',
    top: 48,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  roundNavBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navActionGroup: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  heroTitleWrap: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
  },
  heroName: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.extraBold,
    color: '#FFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  heroBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.xs,
  },
  heroBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: typography.fontSizes.sm,
  },
  tabContentArea: {
    flex: 1,
  },
  contentPadding: {
    padding: spacing.lg,
    paddingBottom: 50,
  },
  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    fontSize: typography.fontSizes.xs,
    marginBottom: spacing.md,
  },
  descriptionText: {
    fontSize: typography.fontSizes.sm,
    lineHeight: typography.lineHeights.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  metricCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    fontSize: 10,
    marginTop: 4,
  },
  metricValue: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    marginTop: 2,
    textAlign: 'center',
  },
  originRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  originText: {
    fontSize: typography.fontSizes.sm,
  },
  highlightText: {
    fontWeight: typography.fontWeights.semiBold,
  },
  colorsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  colorChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
    borderWidth: 0.5,
  },
  colorChipText: {
    fontSize: 11,
  },
  clubBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
    borderWidth: 0.5,
  },
  clubText: {
    fontSize: 11,
    fontWeight: '600',
  },
  subSection: {
    marginTop: spacing.xs,
  },
  temperamentWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  tempPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  tempPillText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: '600',
  },
});
