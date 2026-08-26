import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { supabase } from '../supabase';

export default function UserAccountScreen({ session, onLoggedOut }) {
  const email = session?.user?.email || '';

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>Tu cuenta</Text>
        <Text style={styles.title}>Hola{email ? `, ${email}` : ''}</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Próximamente</Text>
          <Text style={styles.cardText}>
            Aquí vas a poder guardar tus productos favoritos, tus cultivos, tu historial de
            consultas y tus comparaciones — por ahora tu cuenta solo guarda el acceso.
          </Text>
        </View>

        <Pressable
          style={styles.logoutBtn}
          onPress={async () => { await supabase.auth.signOut(); onLoggedOut(); }}
        >
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { padding: 20, paddingTop: 24 },
  eyebrow: {
    fontSize: 12, letterSpacing: 1, textTransform: 'uppercase',
    color: colors.green, fontWeight: '700', marginBottom: 8,
  },
  title: { fontSize: 22, fontWeight: '700', color: colors.ink, marginBottom: 20 },
  card: {
    backgroundColor: colors.paperRaised, borderRadius: 10, borderWidth: 1,
    borderColor: colors.line, padding: 18, marginBottom: 20,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.ink, marginBottom: 8 },
  cardText: { fontSize: 13.5, color: colors.inkSoft, lineHeight: 19 },
  logoutBtn: {
    borderWidth: 1, borderColor: colors.terra, borderRadius: 8,
    paddingVertical: 14, alignItems: 'center',
  },
  logoutText: { color: colors.terra, fontWeight: '700', fontSize: 15 },
});
