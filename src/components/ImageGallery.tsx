import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Linking,
  Modal,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { BreedImage } from '../types/dog';
import { useAppTheme } from '../hooks/useAppTheme';
import { radius, spacing, typography } from '../constants/theme';

interface ImageGalleryProps {
  images?: BreedImage[];
  breedName: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_WIDTH = SCREEN_WIDTH - spacing.xl * 2;
const CARD_HEIGHT = 280;

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images = [], breedName }) => {
  const { colors, isDark } = useAppTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullScreenImage, setFullScreenImage] = useState<BreedImage | null>(null);

  if (!images || images.length === 0) {
    return (
      <View
        style={[
          styles.placeholderContainer,
          {
            backgroundColor: colors.surfaceSubtle,
            borderColor: colors.borderSubtle,
          },
        ]}
      >
        <Ionicons name="paw" size={48} color={colors.textMuted} />
        <Text style={[styles.placeholderText, { color: colors.textMuted }]}>
          No gallery images available for {breedName}
        </Text>
      </View>
    );
  }

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slide = Math.round(
      event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width
    );
    if (slide !== activeIndex && slide >= 0 && slide < images.length) {
      setActiveIndex(slide);
    }
  };

  const openAttributionLink = (url?: string) => {
    if (!url) return;
    Linking.openURL(url).catch((err) => {
      console.warn('Could not open attribution link:', err);
    });
  };

  const currentImage = images[activeIndex] || images[0];
  const attribution = currentImage.attribution;

  return (
    <View style={styles.container}>
      {/* Swipeable Carousel */}
      <FlatList
        data={images}
        keyExtractor={(item, index) => item.id || `img-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        decelerationRate="fast"
        renderItem={({ item, index }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.slide, { width: CAROUSEL_WIDTH }]}
            onPress={() => setFullScreenImage(item)}
            accessibilityRole="imagebutton"
            accessibilityLabel={`${breedName} photo ${index + 1} of ${images.length}. Tap to expand.`}
          >
            <Image
              source={{ uri: item.large || item.medium || item.url }}
              style={styles.image}
              contentFit="cover"
              transition={200}
              placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
              cachePolicy="memory-disk"
            />
            <View style={styles.expandBadge}>
              <Ionicons name="expand" size={16} color="#FFF" />
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Pagination Indicator Dots */}
      {images.length > 1 && (
        <View style={styles.dotsRow}>
          {images.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    idx === activeIndex
                      ? colors.primary
                      : isDark
                      ? colors.border
                      : '#CBD5E1',
                  width: idx === activeIndex ? 18 : 6,
                },
              ]}
            />
          ))}
        </View>
      )}

      {/* Attribution Card - Surfacing author, license, and source */}
      {attribution && (
        <View
          style={[
            styles.attributionCard,
            {
              backgroundColor: colors.surfaceSubtle,
              borderColor: colors.borderSubtle,
            },
          ]}
        >
          <View style={styles.attributionHeader}>
            <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
            <Text style={[styles.attributionTitle, { color: colors.textPrimary }]}>
              Image Attribution & Licensing
            </Text>
          </View>

          {attribution.author ? (
            <Text style={[styles.attributionRow, { color: colors.textSecondary }]}>
              <Text style={styles.attributionLabel}>Author: </Text>
              {attribution.author}
            </Text>
          ) : null}

          {attribution.license ? (
            <TouchableOpacity
              onPress={() => openAttributionLink(attribution.license_url)}
              disabled={!attribution.license_url}
              style={styles.linkRow}
            >
              <Text style={[styles.attributionRow, { color: colors.textSecondary }]}>
                <Text style={styles.attributionLabel}>License: </Text>
                <Text
                  style={{
                    color: attribution.license_url ? colors.primary : colors.textSecondary,
                    textDecorationLine: attribution.license_url ? 'underline' : 'none',
                  }}
                >
                  {attribution.license}
                </Text>
              </Text>
            </TouchableOpacity>
          ) : null}

          {attribution.source ? (
            <TouchableOpacity
              onPress={() => openAttributionLink(attribution.source_url)}
              disabled={!attribution.source_url}
              style={styles.linkRow}
            >
              <Text style={[styles.attributionRow, { color: colors.textSecondary }]}>
                <Text style={styles.attributionLabel}>Source: </Text>
                <Text
                  style={{
                    color: attribution.source_url ? colors.primary : colors.textSecondary,
                    textDecorationLine: attribution.source_url ? 'underline' : 'none',
                  }}
                >
                  {attribution.source}
                </Text>
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      {/* Fullscreen Modal View */}
      <Modal
        visible={!!fullScreenImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFullScreenImage(null)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setFullScreenImage(null)}
            accessibilityLabel="Close full screen image preview"
          >
            <Ionicons name="close" size={28} color="#FFF" />
          </TouchableOpacity>

          {fullScreenImage && (
            <Image
              source={{
                uri: fullScreenImage.large || fullScreenImage.medium || fullScreenImage.url,
              }}
              style={styles.fullScreenImage}
              contentFit="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  placeholderContainer: {
    height: 200,
    borderRadius: radius.lg,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  placeholderText: {
    fontSize: typography.fontSizes.sm,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  slide: {
    height: CARD_HEIGHT,
    borderRadius: radius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: radius.lg,
  },
  expandBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: spacing.xs + 2,
    borderRadius: radius.sm,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.md,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  attributionCard: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  attributionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  attributionTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
  },
  attributionRow: {
    fontSize: typography.fontSizes.xs,
    marginTop: 2,
  },
  attributionLabel: {
    fontWeight: typography.fontWeights.medium,
  },
  linkRow: {
    marginTop: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  fullScreenImage: {
    width: '95%',
    height: '80%',
  },
});
