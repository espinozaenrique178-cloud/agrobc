import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { colors } from '../theme';
import { supabase } from '../supabase';
import { setFertilizantes } from '../data/products';

const emptyForm = { name: '', mfg: '', presentation: '', price: '', ficha_tecnica: '' };

export default function AdminPanelScreen({ onLoggedOut, onDataChanged }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadRows = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase.from('fertilizantes').select('*').order('name');
    setLoading(false);
    if (fetchError) {
      setError('No se pudo cargar el catálogo: ' + fetchError.message);
      return;
    }
    setRows(data || []);
    setFertilizantes(data || []);
    onDataChanged && onDataChanged();
  }, [onDataChanged]);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  function startEdit(row) {
    setEditingId(row.id);
    setForm({
      name: row.name || '',
      mfg: row.mfg || '',
      presentation: row.presentation || '',
      price: String(row.price ?? ''),
      ficha_tecnica: row.ficha_tecnica || '',
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  }

  async function handleSave() {
    setError('');
    if (!form.name.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }
    const payload = {
      name: form.name.trim(),
      mfg: form.mfg.trim(),
      presentation: form.presentation.trim(),
      price: Number(form.price) || 0,
      ficha_tecnica: form.ficha_tecnica.trim(),
    };
    setSaving(true);
    const query = editingId
      ? supabase.from('fertilizantes').update(payload).eq('id', editingId)
      : supabase.from('fertilizantes').insert(payload);
    const { error: saveError } = await query;
    setSaving(false);
    if (saveError) {
      setError('No se pudo guardar: ' + saveError.message);
      return;
    }
    cancelEdit();
    loadRows();
  }

  function handleDelete(row) {
    Alert.alert(
      'Eliminar fertilizante',
      `¿Eliminar "${row.name}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const { error: delError } = await supabase.from('fertilizantes').delete().eq('id', row.id);
            if (delError) {
              setError('No se pudo eliminar: ' + delError.message);
              return;
            }
            loadRows();
          },
        },
      ]
    );
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    onLoggedOut();
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>Sesión de administrador</Text>
          <Text style={styles.title}>Panel de fertilizantes</Text>
        </View>
        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{editingId ? `Editar: ${form.name}` : 'Agregar fertilizante'}</Text>

        <Text style={styles.fieldLabel}>Nombre</Text>
        <TextInput style={styles.input} placeholder="Ej. YaraVita" placeholderTextColor={colors.stone}
          value={form.name} onChangeText={(v) => setForm((f) => ({ ...f, name: v }))} />

        <Text style={styles.fieldLabel}>Fabricante</Text>
        <TextInput style={styles.input} placeholder="Ej. Yara" placeholderTextColor={colors.stone}
          value={form.mfg} onChangeText={(v) => setForm((f) => ({ ...f, mfg: v }))} />

        <Text style={styles.fieldLabel}>Presentación</Text>
        <TextInput style={styles.input} placeholder="Ej. 25 kg" placeholderTextColor={colors.stone}
          value={form.presentation} onChangeText={(v) => setForm((f) => ({ ...f, presentation: v }))} />

        <Text style={styles.fieldLabel}>Precio (MXN)</Text>
        <TextInput style={styles.input} placeholder="Ej. 890" placeholderTextColor={colors.stone}
          keyboardType="numeric" value={form.price} onChangeText={(v) => setForm((f) => ({ ...f, price: v }))} />

        <Text style={styles.fieldLabel}>Ficha técnica (URL)</Text>
        <TextInput style={styles.input} placeholder="https://..." placeholderTextColor={colors.stone}
          autoCapitalize="none" value={form.ficha_tecnica} onChangeText={(v) => setForm((f) => ({ ...f, ficha_tecnica: v }))} />

        <View style={styles.actionsRow}>
          <Pressable style={styles.saveBtn} onPress={handleSave} disabled={saving}>
            <Text style={styles.saveBtnText}>{saving ? 'Guardando…' : 'Guardar'}</Text>
          </Pressable>
          {editingId && (
            <Pressable style={styles.cancelBtn} onPress={cancelEdit}>
              <Text style={styles.cancelBtnText}>Cancelar edición</Text>
            </Pressable>
          )}
        </View>
        {!!error && <Text style={styles.error}>{error}</Text>}
      </View>

      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.cardTitle}>Catálogo actual</Text>
          {loading && <ActivityIndicator color={colors.green} />}
        </View>

        {rows.map((row) => (
          <View key={row.id} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowName}>{row.name}</Text>
              <Text style={styles.rowMeta}>{row.mfg} · {row.presentation} · ${Number(row.price).toLocaleString('es-MX')}</Text>
            </View>
            <Pressable style={styles.rowBtn} onPress={() => startEdit(row)}>
              <Text style={styles.rowBtnText}>Editar</Text>
            </Pressable>
            <Pressable style={[styles.rowBtn, styles.rowBtnDanger]} onPress={() => handleDelete(row)}>
              <Text style={[styles.rowBtnText, { color: '#F8F5EA' }]}>Eliminar</Text>
            </Pressable>
          </View>
        ))}
        {!loading && rows.length === 0 && (
          <Text style={styles.emptyText}>Todavía no hay fertilizantes cargados.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { padding: 20, paddingTop: 24, paddingBottom: 48 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  eyebrow: {
    fontSize: 12, letterSpacing: 1, textTransform: 'uppercase',
    color: colors.green, fontWeight: '700', marginBottom: 6,
  },
  title: { fontSize: 22, fontWeight: '700', color: colors.ink },
  logoutBtn: { borderWidth: 1, borderColor: colors.terra, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  logoutText: { color: colors.terra, fontWeight: '600', fontSize: 13 },
  card: {
    backgroundColor: colors.paperRaised, borderRadius: 10, borderWidth: 1,
    borderColor: colors.line, padding: 18, marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.ink, marginBottom: 12 },
  fieldLabel: { fontSize: 13, color: colors.inkSoft, marginTop: 10, marginBottom: 6, fontWeight: '600' },
  input: {
    borderWidth: 1, borderColor: colors.line, borderRadius: 8, paddingHorizontal: 12,
    paddingVertical: 10, fontSize: 15, color: colors.ink, backgroundColor: colors.paper,
  },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  saveBtn: { backgroundColor: colors.green, borderRadius: 8, paddingVertical: 12, paddingHorizontal: 18 },
  saveBtnText: { color: '#F8F5EA', fontWeight: '700', fontSize: 14 },
  cancelBtn: { borderWidth: 1, borderColor: colors.terra, borderRadius: 8, paddingVertical: 12, paddingHorizontal: 18 },
  cancelBtnText: { color: colors.terra, fontWeight: '600', fontSize: 14 },
  error: { color: colors.terra, fontSize: 13, marginTop: 12 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderTopWidth: 1, borderTopColor: colors.line, paddingVertical: 12,
  },
  rowName: { fontSize: 15, fontWeight: '700', color: colors.ink },
  rowMeta: { fontSize: 12.5, color: colors.inkSoft, marginTop: 2 },
  rowBtn: { borderWidth: 1, borderColor: colors.line, borderRadius: 6, paddingVertical: 7, paddingHorizontal: 10 },
  rowBtnDanger: { backgroundColor: colors.terra, borderColor: colors.terra },
  rowBtnText: { fontSize: 12.5, fontWeight: '600', color: colors.inkSoft },
  emptyText: { color: colors.stone, fontSize: 13.5, textAlign: 'center', paddingVertical: 12 },
});
