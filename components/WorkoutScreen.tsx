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
  deleteWorkoutSet,
  getErrorMessage,
  listWorkoutSets,
  type WorkoutSet,
} from '../lib/workoutSets';
import AddSetForm from './AddSetForm';
import SetRow from './SetRow';

type Props = { email: string };

export default function WorkoutScreen({ email }: Props) {
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
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

  function handleAdded(newSet: WorkoutSet) {
    setNotice(null);
    // If the list is currently showing a load error, reload everything instead.
    if (error) {
      load();
      return;
    }
    setSets((prev) => [newSet, ...prev]);
  }

  // Throws on a real failure (SetRow shows the message).
  // If nothing matched, the row was already gone: remove it locally and say so.
  async function handleDelete(id: string): Promise<void> {
    const removed = await deleteWorkoutSet(id);
    setSets((prev) => prev.filter((s) => s.id !== id));
    setNotice(removed ? null : 'That set was already deleted.');
  }

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
          <SetRow set={item} onDelete={handleDelete} />
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
      <AddSetForm onAdded={handleAdded} />
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
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
  muted: { color: '#666' },
  notice: { color: '#92400e', marginBottom: 8 },
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