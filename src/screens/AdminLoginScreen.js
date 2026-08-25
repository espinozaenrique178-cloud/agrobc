import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { colors } from '../theme';
import { supabase } from '../supabase';

export default function AdminLoginScreen({ onLoggedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError('');
    if (!email.trim() || !password) {
      setError('Ingresa correo y contraseña.');
      return;
    }
    setLoading(true);
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (signInError) {
      setLoading(false);
      setError('No se pudo iniciar sesión: ' + signInError.message);
      return;
    }
    const { data: isAdmin, error: rpcError } = await supabase.rpc('is_admin');
    setLoading(false);
    if (rpcError || !isAdmin) {
      await supabase.auth.signOut();
      setError('Esta cuenta no tiene permiso de administrador.');
      return;
    }
    onLoggedIn(data.session);
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <Text style={styles.eyebrow}>Acceso restringido</Text>
        <Text style={styles.title}>Iniciar sesión como administrador</Text>
        <Text style={styles.lede}>
          Esta pantalla es independiente de cualquier acceso de usuario público. Solo cuentas
          dadas de alta manualmente pueden entrar.
        </Text>

        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Correo</Text>
          <TextInput
            style={styles.input}
            placeholder="admin@agrobc.mx"
            placeholderTextColor={colors.stone}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={colors.stone}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={handleLogin}
          />
          <Pressable style={styles.btn} onPress={handleLogin} disabled={loading}>
            <Text style={styles.btnText}>{loading ? 'Entrando…' : 'Entrar'}</Text>
          </Pressable>
          {!!error && <Text style={styles.error}>{error}</Text>}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { padding: 20, paddingTop: 32 },
  eyebrow: {
    fontSize: 12, letterSpacing: 1, textTransform: 'uppercase',
    color: colors.green, fontWeight: '700', marginBottom: 8,
  },
  title: { fontSize: 22, fontWeight: '700', color: colors.ink, marginBottom: 8 },
  lede: { fontSize: 13.5, color: colors.inkSoft, lineHeight: 19, marginBottom: 20 },
  card: {
    backgroundColor: colors.paperRaised, borderRadius: 10, borderWidth: 1,
    borderColor: colors.line, padding: 18,
  },
  fieldLabel: { fontSize: 13, color: colors.inkSoft, marginBottom: 6, fontWeight: '600' },
  input: {
    borderWidth: 1, borderColor: colors.line, borderRadius: 8, paddingHorizontal: 12,
    paddingVertical: 10, fontSize: 15, color: colors.ink, backgroundColor: colors.paper,
  },
  btn: {
    marginTop: 18, backgroundColor: colors.green, borderRadius: 8,
    paddingVertical: 14, alignItems: 'center',
  },
  btnText: { color: '#F8F5EA', fontWeight: '700', fontSize: 15 },
  error: { color: colors.terra, fontSize: 13, marginTop: 12 },
});
