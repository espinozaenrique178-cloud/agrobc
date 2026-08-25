import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { colors } from '../theme';
import { supabase } from '../supabase';
import { setProducts, addCrops, CATEGORY_LABEL } from '../data/products';

const TABS = [
  { key: 'productos', label: 'Productos' },
  { key: 'cultivos', label: 'Cultivos' },
  { key: 'analitica', label: 'Analítica' },
];

const CATEGORIES = ['plaga', 'enfermedad', 'maleza', 'nutricion'];

const emptyProductForm = {
  category: 'plaga', name: '', mfg: '', type: '', ingredient: '',
  presentation: '', price: '', crops: '', ficha_tecnica: '',
};

export default function AdminPanelScreen({ onLoggedOut, onDataChanged }) {
  const [tab, setTab] = useState('productos');

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.eyebrow}>Sesión de administrador</Text>
          <Text style={styles.title}>Panel de AgroBC</Text>
        </View>
        <Pressable
          style={styles.logoutBtn}
          onPress={async () => { await supabase.auth.signOut(); onLoggedOut(); }}
        >
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>
      </View>

      <View style={styles.tabRow}>
        {TABS.map((t) => (
          <Pressable
            key={t.key}
            style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabBtnText, tab === t.key && styles.tabBtnTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      {tab === 'productos' && <ProductosTab onDataChanged={onDataChanged} />}
      {tab === 'cultivos' && <CultivosTab onDataChanged={onDataChanged} />}
      {tab === 'analitica' && <AnaliticaTab />}
    </ScrollView>
  );
}

function ProductosTab({ onDataChanged }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyProductForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadRows = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase.from('productos').select('*').order('category').order('name');
    setLoading(false);
    if (fetchError) { setError('No se pudo cargar: ' + fetchError.message); return; }
    setRows(data || []);
    setProducts(data || []);
    onDataChanged && onDataChanged();
  }, [onDataChanged]);

  useEffect(() => { loadRows(); }, [loadRows]);

  function startEdit(row) {
    setEditingId(row.id);
    setForm({
      category: row.category,
      name: row.name || '',
      mfg: row.mfg || '',
      type: row.type || '',
      ingredient: row.ingredient || '',
      presentation: row.presentation || '',
      price: String(row.price ?? ''),
      crops: (row.crops || []).join(', '),
      ficha_tecnica: row.ficha_tecnica || '',
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyProductForm);
    setError('');
  }

  async function handleSave() {
    setError('');
    if (!form.name.trim()) { setError('El nombre es obligatorio.'); return; }
    const crops = form.crops.trim()
      ? form.crops.split(',').map((s) => s.trim()).filter(Boolean)
      : ['any'];
    const payload = {
      category: form.category,
      name: form.name.trim(),
      mfg: form.mfg.trim(),
      type: form.type.trim(),
      ingredient: form.ingredient.trim(),
      presentation: form.presentation.trim(),
      price: Number(form.price) || 0,
      crops,
      ficha_tecnica: form.ficha_tecnica.trim(),
    };
    setSaving(true);
    const query = editingId
      ? supabase.from('productos').update(payload).eq('id', editingId)
      : supabase.from('productos').insert(payload);
    const { error: saveError } = await query;
    setSaving(false);
    if (saveError) { setError('No se pudo guardar: ' + saveError.message); return; }
    cancelEdit();
    loadRows();
  }

  function handleDelete(row) {
    Alert.alert('Eliminar producto', `¿Eliminar "${row.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          const { error: delError } = await supabase.from('productos').delete().eq('id', row.id);
          if (delError) { setError('No se pudo eliminar: ' + delError.message); return; }
          loadRows();
        },
      },
    ]);
  }

  return (
    <View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{editingId ? `Editar: ${form.name}` : 'Agregar producto'}</Text>

        <Text style={styles.fieldLabel}>Categoría</Text>
        <View style={styles.chipRow}>
          {CATEGORIES.map((c) => (
            <Pressable
              key={c}
              style={[styles.chip, form.category === c && styles.chipActive]}
              onPress={() => setForm((f) => ({ ...f, category: c }))}
            >
              <Text style={[styles.chipText, form.category === c && styles.chipTextActive]}>{CATEGORY_LABEL[c]}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.fieldLabel}>Nombre</Text>
        <TextInput style={styles.input} placeholder="Ej. Sivanto Prime" placeholderTextColor={colors.stone}
          value={form.name} onChangeText={(v) => setForm((f) => ({ ...f, name: v }))} />

        <Text style={styles.fieldLabel}>Fabricante</Text>
        <TextInput style={styles.input} placeholder="Ej. Bayer" placeholderTextColor={colors.stone}
          value={form.mfg} onChangeText={(v) => setForm((f) => ({ ...f, mfg: v }))} />

        <Text style={styles.fieldLabel}>Tipo</Text>
        <TextInput style={styles.input} placeholder="Ej. Insecticida" placeholderTextColor={colors.stone}
          value={form.type} onChangeText={(v) => setForm((f) => ({ ...f, type: v }))} />

        <Text style={styles.fieldLabel}>Ingrediente activo</Text>
        <TextInput style={styles.input} placeholder="Opcional" placeholderTextColor={colors.stone}
          value={form.ingredient} onChangeText={(v) => setForm((f) => ({ ...f, ingredient: v }))} />

        <Text style={styles.fieldLabel}>Presentación</Text>
        <TextInput style={styles.input} placeholder="Ej. 1 L" placeholderTextColor={colors.stone}
          value={form.presentation} onChangeText={(v) => setForm((f) => ({ ...f, presentation: v }))} />

        <Text style={styles.fieldLabel}>Precio (MXN)</Text>
        <TextInput style={styles.input} placeholder="Ej. 480" placeholderTextColor={colors.stone}
          keyboardType="numeric" value={form.price} onChangeText={(v) => setForm((f) => ({ ...f, price: v }))} />

        <Text style={styles.fieldLabel}>Cultivos (separados por coma, o "any")</Text>
        <TextInput style={styles.input} placeholder="Tomate, Fresa, Chile" placeholderTextColor={colors.stone}
          value={form.crops} onChangeText={(v) => setForm((f) => ({ ...f, crops: v }))} />

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
              <Text style={styles.rowTag}>{CATEGORY_LABEL[row.category]}</Text>
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
        {!loading && rows.length === 0 && <Text style={styles.emptyText}>Todavía no hay productos cargados.</Text>}
      </View>
    </View>
  );
}

function CultivosTab({ onDataChanged }) {
  const [rows, setRows] = useState([]);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadRows = useCallback(async () => {
    const { data, error: fetchError } = await supabase.from('crops').select('*').order('sort_order');
    if (fetchError) { setError('No se pudo cargar: ' + fetchError.message); return; }
    setRows(data || []);
  }, []);

  useEffect(() => { loadRows(); }, [loadRows]);

  async function handleAdd() {
    setError('');
    if (!name.trim()) { setError('El nombre es obligatorio.'); return; }
    setSaving(true);
    const { error: saveError } = await supabase.from('crops').insert({
      name: name.trim(), emoji: emoji.trim() || '🌱', sort_order: 999,
    });
    setSaving(false);
    if (saveError) { setError('No se pudo guardar: ' + saveError.message); return; }
    setName(''); setEmoji('');
    loadRows();
    const { data } = await supabase.from('crops').select('*').order('sort_order');
    if (data) { addCrops(data); onDataChanged && onDataChanged(); }
  }

  function handleDelete(row) {
    Alert.alert('Eliminar cultivo', `¿Eliminar "${row.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          const { error: delError } = await supabase.from('crops').delete().eq('id', row.id);
          if (delError) { setError('No se pudo eliminar: ' + delError.message); return; }
          loadRows();
        },
      },
    ]);
  }

  return (
    <View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Agregar cultivo</Text>
        <Text style={styles.fieldLabel}>Nombre</Text>
        <TextInput style={styles.input} placeholder="Ej. Espárrago" placeholderTextColor={colors.stone}
          value={name} onChangeText={setName} />
        <Text style={styles.fieldLabel}>Emoji</Text>
        <TextInput style={styles.input} placeholder="🌱" placeholderTextColor={colors.stone}
          value={emoji} onChangeText={setEmoji} />
        <Pressable style={styles.saveBtn} onPress={handleAdd} disabled={saving}>
          <Text style={styles.saveBtnText}>{saving ? 'Guardando…' : 'Agregar'}</Text>
        </Pressable>
        {!!error && <Text style={styles.error}>{error}</Text>}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Cultivos actuales</Text>
        <Text style={styles.hintText}>
          Los 12 originales viven en el código como respaldo — eliminarlos aquí no los quita de ahí.
          Los que agregues aquí sí aparecen y desaparecen en vivo.
        </Text>
        {rows.map((row) => (
          <View key={row.id} style={styles.row}>
            <Text style={[styles.rowName, { flex: 1 }]}>{row.emoji} {row.name}</Text>
            <Pressable style={[styles.rowBtn, styles.rowBtnDanger]} onPress={() => handleDelete(row)}>
              <Text style={[styles.rowBtnText, { color: '#F8F5EA' }]}>Eliminar</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}

function AnaliticaTab() {
  const [totals, setTotals] = useState(null);
  const [stats, setStats] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [totalsRes, statsRes] = await Promise.all([
        supabase.rpc('search_totals'),
        supabase.rpc('search_stats'),
      ]);
      setLoading(false);
      if (statsRes.error) { setError('No se pudo cargar la analítica: ' + statsRes.error.message); return; }
      setTotals(totalsRes.data && totalsRes.data[0]);
      setStats(statsRes.data || []);
    })();
  }, []);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Qué busca la gente</Text>
      {loading && <ActivityIndicator color={colors.green} />}
      {!!totals && (
        <View style={styles.statRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{totals.total_searches || 0}</Text>
            <Text style={styles.statLabel}>Búsquedas totales</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>
              {totals.total_since ? new Date(totals.total_since).toLocaleDateString('es-MX') : '—'}
            </Text>
            <Text style={styles.statLabel}>Desde</Text>
          </View>
        </View>
      )}
      {stats.map((row, i) => (
        <View key={i} style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowName}>{row.crop} + {row.problem}</Text>
            <Text style={styles.rowMeta}>{CATEGORY_LABEL[row.category] || row.category || '—'}</Text>
          </View>
          <Text style={styles.statInline}>{row.total}</Text>
        </View>
      ))}
      {!loading && stats.length === 0 && <Text style={styles.emptyText}>Todavía no hay búsquedas registradas.</Text>}
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
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
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  tabBtn: {
    borderWidth: 1, borderColor: colors.line, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.paperRaised,
  },
  tabBtnActive: { backgroundColor: colors.green, borderColor: colors.green },
  tabBtnText: { fontSize: 13, fontWeight: '600', color: colors.inkSoft },
  tabBtnTextActive: { color: '#F8F5EA' },
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
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1, borderColor: colors.line, borderRadius: 20,
    paddingHorizontal: 13, paddingVertical: 7, backgroundColor: colors.paper,
  },
  chipActive: { backgroundColor: colors.green, borderColor: colors.green },
  chipText: { fontSize: 13, color: colors.inkSoft, fontWeight: '600' },
  chipTextActive: { color: '#F8F5EA' },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  saveBtn: { backgroundColor: colors.green, borderRadius: 8, paddingVertical: 12, paddingHorizontal: 18, marginTop: 16, alignSelf: 'flex-start' },
  saveBtnText: { color: '#F8F5EA', fontWeight: '700', fontSize: 14 },
  cancelBtn: { borderWidth: 1, borderColor: colors.terra, borderRadius: 8, paddingVertical: 12, paddingHorizontal: 18 },
  cancelBtnText: { color: colors.terra, fontWeight: '600', fontSize: 14 },
  error: { color: colors.terra, fontSize: 13, marginTop: 12 },
  hintText: { fontSize: 12.5, color: colors.stone, marginBottom: 6 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderTopWidth: 1, borderTopColor: colors.line, paddingVertical: 12,
  },
  rowTag: {
    fontSize: 10.5, fontWeight: '700', color: colors.green, textTransform: 'uppercase', letterSpacing: 0.4,
  },
  rowName: { fontSize: 15, fontWeight: '700', color: colors.ink },
  rowMeta: { fontSize: 12.5, color: colors.inkSoft, marginTop: 2 },
  rowBtn: { borderWidth: 1, borderColor: colors.line, borderRadius: 6, paddingVertical: 7, paddingHorizontal: 10 },
  rowBtnDanger: { backgroundColor: colors.terra, borderColor: colors.terra },
  rowBtnText: { fontSize: 12.5, fontWeight: '600', color: colors.inkSoft },
  emptyText: { color: colors.stone, fontSize: 13.5, textAlign: 'center', paddingVertical: 12 },
  statRow: { flexDirection: 'row', gap: 12, marginTop: 8, marginBottom: 4 },
  statBox: { backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, borderRadius: 8, padding: 12, minWidth: 120 },
  statNum: { fontSize: 20, fontWeight: '700', color: colors.greenDeep },
  statLabel: { fontSize: 11.5, color: colors.stone, marginTop: 2 },
  statInline: { fontSize: 16, fontWeight: '700', color: colors.terra, fontVariant: ['tabular-nums'] },
});
