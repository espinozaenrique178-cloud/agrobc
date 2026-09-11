import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, categoryColors } from '../theme';
import { CROPS, ALL_CROPS, PROBLEMS, ALL_PROBLEMS, CATEGORY_BY_PROBLEM, CATEGORY_LABEL, PRODUCTS } from '../data/products';
import { supabase } from '../supabase';

// Quita acentos y pasa a minúsculas para que "maiz" encuentre "Maíz" y
// "arana" encuentre "Araña roja".
function normalize(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

function Pill({ label, active, accentColor, onPress }) {
  const activeStyle = active
    ? { backgroundColor: accentColor || colors.green, borderColor: accentColor || colors.green }
    : null;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        activeStyle,
        pressed && { opacity: 0.7 },
      ]}
    >
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </Pressable>
  );
}

export default function HomeScreen({ onSearch }) {
  const [cropQuery, setCropQuery] = useState('');
  const [problemQuery, setProblemQuery] = useState('');
  const [productQuery, setProductQuery] = useState('');
  const [crop, setCrop] = useState('Tomate');
  const [problem, setProblem] = useState('Plaga');
  const [showAllCrops, setShowAllCrops] = useState(false);
  const [showAllProblems, setShowAllProblems] = useState(false);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [distribuidoresByProduct, setDistribuidoresByProduct] = useState({});
  const [loadingDistribuidores, setLoadingDistribuidores] = useState(false);

  async function toggleProduct(p) {
    const key = p.id || p.name;
    if (expandedProduct === key) {
      setExpandedProduct(null);
      return;
    }
    setExpandedProduct(key);
    if (!p.id || distribuidoresByProduct[key]) return;
    setLoadingDistribuidores(true);
    const { data } = await supabase
      .from('producto_distribuidores')
      .select('distribuidores(name)')
      .eq('producto_id', p.id);
    const names = (data || []).map((row) => (row.distribuidores && row.distribuidores.name)).filter(Boolean);
    setDistribuidoresByProduct((prev) => ({ ...prev, [key]: names }));
    setLoadingDistribuidores(false);
  }

  const productMatches = useMemo(() => {
    const q = normalize(productQuery.trim());
    if (!q) return [];
    return PRODUCTS.filter(
      (p) => normalize(p.name).includes(q) || normalize(p.ingredient || '').includes(q)
    ).slice(0, 20);
  }, [productQuery]);

  // En "todos" se unen destacados y catálogo completo: así no desaparece
  // ningún cultivo agregado desde el panel de admin (addCrops los mete en CROPS).
  const cropPool = useMemo(() => {
    if (!showAllCrops) return CROPS;
    return Array.from(new Set([...CROPS, ...ALL_CROPS])).sort((a, b) => a.localeCompare(b, 'es'));
  }, [showAllCrops]);

  const problemPool = useMemo(() => {
    if (!showAllProblems) return PROBLEMS;
    return Array.from(new Set([...PROBLEMS, ...ALL_PROBLEMS])).sort((a, b) => a.localeCompare(b, 'es'));
  }, [showAllProblems]);

  const filteredCrops = useMemo(
    () => cropPool.filter((c) => normalize(c).includes(normalize(cropQuery.trim()))),
    [cropPool, cropQuery]
  );
  const filteredProblems = useMemo(
    () => problemPool.filter((p) => normalize(p).includes(normalize(problemQuery.trim()))),
    [problemPool, problemQuery]
  );

  function pickCrop(value) {
    setCrop(value);
  }
  function pickProblem(value) {
    setProblem(value);
  }

  const ctaCategory = CATEGORY_BY_PROBLEM[problem];
  const ctaColor = ctaCategory ? categoryColors[ctaCategory].main : colors.green;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>Baja California · Piloto 2026</Text>
      <Text style={styles.title}>Busca un cultivo y un problema.</Text>
      <Text style={styles.titleAccent}>Compara antes de comprar.</Text>
      <Text style={styles.lede}>
        Productos agrícolas disponibles en Baja California, comparados por ficha técnica
        y presentación — sin favoritismos de marca.
      </Text>

      <View style={styles.card}>
        <Text style={styles.fieldLabel}>¿Ya sabes qué producto buscas?</Text>
        <TextInput
          style={styles.input}
          placeholder="Buscar por nombre… (ej. Yara Mila 15-15-15)"
          placeholderTextColor={colors.stone}
          value={productQuery}
          onChangeText={setProductQuery}
        />
        {productQuery.trim().length > 0 && (
          <View style={styles.productResults}>
            {productMatches.length === 0 ? (
              <Text style={styles.emptyNote}>Sin coincidencias para "{productQuery}".</Text>
            ) : (
              productMatches.map((p, i) => {
                const accent = p.category ? categoryColors[p.category].main : colors.green;
                const key = p.id || p.mfg + '|' + p.name + '|' + i;
                const expanded = expandedProduct === key;
                const names = distribuidoresByProduct[key];
                return (
                  <Pressable
                    key={key}
                    style={({ pressed }) => [styles.productCard, pressed && { opacity: 0.7 }]}
                    onPress={() => toggleProduct(p)}
                  >
                    <View style={[styles.productAccent, { backgroundColor: accent }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.productMfg}>{p.mfg}</Text>
                      <Text style={styles.productName}>{p.name}</Text>
                      <Text style={styles.productMeta}>
                        {CATEGORY_LABEL[p.category] || p.category}
                        {p.ingredient ? ` · ${p.ingredient}` : ''}
                        {p.presentation ? ` · ${p.presentation}` : ''}
                      </Text>
                      {expanded && (
                        <View style={styles.distribBox}>
                          {loadingDistribuidores && !names ? (
                            <ActivityIndicator color={colors.green} size="small" />
                          ) : names && names.length > 0 ? (
                            <View>
                              <Text style={styles.distribLabel}>Disponible con:</Text>
                              {names.map((n) => (
                                <Text key={n} style={styles.distribName}>◍ {n}</Text>
                              ))}
                            </View>
                          ) : (
                            <Text style={styles.distribEmpty}>Aún no hay distribuidor registrado para este producto.</Text>
                          )}
                        </View>
                      )}
                    </View>
                  </Pressable>
                );
              })
            )}
          </View>
        )}
      </View>

      <View style={[styles.card, { marginTop: 14 }]}>
        <Text style={styles.fieldLabel}>Cultivo</Text>
        <TextInput
          style={styles.input}
          placeholder="Buscar cultivo… (ej. espárrago)"
          placeholderTextColor={colors.stone}
          value={cropQuery}
          onChangeText={(text) => {
            setCropQuery(text);
            if (text.trim().length > 0) setCrop(text.trim());
          }}
        />
        {showAllCrops ? (
          <ScrollView
            style={styles.pillScrollBox}
            nestedScrollEnabled
            showsVerticalScrollIndicator
            contentContainerStyle={styles.pillRow}
          >
            {filteredCrops.map((c) => (
              <Pill key={c} label={c} active={crop === c} accentColor={colors.green} onPress={() => pickCrop(c)} />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.pillRow}>
            {filteredCrops.map((c) => (
              <Pill key={c} label={c} active={crop === c} accentColor={colors.green} onPress={() => pickCrop(c)} />
            ))}
          </View>
        )}
        <Pressable
          onPress={() => setShowAllCrops((v) => !v)}
          style={({ pressed }) => [styles.pill, styles.morePill, styles.toggleStandalone, pressed && { opacity: 0.7 }]}
          accessibilityRole="button"
          accessibilityLabel={showAllCrops ? 'Ver solo cultivos destacados' : 'Ver todos los cultivos'}
        >
          <Text style={styles.morePillText}>
            {showAllCrops ? '← Destacados' : '··· Ver todos'}
          </Text>
        </Pressable>
        {showAllCrops && (
          <Text style={styles.catalogNote}>
            Catálogo completo ({cropPool.length} cultivos) — usa el buscador de arriba para filtrar.
          </Text>
        )}
        {filteredCrops.length === 0 && (
          <Text style={styles.emptyNote}>Sin coincidencias — se usará "{cropQuery}" como cultivo escrito.</Text>
        )}

        <Text style={[styles.fieldLabel, { marginTop: 18 }]}>Problema</Text>
        <TextInput
          style={styles.input}
          placeholder="Buscar problema… (ej. araña roja)"
          placeholderTextColor={colors.stone}
          value={problemQuery}
          onChangeText={(text) => {
            setProblemQuery(text);
            if (text.trim().length > 0) setProblem(text.trim());
          }}
        />
        {showAllProblems ? (
          <ScrollView
            style={styles.pillScrollBox}
            nestedScrollEnabled
            showsVerticalScrollIndicator
            contentContainerStyle={styles.pillRow}
          >
            {filteredProblems.map((p) => {
              const cat = CATEGORY_BY_PROBLEM[p];
              const accent = cat ? categoryColors[cat].main : colors.green;
              return (
                <Pill key={p} label={p} active={problem === p} accentColor={accent} onPress={() => pickProblem(p)} />
              );
            })}
          </ScrollView>
        ) : (
          <View style={styles.pillRow}>
            {filteredProblems.map((p) => {
              const cat = CATEGORY_BY_PROBLEM[p];
              const accent = cat ? categoryColors[cat].main : colors.green;
              return (
                <Pill key={p} label={p} active={problem === p} accentColor={accent} onPress={() => pickProblem(p)} />
              );
            })}
          </View>
        )}
        <Pressable
          onPress={() => setShowAllProblems((v) => !v)}
          style={({ pressed }) => [styles.pill, styles.morePill, styles.toggleStandalone, pressed && { opacity: 0.7 }]}
          accessibilityRole="button"
          accessibilityLabel={showAllProblems ? 'Ver solo problemas destacados' : 'Ver todos los problemas'}
        >
          <Text style={styles.morePillText}>
            {showAllProblems ? '← Destacados' : '··· Ver todos'}
          </Text>
        </Pressable>
        {showAllProblems && (
          <Text style={styles.catalogNote}>
            Catálogo completo ({problemPool.length} problemas) — usa el buscador de arriba para filtrar.
          </Text>
        )}
        {filteredProblems.length === 0 && (
          <Text style={styles.emptyNote}>Sin coincidencias — se usará "{problemQuery}" como problema escrito.</Text>
        )}

        <Pressable
          style={[styles.searchBtn, { backgroundColor: ctaColor }]}
          onPress={() => onSearch(crop, problem)}
        >
          <Text style={styles.searchBtnText}>Buscar: {crop} + {problem}</Text>
        </Pressable>
      </View>

      <Text style={styles.hint}>◍ Consulta básica gratuita · sin registro obligatorio</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { padding: 20, paddingTop: 24, paddingBottom: 140 },
  eyebrow: {
    fontSize: 12, letterSpacing: 1, textTransform: 'uppercase',
    color: colors.green, fontWeight: '700', marginBottom: 10,
  },
  title: { fontSize: 28, fontWeight: '700', color: colors.ink, lineHeight: 34 },
  titleAccent: { fontSize: 28, fontWeight: '700', color: colors.green, lineHeight: 34, marginBottom: 12 },
  lede: { fontSize: 15, color: colors.inkSoft, lineHeight: 22, marginBottom: 22 },
  card: {
    backgroundColor: colors.paperRaised, borderRadius: 10, padding: 18,
    borderWidth: 1, borderColor: colors.line,
  },
  fieldLabel: { fontSize: 13, color: colors.inkSoft, marginBottom: 8, fontWeight: '600' },
  input: {
    borderWidth: 1, borderColor: colors.line, borderRadius: 8, paddingHorizontal: 12,
    paddingVertical: 10, fontSize: 15, color: colors.ink, backgroundColor: colors.paper, marginBottom: 10,
  },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  // Catálogo desplegado: altura fija con scroll propio, para no alargar toda
  // la pantalla con 250+ pills — el botón de volver queda siempre visible debajo.
  pillScrollBox: { maxHeight: 260 },
  pill: {
    paddingHorizontal: 17, paddingVertical: 11, borderRadius: 24,
    borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.paper,
  },
  pillText: { fontSize: 14.5, color: colors.inkSoft },
  pillTextActive: { color: '#F8F5EA', fontWeight: '700' },
  morePill: { borderStyle: 'dashed', borderColor: colors.green, backgroundColor: colors.greenTint },
  toggleStandalone: { alignSelf: 'flex-start', marginTop: 10 },
  morePillText: { fontSize: 14.5, color: colors.greenDeep, fontWeight: '700' },
  catalogNote: { fontSize: 12.5, color: colors.stone, marginTop: 8 },
  emptyNote: { fontSize: 12.5, color: colors.terra, marginTop: 6 },
  productResults: { marginTop: 4, gap: 10 },
  productCard: {
    flexDirection: 'row', borderWidth: 1, borderColor: colors.line, borderRadius: 8,
    backgroundColor: colors.paper, overflow: 'hidden',
  },
  productAccent: { width: 5 },
  productMfg: { fontSize: 12, color: colors.stone, fontWeight: '700', paddingHorizontal: 12, paddingTop: 10 },
  productName: { fontSize: 15, color: colors.ink, fontWeight: '700', paddingHorizontal: 12, marginTop: 2 },
  productMeta: { fontSize: 12.5, color: colors.inkSoft, paddingHorizontal: 12, paddingBottom: 10, marginTop: 4 },
  distribBox: {
    paddingHorizontal: 12, paddingBottom: 12, marginTop: -4,
    borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 10,
  },
  distribLabel: { fontSize: 12, color: colors.stone, fontWeight: '700', marginBottom: 4 },
  distribName: { fontSize: 13.5, color: colors.ink, marginTop: 2 },
  distribEmpty: { fontSize: 12.5, color: colors.stone, fontStyle: 'italic' },
  searchBtn: {
    marginTop: 18, borderRadius: 8,
    paddingVertical: 15, alignItems: 'center',
  },
  searchBtnText: { color: '#F8F5EA', fontWeight: '700', fontSize: 15 },
  hint: { marginTop: 18, fontSize: 12.5, color: colors.stone, textAlign: 'center' },
});
