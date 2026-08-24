import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cropInterest, setCropInterest] = useState('');
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <Text style={styles.check}>✓</Text>
        <Text style={styles.thanksTitle}>Gracias — anotado.</Text>
        <Text style={styles.thanksText}>
          Así se vería la confirmación una vez conectado el registro real.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>Antes de construir todo el ecosistema</Text>
      <Text style={styles.title}>Súmate al piloto</Text>
      <Text style={styles.lede}>
        Esto es una prueba, no el producto final. Queremos confirmar si esto le resuelve un
        problema real a quien compra insumos en Baja California.
      </Text>

      <View style={styles.card}>
        <Text style={styles.fieldLabel}>Nombre</Text>
        <TextInput style={styles.input} placeholder="Tu nombre" placeholderTextColor={colors.stone} value={name} onChangeText={setName} />

        <Text style={styles.fieldLabel}>Correo</Text>
        <TextInput style={styles.input} placeholder="tucorreo@ejemplo.com" placeholderTextColor={colors.stone} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

        <Text style={styles.fieldLabel}>Cultivo principal</Text>
        <TextInput style={styles.input} placeholder="Ej. Tomate, fresa, trigo…" placeholderTextColor={colors.stone} value={cropInterest} onChangeText={setCropInterest} />

        <Pressable style={styles.submitBtn} onPress={() => setSent(true)}>
          <Text style={styles.submitBtnText}>Enviar registro</Text>
        </Pressable>
        <Text style={styles.formNote}>
          Demostración — este formulario no envía datos a un servidor.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  centered: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  content: { padding: 20, paddingTop: 24, paddingBottom: 48 },
  eyebrow: {
    fontSize: 12, letterSpacing: 1, textTransform: 'uppercase',
    color: colors.green, fontWeight: '700', marginBottom: 6,
  },
  title: { fontSize: 26, fontWeight: '700', color: colors.ink, marginBottom: 8 },
  lede: { fontSize: 14, color: colors.inkSoft, lineHeight: 20, marginBottom: 20 },
  card: {
    backgroundColor: colors.paperRaised, borderRadius: 10, borderWidth: 1,
    borderColor: colors.line, padding: 18,
  },
  fieldLabel: { fontSize: 13, color: colors.inkSoft, marginBottom: 6, marginTop: 12, fontWeight: '600' },
  input: {
    borderWidth: 1, borderColor: colors.line, borderRadius: 8, paddingHorizontal: 12,
    paddingVertical: 10, fontSize: 15, color: colors.ink, backgroundColor: colors.paper,
  },
  submitBtn: {
    marginTop: 20, backgroundColor: colors.green, borderRadius: 8,
    paddingVertical: 14, alignItems: 'center',
  },
  submitBtnText: { color: '#F8F5EA', fontWeight: '700', fontSize: 15 },
  formNote: { fontSize: 11.5, color: colors.stone, marginTop: 10, textAlign: 'center' },
  check: { fontSize: 40, color: colors.green, marginBottom: 12 },
  thanksTitle: { fontSize: 20, fontWeight: '700', color: colors.ink, marginBottom: 8 },
  thanksText: { fontSize: 14, color: colors.inkSoft, textAlign: 'center' },
});
