import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { colors, categoryColors } from '../theme';
import { CROPS, PROBLEMS, CATEGORY_BY_PROBLEM } from '../data/products';

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
  const [crop, setCrop] = useState('Tomate');
  const [problem, setProblem] = useState('Plaga');

  const filteredCrops = useMemo(
    () => CROPS.filter((c) => c.toLowerCase().includes(cropQuery.trim().toLowerCase())),
    [cropQuery]
  );
  const filteredProblems = useMemo(
    () => PROBLEMS.filter((p) => p.toLowerCase().includes(problemQuery.trim().toLowerCase())),
    [problemQuery]
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
        Productos agrícolas disponibles en Baja California, comparados por ficha técnica,
        presentación y precio — sin favoritismos de marca.
      </Text>

      <View style={styles.card}>
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
        <View style={styles.pillRow}>
          {filteredCrops.map((c) => (
            <Pill key={c} label={c} active={crop === c} accentColor={colors.green} onPress={() => pickCrop(c)} />
          ))}
        </View>
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
        <View style={styles.pillRow}>
          {filteredProblems.map((p) => {
            const cat = CATEGORY_BY_PROBLEM[p];
            const accent = cat ? categoryColors[cat].main : colors.green;
            return (
              <Pill key={p} label={p} active={problem === p} accentColor={accent} onPress={() => pickProblem(p)} />
            );
          })}
        </View>
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
  content: { padding: 20, paddingTop: 24, paddingBottom: 48 },
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
  pill: {
    paddingHorizontal: 17, paddingVertical: 11, borderRadius: 24,
    borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.paper,
  },
  pillText: { fontSize: 14.5, color: colors.inkSoft },
  pillTextActive: { color: '#F8F5EA', fontWeight: '700' },
  emptyNote: { fontSize: 12.5, color: colors.terra, marginTop: 6 },
  searchBtn: {
    marginTop: 18, borderRadius: 8,
    paddingVertical: 15, alignItems: 'center',
  },
  searchBtnText: { color: '#F8F5EA', fontWeight: '700', fontSize: 15 },
  hint: { marginTop: 18, fontSize: 12.5, color: colors.stone, textAlign: 'center' },
});
