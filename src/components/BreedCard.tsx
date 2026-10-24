import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Breed, BreedGroup } from '../types/dog';
import { deriveSizeBand } from '../utils/filterUtils';
import { useAppTheme } from '../hooks/useAppTheme';
import { radius, spacing, typography } from '../constants/theme';

interface BreedCardProps {
  breed: Breed;
  group?: BreedGroup;
  isFavorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
}

export const BreedCard: React.FC<BreedCardProps> = React.memo(
  ({ breed, group, isFavorite, onPress, onToggleFavorite }) => {
    const { colors, isDark } = useAppTheme();
    const { attributes } = breed;

    // Use thumbnail variant to keep memory footprint under 150MB
    const firstImage = attributes.images?.[0];
    const imageUri = firstImage?.thumb || firstImage?.medium || firstImage?.url;

    const sizeBand = deriveSizeBand(breed);
    const sizeBandLabel = sizeBand.charAt(0).toUpperCase() + sizeBand.slice(1);

    const groupName = group?.attributes.name || 'Unassigned';

    // Format life span
    const lifeText =
      attributes.life?.min && attributes.life?.max
        ? `${attributes.life.min}-${attributes.life.max} yrs`
        : attributes.life?.max
        ? `Up to ${attributes.life.max} yrs`
        : null;

    // First 2-3 temperaments
    const temperaments = attributes.traits?.temperament?.slice(0, 3) || [];

    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.borderSubtle,
            shadowColor: colors.cardShadow,
          },
        ]}
        activeOpacity={0.7}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${attributes.name}, breed group: ${groupName}, size: ${sizeBandLabel}. Tap to view details.`}
      >
        {/* Left: Thumbnail with memory caching */}
        <View style={styles.imageContainer}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              contentFit="cover"
              transition={150}
              cachePolicy="memory-disk"
            />
          ) : (
            <View
              style={[
                styles.imagePlaceholder,
                { backgroundColor: colors.surfaceSubtle },
              ]}
            >
              <Ionicons name="paw-outline" size={24} color={colors.textMuted} />
            </View>
          )}

          {attributes.hypoallergenic && (
            <View style={[styles.hypoBadge, { backgroundColor: colors.success }]}>
              <Ionicons name="shield-checkmark" size={10} color="#FFF" />
              <Text style={styles.hypoText}>Hypo</Text>
            </View>
          )}
        </View>

        {/* Right: Rich Information */}
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <View style={styles.titleWrap}>
              <Text
                style={[styles.breedName, { color: colors.textPrimary }]}
                numberOfLines={1}
              >
                {attributes.name}
              </Text>
              <Text
                style={[styles.groupName, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {groupName}
              </Text>
            </View>

            <TouchableOpacity
              onPress={onToggleFavorite}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.favoriteButton}
              accessibilityRole="button"
              accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={22}
                color={isFavorite ? colors.error : colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          {/* Badges Row */}
          <View style={styles.badgesRow}>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: colors.primaryLight,
                  borderColor: isDark ? colors.border : '#BFDBFE',
                },
              ]}
            >
              <Text style={[styles.badgeText, { color: colors.primary }]}>
                {sizeBandLabel}
              </Text>
            </View>

            {lifeText && (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: colors.surfaceSubtle,
                    borderColor: colors.borderSubtle,
                  },
                ]}
              >
                <Ionicons name="time-outline" size={11} color={colors.textSecondary} />
                <Text style={[styles.badgeText, { color: colors.textSecondary }]}>
                  {lifeText}
                </Text>
              </View>
            )}
          </View>

          {/* Temperament Pills */}
          {temperaments.length > 0 && (
            <View style={styles.temperamentRow}>
              {temperaments.map((tag, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.tagPill,
                    {
                      backgroundColor: isDark
                        ? colors.surfaceElevated
                        : colors.surfaceSubtle,
                    },
                  ]}
                >
                  <Text
                    style={[styles.tagText, { color: colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }
);

BreedCard.displayName = 'BreedCard';

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginVertical: 6,
    borderRadius: radius.lg,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    width: 84,
    height: 84,
    borderRadius: radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: radius.md,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.md,
  },
  hypoBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  hypoText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
  },
  contentContainer: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleWrap: {
    flex: 1,
    marginRight: spacing.xs,
  },
  breedName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
  },
  groupName: {
    fontSize: typography.fontSizes.xs,
    marginTop: 2,
  },
  favoriteButton: {
    padding: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginVertical: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
    borderWidth: 0.5,
  },
  badgeText: {
    fontSize: typography.fontSizes.xs - 1,
    fontWeight: typography.fontWeights.medium,
  },
  temperamentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tagPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
  },
});
