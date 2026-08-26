import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TABS = [
  { key: 'buscar', label: 'Buscar', icon: 'search' },
  { key: 'fabricantes', label: 'Fabricantes', icon: 'business' },
  { key: 'sumate', label: 'Súmate', icon: 'person-add' },
  { key: 'admin', label: 'Admin', icon: 'shield-checkmark' },
];

export default function FloatingTabBar({ activeTab, onChange }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { bottom: Math.max(insets.bottom - 20, 4) }]} pointerEvents="box-none">
      <View style={styles.pill}>
        <BlurView intensity={65} tint="dark" style={StyleSheet.absoluteFillObject} />
        <View style={styles.darken} />
        <View style={styles.row}>
          {TABS.map((t) => {
            const active = activeTab === t.key;
            const iconName = active ? t.icon : `${t.icon}-outline`;
            return (
              <Pressable
                key={t.key}
                style={styles.item}
                onPress={() => onChange(t.key)}
                hitSlop={6}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                accessibilityLabel={t.label}
              >
                <View style={[styles.itemInner, active && styles.itemInnerActive]}>
                  <Ionicons
                    name={iconName}
                    size={20}
                    color={active ? '#FFFFFF' : 'rgba(255,255,255,0.62)'}
                  />
                  <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
                    {t.label}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 20,
    right: 20,
  },
  pill: {
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: Platform.OS === 'android' ? 'rgba(18,17,13,0.92)' : 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 14,
  },
  darken: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20,18,14,0.38)',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 20,
    minWidth: 66,
  },
  itemInnerActive: {
    backgroundColor: 'rgba(255,255,255,0.20)',
  },
  label: {
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 3,
    color: 'rgba(255,255,255,0.62)',
  },
  labelActive: {
    color: '#FFFFFF',
  },
});
