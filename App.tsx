import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import AuthForm from './components/AuthForm';

export default function App() {
  // undefined = still checking storage, null = signed out, Session = signed in
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    setSignOutError(null);
    const { error } = await supabase.auth.signOut();
    if (error) setSignOutError(error.message);
  }

  return (
    <View style={styles.container}>
      {session === undefined ? (
        <ActivityIndicator size="large" />
      ) : session === null ? (
        <AuthForm />
      ) : (
        <View style={styles.signedIn}>
          <Text style={styles.title}>Signed in</Text>
          <Text>Email: {session.user.email}</Text>
          <Text>User ID: {session.user.id}</Text>
          {signOutError && <Text style={styles.error}>{signOutError}</Text>}
          <Pressable style={styles.button} onPress={handleLogout}>
            <Text style={styles.buttonText}>Log out</Text>
          </Pressable>
        </View>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signedIn: { gap: 8, padding: 16 },
  title: { fontSize: 24, fontWeight: '600' },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  error: { color: '#b91c1c' },
});