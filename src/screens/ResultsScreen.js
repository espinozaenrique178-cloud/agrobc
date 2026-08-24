import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Linking } from 'react-native';
import { colors } from '../theme';
import { matchProducts, CATEGORY_LABEL, CATEGORY_BY_PROBLEM } from '../data/products';

export default function ResultsScreen({ crop, problem, onBack }) {
  const matches = matchProducts(crop, problem);
  const category = CATEGORY_BY_PROBLEM[problem];

  function openFicha(product) {
    const query = `site:${product.domain} "${product.name}" ficha técnica`;
    const url = 'https://www.google.com/search?q=' + encodeURIComponent(query);
    Linking.openURL(url);
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Pressable onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backText}>‹ Nueva búsqueda</Text>
      </Pressable>

      <Text style={styles.eyebrow}>Resultado de búsqueda</Text>
      <Text style={styles.title}>{crop} + {problem}</Text>
      <Text style={styles.lede}>
        Estas opciones son todas de la misma categoría
        {category ? ` (${CATEGORY_LABEL[category]})` : ''}. Ningún fabricante paga por aparecer primero.
      </Text>

      {matches.length === 0 && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            Aún no tenemos productos de ejemplo para "{crop} + {problem}" en esta demo.
          </Text>
        </View>
      )}

      {matches.map((p, i) => (
        <View key={p.mfg + p.name} style={styles.card}>
          <Text style={styles.rank}>Opción {i + 1}</Text>
          <Text style={styles.mfg}>{p.mfg}</Text>
          <Text style={styles.name}>{p.name}</Text>
          <Text style={styles.type}>{p.type}</Text>

          <View style={styles.specs}>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Ingrediente activo</Text>
              <Text style={styles.specValue}>{p.ingredient}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Presentación</Text>
              <Text style={styles.specValue}>{p.presentation}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Cultivo</Text>
              <Text style={styles.specValue}>{crop}</Text>
            </View>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>${p.price.toLocaleString('es-MX')}</Text>
            <Text style={styles.priceSource}>Ejemplo · actualizado 23/08/2026</Text>
          </View>

          <Pressable style={styles.buyBtn} onPress={() => openFicha(p)}>
            <Text style={styles.buyBtnText}>Ficha técnica en {p.mfg} ↗</Text>
          </Pressable>
        </View>
      ))}

      <Text style={styles.footNote}>
        ◍ Catálogo y precios de ejemplo para esta demostración.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { padding: 20, paddingTop: 16, paddingBottom: 48 },
  backBtn: { marginBottom: 16 },
  backText: { color: colors.green, fontWeight: '600', fontSize: 15 },
  eyebrow: {
    fontSize: 12, letterSpacing: 1, textTransform: 'uppercase',
    color: colors.green, fontWeight: '700', marginBottom: 6,
  },
  title: { fontSize: 24, fontWeight: '700', color: colors.ink, marginBottom: 8 },
  lede: { fontSize: 14, color: colors.inkSoft, lineHeight: 20, marginBottom: 20 },
  emptyCard: {
    padding: 24, borderRadius: 8, borderWidth: 1, borderStyle: 'dashed',
    borderColor: colors.line, backgroundColor: colors.paperRaised,
  },
  emptyText: { color: colors.inkSoft, textAlign: 'center' },
  card: {
    backgroundColor: colors.paperRaised, borderRadius: 10, borderWidth: 1,
    borderColor: colors.line, padding: 18, marginBottom: 14,
  },
  rank: {
    fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase',
    color: colors.stone, fontWeight: '600',
  },
  mfg: { fontSize: 13, color: colors.green, fontWeight: '700', marginTop: 8 },
  name: { fontSize: 20, fontWeight: '700', color: colors.ink, marginTop: 2 },
  type: { fontSize: 13.5, color: colors.inkSoft, marginTop: 2 },
  specs: {
    marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.line, gap: 6,
  },
  specRow: { flexDirection: 'row', justifyContent: 'space-between' },
  specLabel: { fontSize: 13, color: colors.stone },
  specValue: { fontSize: 13, color: colors.ink, fontWeight: '600' },
  priceRow: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.line },
  price: { fontSize: 22, fontWeight: '700', color: colors.terra },
  priceSource: { fontSize: 11.5, color: colors.stone, marginTop: 2 },
  buyBtn: {
    marginTop: 14, backgroundColor: colors.green, borderRadius: 8,
    paddingVertical: 12, alignItems: 'center',
  },
  buyBtnText: { color: '#F8F5EA', fontWeight: '700', fontSize: 14 },
  footNote: { fontSize: 12, color: colors.stone, textAlign: 'center', marginTop: 8 },
});
