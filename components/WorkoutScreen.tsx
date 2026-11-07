import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { supabase } from '../lib/supabase';
import {
  getErrorMessage,
  listWorkoutSets,
  type WorkoutSet,
} from '../lib/workoutSets';

type Props = { email: string };

export default function WorkoutScreen({ email }: Props) {
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSets(await listWorkoutSets());
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleLogout() {
    setLogoutError(null);
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) setLogoutError(signOutError.message);
  }

  function renderBody() {
    if (loading && sets.length === 0) {
      return <ActivityIndicator size="large" style={styles.spinner} />;
    }
    if (error) {
      return (
        <View style={styles.centerBlock}>
          <Text style={styles.error}>{error}</Text>
          <Pressable style={styles.button} onPress={load}>
            <Text style={styles.buttonText}>Retry</Text>
          </Pressable>
        </View>
      );
    }
    if (sets.length === 0) {
      return (
        <View style={styles.centerBlock}>
          <Text style={styles.muted}>No sets yet.</Text>
        </View>
      );
    }
    return (
      <FlatList
        data={sets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.rowMain}>
              <Text style={styles.exercise}>{item.exercise_name}</Text>
              <Text>
                {item.weight} × {item.reps}
                {item.rpe !== null ? `  ·  RPE ${item.rpe}` : ''}
              </Text>
              <Text style={styles.muted}>
                {new Date(item.created_at).toLocaleString()}
              </Text>
            </View>
          </View>
        )}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Workout log</Text>
          <Text style={styles.muted}>{email}</Text>
        </View>
        <Pressable onPress={handleLogout}>
          <Text style={styles.link}>Log out</Text>
        </Pressable>
      </View>
      {logoutError && <Text style={styles.error}>{logoutError}</Text>}
      {renderBody()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    paddingTop: 56,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerText: { gap: 2 },
  title: { fontSize: 24, fontWeight: '600' },
  spinner: { marginTop: 32 },
  centerBlock: { alignItems: 'center', gap: 12, marginTop: 32 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
  },
  rowMain: { flex: 1, gap: 2 },
  exercise: { fontSize: 16, fontWeight: '600' },
  muted: { color: '#666' },
  link: { color: '#2563eb', fontSize: 16 },
  error: { color: '#b91c1c' },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
});