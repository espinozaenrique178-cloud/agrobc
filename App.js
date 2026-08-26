import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { colors } from './src/theme';
import { supabase } from './src/supabase';
import { setProducts, addCrops, CATEGORY_BY_PROBLEM } from './src/data/products';
import FloatingTabBar from './src/components/FloatingTabBar';
import HomeScreen from './src/screens/HomeScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import ManufacturersScreen from './src/screens/ManufacturersScreen';
import CalculatorScreen from './src/screens/CalculatorScreen';
import AccountEntryScreen from './src/screens/AccountEntryScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import AdminPanelScreen from './src/screens/AdminPanelScreen';
import UserAccountScreen from './src/screens/UserAccountScreen';

export default function App() {
  const [tab, setTab] = useState('buscar');
  const [search, setSearch] = useState(null); // { crop, problem } | null
  const [dataVersion, setDataVersion] = useState(0);

  // Cuenta: session/role vienen de Supabase Auth; accountView solo controla
  // qué pantalla se muestra ANTES de que haya sesión (entry/login/signup).
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [accountView, setAccountView] = useState('entry'); // 'entry' | 'login' | 'signup'

  useEffect(() => {
    supabase.from('productos').select('*').order('name').then(({ data }) => {
      if (data && data.length) {
        setProducts(data);
        setDataVersion((v) => v + 1);
      }
    });
    supabase.from('crops').select('*').order('sort_order').then(({ data }) => {
      if (data && data.length) {
        addCrops(data);
        setDataVersion((v) => v + 1);
      }
    });
  }, []);

  function goTab(key) {
    setSearch(null);
    setTab(key);
  }

  function handleSearch(crop, problem) {
    setSearch({ crop, problem });
    supabase.from('search_logs').insert({
      crop,
      problem,
      category: CATEGORY_BY_PROBLEM[problem] || null,
    });
  }

  function handleAuthed(newSession, admin) {
    setSession(newSession);
    setIsAdmin(admin);
    setAccountView('entry');
  }

  function handleLoggedOut() {
    setSession(null);
    setIsAdmin(false);
    setAccountView('entry');
  }

  let content;
  if (tab === 'buscar' && search) {
    content = (
      <ResultsScreen key={dataVersion} crop={search.crop} problem={search.problem} onBack={() => setSearch(null)} />
    );
  } else if (tab === 'buscar') {
    content = <HomeScreen key={dataVersion} onSearch={handleSearch} />;
  } else if (tab === 'fabricantes') {
    content = <ManufacturersScreen />;
  } else if (tab === 'calculadora') {
    content = <CalculatorScreen />;
  } else if (tab === 'admin') {
    if (session && isAdmin) {
      content = (
        <AdminPanelScreen
          onLoggedOut={handleLoggedOut}
          onDataChanged={() => setDataVersion((v) => v + 1)}
        />
      );
    } else if (session) {
      content = <UserAccountScreen session={session} onLoggedOut={handleLoggedOut} />;
    } else if (accountView === 'login') {
      content = <LoginScreen onLoggedIn={handleAuthed} onBack={() => setAccountView('entry')} />;
    } else if (accountView === 'signup') {
      content = <SignupScreen onSignedUp={handleAuthed} onBack={() => setAccountView('entry')} />;
    } else {
      content = (
        <AccountEntryScreen
          onPickLogin={() => setAccountView('login')}
          onPickSignup={() => setAccountView('signup')}
        />
      );
    }
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root} edges={['top']}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <Text style={styles.logo}>
            AgroBC<Text style={{ color: colors.terra }}>.</Text>
          </Text>
        </View>

        <View style={styles.body}>{content}</View>

        <FloatingTabBar activeTab={tab} onChange={goTab} />
      </SafeAreaView>
    </SafeAreaProvider>
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
});
