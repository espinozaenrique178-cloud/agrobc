import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { MANUFACTURERS } from '../data/products';

export default function ManufacturersScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>Quiénes estarían en el catálogo</Text>
      <Text style={styles.title}>Fabricantes</Text>
      <Text style={styles.lede}>
        Fabricantes agroquímicos y de nutrición vegetal que ya operan en Baja California.
        Nombres ilustrativos para esta demostración.
      </Text>

      {MANUFACTURERS.map((m) => (
        <View key={m.name} style={styles.card}>
          <Text style={styles.name}>{m.name}</Text>
          <Text style={styles.meta}>{m.categories}</Text>
          <Text style={styles.domain}>{m.domain}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { padding: 20, paddingTop: 24, paddingBottom: 48 },
  eyebrow: {
    fontSize: 12, letterSpacing: 1, textTransform: 'uppercase',
    color: colors.green, fontWeight: '700', marginBottom: 6,
  },
  title: { fontSize: 26, fontWeight: '700', color: colors.ink, marginBottom: 8 },
  lede: { fontSize: 14, color: colors.inkSoft, lineHeight: 20, marginBottom: 20 },
  card: {
    backgroundColor: colors.paperRaised, borderRadius: 10, borderWidth: 1,
    borderColor: colors.line, padding: 16, marginBottom: 12,
  },
  name: { fontSize: 18, fontWeight: '700', color: colors.greenDeep },
  meta: { fontSize: 13, color: colors.inkSoft, marginTop: 4 },
  domain: { fontSize: 12, color: colors.stone, marginTop: 6 },
});
