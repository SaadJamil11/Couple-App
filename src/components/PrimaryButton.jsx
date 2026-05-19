import React from 'react';
import { Pressable, Text, View, ActivityIndicator } from 'react-native';
import { colors, radius, shadows } from '../theme/colors';
import { text } from '../theme/typography';

// PrimaryButton — pill-shaped, terracotta ink, deliberate press-state.
// `variant` toggles a quieter "ghost" treatment for secondary actions.
export default function PrimaryButton({
  label,
  onPress,
  variant = 'solid',
  disabled,
  loading,
  icon,
  testID,
  style,
}) {
  const isGhost = variant === 'ghost';
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          paddingVertical: 14,
          paddingHorizontal: 22,
          borderRadius: radius.pill,
          backgroundColor: isGhost ? 'transparent' : colors.ink,
          borderWidth: isGhost ? 1.5 : 0,
          borderColor: isGhost ? colors.ink : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          opacity: disabled ? 0.55 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
        !isGhost && shadows.card,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isGhost ? colors.ink : colors.paper} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {icon}
          <Text
            style={[
              text.body,
              {
                color: isGhost ? colors.ink : colors.paper,
                fontWeight: '600',
                letterSpacing: 0.2,
              },
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
