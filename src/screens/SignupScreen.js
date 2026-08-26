import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { supabase } from '../supabase';

export default function SignupScreen({ onSignedUp, onBack }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cropInterest, setCropInterest] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  async function handleSubmit() {
    setError('');
    if (!email.trim() || !password) {
      setError('Correo y contraseña son obligatorios.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { name: name.trim(), crop_interest: cropInterest.trim() },
      },
    });
    setLoading(false);
    if (signUpError) {
      setError('No se pudo crear la cuenta: ' + signUpError.message);
      return;
    }
    if (data.session) {
      onSignedUp(data.session, false);
    } else {
      setNeedsConfirmation(true);
    }
  }

  if (needsConfirmation) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <Text style={styles.check}>✓</Text>
        <Text style={styles.thanksTitle}>Revisa tu correo</Text>
        <Text style={styles.thanksText}>
          Te mandamos un enlace de confirmación a {email}. Confírmalo y ya puedes iniciar
          sesión.
        </Text>
        <Pressable style={styles.backLink} onPress={onBack}>
          <Text style={styles.backLinkText}>‹ Volver</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Pressable onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backText}>‹ Volver</Text>
      </Pressable>

      <Text style={styles.eyebrow}>Antes de construir todo el ecosistema</Text>
      <Text style={styles.title}>Súmate al piloto</Text>
      <Text style={styles.lede}>
        Crea tu cuenta para guardar tus productos favoritos, tus cultivos y tu historial de
        consultas.
      </Text>

      <View style={styles.card}>
        <Text style={styles.fieldLabel}>Nombre</Text>
        <TextInput style={styles.input} placeholder="Tu nombre" placeholderTextColor={colors.stone} value={name} onChangeText={setName} />

        <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Correo</Text>
        <TextInput style={styles.input} placeholder="tucorreo@ejemplo.com" placeholderTextColor={colors.stone} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

        <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Contraseña</Text>
        <TextInput style={styles.input} placeholderTextColor={colors.stone} secureTextEntry value={password} onChangeText={setPassword} />

        <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Cultivo principal</Text>
        <TextInput style={styles.input} placeholder="Ej. Tomate, fresa, trigo…" placeholderTextColor={colors.stone} value={cropInterest} onChangeText={setCropInterest} />

        <Pressable style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.submitBtnText}>{loading ? 'Creando cuenta…' : 'Crear cuenta'}</Text>
        </Pressable>
        {!!error && <Text style={styles.error}>{error}</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  centered: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  content: { padding: 20, paddingTop: 16, paddingBottom: 140 },
  backBtn: { marginBottom: 16 },
  backText: { color: colors.green, fontWeight: '600', fontSize: 15 },
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
  fieldLabel: { fontSize: 13, color: colors.inkSoft, marginBottom: 6, fontWeight: '600' },
  input: {
    borderWidth: 1, borderColor: colors.line, borderRadius: 8, paddingHorizontal: 12,
    paddingVertical: 10, fontSize: 15, color: colors.ink, backgroundColor: colors.paper,
  },
  submitBtn: {
    marginTop: 20, backgroundColor: colors.green, borderRadius: 8,
    paddingVertical: 14, alignItems: 'center',
  },
  submitBtnText: { color: '#F8F5EA', fontWeight: '700', fontSize: 15 },
  error: { color: colors.terra, fontSize: 13, marginTop: 12 },
  check: { fontSize: 40, color: colors.green, marginBottom: 12 },
  thanksTitle: { fontSize: 20, fontWeight: '700', color: colors.ink, marginBottom: 8 },
  thanksText: { fontSize: 14, color: colors.inkSoft, textAlign: 'center' },
  backLink: { marginTop: 20 },
  backLinkText: { color: colors.green, fontWeight: '600', fontSize: 15 },
});
