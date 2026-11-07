import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import AuthForm from './components/AuthForm';
import WorkoutScreen from './components/WorkoutScreen';

export default function App() {
  // undefined = still checking storage, null = signed out, Session = signed in
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      {session === undefined ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      ) : session === null ? (
        <View style={styles.centered}>
          <AuthForm />
        </View>
      ) : (
        <WorkoutScreen email={session.user.email ?? 'unknown'} />
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});