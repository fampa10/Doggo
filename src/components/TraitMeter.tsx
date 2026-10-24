import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../hooks/useAppTheme';
import { radius, spacing, typography } from '../constants/theme';

interface TraitMeterProps {
  label: string;
  value?: number;
  max?: number;
  unit?: string;
  icon: keyof typeof Ionicons.glyphMap;
  isSpecialScale?: boolean; // For exercise minutes
}

export const TraitMeter: React.FC<TraitMeterProps> = ({
  label,
  value,
  max = 5,
  unit,
  icon,
  isSpecialScale = false,
}) => {
  const { colors, isDark } = useAppTheme();

  if (value === undefined || value === null) {
    return null;
  }

  // Qualitative text descriptor
  const getDescriptor = (val: number, isMinutes: boolean) => {
    if (isMinutes) {
      if (val <= 30) return 'Low (<30 min/day)';
      if (val <= 60) return 'Moderate (30-60 min/day)';
      return 'High (60+ min/day)';
    }
    switch (val) {
      case 1:
        return 'Very Low';
      case 2:
        return 'Low';
      case 3:
        return 'Moderate';
      case 4:
        return 'High';
      case 5:
        return 'Very High';
      default:
        return `${val}/${max}`;
    }
  };

  const descriptor = getDescriptor(value, isSpecialScale);

  // Score color progression
  const getScoreColor = (val: number) => {
    if (isSpecialScale) return colors.secondary;
    if (val <= 2) return colors.primary;
    if (val === 3) return colors.accent;
    return colors.secondary;
  };

  const activeColor = getScoreColor(value);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceSubtle,
          borderColor: colors.borderSubtle,
        },
      ]}
      accessible={true}
      accessibilityLabel={`${label}: ${value} out of ${max}. ${descriptor}`}
    >
      <View style={styles.topRow}>
        <View style={styles.labelGroup}>
          <View
            style={[
              styles.iconWrapper,
              { backgroundColor: isDark ? colors.surfaceElevated : colors.surface },
            ]}
          >
            <Ionicons name={icon} size={16} color={activeColor} />
          </View>
          <Text style={[styles.label, { color: colors.textPrimary }]}>{label}</Text>
        </View>

        <View style={styles.valueGroup}>
          <Text style={[styles.valueText, { color: activeColor }]}>
            {value}
            {unit ? ` ${unit}` : ''}
          </Text>
          <Text style={[styles.descriptorText, { color: colors.textSecondary }]}>
            ({descriptor})
          </Text>
        </View>
      </View>

      {/* Visual Segmented Scale (Not a raw table) */}
      {isSpecialScale ? (
        <View style={styles.barBackground}>
          <View
            style={[
              styles.barFill,
              {
                width: `${Math.min(100, (value / 120) * 100)}%`,
                backgroundColor: activeColor,
              },
            ]}
          />
        </View>
      ) : (
        <View style={styles.segmentsRow}>
          {Array.from({ length: max }).map((_, i) => {
            const isFilled = i < value;
            return (
              <View
                key={i}
                style={[
                  styles.segment,
                  {
                    backgroundColor: isFilled
                      ? activeColor
                      : isDark
                      ? colors.border
                      : '#E2E8F0',
                  },
                ]}
              />
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  valueGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  valueText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
  },
  descriptorText: {
    fontSize: typography.fontSizes.xs,
  },
  segmentsRow: {
    flexDirection: 'row',
    gap: 4,
    height: 8,
    width: '100%',
  },
  segment: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  barBackground: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
    width: '100%',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
});
