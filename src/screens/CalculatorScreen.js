import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { colors } from '../theme';

// Familias de unidades: todo se normaliza a una unidad base para poder
// convertir entre las demás de la misma familia.
const UNIT_FAMILIES = {
  liquido: {
    label: 'Líquido',
    baseUnit: 'mL',
    units: [
      { key: 'mL', label: 'mL', toBase: 1 },
      { key: 'L', label: 'L', toBase: 1000 },
    ],
  },
  granulado: {
    label: 'Granulado',
    baseUnit: 'g',
    units: [
      { key: 'g', label: 'g', toBase: 1 },
      { key: 'kg', label: 'kg', toBase: 1000 },
      { key: 'ton', label: 'ton', toBase: 1000000 },
    ],
  },
};

function fmt(n) {
  if (!isFinite(n)) return '—';
  const rounded = Math.round(n * 100) / 100;
  return rounded.toLocaleString('es-MX', { maximumFractionDigits: 2 });
}

export default function CalculatorScreen() {
  const [productType, setProductType] = useState('liquido');
  const [doseUnit, setDoseUnit] = useState('mL');
  const [doseValue, setDoseValue] = useState('');
  const [hectares, setHectares] = useState('');

  const family = UNIT_FAMILIES[productType];

  function pickType(type) {
    setProductType(type);
    setDoseUnit(UNIT_FAMILIES[type].units[0].key);
  }

  const result = useMemo(() => {
    const dose = parseFloat(doseValue.replace(',', '.'));
    const ha = parseFloat(hectares.replace(',', '.'));
    if (!dose || !ha || dose <= 0 || ha <= 0) return null;

    const unit = family.units.find((u) => u.key === doseUnit) || family.units[0];
    const totalBase = dose * unit.toBase * ha; // total en unidad base (mL o g)

    return {
      primaryUnit: unit,
      totalInPrimary: totalBase / unit.toBase,
      equivalences: family.units
        .filter((u) => u.key !== unit.key)
        .map((u) => ({ unit: u, value: totalBase / u.toBase })),
    };
  }, [doseValue, hectares, doseUnit, family]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>Herramienta</Text>
      <Text style={styles.title}>Calculadora de dosificación</Text>
      <Text style={styles.lede}>
        Calcula cuánto producto necesitas según la dosis indicada por el fabricante y la
        superficie a tratar.
      </Text>

      <View style={styles.card}>
        <Text style={styles.fieldLabel}>Tipo de producto</Text>
        <View style={styles.chipRow}>
          {Object.entries(UNIT_FAMILIES).map(([key, f]) => (
            <Pressable
              key={key}
              style={[styles.chip, productType === key && styles.chipActive]}
              onPress={() => pickType(key)}
            >
              <Text style={[styles.chipText, productType === key && styles.chipTextActive]}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.fieldLabel}>Dosis indicada por el fabricante (por hectárea)</Text>
        <View style={styles.doseRow}>
          <TextInput
            style={[styles.input, styles.doseInput]}
            placeholder="Ej. 2"
            placeholderTextColor={colors.stone}
            keyboardType="decimal-pad"
            value={doseValue}
            onChangeText={setDoseValue}
          />
          <View style={styles.unitChipRow}>
            {family.units.map((u) => (
              <Pressable
                key={u.key}
                style={[styles.unitChip, doseUnit === u.key && styles.chipActive]}
                onPress={() => setDoseUnit(u.key)}
              >
                <Text style={[styles.chipText, doseUnit === u.key && styles.chipTextActive]}>
                  {u.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Text style={styles.fieldLabel}>Hectáreas a tratar</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. 3.5"
          placeholderTextColor={colors.stone}
          keyboardType="decimal-pad"
          value={hectares}
          onChangeText={setHectares}
        />
      </View>

      {result ? (
        <View style={[styles.card, styles.resultCard]}>
          <Text style={styles.resultLabel}>Producto total necesario</Text>
          <Text style={styles.resultAmount}>
            {fmt(result.totalInPrimary)} {result.primaryUnit.label}
          </Text>
          <View style={styles.equivList}>
            {result.equivalences.map((e) => (
              <View key={e.unit.key} style={styles.equivRow}>
                <Text style={styles.equivLabel}>Equivale a</Text>
                <Text style={styles.equivValue}>
                  {fmt(e.value)} {e.unit.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View style={[styles.card, styles.emptyCard]}>
          <Text style={styles.emptyText}>
            Ingresa la dosis y las hectáreas para ver el resultado.
          </Text>
        </View>
      )}

      <Text style={styles.footNote}>
        ◍ Esta calculadora es una guía de referencia — sigue siempre las instrucciones y dosis
        de la etiqueta oficial del producto.
      </Text>
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
  lede: { fontSize: 14, color: colors.inkSoft, lineHeight: 20, marginBottom: 20 },
  card: {
    backgroundColor: colors.paperRaised, borderRadius: 10, borderWidth: 1,
    borderColor: colors.line, padding: 18, marginBottom: 16,
  },
  fieldLabel: { fontSize: 13, color: colors.inkSoft, marginTop: 12, marginBottom: 8, fontWeight: '600' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1, borderColor: colors.line, borderRadius: 20,
    paddingHorizontal: 15, paddingVertical: 9, backgroundColor: colors.paper,
  },
  chipActive: { backgroundColor: colors.green, borderColor: colors.green },
  chipText: { fontSize: 13.5, color: colors.inkSoft, fontWeight: '600' },
  chipTextActive: { color: '#F8F5EA' },
  input: {
    borderWidth: 1, borderColor: colors.line, borderRadius: 8, paddingHorizontal: 12,
    paddingVertical: 10, fontSize: 15, color: colors.ink, backgroundColor: colors.paper,
  },
  doseRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  doseInput: { flex: 1 },
  unitChipRow: { flexDirection: 'row', gap: 6 },
  unitChip: {
    borderWidth: 1, borderColor: colors.line, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 9, backgroundColor: colors.paper,
  },
  resultCard: { borderColor: colors.green },
  resultLabel: { fontSize: 12.5, color: colors.inkSoft, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  resultAmount: { fontSize: 30, fontWeight: '700', color: colors.terra, marginTop: 6 },
  equivList: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.line, gap: 8 },
  equivRow: { flexDirection: 'row', justifyContent: 'space-between' },
  equivLabel: { fontSize: 13, color: colors.stone },
  equivValue: { fontSize: 13, color: colors.ink, fontWeight: '600' },
  emptyCard: { alignItems: 'center' },
  emptyText: { color: colors.stone, fontSize: 13.5, textAlign: 'center' },
  footNote: { fontSize: 12, color: colors.stone, textAlign: 'center', marginTop: 4 },
});
