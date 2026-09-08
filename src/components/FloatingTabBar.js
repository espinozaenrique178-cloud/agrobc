import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';

const TABS = [
  { key: 'buscar', label: 'Buscar', icon: 'search' },
  { key: 'fabricantes', label: 'Fabricantes', icon: 'business' },
  { key: 'calculadora', label: 'Calculadora', icon: 'calculator' },
  { key: 'admin', label: 'Admin', icon: 'shield-checkmark' },
];

export default function FloatingTabBar({ activeTab, onChange }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { bottom: Math.max(insets.bottom - 20, 4) }]} pointerEvents="box-none">
      <View style={styles.pill}>
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
                    color={active ? colors.greenDeep : colors.inkSoft}
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
  // Casi opaco: deja entrever el contenido sin comprometer la lectura.
  // rgba de colors.paperRaised (#F6F2E6).
  pill: {
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: 'rgba(246,242,230,0.80)',
    borderWidth: 1,
    borderColor: colors.line,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
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
    backgroundColor: colors.greenTint,
  },
  label: {
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 3,
    color: colors.inkSoft,
  },
  labelActive: {
    color: colors.greenDeep,
    fontWeight: '700',
  },
});
