import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Linking, ActivityIndicator } from 'react-native';
import { colors, categoryColors } from '../theme';
import { supabase } from '../supabase';
import { CATEGORY_LABEL } from '../data/products';

export default function ManufacturersScreen() {
  const [fabricantes, setFabricantes] = useState([]);
  const [distribuidores, setDistribuidores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loadingProductos, setLoadingProductos] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: fab }, { data: dist }] = await Promise.all([
        supabase.from('fabricantes').select('*').order('name'),
        supabase.from('distribuidores').select('*').order('name'),
      ]);
      setFabricantes(fab || []);
      setDistribuidores(dist || []);
      setLoading(false);
    })();
  }, []);

  async function pickFabricante(f) {
    setSelected(f);
    setLoadingProductos(true);
    const { data } = await supabase.from('productos').select('*').eq('fabricante_id', f.id).order('name');
    setProductos(data || []);
    setLoadingProductos(false);
  }

  if (selected) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Pressable onPress={() => setSelected(null)} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Fabricantes</Text>
        </Pressable>
        <Text style={styles.eyebrow}>Fabricante</Text>
        <Text style={styles.title}>{selected.name}</Text>
        <Text style={styles.lede}>
          {loadingProductos ? 'Cargando…' : `${productos.length} producto${productos.length === 1 ? '' : 's'} en AgroBC`}
        </Text>

        {loadingProductos && <ActivityIndicator color={colors.green} style={{ marginTop: 20 }} />}

        {!loadingProductos && productos.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Todavía no hay productos de {selected.name} cargados en el catálogo.</Text>
          </View>
        )}

        {productos.map((p) => {
          const accent = categoryColors[p.category]?.main || colors.green;
          return (
            <View key={p.id} style={[styles.productCard, { borderTopColor: accent, borderTopWidth: 3 }]}>
              <Text style={[styles.productType, { color: accent }]}>{CATEGORY_LABEL[p.category] || p.type}</Text>
              <Text style={styles.productName}>{p.name}</Text>
              {!!p.ingredient && <Text style={styles.productMeta}>{p.ingredient}</Text>}
              {!!p.presentation && <Text style={styles.productMeta}>{p.presentation}</Text>}
              {!!p.ficha_tecnica && (
                <Pressable onPress={() => Linking.openURL(p.ficha_tecnica)}>
                  <Text style={styles.link}>Ver ficha técnica ↗</Text>
                </Pressable>
              )}
            </View>
          );
        })}
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>Catálogo integrado</Text>
      <Text style={styles.title}>Fabricantes y distribuidores</Text>
      <Text style={styles.lede}>Toca un fabricante para ver sus productos cargados en AgroBC.</Text>

      {loading && <ActivityIndicator color={colors.green} style={{ marginTop: 12 }} />}

      {!loading && (
        <>
          <Text style={styles.sectionLabel}>Fabricantes ({fabricantes.length})</Text>
          {fabricantes.map((f) => (
            <Pressable key={f.id} style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]} onPress={() => pickFabricante(f)}>
              <Text style={styles.name}>{f.name}</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
          {fabricantes.length === 0 && <Text style={styles.emptyText}>Todavía no hay fabricantes cargados.</Text>}

          <Text style={[styles.sectionLabel, { marginTop: 22 }]}>Distribuidores ({distribuidores.length})</Text>
          {distribuidores.map((d) => (
            <View key={d.id} style={styles.card}>
              <Text style={styles.name}>{d.name}</Text>
            </View>
          ))}
          {distribuidores.length === 0 && <Text style={styles.emptyText}>Todavía no hay distribuidores cargados.</Text>}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { padding: 20, paddingTop: 24, paddingBottom: 140 },
  eyebrow: {
    fontSize: 12, letterSpacing: 1, textTransform: 'uppercase',
    color: colors.green, fontWeight: '700', marginBottom: 6,
  },
  title: { fontSize: 26, fontWeight: '700', color: colors.ink, marginBottom: 8 },
  lede: { fontSize: 14, color: colors.inkSoft, lineHeight: 20, marginBottom: 8 },
  sectionLabel: {
    fontSize: 13, letterSpacing: 0.4, textTransform: 'uppercase',
    color: colors.stone, fontWeight: '700', marginTop: 16, marginBottom: 10,
  },
  card: {
    backgroundColor: colors.paperRaised, borderRadius: 10, borderWidth: 1,
    borderColor: colors.line, padding: 16, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  name: { fontSize: 16, fontWeight: '700', color: colors.greenDeep },
  chevron: { fontSize: 20, color: colors.stone },
  emptyText: { color: colors.stone, fontSize: 13.5, paddingVertical: 8 },
  emptyCard: {
    padding: 24, borderRadius: 8, borderWidth: 1, borderStyle: 'dashed',
    borderColor: colors.line, backgroundColor: colors.paperRaised, marginTop: 12,
  },
  backBtn: { marginBottom: 16 },
  backText: { color: colors.green, fontWeight: '600', fontSize: 15 },
  productCard: {
    backgroundColor: colors.paperRaised, borderRadius: 10, borderWidth: 1,
    borderColor: colors.line, padding: 16, marginTop: 14,
  },
  productType: {
    fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: '700', marginBottom: 4,
  },
  productName: { fontSize: 17, fontWeight: '700', color: colors.ink },
  productMeta: { fontSize: 13, color: colors.inkSoft, marginTop: 4 },
  link: { fontSize: 13, color: colors.green, fontWeight: '600', marginTop: 10 },
});
