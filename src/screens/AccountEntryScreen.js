import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function AccountEntryScreen({ onPickLogin, onPickSignup }) {
  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>Tu cuenta</Text>
        <Text style={styles.title}>Entra o crea tu cuenta</Text>
        <Text style={styles.lede}>
          Si ya tienes cuenta, inicia sesión — te llevamos directo a tu panel de administrador
          o a tu cuenta, según corresponda. Si no tienes, súmate al piloto.
        </Text>

        <Pressable style={styles.primaryBtn} onPress={onPickLogin}>
          <Text style={styles.primaryBtnText}>Iniciar sesión</Text>
        </Pressable>
        <Pressable style={styles.secondaryBtn} onPress={onPickSignup}>
          <Text style={styles.secondaryBtnText}>Súmate (crear cuenta)</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { padding: 20, paddingTop: 40 },
  eyebrow: {
    fontSize: 12, letterSpacing: 1, textTransform: 'uppercase',
    color: colors.green, fontWeight: '700', marginBottom: 8,
  },
  title: { fontSize: 24, fontWeight: '700', color: colors.ink, marginBottom: 10 },
  lede: { fontSize: 14, color: colors.inkSoft, lineHeight: 20, marginBottom: 28 },
  primaryBtn: {
    backgroundColor: colors.green, borderRadius: 8,
    paddingVertical: 15, alignItems: 'center',
  },
  primaryBtnText: { color: '#F8F5EA', fontWeight: '700', fontSize: 15 },
  secondaryBtn: {
    marginTop: 12, borderWidth: 1, borderColor: colors.green, borderRadius: 8,
    paddingVertical: 15, alignItems: 'center',
  },
  secondaryBtnText: { color: colors.green, fontWeight: '700', fontSize: 15 },
});
