import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from './src/theme';
import HomeScreen from './src/screens/HomeScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import ManufacturersScreen from './src/screens/ManufacturersScreen';
import SignupScreen from './src/screens/SignupScreen';

const TABS = [
  { key: 'buscar', label: 'Buscar' },
  { key: 'fabricantes', label: 'Fabricantes' },
  { key: 'sumate', label: 'Súmate' },
];

export default function App() {
  const [tab, setTab] = useState('buscar');
  const [search, setSearch] = useState(null); // { crop, problem } | null

  function goTab(key) {
    setSearch(null);
    setTab(key);
  }

  let content;
  if (tab === 'buscar' && search) {
    content = (
      <ResultsScreen crop={search.crop} problem={search.problem} onBack={() => setSearch(null)} />
    );
  } else if (tab === 'buscar') {
    content = <HomeScreen onSearch={(crop, problem) => setSearch({ crop, problem })} />;
  } else if (tab === 'fabricantes') {
    content = <ManufacturersScreen />;
  } else {
    content = <SignupScreen />;
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.logo}>
          AgroBC<Text style={{ color: colors.terra }}>.</Text>
        </Text>
      </View>

      <View style={styles.body}>{content}</View>

      <View style={styles.tabBar}>
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <Pressable key={t.key} style={styles.tabItem} onPress={() => goTab(t.key)}>
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{t.label}</Text>
              {active && <View style={styles.tabDot} />}
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  header: {
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.line,
    backgroundColor: colors.paper,
  },
  logo: { fontSize: 18, fontWeight: '800', color: colors.ink },
  body: { flex: 1 },
  tabBar: {
    flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.line,
    backgroundColor: colors.paperRaised,
    paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 4 : 10,
  },
  tabItem: { flex: 1, alignItems: 'center', paddingBottom: 8 },
  tabLabel: { fontSize: 13, color: colors.stone, fontWeight: '600' },
  tabLabelActive: { color: colors.green },
  tabDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.green, marginTop: 6 },
});
